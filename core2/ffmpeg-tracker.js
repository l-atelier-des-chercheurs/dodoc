const ffmpeg = require("fluent-ffmpeg");

const ffmpegPath = require("ffmpeg-static").replace(
  "app.asar",
  "app.asar.unpacked"
);
const ffprobePath = require("ffprobe-static").path.replace(
  "app.asar",
  "app.asar.unpacked"
);

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

module.exports = (function () {
  // Store tracked processes locally
  let trackedProcesses = [];
  let reportingInterval = null;

  const API = {
    /**
     * Initialize the ffmpeg tracker and set up exit handlers
     */
    init() {
      // Set up process exit handlers for Node.js
      if (!global.is_electron) {
        process.on("SIGINT", this.handleExit);
        process.on("SIGTERM", this.handleExit);
        process.on("exit", this.handleExit);
      }
      // For Electron, the cleanup is called from electron.js before-quit event

      // Start periodic reporting of active processes
      this.startReporting();
    },

    /**
     * Start reporting active ffmpeg processes every second
     */
    startReporting() {
      if (reportingInterval) return; // Already running

      reportingInterval = setInterval(() => {
        const count = trackedProcesses.length;
        if (count > 0) {
          dev.log(`FFMPEG-TRACKER • ${count} active process(es) running`);
        }
      }, 1000);
    },

    /**
     * Stop reporting active ffmpeg processes
     */
    stopReporting() {
      if (reportingInterval) {
        clearInterval(reportingInterval);
        reportingInterval = null;
      }
    },

    /**
     * Kill all tracked ffmpeg processes
     */
    killAllProcesses() {
      if (trackedProcesses.length > 0) {
        dev.log(
          `FFMPEG-TRACKER • Killing ${trackedProcesses.length} process(es)...`
        );
        trackedProcesses.forEach((cmd) => {
          try {
            cmd.kill();
          } catch (err) {
            dev.error(`FFMPEG-TRACKER • Error killing process:`, err);
          }
        });
        trackedProcesses = [];
        dev.log(`FFMPEG-TRACKER • All processes killed`);
      }
      this.stopReporting();
    },

    /**
     * Handle process exit - kill all ffmpeg processes
     */
    handleExit: () => {
      dev.log("FFMPEG-TRACKER • Handling process exit...");
      API.killAllProcesses();
    },

    /**
     * Get the number of currently tracked processes
     */
    getProcessCount() {
      return trackedProcesses.length;
    },

    /**
     * Creates an ffmpeg command with automatic process tracking
     * All processes are added to trackedProcesses and automatically
     * removed when they complete or error
     *
     * @param {Object} options - Options to pass to ffmpeg constructor
     * @returns {FfmpegCommand} - ffmpeg command with tracking enabled
     */
    createTrackedFfmpeg(options) {
      const cmd = new ffmpeg(options || global.settings.ffmpeg_options);

      // Store original on method
      const originalOn = cmd.on.bind(cmd);

      // Attach our tracking handlers that always run
      originalOn("start", function (commandLine) {
        trackedProcesses.push(cmd);
        dev.logverbose(
          `FFMPEG-TRACKER • Added process to tracking (total: ${trackedProcesses.length})`
        );
      });

      originalOn("end", function (...args) {
        const index = trackedProcesses.indexOf(cmd);
        if (index > -1) {
          trackedProcesses.splice(index, 1);
          dev.logverbose(
            `FFMPEG-TRACKER • Removed process from tracking (total: ${trackedProcesses.length})`
          );
        }
      });

      originalOn("error", function (...args) {
        const index = trackedProcesses.indexOf(cmd);
        if (index > -1) {
          trackedProcesses.splice(index, 1);
          dev.logverbose(
            `FFMPEG-TRACKER • Removed process from tracking after error (total: ${trackedProcesses.length})`
          );
        }
      });

      // Preserve the original on method for user handlers
      // This allows user code to attach handlers normally
      cmd.on = originalOn;

      return cmd;
    },

    // Export ffprobe for metadata operations
    ffprobe: ffmpeg.ffprobe,
  };

  return API;
})();
