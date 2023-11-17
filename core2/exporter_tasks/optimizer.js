const { promisify } = require("util"),
  fs = require("fs"),
  heicConvert = require("heic-convert"),
  sharp = require("sharp");

sharp.cache(false);

module.exports = (function () {
  const API = {
    async convertToOptimizedImage({ source, destination }) {
      const inputBuffer = await promisify(fs.readFile)(source);
      const outputBuffer = await heicConvert({
        buffer: inputBuffer, // the HEIC file buffer
        format: "JPEG", // output format
        quality: 1, // the jpeg compression quality, between 0 and 1
      });

      await sharp(outputBuffer)
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
