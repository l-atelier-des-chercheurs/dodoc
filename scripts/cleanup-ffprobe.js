const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const platform = os.platform();
const arch = os.arch();

async function cleanupFfprobeBinaries() {
  const ffprobeStaticPath = path.join("node_modules", "ffprobe-static");
  const binPath = path.join(ffprobeStaticPath, "bin");

  if (!(await fs.pathExists(binPath))) {
    console.log("ffprobe-static bin directory not found, skipping cleanup");
    return;
  }

  const currentPlatformPath = path.join(binPath, platform);

  try {
    // Get all platform directories
    const platforms = await fs.readdir(binPath);

    let totalSizeRemoved = 0;

    for (const platformDir of platforms) {
      const platformPath = path.join(binPath, platformDir);
      const stat = await fs.stat(platformPath);

      if (stat.isDirectory() && platformDir !== platform) {
        // Calculate size before removal
        const size = await getFolderSize(platformPath);
        totalSizeRemoved += size;

        // Remove unused platform directory
        await fs.remove(platformPath);
        console.log(
          `Removed unused ffprobe binaries for platform: ${platformDir}`
        );
      }
    }

    // Also remove unused architectures within the current platform
    if (await fs.pathExists(currentPlatformPath)) {
      const architectures = await fs.readdir(currentPlatformPath);

      for (const archDir of architectures) {
        if (archDir !== arch) {
          const archPath = path.join(currentPlatformPath, archDir);
          const archStat = await fs.stat(archPath);

          if (archStat.isDirectory()) {
            const size = await getFolderSize(archPath);
            totalSizeRemoved += size;

            await fs.remove(archPath);
            console.log(
              `Removed unused ffprobe binaries for architecture: ${archDir}`
            );
          }
        }
      }
    }

    if (totalSizeRemoved > 0) {
      console.log(
        `Total space saved: ${(totalSizeRemoved / 1024 / 1024).toFixed(2)} MB`
      );
    } else {
      console.log("No unused ffprobe binaries found to remove");
    }
  } catch (error) {
    console.error("Error cleaning up ffprobe binaries:", error.message);
  }
}

async function getFolderSize(folderPath) {
  let totalSize = 0;

  try {
    const items = await fs.readdir(folderPath);

    for (const item of items) {
      const itemPath = path.join(folderPath, item);
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        totalSize += await getFolderSize(itemPath);
      } else {
        totalSize += stat.size;
      }
    }
  } catch (error) {
    // Ignore errors for individual files
  }

  return totalSize;
}

cleanupFfprobeBinaries().catch(console.error);
