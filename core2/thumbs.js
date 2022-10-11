const path = require("path"),
  fs = require("fs-extra"),
  ffmpegPath = require("ffmpeg-static"),
  { path: ffprobePath } = require("ffprobe-static"),
  ffmpeg = require("fluent-ffmpeg"),
  exifReader = require("exif-reader"),
  cheerio = require("cheerio"),
  fetch = require("node-fetch"),
  https = require("https"),
  StlThumbnailer = require("stl-thumbnailer-node"),
  PdfExtractor = require("pdf-extractor").PdfExtractor;

const utils = require("./utils");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

module.exports = (function () {
  const API = {
    makeFolderCover: ({ folder_type, folder_slug }) =>
      makeFolderCover({ folder_type, folder_slug }),
    makeThumbForMedia: async ({
      media_type,
      media_filename,
      folder_type,
      folder_slug,
    }) => {
      // make/get thumbs for medias with specific types
      dev.space();
      dev.logfunction({
        media_type,
        media_filename,
        folder_type,
        folder_slug,
      });

      const filethumbs_resolutions =
        global.settings.schema[folder_type].files?.thumbs?.resolutions;
      if (!filethumbs_resolutions) return false;

      const path_to_thumb_folder = await _getThumbFolderPath(
        folder_type,
        folder_slug
      );
      const full_media_path = utils.getPathToUserContent(
        folder_type,
        folder_slug,
        media_filename
      );

      let settings;
      if (media_type === "image") {
      } else if (media_type === "video") {
        settings = [
          {
            timemark: "00:00:00",
            suffix: "0",
            ext: "jpeg",
          },
          {
            timemark: "50%",
            suffix: "50pc",
            ext: "jpeg",
          },
        ];
      } else if (media_type === "audio") {
        settings = [
          {
            suffix: "waveform",
            ext: "png",
          },
        ];
      } else if (media_type === "stl") {
        settings = [
          {
            camera_angle: [10, 50, 100],
            suffix: "0",
            ext: "png",
          },
        ];
      } else if (media_type === "document") {
        settings = [
          {
            suffix: "page-1",
            page: 1,
            ext: "png",
          },
        ];
      } else if (media_type === "url") {
        settings = [
          {
            suffix: "ogimage",
            ext: "jpeg",
          },
        ];
      } else {
        return false;
      }

      const thumbs = await _makeThumbFor({
        media_type,
        full_media_path,
        media_filename,
        path_to_thumb_folder,
        resolutions: filethumbs_resolutions,
        settings,
      }).catch((err) => {
        dev.error(err);
        throw err;
      });

      return thumbs;
    },

    getInfosForFile: async ({
      media_type,
      media_filename,
      folder_type,
      folder_slug,
    }) => {
      // get width, height, ratio, gps, duration, exif, size

      dev.logfunction({
        media_type,
        media_filename,
        folder_type,
        folder_slug,
      });

      const full_media_path = utils.getPathToUserContent(
        folder_type,
        folder_slug,
        media_filename
      );

      const infos_filename = media_filename + ".infos.txt";
      const path_to_infos_file = utils.getPathToUserContent(
        "thumbs",
        folder_type,
        folder_slug,
        infos_filename
      );

      if (await fs.pathExists(path_to_infos_file)) {
        dev.logverbose(`has infos file`);
        const infos = utils.readMetaFile(
          "thumbs",
          folder_type,
          folder_slug,
          infos_filename
        );
        return infos;
      }

      let infos = {};
      if (media_type === "image")
        infos = await _readImageExif({ full_media_path });
      else if (media_type === "video" || media_type === "audio")
        infos = await _readVideoAudioExif({ full_media_path });

      // read file infos
      const file_infos = await _readFileInfos({ full_media_path });
      if (file_infos) infos.file = file_infos;

      if (infos) {
        utils.storeMeta({ path: path_to_infos_file, meta: infos });
        return infos;
      }
      return false;
    },
    removeFolderThumbs: ({ folder_type, folder_slug }) =>
      removeFolderThumbs({ folder_type, folder_slug }),
    removeFolderCover: ({ folder_type, folder_slug }) =>
      removeFolderCover({ folder_type, folder_slug }),
    removeFileThumbs: ({ folder_type, folder_slug, meta_slug }) =>
      removeFileThumbs({ folder_type, folder_slug, meta_slug }),
  };

  async function _makeThumbFor({
    media_type,
    full_media_path,
    media_filename,
    path_to_thumb_folder,
    resolutions,
    settings,
  }) {
    dev.logfunction({ full_media_path });

    let thumb_paths = {};

    if (!settings) {
      thumb_paths = await _makeImageThumbsFor({
        full_media_path,
        media_filename,
        path_to_thumb_folder,
        resolutions,
      });
    } else {
      for (const setting of settings) {
        const thumb_name = `${media_filename}.${setting.suffix}.${setting.ext}`;
        const path_to_thumb = path.join(path_to_thumb_folder, thumb_name);
        const full_path_to_thumb = utils.getPathToUserContent(path_to_thumb);

        const thumb_folder = utils.getPathToUserContent(path_to_thumb_folder);

        if (!(await fs.pathExists(full_path_to_thumb))) {
          dev.logverbose(`Missing screenshot at`, full_path_to_thumb);

          if (media_type === "video")
            await _makeVideoScreenshotFromPath({
              thumb_name,
              thumb_folder,
              full_media_path,
              timemark_key: setting.timemark,
            });
          else if (media_type === "audio")
            await _makeAudioWaveforms({
              full_media_path,
              full_path_to_thumb,
            });
          else if (media_type === "stl")
            await _makeSTLThumbs({
              full_media_path,
              full_path_to_thumb,
              camera_angle: setting.camera_angle,
            });
          else if (media_type === "document")
            await _makeDocumentThumbs({
              full_media_path,
              thumb_folder,
              full_path_to_thumb,
              page: setting.page,
            });
          else if (media_type === "url")
            await _makeLinkThumbs({
              full_media_path,
              full_path_to_thumb,
            });
          dev.logverbose(`Made screenshot at`, full_path_to_thumb);
        } else {
          dev.logverbose(`Found screenshot at`, full_path_to_thumb);
        }

        const thumbs = await _makeImageThumbsFor({
          full_media_path: full_path_to_thumb,
          media_filename: thumb_name,
          path_to_thumb_folder,
          resolutions,
        });

        thumb_paths[setting.suffix] = thumbs;
      }
    }

    return thumb_paths;
  }

  async function makeFolderCover({ folder_type, folder_slug }) {
    const cover_name = "meta_cover.jpeg";
    const full_cover_path = utils.getPathToUserContent(
      folder_type,
      folder_slug,
      cover_name
    );

    const cover_schema = global.settings.schema[folder_type].cover;
    const path_to_thumb_folder = await _getThumbFolderPath(
      folder_type,
      folder_slug
    );

    const paths = await _makeImageThumbsFor({
      full_media_path: full_cover_path,
      media_filename: cover_name,
      path_to_thumb_folder,
      resolutions: cover_schema.thumbs.resolutions,
    });

    return paths;
  }

  async function removeFolderThumbs({ folder_type, folder_slug }) {
    dev.logfunction({
      folder_type,
      folder_slug,
    });

    const full_path_to_thumb = utils.getPathToUserContent(
      "thumbs",
      folder_type,
      folder_slug
    );

    return await fs.remove(full_path_to_thumb);
  }
  async function removeFolderCover({ folder_type, folder_slug }) {
    dev.logfunction({
      folder_type,
      folder_slug,
    });
    return await _removeAllThumbsForFile({
      folder_type,
      folder_slug,
      media_filename: "meta_cover.jpeg",
    });
  }
  async function removeFileThumbs({ folder_type, folder_slug, meta_slug }) {
    dev.logfunction({
      folder_type,
      folder_slug,
      meta_slug,
    });

    let meta = await utils.readMetaFile(folder_type, folder_slug, meta_slug);
    const media_filename = meta.media_filename;

    return await _removeAllThumbsForFile({
      folder_type,
      folder_slug,
      media_filename,
    });
  }

  async function _removeAllThumbsForFile({
    folder_type,
    folder_slug,
    media_filename,
  }) {
    const full_path_to_thumb = utils.getPathToUserContent(
      "thumbs",
      folder_type,
      folder_slug
    );

    try {
      dev.logfunction(`Looking for thumbs starting with ${media_filename}`);
      let files = (
        await fs.readdir(full_path_to_thumb, { withFileTypes: true })
      )
        .filter(
          (dirent) =>
            !dirent.isDirectory() && dirent.name.startsWith(media_filename)
        )
        .map((dirent) => dirent.name);
      dev.logfunction({ files });

      for (const filename of files) {
        await fs.remove(path.join(full_path_to_thumb, filename));
      }
      return;
    } catch (err) {
      dev.logverbose("No thumbs to remove");
      return;
    }
  }

  async function _getThumbFolderPath(...paths) {
    const relative_path_to_thumb_folder = path.join("thumbs", ...paths);
    const path_to_thumb_folder = utils.getPathToUserContent(
      relative_path_to_thumb_folder
    );
    await fs.ensureDir(path_to_thumb_folder);
    return relative_path_to_thumb_folder;
  }

  async function _makeImageThumbsFor({
    full_media_path,
    media_filename,
    path_to_thumb_folder,
    resolutions,
  }) {
    dev.logfunction({
      full_media_path,
      media_filename,
      path_to_thumb_folder,
      resolutions,
    });

    let thumb_paths = {};

    for (const resolution of resolutions) {
      let thumb_name = `${media_filename}.${resolution}.jpeg`;
      const path_to_thumb = path.join(path_to_thumb_folder, thumb_name);
      const full_path_to_thumb = utils.getPathToUserContent(path_to_thumb);

      if (!(await fs.pathExists(full_path_to_thumb))) {
        dev.log(`Missing thumb at`, full_path_to_thumb);
        await utils.makeImageFromPath({
          full_path: full_media_path,
          new_path: full_path_to_thumb,
          resolution,
        });
        dev.log(`--> made thumb`);
      }

      // append modified timestamp to buste caching
      // example: sending an image, removing it, then sending another image with the same name
      // caching client-side will be wrong
      try {
        const { mtimems } = await _readFileInfos({
          full_media_path: full_path_to_thumb,
        });
        if (mtimems) thumb_name += "?v=" + mtimems;
      } catch (err) {
        dev.error(err);
      }

      thumb_paths[resolution] = thumb_name;
    }

    dev.logfunction(`Made / found thumbs`);

    return thumb_paths;
  }

  async function _readImageExif({ full_media_path }) {
    dev.logfunction({ full_media_path });

    const metadata = await utils.getImageMetadata({ full_media_path });

    if (!metadata) return false;

    dev.logverbose(`Gotten metadata`, { metadata });

    let extracted_metadata = {};
    if (metadata.width) extracted_metadata.width = metadata.width;
    if (metadata.height) extracted_metadata.height = metadata.height;
    if (extracted_metadata.width && extracted_metadata.height)
      extracted_metadata.ratio = utils.makeRatio({
        w: extracted_metadata.width,
        h: extracted_metadata.height,
      });

    if (metadata.exif) {
      try {
        const exif = exifReader(metadata.exif);
        dev.logfunction({ exif });
        if (exif?.gps) extracted_metadata.gps = exif.gps;
      } catch (err) {}
    }

    return extracted_metadata;
  }

  async function _makeVideoScreenshotFromPath({
    thumb_name,
    thumb_folder,
    full_media_path,
    timemark_key,
  }) {
    return new Promise((resolve, reject) => {
      dev.logfunction({ thumb_name, thumb_folder, timemark_key });

      ffmpeg(full_media_path)
        // setup event handlers
        .on("end", () => {
          return resolve();
        })
        .on("error", (err) => {
          dev.error(`ffmpeg failed: ${err.message}`);
          return reject(err.message);
        })
        .screenshots({
          timemarks: [timemark_key],
          filename: thumb_name,
          folder: thumb_folder,
        });
    });
  }

  function _makeAudioWaveforms({ full_media_path, full_path_to_thumb }) {
    return new Promise((resolve, reject) => {
      dev.logfunction({ full_media_path, full_path_to_thumb });

      ffmpeg()
        .input(full_media_path)
        .input(`color=white:s=3000x2000`)
        .inputFormat("lavfi")
        .complexFilter(
          "[0:a]aformat=channel_layouts=mono,showwavespic=s=3000x2000:colors=#fc4b60[fg];[1:v][fg]overlay=format=auto"
        )
        .outputOptions(["-vframes 1"])
        // setup event handlers
        .on("end", () => {
          return resolve();
        })
        .on("error", function (err) {
          return reject(err.message);
        })
        .save(full_path_to_thumb);
    });
  }

  function _makeSTLThumbs({
    full_media_path,
    full_path_to_thumb,
    camera_angle,
  }) {
    return new Promise(function (resolve, reject) {
      new StlThumbnailer({
        filePath: full_media_path,
        requestThumbnails: [
          {
            width: 2200,
            height: 2200,
            cameraAngle: camera_angle,
          },
        ],
      }).then(function (thumbnails) {
        // thumbnails is an array (in matching order to your requests) of Canvas objects
        // you can write them to disk, return them to web users, etc
        // see node-canvas documentation at https://github.com/Automattic/node-canvas
        thumbnails[0].toBuffer(async (err, buf) => {
          if (err) return reject(err);

          await fs.outputFile(full_path_to_thumb, buf);
          return resolve();
        });
      });
    });
  }

  async function _makeDocumentThumbs({
    full_media_path,
    thumb_folder,
    full_path_to_thumb,
    page,
  }) {
    dev.logfunction({ full_media_path, full_path_to_thumb, page });

    const temp_pdf_doc = path.join(thumb_folder, "_temp_pdf");
    await fs.ensureDir(temp_pdf_doc);

    let pdf_extractor = new PdfExtractor(temp_pdf_doc, {
      viewportScale: (width, height) => {
        if (width > height) return 1100 / width;
        return 800 / width;
      },
      pageRange: [page, page],
    });

    await pdf_extractor.parse(full_media_path).catch((err) => {
      dev.error(err);
    });

    dev.logverbose(`Created temp pdf folder`);

    try {
      const src = path.join(temp_pdf_doc, "page-1.png");
      await fs.move(src, full_path_to_thumb);
      await fs.remove(temp_pdf_doc);
    } catch (err) {
      await fs.remove(temp_pdf_doc);
      throw err;
    }

    dev.logverbose(`Moved/removed temp pdf folder`);
  }

  async function _makeLinkThumbs({ full_media_path, full_path_to_thumb }) {
    dev.logfunction({ full_media_path, full_path_to_thumb });

    // get content for full_media_path
    const url = await await fs.readFile(full_media_path, "UTF-8");
    if (!url) throw "no url";

    const { image } = await _getPageMetadata({ url });

    if (image) await _fetchImageAndSave({ url, image, full_path_to_thumb });
    else throw new Error("No image to download");
  }

  async function _readVideoAudioExif({ full_media_path }) {
    try {
      dev.logfunction({ full_media_path });

      const metadata = await _ffprobeVideoAudio({ full_media_path });

      dev.log({ metadata });

      let extracted_metadata = {};
      if (metadata.format?.duration)
        extracted_metadata.duration = metadata.format.duration;
      if (metadata.format?.tags?.location)
        extracted_metadata.location = metadata.format.tags.location;
      if (metadata.format?.tags?.["com.apple.quicktime.location.ISO6709"])
        extracted_metadata.location =
          metadata.format.tags["com.apple.quicktime.location.ISO6709"];

      if (metadata.streams[0]?.height && metadata.streams[0]?.width) {
        extracted_metadata.width = metadata.streams[0].width;
        extracted_metadata.height = metadata.streams[0].height;
        extracted_metadata.ratio = utils.makeRatio({
          w: extracted_metadata.width,
          h: extracted_metadata.height,
        });
      }

      return extracted_metadata;
    } catch (err) {
      dev.error(err);
      return;
    }
  }

  function _ffprobeVideoAudio({ full_media_path }) {
    return new Promise(function (resolve, reject) {
      dev.logverbose(`getting probe data`);
      ffmpeg.ffprobe(full_media_path, (err, metadata) => {
        if (err || typeof metadata === "undefined") {
          return reject(err);
        }
        return resolve(metadata);
      });
    });
  }

  function _readFileInfos({ full_media_path }) {
    return new Promise(function (resolve, reject) {
      dev.logverbose(`getting file infos with fs.stat`);
      fs.stat(full_media_path)
        .then((stats) => {
          return resolve({
            size: stats.size,
            mtimems: Math.floor(stats.mtimeMs),
          });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  async function _getPageMetadata({ url }) {
    dev.logfunction({ url });

    function addhttp(url) {
      if (!/^(?:f|ht)tps?\:\/\//.test(url)) url = "http://" + url;
      return url;
    }
    url = addhttp(url);

    let headers = {};
    if (url.includes("https://"))
      headers.agent = new https.Agent({
        rejectUnauthorized: false,
      });

    const response = await fetch(url, headers);
    const html = await response.text();

    const obj = _parseHTMLMetaTags({ html });
    return obj;
  }

  function _parseHTMLMetaTags({ html }) {
    dev.logfunction({ html });

    const $ = cheerio.load(html);
    const page_meta = {};

    const title =
      $('meta[property="og:title"]').attr("content") || $("title").text();
    if (title) page_meta.title = title;

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content");
    if (description) page_meta.description = description;

    const image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="og:image"]').attr("content") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="icon"]').attr("href");

    if (image) page_meta.image = image;

    return page_meta;
  }

  async function _fetchImageAndSave({ url, image, full_path_to_thumb }) {
    dev.logfunction({ url, image, full_path_to_thumb });

    const full_url = new URL(image, url).href;
    dev.logfunction({ full_url });

    let headers = {};
    if (url.includes("https://"))
      headers.agent = new https.Agent({
        rejectUnauthorized: false,
      });

    const _image = await fetch(full_url);
    const image_buffer = await _image.buffer();

    await utils.imageBufferToFile({ image_buffer, full_path_to_thumb });
    return;
  }

  return API;
})();
