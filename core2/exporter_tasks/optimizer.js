const { promisify } = require("util"),
  fs = require("fs"),
  decode = require("heic-decode"),
  sharp = require("sharp");

sharp.cache(false);

module.exports = (function () {
  const API = {
    async convertToOptimizedImage({ source, destination }) {
      const buffer = await promisify(fs.readFile)(source);
      const { width, height, data } = await decode({ buffer });
      await sharp(new Uint8Array(data), {
        raw: {
          width,
          height,
          channels: 4,
          density: 300,
        },
      })
        .rotate()
        .toFormat("jpeg", {
          quality: global.settings.mediaThumbQuality,
        })
        .toFile(destination)
        .catch((err) => {
          dev.error(`Failed to sharp create image to destination.`);
          throw err;
        });
    },
  };

  return API;
})();
