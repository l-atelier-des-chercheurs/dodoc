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
    async convertHEIC({ source, destination, quality_preset }) {
      const heic_buffer = await promisify(fs.readFile)(source);
      const { width, height, data } = await decode({ buffer: heic_buffer });

      const buffer = new Uint8Array(data);
      const addtl_infos = {
        raw: {
          width,
          height,
          channels: 4,
          density: 300,
        },
      };

      await _saveImage({
        source: buffer,
        addtl_infos,
        destination,
        quality_preset,
      });
    },

    async convertCameraRAW({ source, destination, quality_preset }) {
      let infos = await require("extractd").generate(source, {
        base64: true,
        datauri: true,
      });
      if (!infos.preview) throw new Error(`no_preview_detected`);

      // https://stackoverflow.com/a/51957976
      const uri = infos.preview.split(";base64,").pop();
      const buffer = Buffer.from(uri, "base64");

      await _saveImage({
        source: buffer,
        destination,
        quality_preset,
      });
    },
    async convertImage({ source, destination, quality_preset }) {
      await _saveImage({
        source,
        destination,
        quality_preset,
      });
    },
    async convertAudio({
      source,
      destination,
      quality_preset,
      ffmpeg_cmd,
      reportProgress,
    }) {
      return new Promise(async (resolve, reject) => {
        ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options);

        // https://stackoverflow.com/a/70899710
        let totalTime;

        let bitrate = "256k";
        if (quality_preset === "high") bitrate = "192k";
        else if (quality_preset === "medium") bitrate = "128k";

        ffmpeg_cmd
          .input(source)
          .withAudioCodec("aac")
          .withAudioBitrate(bitrate)

          .on("start", (commandLine) => {
            dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
          })
          .on("codecData", (data) => {
            totalTime = parseInt(data.duration.replace(/:/g, ""));
          })
          .on("progress", (progress) => {
            const time = parseInt(progress.timemark.replace(/:/g, ""));
            const percent = (time / totalTime) * 100;
            reportProgress(percent);
          })
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
    async convertVideo({
      source,
      destination,
      quality_preset,
      ffmpeg_cmd,
      reportProgress,
    }) {
      return new Promise(async (resolve, reject) => {
        ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options);

        let resolution, bitrate;
        if (quality_preset === "high") {
          resolution = { width: 1920, height: 1080 };
          bitrate = "4000k";
        } else if (quality_preset === "medium") {
          resolution = { width: 1920, height: 1080 };
          bitrate = "2000k";
        }

        await utils.convertVideoToStandardFormat({
          source,
          destination,
          resolution,
          bitrate,
          ffmpeg_cmd,
          reportProgress,
        });

        return resolve();
      });
    },
  };

  async function _saveImage({
    source,
    addtl_infos = undefined,
    destination,
    quality_preset,
  }) {
    const sharp_buffer = await sharp(source, addtl_infos)
      .rotate()
      .toFormat("jpeg", {
        quality: global.settings.mediaThumbQuality,
      })
      .toBuffer()
      .catch((err) => {
        dev.error(`Failed to sharp create image to destination.`);
        throw err;
      });

    if (quality_preset === "source")
      await sharp(sharp_buffer).toFile(destination);
    else if (quality_preset === "high")
      await sharp(sharp_buffer)
        .resize({
          width: 1920,
          height: 1920,
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFile(destination);
    else if (quality_preset === "medium")
      await sharp(sharp_buffer)
        .resize({
          width: 1280,
          height: 1280,
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFile(destination);
  }

  return API;
})();
