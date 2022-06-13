const path = require("path"),
  fs = require("fs-extra"),
  ffmpegPath = require("ffmpeg-static"),
  { path: ffprobePath } = require("ffprobe-static"),
  ffmpeg = require("fluent-ffmpeg"),
  exifReader = require("exif-reader"),
  sharp = require("sharp"),
  cheerio = require("cheerio"),
  fetch = require("node-fetch"),
  https = require("https");

const { BrowserWindow } = require("electron");

sharp.cache(false);

const utils = require("./utils");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

module.exports = (function () {
  const API = {
    makeFolderPreview: ({ folder_type, folder_slug }) =>
      makeFolderPreview({ folder_type, folder_slug }),
    makeThumbForMedia: async ({
      media_type,
      media_filename,
      folder_type,
      folder_slug,
    }) => {
      // make/get thumbs for medias with specific types

      dev.logfunction({
        media_type,
        media_filename,
        folder_type,
        folder_slug,
      });

      const filethumbs_resolutions =
        global.settings.schema[folder_type].files?.thumbs?.resolutions;
      if (!filethumbs_resolutions) return false;

      let thumbs = {};

      const path_to_thumb_folder = await _getThumbFolderPath(
        folder_type,
        folder_slug
      );
      const full_media_path = utils.getPathToUserContent(
        folder_type,
        folder_slug,
        media_filename
      );

      if (media_type === "image") {
        thumbs = await _makeImageThumbsFor({
          full_media_path,
          media_filename,
          path_to_thumb_folder,
          resolutions: filethumbs_resolutions,
        });
      } else if (media_type === "video") {
        // extract preview at 0, 50% and 100% for video
        // make thumbs for each
        // thumbs = await makeVideoPreviewFor({
        //   full_media_path,
        //   media_filename,
        //   path_to_thumb_folder,
        //   resolutions: filethumbs_resolutions,
        // });
      }

      return thumbs;
    },

    makeMetaForFile: async ({
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

      let metas = {};

      const path_to_thumb_folder = await _getThumbFolderPath(
        folder_type,
        folder_slug
      );
      const full_media_path = utils.getPathToUserContent(
        folder_type,
        folder_slug,
        media_filename
      );

      if (media_type === "image") {
        const exif = await _readImageExif({ full_media_path });
        if (exif) metas.exif = exif;
      }

      return metas;
    },

    removeFolderThumbs: ({ folder_type, folder_slug }) =>
      removeFolderThumbs({ folder_type, folder_slug }),

    getMediaEXIF: (d) => getMediaEXIF(d),
    getTimestampFromEXIF: (mediaPath) => getTimestampFromEXIF(mediaPath),
  };

  async function makeFolderPreview({ folder_type, folder_slug }) {
    const preview_name = "meta_preview.jpeg";
    const full_preview_path = utils.getPathToUserContent(
      folder_type,
      folder_slug,
      preview_name
    );

    const preview_schema = global.settings.schema[folder_type].preview;
    const path_to_thumb_folder = await _getThumbFolderPath(
      folder_type,
      folder_slug
    );

    const paths = await _makeImageThumbsFor({
      full_media_path: full_preview_path,
      media_filename: preview_name,
      path_to_thumb_folder,
      resolutions: preview_schema.thumbs.resolutions,
    });

    return paths;
  }

  async function removeFolderThumbs({ folder_type, folder_slug }) {
    dev.logfunction({
      folder_type,
      folder_slug,
    });

    const full_path_to_thumb = utils.getPathToUserContent(
      global.settings.thumbFolderName,
      folder_type,
      folder_slug
    );

    return await fs.remove(full_path_to_thumb);
  }

  async function _getThumbFolderPath(...paths) {
    const relative_path_to_thumb_folder = path.join(
      global.settings.thumbFolderName,
      ...paths
    );
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
      const thumb_name = `${media_filename}.${resolution}.jpeg`;
      const path_to_thumb = path.join(path_to_thumb_folder, thumb_name);
      const full_path_to_thumb = utils.getPathToUserContent(path_to_thumb);

      if (!(await fs.pathExists(full_path_to_thumb))) {
        dev.log(`Missing thumb at`, full_path_to_thumb);
        await _makeImageFromPath({
          full_path: full_media_path,
          new_path: full_path_to_thumb,
          resolution,
        });
      }
      thumb_paths[resolution] = path_to_thumb;
    }

    return thumb_paths;
  }

  async function _makeImageFromPath({ full_path, new_path, resolution }) {
    await sharp(full_path)
      .rotate()
      .resize(resolution, resolution, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "white" })
      .withMetadata()
      .toFormat("jpeg", {
        quality: global.settings.mediaThumbQuality,
      })
      .toFile(new_path)
      .catch((err) => {
        throw err;
      });
  }

  async function _readImageExif({ full_media_path }) {
    dev.logfunction({ full_media_path });

    const metadata = await sharp(full_media_path).metadata();

    if (!metadata) return false;

    dev.logverbose(`Gotten metadata`, { metadata });

    let extracted_metadata = {};
    if (metadata.width) extracted_metadata.width = metadata.width;
    if (metadata.height) extracted_metadata.height = metadata.height;
    if (extracted_metadata.width && extracted_metadata.height)
      extracted_metadata.ratio = Number.parseFloat(
        extracted_metadata.height / extracted_metadata.width
      ).toPrecision(4);

    if (metadata.exif) {
      try {
        const exif = exifReader(metadata.exif);
        dev.logfunction({ exif });
        if (exif?.gps) extracted_metadata.gps = exif.gps;
      } catch (err) {}
    }

    return extracted_metadata;
  }

  return API;
})();
