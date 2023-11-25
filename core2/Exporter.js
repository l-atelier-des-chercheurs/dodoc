const path = require("path"),
  fs = require("fs-extra"),
  ffmpeg = require("fluent-ffmpeg"),
  pad = require("pad-left"),
  writeFileAtomic = require("write-file-atomic"),
  { v4: uuidv4 } = require("uuid");

const utils = require("./utils"),
  folder = require("./folder"),
  file = require("./file"),
  settings = require("./settings"),
  notifier = require("./notifier"),
  tasks = require("./exporter_tasks/tasks"),
  optimizer = require("./exporter_tasks/optimizer");

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

class Exporter {
  constructor({ path_to_folder, folder_to_export_to, instructions }) {
    this.id = uuidv4();
    this.path_to_folder = path_to_folder;
    this.folder_to_export_to = folder_to_export_to;
    this.ffmpeg_cmd = null;

    this.instructions = instructions;
    this.status = "ready";
  }

  async start() {
    dev.logfunction();

    this.status = "started";

    let full_path_to_file;

    if (this.instructions.recipe === "stopmotion") {
      full_path_to_file = await this._createStopmotionFromImages();
    } else if (this.instructions.recipe === "pdf") {
      full_path_to_file = await this._loadPageAndPrint();
    } else if (this.instructions.recipe === "png") {
      full_path_to_file = await this._loadPageAndPrint();
    } else if (this.instructions.recipe === "trim_video") {
      full_path_to_file = await this._trimVideo();
    } else if (this.instructions.recipe === "mix_audio_and_image") {
      full_path_to_file = await this._mixAudioAndImage();
    } else if (this.instructions.recipe === "mix_audio_and_video") {
      full_path_to_file = await this._mixAudioAndVideo();
    } else if (this.instructions.recipe === "video_assemblage") {
      full_path_to_file = await this._videoAssemblage();
    } else if (this.instructions.recipe === "optimize_media") {
      full_path_to_file = await this._optimizeMedia();
    } else {
      throw new Error(`recipe_handling_missing`);
    }

    if (this.status === "aborted") {
      // todo remove full_path_to_file
      this._notifyEnded({
        event: "aborted",
      });
      throw new Error(`aborted`);
    }

    const additional_meta = this.instructions.additional_meta || {};

    const suggested_file_name = this.instructions.suggested_file_name
      ? utils.slug(this.instructions.suggested_file_name)
      : this.instructions.recipe;

    const meta_filename = await file.addFileToFolder({
      full_path_to_file,
      desired_filename: suggested_file_name,
      path_to_folder: this.folder_to_export_to,
      additional_meta,
    });

    const exported_path_to_meta = path.join(
      this.folder_to_export_to,
      meta_filename
    );
    const exported_file = await file.getFile({
      path_to_meta: exported_path_to_meta,
    });

    this._notifyEnded({
      event: "completed",
      file: exported_file,
    });

    return exported_path_to_meta;
  }
  abort() {
    if (this.ffmpeg_cmd) {
      this.ffmpeg_cmd.kill();
      this.ffmpeg_cmd = null;
    }
    this.status = "aborted";
  }

  async _loadFilesInOrder() {
    const folder_meta = await folder.getFolder({
      path_to_folder: this.path_to_folder,
    });
    const files = await file.getFiles({ path_to_folder: this.path_to_folder });

    const list_of_metas_in_order = folder_meta[this.instructions.field];
    const selected_files = list_of_metas_in_order.map((lf) =>
      files.find((f) => f.$path.endsWith("/" + lf))
    );
    return selected_files;
  }

  _createStopmotionFromImages() {
    return new Promise(async (resolve, reject) => {
      // we need to copy all images to a temp folder with the right naming
      const images = await this._loadFilesInOrder();

      this._notifyProgress(5);

      const width = images[0].$infos.width || 1280;
      const height = images[0].$infos.height || 720;
      const resolution = { width, height };

      const full_path_to_folder_in_cache =
        await this._copyToCacheAndRenameImages({
          images,
          resolution,
        });

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

      this._notifyProgress(10);

      const frame_rate = this.instructions.frame_rate || 4;
      const output_frame_rate = 30;

      this.ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
        .input(path.join(full_path_to_folder_in_cache, "img-%04d.jpeg"))
        .inputFPS(frame_rate)
        .withVideoCodec("libx264")
        .withVideoBitrate("4000k")
        .input("anullsrc")
        .inputFormat("lavfi")
        .duration(images.length / frame_rate)
        .size(`${width}x${height}`)
        .outputFPS(output_frame_rate)
        .autopad()
        .addOptions(["-preset slow", "-tune animation"])
        .toFormat("mp4")
        .on("start", (commandLine) => {
          dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
        })
        .on("progress", (progress) => {
          // value from 0 to 100
          const adv =
            (progress.frames /
              ((images.length / frame_rate) * output_frame_rate)) *
            100;

          const progress_percent = Math.round(utils.remap(adv, 0, 100, 15, 90));

          this._notifyProgress(progress_percent);
        })
        .on("end", async () => {
          dev.logverbose("Video ended");

          this._notifyProgress(95);

          await _removeAllImages();
          return resolve(full_path_to_new_video);
        })
        .on("error", async (err, stdout, stderr) => {
          dev.error("An error happened: " + err.message);
          dev.error("ffmpeg standard output:\n" + stdout);
          dev.error("ffmpeg standard error:\n" + stderr);
          await _removeAllImages();
          this._notifyEnded({
            event: "failed",
            info: err.message,
          });

          return reject(err);
        })
        .save(full_path_to_new_video);
    });
  }
  _notifyProgress(progress) {
    notifier.emit("taskStatus", "task_" + this.id, {
      task_id: this.id,
      progress,
    });
  }
  _notifyEnded(message) {
    notifier.emit("taskEnded", "task_" + this.id, {
      task_id: this.id,
      message,
    });
  }

  async _copyToCacheAndRenameImages({ images, resolution }) {
    let full_path_to_folder_in_cache = await utils.createFolderInCache(
      "stopmotion"
    );

    let index = 0;

    for (const image of images) {
      const path_to_image =
        image.$path.substring(0, image.$path.lastIndexOf("/") + 1) +
        image.$media_filename;
      const source = utils.getPathToUserContent(path_to_image);
      const destination = path.join(
        full_path_to_folder_in_cache,
        "img-" + pad(index, 4, "0") + ".jpeg"
      );

      await utils.convertAndCopyImage({ source, destination, resolution });
      // await fs.copy(source, destination);
      index++;
    }

    return full_path_to_folder_in_cache;
  }

  _loadPageAndPrint() {
    return new Promise(async (resolve, reject) => {
      // convert path_to_folder to URL (see createURLFromPath)
      const path_without_space = this.path_to_folder
        .replace("spaces/", "/+")
        .replace("projects/", "");

      let url = global.appInfos.homeURL + path_without_space;

      let query = {};
      if (this.instructions.page) {
        query.page = this.instructions.page;
        query.make_preview = true;
      }

      const { general_password } = await settings.get();
      if (!!general_password) query.general_password = general_password;

      if (Object.keys(query).length > 0) {
        const searchParams = new URLSearchParams(query);
        url += "?" + searchParams.toString();
      }

      // open page https://localhost:8080/projects/hehe/publications/test-pages/
      const { BrowserWindow } = require("electron");

      const document_size = {
        width: this.instructions.page_width * 1 || 210,
        height: this.instructions.page_height * 1 || 297,
      };
      const magnify_factor =
        this.instructions.layout_mode === "print" ? 3.7952 : 1;

      // magnify browser window size if print with css px to mm of 3.7952
      // if screen, browser window size is same as page size
      const bw_pagesize = {
        width: Math.floor(document_size.width * magnify_factor),
        height: Math.floor(document_size.height * magnify_factor) + 0 /*25*/,
        // height: Math.floor(document_size.height * magnify_factor) + 25 /*25*/,
      };

      // print to pdf with size, try to match pagesize with pixels
      const reduction_factor =
        this.instructions.layout_mode === "print" ? 1 : 3.7952;

      const printToPDF_pagesize = {
        width: (document_size.width * 1000) / reduction_factor,
        height: (document_size.height * 1000) / reduction_factor,
      };

      let win = new BrowserWindow({
        // width: 800,
        // height: 800,
        width: bw_pagesize.width,
        height: bw_pagesize.height,
        show: false,
        enableLargerThanScreen: true,
        webPreferences: {
          contextIsolation: true,
          allowRunningInsecureContent: true,
          offscreen: true,
        },
      });
      win.loadURL(url);
      win.webContents.setAudioMuted(true);

      this._notifyProgress(5);

      let page_timeout = setTimeout(() => {
        clearTimeout(page_timeout);
        if (win) win.close();
        return reject(new Error(`page-timeout`));
      }, 30_000);

      win.webContents.once("did-finish-load", async () => {
        dev.logverbose("did-finish-load " + url);
        this._notifyProgress(40);

        new Promise(function (resolve, reject) {
          setTimeout(() => resolve(1), 4000);
        })
          .then(() => {
            this._notifyProgress(45);
            if (this.instructions.recipe === "pdf")
              return win.webContents.printToPDF({
                // electron < 21
                marginsType: 0,
                // electron >= 21
                // margins are set using @page in css
                margins: { marginType: "default" },
                pageSize: printToPDF_pagesize,
                printBackground: true,
                printSelectionOnly: false,
              });
            else if (this.instructions.recipe === "png")
              return win.capturePage();
          })
          .then((data) => {
            this._notifyProgress(80);
            if (win) win.close();
            clearTimeout(page_timeout);
            return data;
          })
          .then(async (data) => {
            if (this.instructions.recipe === "pdf") {
              const full_path_to_pdf = await this._saveData("pdf", data);
              this._notifyProgress(95);
              return resolve(full_path_to_pdf);
            } else if (this.instructions.recipe === "png") {
              const full_path_to_image = await this._saveData(
                "png",
                data.toPNG(1.0)
              );
              return resolve(full_path_to_image);
            }
          })
          .catch((error) => {
            dev.logverbose("Failed to print to pdf " + url);
            dev.error(error.message);
            if (win) win.close();
            clearTimeout(page_timeout);
            this._notifyEnded({
              event: "failed",
            });
            return reject(error);
          });
      });

      win.webContents.once(
        "did-fail-load",
        (event, code, desc, url, isMainFrame) => {
          dev.error(`Failed to load print pdf page ${url}`);
          clearTimeout(page_timeout);
          dev.error("did-fail-load: ");
          // dev.error("did-fail-load: ", event, code, desc, url, isMainFrame);
          if (win) win.close();

          this._notifyEnded({
            event: "failed",
          });
          return reject(new Error(`did-fail-load`));
        }
      );
    });
    // print to pdf
  }

  _trimVideo() {
    return new Promise(async (resolve, reject) => {
      this._notifyProgress(5);

      const {
        full_path_to_folder_in_cache,
        full_path_to_new_file: full_path_to_new_video,
      } = await this._createTempFolderAndName("video", "mp4");

      const base_media_path = utils.getPathToUserContent(
        this.instructions.base_media_path
      );
      const { start, end } = this.instructions.selection;

      this._notifyProgress(10);

      this.ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
        .input(base_media_path)
        .inputOptions([`-ss ${start}`, `-to ${end}`])
        .withVideoCodec("libx264")
        .toFormat("mp4")
        .on("start", (commandLine) => {
          dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
        })
        .on("progress", (progress) => {
          if (progress.percent) {
            const progress_percent = Math.round(
              utils.remap(progress.percent, 0, 100, 15, 90)
            );
            this._notifyProgress(progress_percent);
          } else this._notifyProgress(40);
        })
        .on("end", async () => {
          dev.logverbose("Video ended");
          this._notifyProgress(95);
          return resolve(full_path_to_new_video);
        })
        .on("error", async (err, stdout, stderr) => {
          dev.error("An error happened: " + err.message);
          dev.error("ffmpeg standard output:\n" + stdout);
          dev.error("ffmpeg standard error:\n" + stderr);
          this._notifyEnded({
            event: "failed",
            info: err.message,
          });
          await fs.remove(full_path_to_folder_in_cache);
          return reject(err);
        })
        .save(full_path_to_new_video);
    });
  }

  _mixAudioAndImage() {
    return new Promise(async (resolve, reject) => {
      this._notifyProgress(5);

      const {
        full_path_to_folder_in_cache,
        full_path_to_new_file: full_path_to_new_video,
      } = await this._createTempFolderAndName("video", "mp4");

      const base_audio_path = utils.getPathToUserContent(
        this.instructions.base_audio_path
      );
      const base_image_path = utils.getPathToUserContent(
        this.instructions.base_image_path
      );

      const output_width = this.instructions.output_width;
      const output_height = this.instructions.output_height;

      this._notifyProgress(10);

      this.ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
        .input(base_image_path)
        .loop()
        .input(base_audio_path)
        .withVideoCodec("libx264")
        .withVideoBitrate("4000k")
        .addOptions(["-shortest"])
        .withAudioCodec("aac")
        .withAudioBitrate("192k")
        .addOptions(["-tune stillimage", "-pix_fmt yuv420p"])
        .videoFilters(
          `scale=w=${output_width}:h=${output_height}:force_original_aspect_ratio=1,pad=${output_width}:${output_height}:(ow-iw)/2:(oh-ih)/2`
        )
        .outputFPS(30)
        .toFormat("mp4")
        .on("start", (commandLine) => {
          dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
        })
        .on("progress", (progress) => {
          if (progress.percent) {
            const progress_percent = Math.round(
              utils.remap(progress.percent, 0, 100, 15, 90)
            );
            this._notifyProgress(progress_percent);
          } else this._notifyProgress(40);
        })
        .on("end", async () => {
          dev.logverbose("Video ended");
          this._notifyProgress(95);
          return resolve(full_path_to_new_video);
        })
        .on("error", async (err, stdout, stderr) => {
          dev.error("An error happened: " + err.message);
          dev.error("ffmpeg standard output:\n" + stdout);
          dev.error("ffmpeg standard error:\n" + stderr);
          this._notifyEnded({
            event: "failed",
            info: err.message,
          });
          await fs.remove(full_path_to_folder_in_cache);
          return reject(err);
        })
        .save(full_path_to_new_video);
    });
  }
  _mixAudioAndVideo() {
    return new Promise(async (resolve, reject) => {
      this._notifyProgress(5);

      const {
        full_path_to_folder_in_cache,
        full_path_to_new_file: full_path_to_new_video,
      } = await this._createTempFolderAndName("video", "mp4");

      const base_audio_path = utils.getPathToUserContent(
        this.instructions.base_audio_path
      );
      const base_video_path = utils.getPathToUserContent(
        this.instructions.base_video_path
      );

      const output_width = this.instructions.output_width;
      const output_height = this.instructions.output_height;
      const duration = this.instructions.duration;

      this._notifyProgress(10);

      this.ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
        .input(base_video_path)
        .input(base_audio_path)
        .duration(duration)
        // .withVideoCodec('copy')
        .withVideoCodec("libx264")
        .withVideoBitrate("4000k")
        .withAudioCodec("aac")
        .withAudioBitrate("192k")
        .addOptions(["-map 0:v:0", "-map 1:a:0", "-af apad"])
        .videoFilters(
          `scale=w=${output_width}:h=${output_height}:force_original_aspect_ratio=1,pad=${output_width}:${output_height}:(ow-iw)/2:(oh-ih)/2`
        )
        .toFormat("mp4")
        .on("start", (commandLine) => {
          dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
        })
        .on("progress", (progress) => {
          if (progress.percent) {
            const progress_percent = Math.round(
              utils.remap(progress.percent, 0, 100, 15, 90)
            );
            this._notifyProgress(progress_percent);
          } else this._notifyProgress(40);
        })
        .on("end", async () => {
          dev.logverbose("Video ended");
          this._notifyProgress(95);
          return resolve(full_path_to_new_video);
        })
        .on("error", async (err, stdout, stderr) => {
          dev.error("An error happened: " + err.message);
          dev.error("ffmpeg standard output:\n" + stdout);
          dev.error("ffmpeg standard error:\n" + stderr);
          this._notifyEnded({
            event: "failed",
            info: err.message,
          });
          await fs.remove(full_path_to_folder_in_cache);
          return reject(err);
        })
        .save(full_path_to_new_video);
    });
  }

  async _videoAssemblage() {
    this._notifyProgress(5);

    const {
      full_path_to_folder_in_cache,
      full_path_to_new_file: full_path_to_new_video,
    } = await this._createTempFolderAndName("video", "mp4");

    if (
      !Array.isArray(this.instructions.montage) ||
      this.instructions.montage.length === 0
    )
      return reject(new Error(`no-montage-in-instructions`));

    const bitrate = "6000k";
    const output_width = this.instructions.output_width;
    const output_height = this.instructions.output_height;
    const resolution = { width: output_width, height: output_height };

    this._notifyProgress(10);

    try {
      const temp_videos_array = [];

      for (const [index, media] of this.instructions.montage.entries()) {
        const media_full_path = utils.getPathToUserContent(media.path);
        const media_type = media.type;
        const transition_in = media.transition_in;
        const transition_out = media.transition_out;

        let video_path, duration;

        const that = this;
        const total_number_of_items_to_process =
          this.instructions.montage.length;
        // 50
        const intval = 100 / total_number_of_items_to_process;
        const reportFFMPEGProgress = (ffmpeg_progress) => {
          let progress_percent = Math.round(
            utils.remap(
              ffmpeg_progress,
              0,
              100,
              index * intval,
              index * intval + intval
            )
          );
          progress_percent = Math.round(
            utils.remap(progress_percent, 0, 100, 15, 75)
          );
          that._notifyProgress(progress_percent);
        };

        if (media_type === "image") {
          ({ video_path, duration } = await tasks.prepareImageForMontageAndWeb({
            media_full_path,
            full_path_to_folder_in_cache,
            resolution,
            bitrate,
            ffmpeg_cmd: this.ffmpeg_cmd,
          }));
        } else if (media_type === "video") {
          ({ video_path, duration } = await tasks.prepareVideoForMontageAndWeb({
            media_full_path,
            full_path_to_folder_in_cache,
            resolution,
            bitrate,
            ffmpeg_cmd: this.ffmpeg_cmd,
            reportFFMPEGProgress,
          }));
        } else {
          continue;
        }

        temp_videos_array.push({
          video_path,
          duration,
          transition_in,
          transition_out,
        });
      }

      this._notifyProgress(75);

      await tasks.mergeAllVideos({
        temp_videos_array,
        bitrate,
        ffmpeg_cmd: this.ffmpeg_cmd,
        full_path_to_new_video,
      });

      dev.logverbose("Video created");
      this._notifyProgress(95);
      return full_path_to_new_video;
    } catch (err) {
      dev.error("An error happened: " + err.message);
      await fs.remove(full_path_to_folder_in_cache);
      this._notifyEnded({
        event: "failed",
        info: err.message,
      });
      throw err;
    }
  }

  async _optimizeMedia() {
    this._notifyProgress(5);

    let filetype, fileext;
    if (
      utils.fileExtensionIs(this.instructions.base_media_path, [
        ".heic",
        ".tif",
        ".tiff",
        ".webp",
      ])
    ) {
      filetype = "image";
      fileext = "jpeg";
    } else if (
      utils.fileExtensionIs(this.instructions.base_media_path, [
        ".flv",
        ".mov",
        ".avi",
        ".webm",
      ])
    ) {
      filetype = "video";
      fileext = "mp4";
    } else if (
      utils.fileExtensionIs(this.instructions.base_media_path, [
        ".amr",
        ".wma",
        ".aif",
        ".flac",
      ])
    ) {
      filetype = "audio";
      fileext = "aac";
    }
    let { full_path_to_folder_in_cache, full_path_to_new_file } =
      await this._createTempFolderAndName(filetype, fileext);

    const base_media_path = utils.getPathToUserContent(
      this.instructions.base_media_path
    );

    this._notifyProgress(10);

    const that = this;
    const reportFFMPEGProgress = (ffmpeg_progress) => {
      const progress_percent = Math.round(
        utils.remap(ffmpeg_progress, 0, 100, 15, 90)
      );
      that._notifyProgress(progress_percent);
    };

    try {
      if (utils.fileExtensionIs(this.instructions.base_media_path, [".heic"])) {
        await optimizer.convertHEIC({
          source: base_media_path,
          destination: full_path_to_new_file,
        });
      } else if (
        utils.fileExtensionIs(this.instructions.base_media_path, [
          ".tif",
          ".tiff",
          ".webp",
        ])
      ) {
        await optimizer.convertImage({
          source: base_media_path,
          destination: full_path_to_new_file,
        });
      } else if (
        utils.fileExtensionIs(this.instructions.base_media_path, [
          ".flv",
          ".mov",
          ".avi",
          ".webm",
        ])
      ) {
        await optimizer.convertVideo({
          source: base_media_path,
          destination: full_path_to_new_file,
          ffmpeg_cmd: this.ffmpeg_cmd,
          reportFFMPEGProgress,
        });
      } else if (
        utils.fileExtensionIs(this.instructions.base_media_path, [
          ".amr",
          ".wma",
          ".aif",
          ".flac",
        ])
      ) {
        await optimizer.convertAudio({
          source: base_media_path,
          destination: full_path_to_new_file,
          ffmpeg_cmd: this.ffmpeg_cmd,
          reportFFMPEGProgress,
        });
      } else {
        throw new Error(`no_conversion_task_found`);
      }

      this._notifyProgress(95);
      return full_path_to_new_file;
    } catch (err) {
      await fs.remove(full_path_to_folder_in_cache);
      this._notifyEnded({
        event: "failed",
        info: err.message,
      });
      throw err;
    }
  }

  async _saveData(type, data) {
    const full_path_to_folder_in_cache = await utils.createUniqueFolderInCache(
      type
    );
    const full_path_to_file = path.join(
      full_path_to_folder_in_cache,
      "file." + type
    );
    await writeFileAtomic(full_path_to_file, data);
    return full_path_to_file;
  }

  async _createTempFolderAndName(prefix, extension) {
    const full_path_to_folder_in_cache = await utils.createUniqueFolderInCache(
      prefix
    );
    const new_video_name = utils.createUniqueName(prefix) + "." + extension;
    const full_path_to_new_file = path.join(
      full_path_to_folder_in_cache,
      new_video_name
    );
    return { full_path_to_folder_in_cache, full_path_to_new_file };
  }
}

module.exports = Exporter;
