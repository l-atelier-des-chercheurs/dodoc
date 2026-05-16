const path = require("path"),
  archiver = require("archiver"),
  fs = require("fs-extra");

const utils = require("./utils"),
  journal = require("./journal"),
  dev = require("./dev-log");

module.exports = (function () {
  const API = {
    downloadFolder: async ({
      path_to_folder,
      path_to_type,
      res,
      token_path = "",
    }) => {
      dev.logapi({ path_to_folder, path_to_type });

      try {
        const filename = utils.getZipFolderFilename({
          path_to_folder,
          path_to_type,
        });
        res.header("Content-Type", "application/zip");
        res.header("Content-Disposition", `attachment; filename="${filename}"`);

        const archive = archiver("zip", { zlib: { level: 0 } });
        archive.on("warning", (err) => {
          throw err;
        });
        archive.on("error", (err) => {
          throw err;
        });
        archive.pipe(res);

        const full_folder_path = utils.getPathToUserContent(path_to_folder);
        const folder_slug = utils.getFilename(path_to_folder);
        archive.directory(full_folder_path, folder_slug);

        archive.finalize();

        dev.logpackets(`Successfully started download for ${path_to_folder}`);
        journal.log({
          from: "api2",
          event: "download_folder",
          details: {
            outcome: "success",
            path_to_folder,
            author_path: token_path,
          },
        });

        dev.log("download started");
      } catch (err) {
        _handleDownloadFolderError(err, res, { path_to_folder, token_path });
      }
    },

    downloadFolderType: async ({
      path_to_type,
      res,
      token_path = "",
    }) => {
      // TODO: optionally omit `_bin` beside slug folders here for lighter / more portable bundles (mirror disk otherwise).
      dev.logapi({ path_to_type });

      const full_path = utils.getPathToUserContent(path_to_type);
      try {
        if (!(await fs.pathExists(full_path))) {
          return res.status(404).send({ code: "not_found" });
        }

        const filename = utils.getZipFolderTypeFilename({ path_to_type });
        res.header("Content-Type", "application/zip");
        res.header("Content-Disposition", `attachment; filename="${filename}"`);

        const archive = archiver("zip", { zlib: { level: 0 } });
        archive.on("warning", (err) => {
          throw err;
        });
        archive.on("error", (err) => {
          throw err;
        });
        archive.pipe(res);

        archive.directory(full_path, false);

        archive.finalize();

        dev.logpackets(
          `Successfully started download folder type ${path_to_type}`
        );
        journal.log({
          from: "api2",
          event: "download_folder_type",
          details: {
            outcome: "success",
            path_to_type,
            author_path: token_path,
          },
        });

        dev.log("download folder type started");
      } catch (err) {
        _handleDownloadFolderTypeError(err, res, {
          path_to_type,
          token_path,
        });
      }
    },

    downloadSources: async ({
      path_to_folder,
      res,
      token_path = "",
      meta_filenames,
    }) => {
      dev.logapi({ path_to_folder, meta_filenames });

      try {
        if (
          !meta_filenames ||
          !Array.isArray(meta_filenames) ||
          meta_filenames.length === 0
        ) {
          return res.status(400).send({ code: "invalid_meta_filenames" });
        }

        const MAX_FILES = 100;
        if (meta_filenames.length > MAX_FILES) {
          return res.status(400).send({ code: "too_many_files" });
        }

        const hasPathTraversal = (name) =>
          name.includes("..") || name.includes("/") || name.includes("\\");
        if (meta_filenames.some(hasPathTraversal)) {
          return res.status(400).send({ code: "invalid_meta_filenames" });
        }

        res.header("Content-Type", "application/zip");
        res.header(
          "Content-Disposition",
          'attachment; filename="sources.zip"'
        );

        const archive = archiver("zip", { zlib: { level: 0 } });
        archive.on("warning", (err) => {
          throw err;
        });
        archive.on("error", (err) => {
          throw err;
        });
        archive.pipe(res);

        const full_folder_path = utils.getPathToUserContent(path_to_folder);

        for (const meta_filename of meta_filenames) {
          try {
            const meta = await utils.readMetaFile(
              path_to_folder,
              meta_filename
            );
            const media_filename = meta.$media_filename;
            if (!media_filename) continue;

            const full_path = path.join(full_folder_path, media_filename);
            if (!(await fs.pathExists(full_path))) {
              dev.logverbose(`Media file missing: ${full_path}`);
              continue;
            }
            archive.file(full_path, { name: media_filename });
          } catch (err) {
            dev.logverbose(`Skipping ${meta_filename}: ${err.message}`);
          }
        }

        archive.finalize();

        dev.logpackets(
          `Successfully started download sources for ${path_to_folder}`
        );
        journal.log({
          from: "api2",
          event: "download_sources",
          details: {
            outcome: "success",
            path_to_folder,
            author_path: token_path,
          },
        });
      } catch (err) {
        const { message, code, err_infos } = err;
        dev.error(`Failed to download sources ${path_to_folder}: ${message}`);
        journal.log({
          from: "api2",
          event: "download_sources",
          details: {
            outcome: "error",
            path_to_folder,
            error_message: message,
            author_path: token_path,
          },
        });
        res.status(500).send({ code, err_infos });
      }
    },
  };

  function _handleDownloadFolderError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to download folder ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "download_folder",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  function _handleDownloadFolderTypeError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to download folder type ${context.path_to_type}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "download_folder_type",
      details: {
        outcome: "error",
        path_to_type: context.path_to_type,
        error_message: message,
        author_path: context.token_path,
      },
    });

    if (!res.headersSent) {
      res.status(500).send({ code, err_infos });
    }
  }

  return API;
})();
