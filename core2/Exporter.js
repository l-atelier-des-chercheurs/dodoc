const path = require("path"),
  fs = require("fs-extra"),
  ffmpeg = require("fluent-ffmpeg"),
  pad = require("pad-left"),
  writeFileAtomic = require("write-file-atomic"),
  { v4: uuidv4 } = require("uuid");

const utils = require("./utils"),
  folder = require("./folder"),
  file = require("./file"),
  thumbs = require("./thumbs"),
  notifier = require("./notifier"),
  auth = require("./auth"),
  tasks = require("./exporter_tasks/tasks"),
  effects = require("./exporter_tasks/effects"),
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
    } else if (this.instructions.recipe === "stopmotion_animation") {
      full_path_to_file = await this._createStopmotionFromImages();
    } else if (this.instructions.recipe === "pdf") {
      full_path_to_file = await this._loadPageAndPrint();
    } else if (this.instructions.recipe === "png") {
      full_path_to_file = await this._loadPageAndPrint();
    } else if (this.instructions.recipe === "webpage") {
      full_path_to_file = await this._loadPageAndExport();
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
    } else if (this.instructions.recipe === "video_effects") {
      full_path_to_file = await this._videoEffects();
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

    // remove temp file
    await fs.remove(full_path_to_file);

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
    const selected_files = list_of_metas_in_order.reduce((acc, lf) => {
      const meta = lf.m || lf;
      const duration = lf.d || 1;
      const file = files.find((f) => f.$path.endsWith("/" + meta));
      if (!file || file.$type !== "image") return acc;

      for (let i = 0; i < duration; i++) {
        acc.push(file);
      }
      return acc;
    }, []);
    return selected_files;
  }
  async _loadFilesFromParentFolder() {
    this.instructions.images_meta;

    const grand_parent_path = utils.getContainingFolder(
      utils.getContainingFolder(this.path_to_folder)
    );
    const files = await file.getFiles({ path_to_folder: grand_parent_path });

    const selected_files = this.instructions.images_meta.reduce((acc, lf) => {
      const meta = lf.m;
      const duration = lf.d || 1;
      const file = files.find((f) => f.$path.endsWith("/" + meta));
      if (!file || file.$type !== "image") return acc;

      for (let i = 0; i < duration; i++) {
        acc.push(file);
      }
      return acc;
    }, []);
    return selected_files;
  }

  _createStopmotionFromImages() {
    return new Promise(async (resolve, reject) => {
      // we need to copy all images to a temp folder with the right naming
      let images = [];
      if (this.instructions.hasOwnProperty("field")) {
        images = await this._loadFilesInOrder();
      } else if (this.instructions.hasOwnProperty("images_meta")) {
        images = await this._loadFilesFromParentFolder();
      }

      // images is an array of files
      this._notifyProgress(5);

      const { output_width, output_height, video_bitrate, output_format } =
        this._extractResolutionAndBitrate(this.instructions);

      if (!output_width) output_width = images[0].$infos.width || 1280;
      if (!output_height) output_height = images[0].$infos.height || 720;
      if (!video_bitrate) video_bitrate = 4000;

      const full_path_to_folder_in_cache =
        await this._copyToCacheAndRenameImages({
          images,
          output_width,
          output_height,
        });

      const file_ext = output_format === "gif" ? ".gif" : ".mp4";
      const new_video_name = utils.createUniqueName("stopmotion") + file_ext;
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
        .inputFPS(frame_rate);

      if (output_format === "gif") {
        this.ffmpeg_cmd.inputOption("-stream_loop -1");
      } else {
        this.ffmpeg_cmd
          .withVideoCodec("libx264")
          .withVideoBitrate(video_bitrate)
          .input("anullsrc")
          .inputFormat("lavfi");
      }

      this.ffmpeg_cmd
        .duration(images.length / frame_rate)
        .size(`${output_width}x${output_height}`)
        .outputFPS(output_frame_rate)
        .autopad()
        .addOptions(["-preset slow", "-tune animation"])
        .toFormat(output_format === "gif" ? "gif" : "mp4");

      this.ffmpeg_cmd
        .on("start", (commandLine) => {
          dev.log("Spawned Ffmpeg with command: \n" + commandLine);
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
    dev.logverbose("Task " + this.id + " progress = " + progress);
    notifier.emit("taskStatus", "task_" + this.id, {
      task_id: this.id,
      progress,
    });
  }
  _notifyEnded(message) {
    dev.logverbose("Task " + this.id + " end");
    notifier.emit("taskEnded", "task_" + this.id, {
      task_id: this.id,
      message,
    });
  }

  async _copyToCacheAndRenameImages({ images, output_width, output_height }) {
    let full_path_to_folder_in_cache = await utils.createUniqueFolderInCache(
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

      await utils.convertAndCopyImage({
        source,
        destination,
        width: output_width,
        height: output_height,
      });
      // await fs.copy(source, destination);
      index++;
    }

    return full_path_to_folder_in_cache;
  }

  async _loadPageAndPrint() {
    try {
      // convert path_to_folder to URL (see createURLFromPath)
      dev.logfunction();
      const path_without_space = this.path_to_folder
        .replace("spaces" + path.sep, "/+")
        .replace("projects" + path.sep, "");

      let url = global.appInfos.homeURL + path_without_space;

      let query = {};
      if (this.instructions.page) {
        query.page = this.instructions.page;
        query.make_preview = true;
      }

      // use superamdin token
      const sat = auth.getSuperadminToken();
      query.sat = sat;

      if (Object.keys(query).length > 0) {
        const searchParams = new URLSearchParams(query);
        url += "?" + searchParams.toString();
      }

      const puppeteer = require("puppeteer");

      const document_size = {
        width: this.instructions.page_width * 1 || 210,
        height: this.instructions.page_height * 1 || 297,
      };
      const magnify_factor =
        this.instructions.layout_mode === "print" ? 3.7952 : 1;

      // magnify browser window size if print with css px to mm of 3.78
      // if screen, browser window size is same as page size
      const bw_pagesize = {
        width: Math.floor(document_size.width * magnify_factor),
        height: Math.floor(document_size.height * magnify_factor) + 0,
      };

      // print to pdf with size, try to match pagesize with pixels
      const reduction_factor =
        this.instructions.layout_mode === "print" ? 1 : 3.7952;

      const printToPDF_pagesize = {
        width: document_size.width / reduction_factor,
        height: document_size.height / reduction_factor,
      };

      let browser;

      let page_timeout = setTimeout(async () => {
        clearTimeout(page_timeout);
        if (browser) await browser.close();
        this._notifyEnded({
          event: "failed",
        });
        const err = new Error("Failed to capture media screenshot");
        err.code = "failed_to_capture_media_screenshot_page-timeout";
        throw err;
      }, 30_000);

      browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: ["--no-sandbox", "--font-render-hinting=none"],
      });

      this._notifyProgress(15);
      const page = await browser.newPage();

      // Set screen size
      await page.setViewport({
        width: bw_pagesize.width,
        height: bw_pagesize.height,
        deviceScaleFactor: 2,
      });

      this._notifyProgress(30);
      await page
        .goto(url, {
          waitUntil: "networkidle0",
        })
        .catch((err) => {
          throw err;
        });
      this._notifyProgress(50);

      page.emulateMediaType("print");

      await new Promise((r) => setTimeout(r, 3000));
      this._notifyProgress(70);

      let path_to_temp_file = "";

      if (this.instructions.recipe === "pdf") {
        path_to_temp_file = await this._saveData("pdf");
        await page.pdf({
          path: path_to_temp_file,
          printBackground: true,
          width: `${printToPDF_pagesize.width}mm`,
          height: `${printToPDF_pagesize.height}mm`,
        });
      } else if (this.instructions.recipe === "png") {
        path_to_temp_file = await this._saveData("png");
        await page.screenshot({
          path: path_to_temp_file,
          clip: {
            x: 0,
            y: 0,
            width: Math.floor(bw_pagesize.width),
            height: Math.floor(bw_pagesize.height),
          },
        });
      }

      this._notifyProgress(95);
      if (page_timeout) clearTimeout(page_timeout);
      if (browser) await browser.close();

      return path_to_temp_file;
    } catch (err) {
      dev.error(`err for puppeteer ${err}`);
      if (page_timeout) clearTimeout(page_timeout);
      this._notifyEnded({
        event: "failed",
      });
      throw new Error(`failed`);
    }
  }

  _loadPageAndExport() {
    return new Promise(async (resolve, reject) => {
      this._notifyProgress(5);

      // convert path_to_folder to URL (see createURLFromPath)
      dev.logfunction();

      const path_without_space = this.path_to_folder
        .replace("spaces" + path.sep, "/+")
        .replace("projects" + path.sep, "");

      let url = global.appInfos.homeURL + path_without_space;

      let query = {};
      if (this.instructions.page) {
        query.page = this.instructions.page;
        query.make_preview = true;
      }

      // use superamdin token
      const sat = auth.getSuperadminToken();
      query.sat = sat;

      if (Object.keys(query).length > 0) {
        const searchParams = new URLSearchParams(query);
        url += "?" + searchParams.toString();
      }

      const res = this.instructions.express_res;

      // get necessary files
      let folder_data = await folder.getFolder({
        path_to_folder: this.path_to_folder,
      });
      folder_data.$files = await file.getFiles({
        path_to_folder: this.path_to_folder,
        embed_source: true,
      });

      this._notifyProgress(24);

      const full_path_to_folder_in_cache =
        await utils.createUniqueFolderInCache("webpage_export");

      const length = folder_data.$files.length;

      for (const [index, file] of folder_data.$files.entries()) {
        this._notifyProgress(25 + Math.round((index / length) * 50));

        if (!file.source_medias) continue;

        try {
          for (const source_media of file.source_medias) {
            if (!source_media._media?.$media_filename) continue;

            // copy necessary medias from the project to the cache
            const parent_folder_path = utils.getContainingFolder(
              source_media._media.$path
            );
            const parent_folder_full_path =
              utils.getPathToUserContent(parent_folder_path);
            const source = path.join(
              parent_folder_full_path,
              source_media._media.$media_filename
            );
            const destination = path.join(
              full_path_to_folder_in_cache,
              "medias",
              source_media._media.$media_filename
            );
            await fs.copy(source, destination);

            // copy necessary thumbs from the project to the cache
            if (
              !source_media._media?.$thumbs ||
              typeof source_media._media.$thumbs !== "object"
            )
              continue;

            const full_path_to_thumb = await utils.getPathToUserContent(
              await thumbs.getThumbFolderPath(parent_folder_path)
            );

            await thumbs.copyAllThumbsForFile({
              full_path_to_thumb,
              full_path_to_new_thumb: path.join(
                full_path_to_folder_in_cache,
                "thumbs"
              ),
              media_filename: source_media._media.$media_filename,
            });
          }
        } catch (error) {
          dev.error(error.message);
          throw error;
        }
      }

      this._notifyProgress(76);

      res.render(
        "index",
        {
          page_is_standalone_html: true,
          folder_data,
        },
        async (err, html) => {
          ////////////////////////////////////////////////////////////// HTML
          const full_path_to_html_file = path.join(
            full_path_to_folder_in_cache,
            "index.html"
          );
          await writeFileAtomic(full_path_to_html_file, html);

          ////////////////////////////////////////////////////////////// CLIENT DIST
          const full_path_to_client_dist = path.join(
            `${global.appRoot.replace(
              `${path.sep}app.asar`,
              `${path.sep}app.asar.unpacked`
            )}`,
            "client",
            "dist"
          );
          const destination_path = path.join(
            full_path_to_folder_in_cache,
            "_client"
          );
          await fs.copy(full_path_to_client_dist, destination_path);

          this._notifyProgress(80);

          // ZIP folder
          const full_path_to_zip_file = await utils.createZIPFromFolder({
            full_path_to_folder: full_path_to_folder_in_cache,
          });

          await fs.remove(full_path_to_folder_in_cache);

          this._notifyProgress(95);

          return resolve(full_path_to_zip_file);
        }
      );
    });
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
      let volume = 1;
      if (typeof this.instructions.volume !== "undefined")
        volume = this.instructions.volume / 100;

      this._notifyProgress(10);

      this.ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
        .input(base_media_path)
        .inputOptions([`-ss ${start}`, `-to ${end}`])
        .withVideoCodec("libx264")
        .addOptions(["-af volume=" + volume])
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

      const { output_width, output_height, video_bitrate } =
        this._extractResolutionAndBitrate(this.instructions);

      this._notifyProgress(10);

      this.ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
        .input(base_image_path)
        .loop()
        .input(base_audio_path)
        .withVideoCodec("libx264")
        .withVideoBitrate(video_bitrate)
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

      const { output_width, output_height, video_bitrate } =
        this._extractResolutionAndBitrate(this.instructions);
      const duration = this.instructions.duration;

      this._notifyProgress(10);

      this.ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
        .input(base_video_path)
        .input(base_audio_path)
        .duration(duration)
        // .withVideoCodec('copy')
        .withVideoCodec("libx264")
        .withVideoBitrate(video_bitrate)
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

    const { output_width, output_height, video_bitrate } =
      this._extractResolutionAndBitrate(this.instructions);

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
        const reportProgress = (ffmpeg_progress) => {
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
            output_width,
            output_height,
            video_bitrate,
            image_duration: media.image_duration,
            ffmpeg_cmd: this.ffmpeg_cmd,
          }));
        } else if (media_type === "video") {
          ({ video_path, duration } = await tasks.prepareVideoForMontageAndWeb({
            media_full_path,
            full_path_to_folder_in_cache,
            output_width,
            output_height,
            video_bitrate,
            ffmpeg_cmd: this.ffmpeg_cmd,
            reportProgress,
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
        video_bitrate,
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

    let full_path_to_folder_in_cache, full_path_to_new_file;

    const ext_handler = [
      {
        exts: [".heic"],
        task: "convertHEIC",
      },
      {
        exts: [
          ".cr3",
          ".cr2",
          ".raf",
          ".dng",
          ".rwl",
          ".nef",
          ".rw2",
          ".x3f",
          ".arw",
        ],
        task: "convertCameraRAW",
      },
      {
        exts: [".tif", ".tiff", ".webp", ".jpeg", ".jpg"],
        task: "convertImage",
      },
      {
        exts: [".flv", ".mov", ".avi", ".webm", ".mp4"],
        task: "convertVideo",
      },
      {
        exts: [
          ".amr",
          ".wma",
          ".aif",
          ".flac",
          ".wav",
          ".m4a",
          ".ogg",
          ".mp3",
          ".aac",
        ],
        task: "convertAudio",
      },
    ];

    try {
      const handler = ext_handler.find((e) =>
        utils.fileExtensionIs(this.instructions.base_media_path, e.exts)
      );
      if (!handler) throw new Error(`no_handler`);

      ({ full_path_to_folder_in_cache, full_path_to_new_file } =
        await this._createTempFolderAndName("optimizer"));
      const base_media_path = utils.getPathToUserContent(
        this.instructions.base_media_path
      );

      this._notifyProgress(10);

      // source high medium
      const trim_start = this.instructions.hasOwnProperty("trim_start")
        ? this.instructions.trim_start
        : undefined;
      const trim_end = this.instructions.hasOwnProperty("trim_end")
        ? this.instructions.trim_end
        : undefined;

      const that = this;
      const reportProgress = (progress) => {
        const progress_percent = Math.round(
          utils.remap(progress, 0, 100, 15, 90)
        );
        that._notifyProgress(progress_percent);
      };

      const image_width = this.instructions.image_width;
      const image_height = this.instructions.image_height;
      const video_bitrate = this.instructions.video_bitrate;
      const audio_bitrate = this.instructions.audio_bitrate;

      const full_path_to_new_file_with_ext = await optimizer[handler.task]({
        source: base_media_path,
        destination: full_path_to_new_file,
        image_width,
        image_height,
        video_bitrate,
        audio_bitrate,
        trim_start,
        trim_end,
        ffmpeg_cmd: this.ffmpeg_cmd,
        reportProgress,
      });
      this._notifyProgress(95);
      return full_path_to_new_file_with_ext;
    } catch (err) {
      if (full_path_to_folder_in_cache)
        await fs.remove(full_path_to_folder_in_cache);
      this._notifyEnded({
        event: "failed",
        info: err.message,
      });
      throw err;
    }
  }

  async _videoEffects() {
    this._notifyProgress(5);

    const {
      full_path_to_folder_in_cache,
      full_path_to_new_file: full_path_to_new_video,
    } = await this._createTempFolderAndName("video", "mp4");

    const effect_type = this.instructions.effect_type;
    const effect_opts = this.instructions.effect_opts;
    const base_media_path = utils.getPathToUserContent(
      this.instructions.base_media_path
    );

    const { output_width, output_height, video_bitrate } =
      this._extractResolutionAndBitrate(this.instructions);

    const keep_audio_track =
      this.instructions.keep_audio_track === true ? true : false;

    const that = this;
    const reportProgress = (progress) => {
      const progress_percent = Math.round(
        utils.remap(progress, 0, 100, 15, 90)
      );
      that._notifyProgress(progress_percent);
    };

    try {
      await effects.applyVideoEffect({
        source: base_media_path,
        destination: full_path_to_new_video,
        output_width,
        output_height,
        video_bitrate,
        keep_audio_track,
        effect_type,
        effect_opts,
        ffmpeg_cmd: this.ffmpeg_cmd,
        reportProgress,
      });
      this._notifyProgress(95);
      return full_path_to_new_video;
    } catch (err) {
      if (full_path_to_folder_in_cache)
        await fs.remove(full_path_to_folder_in_cache);
      this._notifyEnded({
        event: "failed",
        info: err.message,
      });
      throw err;
    }
  }

  async _saveData(type) {
    const full_path_to_folder_in_cache = await utils.createUniqueFolderInCache(
      type
    );
    const full_path_to_file = path.join(
      full_path_to_folder_in_cache,
      "file." + type
    );
    return full_path_to_file;
  }

  async _createTempFolderAndName(prefix, extension) {
    const full_path_to_folder_in_cache = await utils.createUniqueFolderInCache(
      prefix
    );
    let new_file_name = utils.createUniqueName(prefix);
    if (extension) new_file_name += "." + extension;
    const full_path_to_new_file = path.join(
      full_path_to_folder_in_cache,
      new_file_name
    );
    return { full_path_to_folder_in_cache, full_path_to_new_file };
  }

  _extractResolutionAndBitrate(instructions) {
    const output_width = instructions.output_width
      ? Math.ceil(instructions.output_width / 2) * 2
      : 1280;
    const output_height = instructions.output_height
      ? Math.ceil(instructions.output_height / 2) * 2
      : 720;
    const video_bitrate = instructions.video_bitrate
      ? Math.ceil(instructions.video_bitrate / 2) * 2
      : 4000;
    const output_format = instructions.output_format || "mp4";
    return { output_width, output_height, video_bitrate, output_format };
  }
}

module.exports = Exporter;
