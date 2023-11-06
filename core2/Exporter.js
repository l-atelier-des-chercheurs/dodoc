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
  notifier = require("./notifier");

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

    this.instructions = instructions;
    this.status = "ready";
  }

  async start() {
    this.status = "started";

    let full_path_to_file;
    let desired_filename;

    if (this.instructions.recipe === "stopmotion") {
      full_path_to_file = await this._createStopmotionFromImages();
      desired_filename = "stopmotion.mp4";
    } else if (this.instructions.recipe === "pdf") {
      full_path_to_file = await this._loadPageAndPrint().catch((err) => {
        dev.error(err);
        this._notifyEnded({
          event: "failed",
        });
        throw new Error(`failed`);
      });

      desired_filename = this.instructions.suggested_file_name
        ? utils.slug(this.instructions.suggested_file_name) + ".pdf"
        : "publication.pdf";
    } else if (this.instructions.recipe === "png") {
      full_path_to_file = await this._loadPageAndPrint();
      desired_filename = "preview.png";
    } else if (this.instructions.recipe === "trim_video") {
      full_path_to_file = await this._trimVideo();

      desired_filename = this.instructions.suggested_file_name
        ? utils.slug(this.instructions.suggested_file_name) + ".mp4"
        : "trim_video.mp4";
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

    const meta_filename = await file.addFileToFolder({
      full_path_to_file,
      desired_filename,
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
    if (this.ffmpeg_cmd) this.ffmpeg_cmd.kill();
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

  async _loadPageAndPrint() {
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

    let page_timeout = setTimeout(async () => {
      clearTimeout(page_timeout);
      dev.error(`page timeout for ${url}`);
      if (browser) await browser.close();
      throw new Error(`page-timeout`);
    }, 30_000);

    const browser = await puppeteer.launch({
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
    clearTimeout(page_timeout);
    if (browser) await browser.close();

    return path_to_temp_file;
  }

  _trimVideo() {
    return new Promise(async (resolve, reject) => {
      this._notifyProgress(5);

      const new_video_name =
        "video_trim_" +
        +new Date() +
        (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 2) +
        ".mp4";

      let full_path_to_folder_in_cache = await utils.createFolderInCache(
        "video"
      );

      const full_path_to_new_video = path.join(
        full_path_to_folder_in_cache,
        new_video_name
      );

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

          return reject(err);
        })
        .save(full_path_to_new_video);
    });
  }

  async _saveData(type) {
    const full_path_to_folder_in_cache = await utils.createFolderInCache(type);
    const full_path_to_file = path.join(
      full_path_to_folder_in_cache,
      "file." + type
    );
    return full_path_to_file;
  }
}

module.exports = Exporter;
