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
    log: ({ message, type = "general", level = "info", from = null }) =>
      _log({ message, type, level, from }),
    getLogFilePath: () => logFilePath,
    cleanupOldLogs: (keepDays = 7) => _cleanupOldLogs(keepDays),
    shutdown: () => _handleCleanShutdown(),
  };

  function _setupLogFile() {
    dev.logfunction();
    try {
      logDirPath = path.join(global.pathToUserContent, "journal");

      if (!fs.existsSync(logDirPath)) {
        fs.ensureDirSync(logDirPath);
      }

      // Create timestamped filename
      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/T/, "_")
        .replace(/:/g, "-")
        .split(".")[0]; // Remove milliseconds

      logFilePath = path.join(logDirPath, `${timestamp}.jsonl`);

      // Write initial log entry as JSON
      const initEntry = {
        ts: now.toISOString(),
        type: "general",
        level: "info",
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
    process.on("exit", () => {
      _renameToCleanShutdown();
    });

    // Handle SIGTERM (normal termination)
    process.on("SIGTERM", () => {
      _handleCleanShutdown();
      process.exit(0);
    });

    // Handle SIGINT (Ctrl+C)
    process.on("SIGINT", () => {
      _handleCleanShutdown();
      process.exit(0);
    });

    // Handle uncaught exceptions (crashes) - don't rename file
    process.on("uncaughtException", (error) => {
      _writeCrashInfo("uncaughtException", error);
      process.exit(1);
    });

    // Handle unhandled promise rejections (potential crashes) - don't rename file
    process.on("unhandledRejection", (reason, promise) => {
      _writeCrashInfo("unhandledRejection", reason);
      process.exit(1);
    });

    // Electron-specific handlers
    if (global.is_electron) {
      const { app } = require("electron");

      app.on("before-quit", () => {
        _handleCleanShutdown();
      });

      app.on("window-all-closed", () => {
        _handleCleanShutdown();
      });
    }

    shutdownHandlersRegistered = true;
  }

  function _handleCleanShutdown() {
    const shutdownEntry = {
      ts: new Date().toISOString(),
      type: "general",
      level: "info",
      message: "DODOC CLEAN SHUTDOWN",
    };

    if (!logFilePath || !isEnabled) {
      // If file not ready, add to buffer (though unlikely during shutdown)
      pendingMessages.push(JSON.stringify(shutdownEntry) + "\n");
      return;
    }

    try {
      fs.appendFileSync(logFilePath, JSON.stringify(shutdownEntry) + "\n");

      // Rename file to indicate clean shutdown
      _renameToCleanShutdown();
    } catch (error) {
      console.error(`Failed to write clean shutdown message: ${error.message}`);
    }
  }

  function _renameToCleanShutdown() {
    if (!logFilePath || !isEnabled) return;

    try {
      const dir = path.dirname(logFilePath);
      const name = path.basename(logFilePath, ".jsonl");
      const cleanLogPath = path.join(dir, `${name}_ok.jsonl`);

      if (fs.existsSync(logFilePath)) {
        fs.renameSync(logFilePath, cleanLogPath);
      }
    } catch (error) {
      // Silent failure - don't want to crash during shutdown
    }
  }

  function _writeCrashInfo(crashType, error) {
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    const crashEntry = {
      ts: new Date().toISOString(),
      type: "general",
      level: "crash",
      message: `DODOC CRASHED (${crashType})`,
      error: errorMessage,
      stack: error?.stack || null,
    };

    if (!logFilePath || !isEnabled) {
      // If file not ready, add to buffer
      pendingMessages.push(JSON.stringify(crashEntry) + "\n");
      return;
    }

    try {
      fs.appendFileSync(logFilePath, JSON.stringify(crashEntry) + "\n");
      // Note: Don't rename file - leave it without suffix to indicate crash
    } catch (writeError) {
      // Silent failure in crash handler
    }
  }

  function _log({ message, type = "general", level = "info", from = null }) {
    let logEntry = {
      ts: new Date().toISOString(),
      type,
      level,
      message,
    };

    if (from) {
      logEntry.from = from;
    }

    if (!logFilePath || !isEnabled) {
      // Buffer the message until file is ready
      pendingMessages.push(JSON.stringify(logEntry) + "\n");
      return;
    }

    try {
      fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + "\n");
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

  return API;
})();
