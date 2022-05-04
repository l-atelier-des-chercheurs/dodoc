const fs = require("fs-extra"),
  path = require("path"),
  sharp = require("sharp"),
  ffmpegPath = require("ffmpeg-static"),
  { path: ffprobePath } = require("ffprobe-static"),
  ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

module.exports = (function () {
  return {
    applyRecipe: (
      { type, detail },
      base_media_path,
      slugFolderPath,
      newFileName,
      socket,
      media_meta
    ) => {
      return new Promise(function (resolve, reject) {
        if (!type) {
          return reject(`Missing type or detail to make recipe`);
        }

        if (type === "rotate_image") {
          const new_media_path = path.join(slugFolderPath, newFileName);

          sharp(base_media_path)
            .rotate(detail.angle)
            .withMetadata()
            .toBuffer(function (err, buffer) {
              if (err) {
                return reject(err);
              } else {
                fs.writeFile(new_media_path, buffer, function (e) {
                  return resolve(newFileName);
                });
              }
            });
        } else if (type === "optimize" && media_meta.type === "video") {
          newFileName =
            new RegExp(global.settings.regexpRemoveFileExtension, "i").exec(
              newFileName
            )[1] + "_optimized.mp4";

          const new_media_path = path.join(slugFolderPath, newFileName);

          const ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options);

          let size = `?x720`;
          if (detail.hasOwnProperty("quality")) size = `?x${detail.quality}`;

          fs.unlink(new_media_path, (err) => {
            ffmpeg_cmd
              .input(base_media_path)
              .native()
              .outputFPS(30)
              .addOptions(["-af apad"])
              .withVideoCodec("libx264")
              .withAudioCodec("aac")
              .withAudioBitrate("128k")
              .size(size)
              // .autopad()
              .videoFilter(["setsar=1"])
              .addOptions(["-shortest", "-bsf:v h264_mp4toannexb"])
              .toFormat("mp4")
              .output(new_media_path)
              .on("start", function (commandLine) {
                dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
              })
              .on("progress", (progress) => {
                require("./sockets").notify({
                  socket,
                  localized_string: `creating_video`,
                  not_localized_string:
                    Number.parseFloat(progress.percent).toFixed(1) + "%",
                });
              })
              .on("end", () => {
                dev.logverbose(`Video conversion has been completed`);
                return resolve(newFileName);
              })
              .on("error", function (err, stdout, stderr) {
                dev.error("An error happened: " + err.message);
                dev.error("ffmpeg standard output:\n" + stdout);
                dev.error("ffmpeg standard error:\n" + stderr);
                return reject(`Couldn't convert video : ${err.message}`);
              })
              .run();
          });
        } else if (type === "optimize" && media_meta.type === "audio") {
          newFileName =
            new RegExp(global.settings.regexpRemoveFileExtension, "i").exec(
              newFileName
            )[1] + "_optimized.mp3";

          const new_media_path = path.join(slugFolderPath, newFileName);

          const ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options);

          fs.unlink(new_media_path, (err) => {
            ffmpeg_cmd
              .input(base_media_path)
              .withAudioCodec("libmp3lame")
              .withAudioBitrate("192k")
              .toFormat("mp3")
              .output(new_media_path)
              .on("start", function (commandLine) {
                dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
              })
              .on("progress", (progress) => {
                require("./sockets").notify({
                  socket,
                  localized_string: `creating_video`,
                  not_localized_string:
                    Number.parseFloat(progress.percent).toFixed(1) + "%",
                });
              })
              .on("end", () => {
                dev.logverbose(`Video conversion has been completed`);
                return resolve(newFileName);
              })
              .on("error", function (err, stdout, stderr) {
                dev.error("An error happened: " + err.message);
                dev.error("ffmpeg standard output:\n" + stdout);
                dev.error("ffmpeg standard error:\n" + stderr);
                return reject(`Couldn't convert video : ${err.message}`);
              })
              .run();
          });
        } else if (type === "trim" && media_meta.type === "video") {
          const trim_string = `_trim_${detail.beginning}_${detail.end}`.replace(
            /:/g,
            "-"
          );

          newFileName =
            new RegExp(global.settings.regexpRemoveFileExtension, "i").exec(
              newFileName
            )[1] +
            trim_string +
            ".mp4";
          const new_media_path = path.join(slugFolderPath, newFileName);

          const ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options);

          fs.unlink(new_media_path, (err) => {
            // see https://stackoverflow.com/a/48208806
            ffmpeg_cmd
              .input(base_media_path)
              .inputOptions([`-ss ${detail.beginning}`, `-to ${detail.end}`])
              .withVideoCodec("libx264")
              .toFormat("mp4")
              .output(new_media_path)
              .on("start", function (commandLine) {
                dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
              })
              .on("progress", (progress) => {
                require("./sockets").notify({
                  socket,
                  localized_string: `creating_video`,
                  not_localized_string:
                    Number.parseFloat(progress.percent).toFixed(1) + "%",
                });
              })
              .on("end", () => {
                dev.logverbose(`Video conversion has been completed`);
                return resolve(newFileName);
              })
              .on("error", function (err, stdout, stderr) {
                dev.error("An error happened: " + err.message);
                dev.error("ffmpeg standard output:\n" + stdout);
                dev.error("ffmpeg standard error:\n" + stderr);
                return reject(`Couldn't convert video : ${err.message}`);
              })
              .run();
          });
        } else if (type === "trim" && media_meta.type === "audio") {
          const trim_string = `_trim_${detail.beginning}_${detail.end}`.replace(
            /:/g,
            "-"
          );

          newFileName =
            new RegExp(global.settings.regexpRemoveFileExtension, "i").exec(
              newFileName
            )[1] +
            trim_string +
            ".mp3";
          const new_media_path = path.join(slugFolderPath, newFileName);

          const ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options);

          fs.unlink(new_media_path, (err) => {
            // see https://stackoverflow.com/a/48208806
            ffmpeg_cmd
              .input(base_media_path)
              .inputOptions([`-ss ${detail.beginning}`, `-to ${detail.end}`])
              .withAudioCodec("libmp3lame")
              .toFormat("mp3")
              .output(new_media_path)
              .on("start", function (commandLine) {
                dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
              })
              .on("progress", (progress) => {
                require("./sockets").notify({
                  socket,
                  localized_string: `creating_audio`,
                  not_localized_string:
                    Number.parseFloat(progress.percent).toFixed(1) + "%",
                });
              })
              .on("end", () => {
                dev.logverbose(`Audio conversion has been completed`);
                return resolve(newFileName);
              })
              .on("error", function (err, stdout, stderr) {
                dev.error("An error happened: " + err.message);
                dev.error("ffmpeg standard output:\n" + stdout);
                dev.error("ffmpeg standard error:\n" + stderr);
                return reject(`Couldn't convert audio : ${err.message}`);
              })
              .run();
          });
        } else {
          return reject(`Unknow recipe type : ${type}`);
        }
      });
    },
  };
})();
