const path = require("path");
const fs = require("fs-extra");
const dev = require("./dev-log");
const utils = require("./utils");
const paths = require("./paths");

// Cache cleanup interval in milliseconds (default: 1 hour)
const CACHE_CLEANUP_INTERVAL = 60 * 60 * 1000;
// Maximum cache age in milliseconds (default: 24 hours)
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000;

module.exports = (function () {
  let cleanupInterval;

  const API = {
    async init() {
      global.pathToCache = await createCacheFolder().catch((err) => {
        throw err;
      });

      // Set up cache cleanup interval
      cleanupInterval = setInterval(this.cleanupCache, CACHE_CLEANUP_INTERVAL);

      // Initial cache cleanup
      await this.cleanupCache();

      // Set up process exit handlers for Node.js
      if (!global.is_electron) {
        process.on("SIGINT", this.handleExit);
        process.on("SIGTERM", this.handleExit);
        process.on("exit", this.handleExit);
      }
    },

    async cleanup() {
      try {
        if (global.pathToCache) {
          dev.log("Cleaning up cache...");
          await fs.remove(global.pathToCache);
          dev.log("Cache cleanup completed");
        }
      } catch (err) {
        dev.error("Error during cache cleanup:", err);
      }
    },

    stopCleanupInterval() {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
      }
    },

    async cleanupCache() {
      dev.logfunction(`Will clean up cache`);

      try {
        const cacheFolder = global.pathToCache;
        if (!cacheFolder) return;

        // dev.log("Starting cache cleanup...");

        // Get all files in cache directory
        const files = await fs.readdir(cacheFolder);

        for (const file of files) {
          const filePath = path.join(cacheFolder, file);
          const stats = await fs.stat(filePath);

          // Check if file is older than MAX_CACHE_AGE
          if (Date.now() - stats.mtime.getTime() > MAX_CACHE_AGE) {
            await fs.remove(filePath);
            dev.log(`Removed old cache file: ${file}`);
          }
        }

        dev.logverbose(`Cache cleanup completed`);
      } catch (err) {
        dev.error("Error during cache cleanup:", err);
      }
    },

    handleExit: async () => {
      dev.log("Handling process exit...");
      API.stopCleanupInterval();
      await API.cleanup();
      process.exit(0);
    },
  };

  async function createCacheFolder() {
    const cache_folder_path = path.join(paths.getCacheFolder(), "dodoc_cache");
    try {
      await utils.testWriteFileInFolder(cache_folder_path);
      dev.log(`Cache folder set to`, cache_folder_path);
    } catch (err) {
      dev.error(`-> failed to write to cache folder`, err);
      throw err;
    }
    return cache_folder_path;
  }

  return API;
})();
