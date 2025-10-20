const { promisify } = require("util"),
  fs = require("fs"),
  heicdecode = require("heic-decode"),
  sharp = require("sharp");

const utils = require("../utils"),
  ffmpegTracker = require("../ffmpeg-tracker");

sharp.cache(false);

module.exports = (function () {
  const API = {
    async convertHEIC({ source, destination, image_width, image_height }) {
      const heic_buffer = await promisify(fs.readFile)(source);
      const { width, height, data } = await heicdecode({ buffer: heic_buffer });

      const addtl_infos = {
        raw: {
          width,
          height,
          channels: 4,
          // density: 300,
        },
      };

      return await _saveImage({
        source: data,
        addtl_infos,
        destination,
        image_width,
        image_height,
      });
    },

    async convertCameraRAW({ source, destination, image_width, image_height }) {
      let infos = await require("extractd").generate(source, {
        base64: true,
        datauri: true,
      });
      if (!infos.preview) throw new Error(`no_preview_detected`);

      // https://stackoverflow.com/a/51957976
      const uri = infos.preview.split(";base64,").pop();
      const buffer = Buffer.from(uri, "base64");

      return await _saveImage({
        source: buffer,
        destination,
        image_width,
        image_height,
      });
    },
    async convertImage({ source, destination, image_width, image_height }) {
      return await _saveImage({
        source,
        destination,
        image_width,
        image_height,
      });
    },
    async convertAudio({
      source,
      destination,
      audio_bitrate,
      trim_start,
      trim_end,
      reportProgress,
    }) {
      return new Promise(async (resolve, reject) => {
        const ffmpeg_cmd = ffmpegTracker.createTrackedFfmpeg();

        // https://stackoverflow.com/a/70899710
        let totalTime;

        ffmpeg_cmd.input(source);

        // if (audio_bitrate === "no_audio") ffmpeg_cmd.noAudio();
        if (audio_bitrate)
          ffmpeg_cmd.withAudioCodec("aac").withAudioBitrate(audio_bitrate);

        destination = destination + ".aac";

        if (trim_start !== undefined && trim_end !== undefined)
          ffmpeg_cmd.inputOptions([`-ss ${trim_start}`, `-to ${trim_end}`]);

        ffmpeg_cmd
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
            return resolve(destination);
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
      image_width,
      image_height,
      video_bitrate,
      audio_bitrate,
      trim_start,
      trim_end,
      reportProgress,
    }) {
      try {
        if (video_bitrate === "no_video") {
          // For audio-only, just extract audio and rename to .aac
          const audioDestination = destination + ".aac";

          await utils.convertVideoToStandardFormat({
            source,
            destination: audioDestination,
            image_width,
            image_height,
            video_bitrate,
            audio_bitrate,
            trim_start,
            trim_end,
            reportProgress,
          });

          return audioDestination;
        } else {
          // For video, use normal processing
          const videoDestination = destination + ".mp4";

          await utils.convertVideoToStandardFormat({
            source,
            destination: videoDestination,
            image_width,
            image_height,
            video_bitrate,
            audio_bitrate,
            trim_start,
            trim_end,
            reportProgress,
          });

          return videoDestination;
        }
      } catch (err) {
        dev.error(err);
        throw err;
      }
    },
  };

  async function _saveImage({
    source,
    addtl_infos = {},
    destination,
    image_width,
    image_height,
  }) {
    // check if source has transparency

    let output_format = "jpeg";
    let quality = global.settings.mediaThumbQuality;
    let background = "white";

    try {
      const { hasAlpha } = await sharp(source).metadata();
      if (hasAlpha) {
        output_format = "png";
        quality = 100;
        background = "transparent";
      }
    } catch (err) {}

    destination = destination + "." + output_format;

    const sharp_buffer = await sharp(source, addtl_infos)
      .rotate()
      // .flatten({ background })
      .toFormat(output_format, { quality })
      .toBuffer()
      .catch((err) => {
        dev.error(`Failed to sharp create image to destination.`);
        throw err;
      });

    if (image_width && image_height)
      await sharp(sharp_buffer)
        .resize({
          width: image_width,
          height: image_height,
          fit: "fill",
          background,
        })
        .toFile(destination);
    else if (image_width || image_height)
      await sharp(sharp_buffer)
        .resize({
          width: image_width,
          height: image_height,
          fit: "inside",
          background,
        })
        .toFile(destination);
    else await sharp(sharp_buffer).toFile(destination);

    return destination;
  }

  return API;
})();
