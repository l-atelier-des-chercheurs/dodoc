const { promisify } = require("util"),
  fs = require("fs"),
  decode = require("heic-decode"),
  sharp = require("sharp"),
  ffmpeg = require("fluent-ffmpeg");

const utils = require("../utils");

sharp.cache(false);

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
  const API = {
    async convertHEIC({ source, destination }) {
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
    async convertImage({ source, destination }) {
      await sharp(source)
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
    async convertAudio({ source, destination, ffmpeg_cmd, notifyProgress }) {
      return new Promise(async (resolve, reject) => {
        ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options);

        ffmpeg_cmd
          .input(source)
          .withAudioCodec("aac")
          .withAudioBitrate("192k")
          .on("start", (commandLine) => {
            dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
          })
          .on("progress", notifyProgress)
          .on("end", async () => {
            return resolve();
          })
          .on("error", async (err, stdout, stderr) => {
            dev.error("An error happened: " + err.message);
            dev.error("ffmpeg standard output:\n" + stdout);
            dev.error("ffmpeg standard error:\n" + stderr);
            return reject(err);
          })
          .save(destination);
      });
    },
    async convertVideo({ source, destination, ffmpeg_cmd }) {
      return new Promise(async (resolve, reject) => {
        ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options);

        await utils.convertVideoToStandardFormat({
          ffmpeg_cmd,
          source,
          destination,
        });

        return resolve();
      });
    },
  };

  return API;
})();
