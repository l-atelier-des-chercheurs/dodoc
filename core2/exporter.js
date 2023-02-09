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
  let all_tasks = [];

  const API = {
    createTask: async ({
      path_to_folder,
      path_to_parent_folder,
      instructions,
    }) => {
      dev.logfunction({ path_to_folder });

      if (instructions.recipe === "stopmotion") {
        const meta_filename = await _makeAndSaveStopmotionFrom({
          path_to_folder,
          path_to_parent_folder,
          field: instructions.field,
          frame_rate: instructions.frame_rate,
        });
        return meta_filename;
      } else {
        throw new Error(`missing_recipe`);
      }
    },
  };

  async function _makeAndSaveStopmotionFrom({
    path_to_folder,
    path_to_parent_folder,
    field,
    frame_rate = 4,
  }) {
    const images = await _loadFilesInOrder({ path_to_folder, field });
    const { full_path_to_new_video } = await _createStopmotionFromImages({
      images,
      frame_rate,
    });

    const desired_filename = "stopmotion.mp4";
    const meta_filename = await file.addFileToFolder({
      full_path_to_file: full_path_to_new_video,
      desired_filename,
      path_to_folder: path_to_parent_folder,
    });

    return meta_filename;
  }

  async function _loadFilesInOrder({ path_to_folder, field }) {
    const folder_meta = await folder.getFolder({ path_to_folder });
    const files = await file.getFiles({ path_to_folder });

    const list_of_metas_in_order = folder_meta[field];
    const selected_files = list_of_metas_in_order.map((lf) =>
      files.find((f) => f.$path.endsWith("/" + lf))
    );
    return selected_files;
  }

  function _createStopmotionFromImages({ images, frame_rate }) {
    return new Promise(async function (resolve, reject) {
      // we need to copy all images to a temp folder with the right naming

      let progress_pc = 0;

      const full_path_to_folder_in_cache = await _copyToCacheAndRenameImages({
        images,
      });

      progress_pc = 10;

      const width = images[0].$infos.width || 1280;
      const height = images[0].$infos.height || 720;

      const new_video_name =
        "stopmotion_" +
        +new Date() +
        (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 2) +
        ".mp4";
      const full_path_to_new_video = path.join(
        full_path_to_folder_in_cache,
        new_video_name
      );

      const _removeAllImages = async () => {
        await fs.remove(path.join(full_path_to_folder_in_cache, "*.jpeg"));
      };

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
          progress_pc = Math.round(
            10 +
              Math.min(1, progress.frames / (images.length / frame_rate)) *
                30 *
                0.85
          );
          // notifier.emit("fileCreated", path_to_parent_folder, {
          //   path_to_folder: path_to_parent_folder,
          //   meta,
          // });
        })
        .on("end", async () => {
          dev.logverbose("Video ended");
          progress_pc = 100;

          await _removeAllImages();
          return resolve({ full_path_to_new_video });
        })
        .on("error", async (err, stdout, stderr) => {
          dev.error("An error happened: " + err.message);
          dev.error("ffmpeg standard output:\n" + stdout);
          dev.error("ffmpeg standard error:\n" + stderr);
          await _removeAllImages();
          return reject(error);
        })
        .save(full_path_to_new_video);
    });
  }

  async function _copyToCacheAndRenameImages({ images }) {
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
