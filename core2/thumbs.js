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
const { ffprobe } = require("fluent-ffmpeg");

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
        thumbs = await _makeVideoThumbsFor({
          full_media_path,
          media_filename,
          path_to_thumb_folder,
          resolutions: filethumbs_resolutions,
        });
      } else if (media_type === "audio") {
        thumbs = await _makeAudioThumbsFor({
          full_media_path,
          media_filename,
          path_to_thumb_folder,
          resolutions: filethumbs_resolutions,
        });
      } else if (media_type === "stl") {
        thumbs = await _makeSTLThumbsFor({
          full_media_path,
          media_filename,
          path_to_thumb_folder,
          resolutions: filethumbs_resolutions,
        });
      }

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
        global.settings.thumbFolderName,
        folder_type,
        folder_slug,
        infos_filename
      );

      if (await fs.pathExists(path_to_infos_file)) {
        dev.logverbose(`has infos file`);
        const infos = utils.readMetaFile(
          global.settings.thumbFolderName,
          folder_type,
          folder_slug,
          infos_filename
        );
        return infos;
      }

      let infos;
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
    removeFileThumbs: ({ folder_type, folder_slug, meta_slug }) =>
      removeFileThumbs({ folder_type, folder_slug, meta_slug }),
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
  async function removeFileThumbs({ folder_type, folder_slug, meta_slug }) {
    dev.logfunction({
      folder_type,
      folder_slug,
      meta_slug,
    });

    let meta = await utils.readMetaFile(folder_type, folder_slug, meta_slug);
    const media_filename = meta.media_filename;

    const full_path_to_thumb = utils.getPathToUserContent(
      global.settings.thumbFolderName,
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
        dev.log(`--> made thumb`);
      }
      thumb_paths[resolution] = path_to_thumb;
    }

    dev.logfunction(`Made / found thumbs`);

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

  async function _makeVideoThumbsFor({
    full_media_path,
    media_filename,
    path_to_thumb_folder,
    resolutions,
  }) {
    dev.logfunction({ full_media_path });

    let thumb_paths = {};
    let screenshots_timemarks = [
      {
        key: "00:00:00",
        filename_suffix: "0",
      },
      {
        key: "50%",
        filename_suffix: "50pc",
      },
    ];

    for (const timemark of screenshots_timemarks) {
      const thumb_name = `${media_filename}.${timemark.filename_suffix}.jpeg`;
      const path_to_thumb = path.join(path_to_thumb_folder, thumb_name);
      const full_path_to_thumb = utils.getPathToUserContent(path_to_thumb);

      const thumb_folder = utils.getPathToUserContent(path_to_thumb_folder);

      if (!(await fs.pathExists(full_path_to_thumb))) {
        dev.logverbose(`Missing screenshot at`, full_path_to_thumb);
        await _makeVideoScreenshotFromPath({
          thumb_name,
          thumb_folder,
          full_media_path,
          timemark_key: timemark.key,
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

      thumb_paths[timemark.key] = thumbs;
    }

    return thumb_paths;
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

  async function _makeAudioThumbsFor({
    full_media_path,
    media_filename,
    path_to_thumb_folder,
    resolutions,
  }) {
    dev.logfunction({ full_media_path });

    const thumb_name = `${media_filename}.wf.png`;
    const path_to_thumb = path.join(path_to_thumb_folder, thumb_name);
    const full_path_to_thumb = utils.getPathToUserContent(path_to_thumb);

    if (!(await fs.pathExists(full_path_to_thumb))) {
      dev.logverbose(`Missing screenshot at`, full_path_to_thumb);
      await _makeAudioWaveforms({
        full_media_path,
        full_path_to_thumb,
      });
      dev.logverbose(`Made screenshot at`, full_path_to_thumb);
    } else {
      dev.logverbose(`Found screenshot at`, full_path_to_thumb);
    }

    return await _makeImageThumbsFor({
      full_media_path: full_path_to_thumb,
      media_filename: thumb_name,
      path_to_thumb_folder,
      resolutions,
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

  async function _makeSTLThumbsFor({
    full_media_path,
    media_filename,
    path_to_thumb_folder,
    resolutions,
  }) {
    dev.logfunction({ full_media_path });

    const thumb_name = `${media_filename}.wf.png`;
    const path_to_thumb = path.join(path_to_thumb_folder, thumb_name);
    const full_path_to_thumb = utils.getPathToUserContent(path_to_thumb);
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
        .then((stats) =>
          resolve({
            size: stats.size,
          })
        )
        .catch((err) => {
          return reject(err);
        });
    });
  }

  return API;
})();
