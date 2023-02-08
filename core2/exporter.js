const path = require("path"),
  fs = require("fs-extra"),
  ffmpegPath = require("ffmpeg-static"),
  { path: ffprobePath } = require("ffprobe-static"),
  ffmpeg = require("fluent-ffmpeg"),
  pad = require("pad-left");

const utils = require("./utils"),
  folder = require("./folder"),
  file = require("./file");

module.exports = (function () {
  const API = {
    createTask: async ({ path_to_folder, instructions }) => {
      dev.logfunction({ path_to_folder });

      const folder_meta = await folder.getFolder({ path_to_folder });
      const files = await file.getFiles({ path_to_folder });

      const recipe = instructions.recipe;

      if (recipe === "stopmotion") {
        const field = instructions.field;
        const list_of_metas_in_order = folder_meta[field];
        const images = list_of_metas_in_order.map((lf) =>
          files.find((f) => f.$path.endsWith("/" + lf))
        );
        const frame_rate = instructions.frame_rate || 4;

        // todo start task

        const new_video_name = await _createStopmotionFromImages({
          path_to_folder,
          images,
          frame_rate,
        });
        debugger;
      }
    },
  };

  function _createStopmotionFromImages({ path_to_folder, images, frame_rate }) {
    return new Promise(async function (resolve, reject) {
      // we need to copy all images to a temp folder with the right naming
      const full_path_to_folder_in_cache = await copyToCacheAndRenameImages({
        images,
      });

      const width = images[0].$infos.width || 1280;
      const height = images[0].$infos.height || 720;

      const new_video_name =
        "stopmotion_" +
        +new Date() +
        (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 2) +
        ".mp4";
      const full_path_to_new_video = utils.getPathToUserContent(
        path_to_folder,
        new_video_name
      );

      const ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
        .input(path.join(full_path_to_folder_in_cache, "img-%05d.jpeg"))
        .inputFPS(frame_rate)
        .withVideoCodec("libx264")
        .withVideoBitrate("4000k")
        .input("anullsrc")
        .inputFormat("lavfi")
        .duration(images.length / frame_rate)
        .size(`${width}x${height}`)
        .outputFPS(30)
        .autopad()
        .addOptions(["-preset slow", "-tune animation"])
        .toFormat("mp4")
        .on("start", (commandLine) => {
          dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
        })
        .on("progress", (progress) => {
          // _notifyFfmpegProgress({ socket, progress });
        })
        .on("end", () => {
          return resolve(new_video_name);
        })
        .on("error", function (err, stdout, stderr) {
          dev.error("An error happened: " + err.message);
          dev.error("ffmpeg standard output:\n" + stdout);
          dev.error("ffmpeg standard error:\n" + stderr);
          return reject(error);
        })
        .save(full_path_to_new_video);
    });
  }

  async function copyToCacheAndRenameImages({ images }) {
    // generate random folder name
    let folder_name =
      "stopmotion_" +
      +utils.getCurrentDate() +
      "-" +
      (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 2);
    let full_path_to_folder_in_cache = utils.getPathToCache(folder_name);
    await fs.ensureDir(full_path_to_folder_in_cache);

    let index = 0;
    for (const image of images) {
      const path_to_image =
        image.$path.substring(0, image.$path.lastIndexOf("/") + 1) +
        image.$media_filename;
      const source = utils.getPathToUserContent(path_to_image);
      const destination = path.join(
        full_path_to_folder_in_cache,
        "img-" + pad(index, 5, "0") + ".jpeg"
      );
      await fs.copy(source, destination);
      index++;
    }

    return full_path_to_folder_in_cache;
  }

  return API;
})();
