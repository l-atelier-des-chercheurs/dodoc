const path = require("path"),
  fs = require("fs-extra"),
  ffmpegPath = require("ffmpeg-static"),
  { path: ffprobePath } = require("ffprobe-static"),
  ffmpeg = require("fluent-ffmpeg"),
  pad = require("pad-left"),
  { v4: uuidv4 } = require("uuid");

const utils = require("./utils"),
  folder = require("./folder"),
  file = require("./file"),
  notifier = require("./notifier");

class Exporter {
  constructor({ path_to_folder, path_to_parent_folder, instructions }) {
    this.id = uuidv4();
    this.path_to_folder = path_to_folder;
    this.path_to_parent_folder = path_to_parent_folder;

    this.field = instructions.field;
    this.frame_rate = instructions.frame_rate || 4;
    this.status = "ready";
  }

  async start() {
    this.status = "started";
    return await this._makeAndSaveStopmotionFrom();
  }
  abort() {
    if (this.ffmpeg_cmd) this.ffmpeg_cmd.kill();
    this.status = "aborted";
  }

  async _makeAndSaveStopmotionFrom() {
    const images = await this._loadFilesInOrder();
    const { full_path_to_new_video } = await this._createStopmotionFromImages({
      images,
    });

    if (this.status === "aborted") throw new Error(`aborted`);

    const desired_filename = "stopmotion.mp4";
    const meta_filename = await file.addFileToFolder({
      full_path_to_file: full_path_to_new_video,
      desired_filename,
      path_to_folder: this.path_to_parent_folder,
    });

    return meta_filename;
  }

  async _loadFilesInOrder() {
    const folder_meta = await folder.getFolder({
      path_to_folder: this.path_to_folder,
    });
    const files = await file.getFiles({ path_to_folder: this.path_to_folder });

    const list_of_metas_in_order = folder_meta[this.field];
    const selected_files = list_of_metas_in_order.map((lf) =>
      files.find((f) => f.$path.endsWith("/" + lf))
    );
    return selected_files;
  }

  _createStopmotionFromImages({ images }) {
    return new Promise(async (resolve, reject) => {
      // we need to copy all images to a temp folder with the right naming

      this._notify({
        event: "ffmpeg_compilation_in_progress",
        progress_percent: 0,
      });

      const full_path_to_folder_in_cache =
        await this._copyToCacheAndRenameImages({
          images,
        });

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
        // todo implement this
        // await fs.remove(path.join(full_path_to_folder_in_cache, "*.jpeg"));
      };

      this._notify({
        event: "ffmpeg_compilation_in_progress",
        progress_percent: 10,
      });

      this.ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
        .input(path.join(full_path_to_folder_in_cache, "img-%05d.jpeg"))
        .inputFPS(this.frame_rate)
        .withVideoCodec("libx264")
        .withVideoBitrate("4000k")
        .input("anullsrc")
        .inputFormat("lavfi")
        .duration(images.length / this.frame_rate)
        .size(`${width}x${height}`)
        .outputFPS(30)
        .autopad()
        .addOptions(["-preset slow", "-tune animation"])
        .toFormat("mp4")
        .on("start", (commandLine) => {
          dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
        })
        .on("progress", (progress) => {
          // value from 0 to 100
          const adv =
            (progress.frames / ((images.length / this.frame_rate) * 30)) * 100;
          const progress_percent = Math.round(10 + adv * 0.85);

          this._notify({
            event: "ffmpeg_compilation_in_progress",
            progress_percent,
          });
        })
        .on("end", async () => {
          dev.logverbose("Video ended");

          this._notify({
            event: "ffmpeg_compilation_in_progress",
            progress_percent: 95,
          });

          await _removeAllImages();
          return resolve({ full_path_to_new_video });
        })
        .on("error", async (err, stdout, stderr) => {
          dev.error("An error happened: " + err.message);
          dev.error("ffmpeg standard output:\n" + stdout);
          dev.error("ffmpeg standard error:\n" + stderr);
          await _removeAllImages();
          _notify({
            event: "ffmpeg_compilation_failed",
            info: err.message,
          });

          return reject(err);
        })
        .save(full_path_to_new_video);
    });
  }
  _notify(message) {
    const task_id = "task_" + this.id;
    notifier.emit("taskStatus", task_id, {
      task_id,
      message,
    });
  }

  async _copyToCacheAndRenameImages({ images }) {
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
}

module.exports = Exporter;
