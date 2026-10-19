const path = require("path");
const fs = require("fs-extra");

module.exports = (function () {
  let isEnabled = false;
  let logFilePath = null;
  let logDirPath = null;
  let shutdownHandlersRegistered = false;
  let pendingMessages = []; // Buffer for messages before file is ready

  const API = {
    init: () => _setupLogFile(),
    isEnabled: () => isEnabled,
    log: ({ message, type = "general", event = "info", from, details }) =>
      _log({ message, type, event, from, details }),
    getLogFilePath: () => logFilePath,
    cleanupOldLogs: (keepDays = 7) => _cleanupOldLogs(keepDays),
    shutdown: () => _handleCleanShutdown(),

    getLogs: () => _getLogs(),
    downloadLog: ({ filename, res }) => _downloadLog({ filename, res }),
  };

  function _createTimestamp(date = new Date()) {
    // Use local time with system locale, forcing predictable format
    const dateStr = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format (ISO-like)
    const timeStr = date
      .toLocaleTimeString(undefined, {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/:/g, "-"); // HH:MM:SS -> HH-MM-SS

    return `${dateStr}_${timeStr}`;
  }

  function _setupLogFile() {
    try {
      logDirPath = path.join(global.pathToUserContent, "journal");

      if (!fs.existsSync(logDirPath)) {
        fs.ensureDirSync(logDirPath);
      }

      // Create timestamped filename
      const timestamp = _createTimestamp();

      logFilePath = path.join(logDirPath, `${timestamp}.jsonl`);

      // Write initial log entry as JSON
      const initEntry = {
        ts: new Date().toISOString(),
        message: "DODOC LOG STARTED",
      };
      fs.writeFileSync(logFilePath, JSON.stringify(initEntry) + "\n");

      // Write any buffered messages from before file was ready
      if (pendingMessages.length > 0) {
        const bufferedContent = pendingMessages.join("");
        fs.appendFileSync(logFilePath, bufferedContent);
        pendingMessages = []; // Clear buffer
      }

      // Register exit handlers
      _registerExitHandlers();

      isEnabled = true;
      return true;
    } catch (error) {
      console.error(`Failed to setup journal file: ${error.message}`);
      isEnabled = false;
      return false;
    }
  }

  function _registerExitHandlers() {
    if (shutdownHandlersRegistered) return;

    // Any exit with code 0 is a clean one (exit-handler, Electron quit…)
    process.on("exit", (code) => {
      if (code === 0) _handleCleanShutdown();
    });

    // SIGTERM (normal termination), SIGINT (Ctrl+C), SIGHUP (terminal closed).
    // The shutdown is written synchronously so that another handler calling
    // process.exit (see exit-handler.js) can't interrupt it. Only exit here if
    // no other handler will, so their cleanup isn't cut short either.
    for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"]) {
      process.on(signal, () => {
        _handleCleanShutdown();
        if (process.listenerCount(signal) === 1) process.exit(0);
      });
    }

    // Handle uncaught exceptions (crashes) - don't rename file
    process.on("uncaughtException", async (error) => {
      await _writeCrashInfo("uncaughtException", error);
      process.exit(1);
    });

    // Handle unhandled promise rejections (potential crashes) - don't rename file
    process.on("unhandledRejection", async (reason, promise) => {
      await _writeCrashInfo("unhandledRejection", reason);
      process.exit(1);
    });

    // Electron-specific handlers
    if (global.is_electron) {
      const { app } = require("electron");

      app.on("before-quit", () => _handleCleanShutdown());
      app.on("window-all-closed", () => _handleCleanShutdown());
    }

    shutdownHandlersRegistered = true;
  }

  // Synchronous and run once: it may be called from several exit paths, and
  // from the "exit" event where async work never completes.
  let has_shut_down = false;
  function _handleCleanShutdown() {
    if (has_shut_down || !logFilePath || !isEnabled) return;
    has_shut_down = true;

    try {
      fs.appendFileSync(
        logFilePath,
        JSON.stringify({
          ts: new Date().toISOString(),
          message: "DODOC CLEAN SHUTDOWN",
          event: "shutdown",
          from: "journal",
        }) + "\n"
      );
      _renameToCleanShutdown();
    } catch (error) {
      console.error(`Failed to write clean shutdown message: ${error.message}`);
    }
  }

  function _renameToCleanShutdown() {
    try {
      const dir = path.dirname(logFilePath);
      const name = path.basename(logFilePath, ".jsonl");
      const closeTimestamp = _createTimestamp();
      const cleanLogPath = path.join(
        dir,
        `${name}_until_${closeTimestamp}.jsonl`
      );

      if (fs.existsSync(logFilePath)) {
        fs.renameSync(logFilePath, cleanLogPath);
        // later log calls (if any) still land in the renamed file
        logFilePath = cleanLogPath;
      }
    } catch (error) {
      // Silent failure - don't want to crash during shutdown
    }
  }

  async function _writeCrashInfo(crashType, error) {
    const errorMessage = error?.message || error?.toString() || "Unknown error";

    try {
      await _log({
        message: `DODOC CRASHED (${crashType})`,
        type: "general",
        event: "crash",
        from: "journal",
        details: {
          error: errorMessage,
          stack: error?.stack || null,
        },
      });
      // Note: Don't rename file - leave it without suffix to indicate crash
    } catch (writeError) {
      // Silent failure in crash handler
    }
  }

  function _parseLogFilename(filename) {
    const nameWithoutExt = filename.replace(".jsonl", "");
    const parts = nameWithoutExt.split("_until_");

    let startTimestamp;
    let endTimestamp;

    if (parts.length >= 1) {
      const startParts = parts[0].split("_");
      if (startParts.length >= 2) {
        const datePart = startParts[0];
        const timePart = startParts[1].replace(/-/g, ":");
        startTimestamp = `${datePart}T${timePart}`;
      }

      if (parts.length >= 2) {
        const endParts = parts[1].split("_");
        if (endParts.length >= 2) {
          const endDatePart = endParts[0];
          const endTimePart = endParts[1].replace(/-/g, ":");
          endTimestamp = `${endDatePart}T${endTimePart}`;
        }
      }
    }

    const startDate = startTimestamp ? +new Date(startTimestamp) : null;
    const endDate = endTimestamp ? +new Date(endTimestamp) : null;

    return { startDate, endDate };
  }

  async function _log({ message, from, event, details }) {
    // from: main2, server, api2, etc. (filename)
    // event: create_folder, upload_file, etc. (action)
    // details: { outcome: "success", path_to_folder }

    let logEntry = {
      ts: new Date().toISOString(),
    };

    if (message) logEntry.message = message;
    if (event) logEntry.event = event;
    if (from) logEntry.from = from;
    if (details) logEntry.details = details;

    if (!logFilePath || !isEnabled) {
      // Buffer the message until file is ready
      pendingMessages.push(JSON.stringify(logEntry) + "\n");
      return;
    }

    try {
      await fs.appendFile(logFilePath, JSON.stringify(logEntry) + "\n");
    } catch (error) {
      console.error(`Failed to write to journal file: ${error.message}`);
    }
  }

  function _cleanupOldLogs(keepDays = 7) {
    if (!logDirPath || !fs.existsSync(logDirPath)) return;

    try {
      const files = fs.readdirSync(logDirPath);
      const cutoffTime = Date.now() - keepDays * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        if (path.extname(file) === ".jsonl") {
          const filePath = path.join(logDirPath, file);
          const stats = fs.statSync(filePath);

          if (stats.mtime.getTime() < cutoffTime) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up old journal file: ${file}`);
          }
        }
      });
    } catch (error) {
      console.error(`Failed to cleanup old journal files: ${error.message}`);
    }
  }

  async function _getLogs() {
    // return list of all available logs
    if (!logDirPath || !fs.existsSync(logDirPath)) return [];

    let files = [];
    try {
      files = await fs.readdir(logDirPath);
    } catch (error) {
      return [];
    }

    const jsonlFiles = files.filter(
      (filename) => path.extname(filename) === ".jsonl"
    );

    const results = await Promise.allSettled(
      jsonlFiles.map(async (filename) => {
        const filePath = path.join(logDirPath, filename);
        const { startDate, endDate } = _parseLogFilename(filename);
        const duration =
          startDate && endDate
            ? Math.max(0, Math.floor((endDate - startDate) / 1000))
            : null;

        let filesize = 0;
        try {
          const stats = await fs.stat(filePath);
          filesize = stats.size;
        } catch (e) {}

        let end_status = "clean";
        let crash_error = null;
        if (!endDate) {
          if (filePath === logFilePath) {
            end_status = "running";
          } else {
            // crashes caught by the process leave a "crash" entry at the end,
            // otherwise it was stopped without notice (killed, power cut…)
            crash_error = await _findCrashError({ filePath, filesize });
            end_status = crash_error !== null ? "crashed" : "interrupted";
          }
        }

        return {
          filename,
          filesize,
          startDate,
          endDate,
          duration,
          end_status,
          crash_error,
          download_url: `/_api2/_logs/${encodeURIComponent(filename)}`,
        };
      })
    );

    const logs = [];
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        logs.push(result.value);
      }
    });

    return logs;
  }

  // Returns the error message of the last "crash" entry, if any. Only the end
  // of the file is read, since that's where a crash is logged.
  async function _findCrashError({ filePath, filesize }) {
    const tail_size = Math.min(filesize, 32 * 1024);
    if (tail_size === 0) return null;

    let tail;
    const fd = await fs.open(filePath, "r");
    try {
      const buffer = Buffer.alloc(tail_size);
      await fs.read(fd, buffer, 0, tail_size, filesize - tail_size);
      tail = buffer.toString("utf8");
    } finally {
      await fs.close(fd);
    }

    const crash_line = tail
      .split("\n")
      .reverse()
      .find((line) => line.includes('"event":"crash"'));
    if (!crash_line) return null;

    try {
      return JSON.parse(crash_line).details?.error || "";
    } catch (e) {
      return "";
    }
  }

  async function _downloadLog({ filename, res }) {
    if (
      !filename ||
      path.basename(filename) !== filename ||
      path.extname(filename) !== ".jsonl"
    ) {
      return res.status(400).send({ code: "invalid_filename" });
    }

    const journal_path = path.join(global.pathToUserContent, "journal");
    const file_path = path.join(journal_path, filename);
    const resolved_journal_path = path.resolve(journal_path) + path.sep;
    const resolved_file_path = path.resolve(file_path);

    if (!resolved_file_path.startsWith(resolved_journal_path)) {
      return res.status(403).send({ code: "not_allowed" });
    }

    if (!(await fs.pathExists(resolved_file_path))) {
      return res.status(404).send({ code: "not_found" });
    }

    return res.download(resolved_file_path, filename);
  }

  return API;
})();
