const path = require("path");
const fs = require("fs-extra");
const crypto = require("crypto");
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
    async init({ content_path }) {
      global.pathToCache = await createCacheFolder(content_path).catch((err) => {
        throw err;
      });

      // Set up cache cleanup interval
      cleanupInterval = setInterval(this.cleanupCache, CACHE_CLEANUP_INTERVAL);

      // Initial cache cleanup
      await this.cleanupCache();
    },

    async cleanup() {
      try {
        if (global.pathToCache) {
          dev.logverbose("Cleaning up cache...");
          await fs.remove(global.pathToCache);
          dev.logverbose("Cache cleanup completed");
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
            dev.logverbose(`Removed old cache file: ${file}`);
          }
        }

        dev.logverbose(`Cache cleanup completed`);
      } catch (err) {
        dev.error("Error during cache cleanup:", err);
      }
    },

    async onExit() {
      dev.logverbose("Stopping cache cleanup interval and cleaning up...");
      API.stopCleanupInterval();
      await API.cleanup();
    },
  };

  // one per app and content folder, so that instances of the same app
  // running side by side (a VPS with several dodoc, each on its own content)
  // don't share it: each instance removes its cache folder when it quits.
  // The content folder lock (content-lock.js) makes it one process per cache
  // folder, and the name stays the same across restarts.
  async function createCacheFolder(content_path) {
    const content_hash = crypto
      .createHash("sha1")
      .update(path.resolve(content_path))
      .digest("hex")
      .slice(0, 8);
    const cache_folder_path = path.join(
      paths.getCacheFolder(),
      `${global.appInfos.name}_cache`,
      `${utils.slug(path.basename(content_path))}-${content_hash}`
    );
    try {
      await utils.testWriteFileInFolder(cache_folder_path);
      dev.logverbose(`Cache folder set to`, cache_folder_path);
    } catch (err) {
      dev.error(`-> failed to write to cache folder`, err);
      throw err;
    }
    return cache_folder_path;
  }

  return API;
})();
