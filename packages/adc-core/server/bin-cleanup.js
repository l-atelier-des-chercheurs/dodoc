const path = require("path");
const fs = require("fs-extra");
const dev = require("./dev-log");
const utils = require("./utils");

// Bin cleanup interval in milliseconds (default: 24 hours)
const BIN_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;
// Maximum bin age in milliseconds (default: 30 days)
const MAX_BIN_AGE = 30 * 24 * 60 * 60 * 1000;

module.exports = (function () {
  let cleanupInterval;

  const API = {
    async init() {
      // Set up bin cleanup interval
      cleanupInterval = setInterval(this.cleanupBins, BIN_CLEANUP_INTERVAL);

      // Initial bin cleanup
      await this.cleanupBins();
    },

    stopCleanupInterval() {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
      }
    },

    async cleanupBins() {
      dev.logfunction(`Will clean up bins`);

      try {
        if (!global.pathToUserContent) {
          dev.logverbose("Content path not available, skipping bin cleanup");
          return;
        }

        const deletedFolderName = global.settings.deletedFolderName || "_bin";
        const now = Date.now();
        let totalRemoved = 0;

        // Recursively find bin folders only in schema-declared content roots
        const binFolders = await _collectBinFolders(
          deletedFolderName,
          global.pathToUserContent
        );

        dev.logverbose(`Found ${binFolders.length} bin folder(s) to check`);

        // Clean up each bin folder
        for (const binFolderPath of binFolders) {
          const removed = await _cleanupBinFolder(binFolderPath, now);
          totalRemoved += removed;
        }

        if (totalRemoved > 0) {
          dev.log(
            `Bin cleanup completed: removed ${totalRemoved} item(s) from ${binFolders.length} bin folder(s)`
          );
        } else {
          dev.logverbose(`Bin cleanup completed: no items to remove`);
        }

        const removedArchives = await _cleanupOldArchives(now);
        if (removedArchives > 0) {
          dev.log(
            `Archive cleanup completed: removed ${removedArchives} version(s) older than 30 days`
          );
        } else {
          dev.logverbose(`Archive cleanup completed: no versions to remove`);
        }
      } catch (err) {
        dev.error("Error during bin cleanup:", err);
      }
    },

    onExit() {
      dev.logverbose("Stopping bin cleanup interval...");
      API.stopCleanupInterval();
    },
  };

  /**
   * Build list of bin folders restricted to schema-declared content roots.
   */
  async function _collectBinFolders(binFolderName, contentRoot) {
    const binFolders = [];

    const schemaRoots = await _getSchemaContentRoots(contentRoot);
    for (const root of schemaRoots) {
      const folders = await _findAllBinFolders(root, binFolderName);
      binFolders.push(...folders);
    }

    return binFolders;
  }

  /**
   * Determine which top-level folders contain user content by reading the schema.
   */
  async function _getSchemaContentRoots(contentRoot) {
    const schemaFolders = Object.keys(global.settings?.schema?.$folders || {});

    if (schemaFolders.length === 0) {
      return [contentRoot];
    }

    const existingRoots = [];
    for (const folderName of schemaFolders) {
      const folderPath = path.join(contentRoot, folderName);
      if (await fs.pathExists(folderPath)) {
        existingRoots.push(folderPath);
      }
    }

    return existingRoots;
  }

  /**
   * Recursively find all bin folders in the content directory
   */
  async function _findAllBinFolders(rootPath, binFolderName) {
    const binFolders = [];

    async function traverse(currentPath) {
      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);

          // Skip hidden files (starting with ".")
          if (entry.name.startsWith(".")) {
            continue;
          }

          // Check if this is a bin folder
          if (entry.name === binFolderName && entry.isDirectory()) {
            binFolders.push(fullPath);
            // Don't traverse into bin folders
            continue;
          }

          // If it's a directory, traverse it (including folders starting with "_")
          if (entry.isDirectory()) {
            await traverse(fullPath);
          }
        }
      } catch (err) {
        // Ignore permission errors or missing directories
        if (err.code !== "EACCES" && err.code !== "ENOENT") {
          dev.error(`Error traversing ${currentPath}:`, err);
        }
      }
    }

    await traverse(rootPath);
    return binFolders;
  }

  /**
   * Clean up a single bin folder by removing items older than MAX_BIN_AGE
   */
  async function _cleanupBinFolder(binFolderPath, now) {
    let removedCount = 0;

    try {
      const entries = await fs.readdir(binFolderPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(binFolderPath, entry.name);

        try {
          const stats = await fs.stat(fullPath);
          const age = now - stats.mtime.getTime();

          // Remove items older than MAX_BIN_AGE
          if (age > MAX_BIN_AGE) {
            await fs.remove(fullPath);
            removedCount++;
            dev.logverbose(
              `Removed old bin item: ${entry.name} (${Math.round(
                age / (24 * 60 * 60 * 1000)
              )} days old)`
            );
          }
        } catch (err) {
          // If we can't stat or remove the item, log and continue
          dev.error(`Error processing bin item ${entry.name}:`, err);
        }
      }
    } catch (err) {
      // If bin folder doesn't exist or can't be read, that's okay
      if (err.code !== "ENOENT") {
        dev.error(`Error reading bin folder ${binFolderPath}:`, err);
      }
    }

    return removedCount;
  }

  /**
   * Remove text archives older than MAX_BIN_AGE.
   * Each archived file is named with the timestamp of the version.
   */
  async function _cleanupOldArchives(now) {
    const archivesRoot = utils.getPathToUserContent("archives");
    if (!(await fs.pathExists(archivesRoot))) return 0;

    let removedCount = 0;

    async function traverse(currentPath) {
      let entries = [];
      try {
        entries = await fs.readdir(currentPath, { withFileTypes: true });
      } catch (err) {
        if (err.code !== "EACCES" && err.code !== "ENOENT") {
          dev.error(`Error reading archives folder ${currentPath}:`, err);
        }
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await traverse(fullPath);
          try {
            const remaining = await fs.readdir(fullPath);
            if (remaining.length === 0) await fs.rmdir(fullPath);
          } catch (err) {
            if (err.code !== "ENOENT" && err.code !== "ENOTEMPTY") {
              dev.error(`Error removing empty archives folder ${entry.name}:`, err);
            }
          }
          continue;
        }

        const timestamp = Number(path.parse(entry.name).name);
        if (!Number.isFinite(timestamp)) continue;

        const age = now - timestamp;
        if (age <= MAX_BIN_AGE) continue;

        try {
          await fs.remove(fullPath);
          removedCount++;
          dev.logverbose(
            `Removed old archive: ${entry.name} (${Math.round(
              age / (24 * 60 * 60 * 1000)
            )} days old)`
          );
        } catch (err) {
          dev.error(`Error removing archive ${entry.name}:`, err);
        }
      }
    }

    await traverse(archivesRoot);
    return removedCount;
  }

  return API;
})();
