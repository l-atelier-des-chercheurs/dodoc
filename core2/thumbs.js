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

    getEXIFDataForImage: (mediaPath) => getEXIFDataForImage(mediaPath),
    getMediaEXIF: (d) => getMediaEXIF(d),
    getTimestampFromEXIF: (mediaPath) => getTimestampFromEXIF(mediaPath),
  };

  async function makeFolderPreview({ folder_type, folder_slug }) {
    const preview_name = "meta_preview.jpeg";
    const full_preview_path = utils.getPathToUserContent(
      global.settings.schema[folder_type].path,
      folder_slug,
      preview_name
    );

    const preview_schema = global.settings.schema[folder_type].preview;
    const path_to_thumb_folder = await _getThumbFolderPath(
      global.settings.schema[folder_type].path,
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

  return API;
})();
