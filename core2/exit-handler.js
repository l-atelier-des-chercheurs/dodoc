const dev = require("./dev-log");
const binCleanup = require("./bin-cleanup");
const cacheManager = require("./cache-manager");
const ffmpegTracker = require("./ffmpeg-tracker");

let exitHandled = false;

/**
 * Run all exit cleanups (bin cleanup, cache manager, ffmpeg tracker).
 * Used by the centralized process exit handler and by Electron before-quit.
 * Safe to call multiple times; runs only once.
 */
async function runExitCleanup() {
  if (exitHandled) return;
  exitHandled = true;

  dev.log("Running exit cleanup...");

  try {
    try {
      binCleanup.onExit();
    } catch (err) {
      dev.error("Error during bin cleanup:", err);
    }

    try {
      await cacheManager.onExit();
    } catch (err) {
      dev.error("Error during cache cleanup:", err);
    }

    try {
      ffmpegTracker.onExit();
    } catch (err) {
      dev.error("Error during ffmpeg cleanup:", err);
    }

    dev.log("Exit cleanup completed");
  } catch (err) {
    dev.error("Error during exit cleanup wrapper:", err);
  }
}

/**
 * Register process exit handlers (SIGINT, SIGTERM).
 * Call after bin-cleanup, cache-manager, and ffmpeg-tracker are initialized.
 * Not registered when running in Electron (Electron uses before-quit instead).
 */
function init() {
  if (global.is_electron) return;

  function handleExit() {
    runExitCleanup()
      .then(() => process.exit(0))
      .catch((err) => {
        dev.error("Exit cleanup failed:", err);
        process.exit(1);
      });
  }

  process.on("SIGINT", handleExit);
  process.on("SIGTERM", handleExit);
}

module.exports = {
  init,
  runExitCleanup,
};
