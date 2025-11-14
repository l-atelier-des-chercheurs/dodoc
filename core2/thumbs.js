const path = require("path"),
  fs = require("fs-extra"),
  ffmpeg = require("fluent-ffmpeg"),
  cheerio = require("cheerio"),
  fetch = require("node-fetch"),
  https = require("https");

const utils = require("./utils"),
  webpreview = require("./webpreview");

const ffmpegPath = require("ffmpeg-static").replace(
  "app.asar",
  "app.asar.unpacked"
);
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = (function () {
  const API = {
    makeFolderCover: ({ path_to_folder }) =>
      makeFolderCover({ path_to_folder }),
    makeThumbForMedia: async ({
      media_type,
      media_filename,
      path_to_folder,
    }) => {
      // make/get thumbs for medias with specific types
      dev.space();
      dev.logfunction({
        media_type,
        media_filename,
        path_to_folder,
      });

      const item_in_schema = utils.parseAndCheckSchema({
        relative_path: path_to_folder,
      });
      const filethumbs_resolutions = item_in_schema.$files?.thumbs?.resolutions;
      if (!filethumbs_resolutions) return false;

      const path_to_thumb_folder = await API.getThumbFolderPath(path_to_folder);
      const full_media_path = utils.getPathToUserContent(
        path_to_folder,
        media_filename
      );

      // make sure media exists
      if (!(await fs.pathExists(full_media_path)))
        throw new Error(`Media does not exist`);

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
      } else if (media_type === "pdf") {
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

    getInfosForFile: async ({ media_type, media_filename, path_to_folder }) => {
      // get width, height, ratio, gps, duration, exif, size

      dev.logfunction({
        media_type,
        media_filename,
        path_to_folder,
      });

      const full_media_path = utils.getPathToUserContent(
        path_to_folder,
        media_filename
      );

      const infos_filename = media_filename + ".infos.txt";

      const path_to_thumb_folder = await API.getThumbFolderPath(path_to_folder);
      try {
        const infos = await utils.readMetaFile(
          path_to_thumb_folder,
          infos_filename
        );
        return infos;
      } catch (err) {
        // no existing infos file, let's create it
        // dev.error(err);
      }

      dev.logverbose(`Creating infos file for`, full_media_path);

      let infos = {};
      try {
        if (media_type === "image")
          infos = await _readImageExif({ full_media_path });
        else if (media_type === "video" || media_type === "audio")
          infos = await utils.getVideoMetaData({ path: full_media_path });
      } catch (err) {
        dev.error(err);
      }

      // read file infos
      const { size, mtimems, hash } = await _readFileInfos({ full_media_path });
      if (size !== undefined) infos.size = size;
      if (mtimems !== undefined) infos.mtimems = mtimems;
      if (hash !== undefined) infos.hash = hash;

      if (infos) {
        const path_to_infos_file = utils.getPathToUserContent(
          path_to_thumb_folder,
          infos_filename
        );
        utils.storeContent({ full_path: path_to_infos_file, meta: infos });
        return infos;
      }
      return false;
    },
    getInfosForFolder: async ({ path_to_folder }) => {
      dev.logfunction({
        path_to_folder,
      });

      let infos = {};
      infos.size = await utils.getFolderSize(path_to_folder);

      return infos;
    },

    removeFolderThumbs: async ({ path_to_folder }) =>
      removeFolderThumbs({ path_to_folder }),
    removeFolderCover: ({ path_to_folder }) =>
      removeFolderCover({ path_to_folder }),
    removeFileThumbs: ({ path_to_folder, meta_filename }) =>
      removeFileThumbs({ path_to_folder, meta_filename }),
    duplicateThumbFolder: async ({
      path_to_source_folder,
      path_to_destination_folder,
    }) => {
      duplicateThumbFolder({
        path_to_source_folder,
        path_to_destination_folder,
      });
    },
    copyThumbFiles: async ({
      path_to_folder,
      media_filename,
      path_to_destination_folder,
      new_filename,
    }) => {
      copyThumbFiles({
        path_to_folder,
        media_filename,
        path_to_destination_folder,
        new_filename,
      });
    },
    copyAllThumbsForFile: async ({
      full_path_to_thumb,
      full_path_to_new_thumb,
      media_filename,
      new_filename,
    }) => {
      try {
        const files = await _getAllThumbsForFile({
          full_path_to_thumb,
          media_filename,
        });

        for (const filename of files) {
          // copy to destination folder with new name
          const new_filename_with_suffix = new_filename
            ? filename.replace(media_filename, new_filename)
            : filename;

          await fs.copy(
            path.join(full_path_to_thumb, filename),
            path.join(full_path_to_new_thumb, new_filename_with_suffix)
          );
        }
        return;
      } catch (err) {
        dev.logverbose("No thumbs to remove");
        return;
      }
    },
    getThumbFolderPath: async (...paths) => {
      const relative_path_to_thumb_folder = path.join("thumbs", ...paths);
      const path_to_thumb_folder = utils.getPathToUserContent(
        relative_path_to_thumb_folder
      );
      await fs.ensureDir(path_to_thumb_folder);
      return relative_path_to_thumb_folder;
    },
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
      const no_preview_path = utils.getPathToUserContent(
        path_to_thumb_folder,
        `${media_filename}.no_preview`
      );
      if (await fs.pathExists(no_preview_path)) return "no_preview";

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

        const no_preview_path = utils.getPathToUserContent(
          path_to_thumb_folder,
          `${thumb_name}.no_preview`
        );
        if (await fs.pathExists(no_preview_path)) continue;

        const thumb_folder = utils.getPathToUserContent(path_to_thumb_folder);

        if (!(await fs.pathExists(full_path_to_thumb))) {
          dev.logverbose(`Missing screenshot at`, full_path_to_thumb);

          try {
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
            else if (media_type === "pdf")
              await _makePDFThumbs({
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
          } catch (err) {
            dev.error(err);
            // make empty nopreview file
            await utils.storeContent({
              full_path: no_preview_path,
              meta: "",
            });
          }
          dev.logverbose(`Made screenshot at`, full_path_to_thumb);
        } else {
          dev.logverbose(`Found screenshot at`, full_path_to_thumb);
        }

        if (await fs.pathExists(no_preview_path)) continue;

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

  async function makeFolderCover({ path_to_folder }) {
    const cover_name = "meta_cover.jpeg";
    const full_cover_path = utils.getPathToUserContent(
      path_to_folder,
      cover_name
    );

    const item_in_schema = utils.parseAndCheckSchema({
      relative_path: path_to_folder,
    });
    const cover_schema = item_in_schema.$cover;
    const path_to_thumb_folder = await API.getThumbFolderPath(path_to_folder);

    const paths = await _makeImageThumbsFor({
      full_media_path: full_cover_path,
      media_filename: cover_name,
      path_to_thumb_folder,
      resolutions: cover_schema.thumbs.resolutions,
    });

    let _cover_name = cover_name;
    const { mtimems } = await _readFileInfos({
      full_media_path: full_cover_path,
    });
    if (mtimems) _cover_name += "?v=" + mtimems;
    paths.original = _cover_name;

    return paths;
  }

  async function removeFolderThumbs({ path_to_folder }) {
    try {
      dev.logfunction({ path_to_folder });
      return await fs.remove(
        utils.getPathToUserContent("thumbs", path_to_folder)
      );
    } catch (err) {
      return false;
    }
  }
  async function removeFolderCover({ path_to_folder }) {
    dev.logfunction({ path_to_folder });
    return await _removeAllThumbsForFile({
      path_to_folder,
      media_filename: "meta_cover.jpeg",
    });
  }
  async function removeFileThumbs({ path_to_folder, meta_filename }) {
    dev.logfunction({
      path_to_folder,
      meta_filename,
    });

    let meta = await utils.readMetaFile(path_to_folder, meta_filename);
    const media_filename = meta.$media_filename;
    if (!media_filename) return;

    return await _removeAllThumbsForFile({
      path_to_folder,
      media_filename,
    });
  }
  async function duplicateThumbFolder({
    path_to_source_folder,
    path_to_destination_folder,
  }) {
    const path_to_thumb_folder = await API.getThumbFolderPath(
      path_to_source_folder
    );
    const path_to_destination_thumb_folder = await API.getThumbFolderPath(
      path_to_destination_folder
    );
    await fs.copy(
      utils.getPathToUserContent(path_to_thumb_folder),
      utils.getPathToUserContent(path_to_destination_thumb_folder)
    );
    return;
  }

  async function copyThumbFiles({
    path_to_folder,
    media_filename,
    path_to_destination_folder,
    new_filename,
  }) {
    const full_path_to_thumb = utils.getPathToUserContent(
      "thumbs",
      path_to_folder
    );
    const full_path_to_new_thumb = utils.getPathToUserContent(
      "thumbs",
      path_to_destination_folder
    );

    API.copyAllThumbsForFile({
      full_path_to_thumb,
      full_path_to_new_thumb,
      media_filename,
      new_filename,
    });
  }

  async function _removeAllThumbsForFile({ path_to_folder, media_filename }) {
    const full_path_to_thumb = utils.getPathToUserContent(
      "thumbs",
      path_to_folder
    );

    try {
      const files = await _getAllThumbsForFile({
        full_path_to_thumb,
        media_filename,
      });

      for (const filename of files) {
        await fs.remove(path.join(full_path_to_thumb, filename));
      }
      return;
    } catch (err) {
      dev.logverbose("No thumbs to remove");
      return;
    }
  }

  async function _getAllThumbsForFile({ full_path_to_thumb, media_filename }) {
    return (await fs.readdir(full_path_to_thumb, { withFileTypes: true }))
      .filter(
        (dirent) =>
          !dirent.isDirectory() && dirent.name.startsWith(media_filename)
      )
      .map((dirent) => dirent.name);
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

    const format = utils.isExtensionLosslessImageFormat(media_filename)
      ? "png"
      : "jpeg";

    let thumb_paths = {};

    for (const resolution of resolutions) {
      let thumb_name = `${media_filename}.${resolution}.${format}`;
      const path_to_thumb = path.join(path_to_thumb_folder, thumb_name);
      const full_path_to_thumb = utils.getPathToUserContent(path_to_thumb);

      if (!(await fs.pathExists(full_path_to_thumb))) {
        dev.log(`Missing thumb at`, full_path_to_thumb);
        await utils.makeImageFromPath({
          full_path: full_media_path,
          new_path: full_path_to_thumb,
          resolution,
          format,
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

    try {
      if (!metadata.width || !metadata.height)
        throw new Error(`no width or height for image`);

      let w = metadata.width;
      let h = metadata.height;

      if (metadata.orientation === 6 || metadata.orientation === 8) {
        const _w = w;
        w = h;
        h = _w;
      }

      extracted_metadata.width = w;
      extracted_metadata.height = h;

      if (w && h)
        extracted_metadata.ratio = utils.makeRatio({
          w,
          h,
        });
    } catch (err) {}

    if (metadata.exif) {
      try {
        const gps = await utils.getGPSFromFile(full_media_path);
        if (gps) extracted_metadata.gps = gps;
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

  async function _makeSTLThumbs({
    full_media_path,
    full_path_to_thumb,
    camera_angle,
  }) {
    dev.logfunction({ full_media_path, full_path_to_thumb, camera_angle });
    try {
      await _captureMediaScreenshot({ full_media_path, full_path_to_thumb });
      return;
    } catch (err) {
      dev.error(err.message);
      throw err;
    }
  }

  async function _makePDFThumbs({
    full_media_path,
    // thumb_folder,
    full_path_to_thumb,
    page,
  }) {
    dev.logfunction({ full_media_path, full_path_to_thumb, page });
    try {
      await _captureMediaScreenshot({ full_media_path, full_path_to_thumb });
      return;
    } catch (err) {
      dev.error(err.message);
      throw err;
    }
  }

  async function _captureMediaScreenshot({
    full_media_path,
    full_path_to_thumb,
  }) {
    dev.logfunction({ full_media_path, full_path_to_thumb });

    const relative_path_from_server = full_media_path.replace(
      utils.getPathToUserContent(),
      ""
    );
    const encoded_full_media_path = encodeURIComponent(
      relative_path_from_server
    );
    let url =
      global.appInfos.homeURL +
      "/_previewmedia?path_to_media=" +
      encoded_full_media_path +
      "&previewing_for=node";

    try {
      await webpreview.captureScreenshot({ url, full_path_to_thumb });
      return;
    } catch (err) {
      dev.error(err);
      throw new Error("failed to capture screenshot");
    }
  }

  async function _makeLinkThumbs({ full_media_path, full_path_to_thumb }) {
    dev.logfunction({ full_media_path, full_path_to_thumb });

    // get content for full_media_path
    const url = await fs.readFile(full_media_path, "UTF-8");
    if (!url) throw "no url";

    const { image } = await _getPageMetadata({ url });
    if (image) {
      try {
        await utils.downloadFileFromUrl({
          url: image,
          destination_path: full_path_to_thumb,
          base_url: url,
          max_file_size_in_mo: 50, // Smaller limit for thumbnails
        });
        return;
      } catch (err) {
        dev.error(err);
      }
    }

    try {
      await webpreview.captureScreenshot({ url, full_path_to_thumb });
      return;
    } catch (err) {
      dev.error(err);
      throw new Error("failed to capture screenshot");
    }

    // todo fix err
    const err = new Error("No image to download");
    err.code = "no_image_to_download";
    throw err;
  }

  async function _readFileInfos({ full_media_path }) {
    dev.logfunction({ full_media_path });

    const props = {};
    try {
      const { size, mtimeMs } = await fs.stat(full_media_path);
      props.size = size;
      props.mtimems = Math.floor(mtimeMs);
    } catch (e) {
      dev.error(e);
    }
    try {
      const hash = await utils.md5FromFile({ full_media_path });

      props.hash = hash;
    } catch (e) {
      dev.error(e);
    }

    return props;
  }

  async function _getPageMetadata({ url }) {
    dev.logfunction({ url });

    url = utils.addhttp(url);

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
      $('meta[property="og:image:url"]').attr("content") ||
      $('meta[property="image"]').attr("content") ||
      $('meta[name="og:image"]').attr("content");
    // Commented out favicon fallbacks to prevent stretched favicon previews
    // $('link[rel="shortcut icon"]').attr("href") ||
    // $('link[rel="icon"]').attr("href");

    if (image) page_meta.image = image;

    return page_meta;
  }

  return API;
})();
