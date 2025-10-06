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

    // Handle normal process exit
    process.on("exit", async () => {});

    // Handle SIGTERM (normal termination)
    process.on("SIGTERM", async () => {
      await _handleCleanShutdown();
      process.exit(0);
    });

    // Handle SIGINT (Ctrl+C)
    process.on("SIGINT", async () => {
      await _handleCleanShutdown();
      process.exit(0);
    });

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

      app.on("before-quit", async () => {
        await _handleCleanShutdown();
      });

      app.on("window-all-closed", async () => {
        await _handleCleanShutdown();
      });
    }

    shutdownHandlersRegistered = true;
  }

  async function _handleCleanShutdown() {
    try {
      await _log({
        message: "DODOC CLEAN SHUTDOWN",
        type: "general",
        event: "shutdown",
        from: "journal",
      });
      await _renameToCleanShutdown();
    } catch (error) {
      console.error(`Failed to write clean shutdown message: ${error.message}`);
    }
  }

  async function _renameToCleanShutdown() {
    if (!logFilePath || !isEnabled) return;

    try {
      const dir = path.dirname(logFilePath);
      const name = path.basename(logFilePath, ".jsonl");
      const closeTimestamp = _createTimestamp();
      const cleanLogPath = path.join(
        dir,
        `${name}_until_${closeTimestamp}.jsonl`
      );

      if (fs.existsSync(logFilePath)) {
        await fs.rename(logFilePath, cleanLogPath);
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

        return {
          filename,
          filesize,
          startDate,
          endDate,
          duration,
          download_url: `/journal/${filename}`,
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

  return API;
})();
