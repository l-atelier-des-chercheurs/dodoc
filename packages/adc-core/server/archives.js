const path = require("path"),
  fs = require("fs-extra");

const utils = require("./utils");

module.exports = (function () {
  const API = {
    archiveVersion: async ({ path_to_folder, media_filename }) => {
      dev.logfunction(arguments[0]);
      const media_path = utils.getPathToUserContent(
        path_to_folder,
        media_filename
      );

      const archive_folder_path = _getArchiveFolderPath(
        path_to_folder,
        media_filename
      );

      const full_archived_folder_path =
        utils.getPathToUserContent(archive_folder_path);
      await fs.ensureDir(full_archived_folder_path);

      try {
        // keep file name, append -1, -2, etc. if necessary to prevent override
        // const archived_media_filename = await _preventFileOverride({
        //   folder_path: archived_folder_path,
        //   original_filename: media_filename,
        // });

        // use timestamp to mark time archived
        const archived_media_filename =
          +utils.getCurrentDate() + path.parse(media_filename).ext;

        const archived_media_path = path.join(
          full_archived_folder_path,
          archived_media_filename
        );

        await fs.move(media_path, archived_media_path, {
          overwrite: true,
        });
        return;
      } catch (err) {
        throw err;
      }
    },
    getArchives: async ({ path_to_folder, meta_filename }) => {
      dev.logfunction();

      let meta = await utils.readMetaFile(path_to_folder, meta_filename);

      const archive_folder_path = _getArchiveFolderPath(
        path_to_folder,
        meta.$media_filename
      );
      const full_archived_folder_path =
        utils.getPathToUserContent(archive_folder_path);

      try {
        let filenames = (
          await fs.readdir(full_archived_folder_path, { withFileTypes: true })
        )
          .filter((dirent) => !dirent.isDirectory())
          .map((dirent) => dirent.name);
        dev.logfunction({ filenames });

        const files_content = [];
        for (const filename of filenames) {
          const content = await utils.readFileContent(
            archive_folder_path,
            filename
          );
          const date = +path.parse(filename).name;
          files_content.push({
            date,
            filename,
            content,
          });
        }
        return files_content;
      } catch (err) {
        dev.error(err);
        return;
      }
    },

    removeFileArchives: async ({ path_to_folder, meta_filename }) => {
      dev.logfunction({ path_to_folder, meta_filename });

      try {
        let meta = await utils.readMetaFile(path_to_folder, meta_filename);
        const archive_folder_path = _getArchiveFolderPath(
          path_to_folder,
          meta.$media_filename
        );
        const full_archived_folder_path =
          utils.getPathToUserContent(archive_folder_path);
        await fs.remove(full_archived_folder_path);
      } catch (err) {
        dev.logverbose("No archives to remove");
        return;
      }
    },
    removeFolderArchives: async ({ path_to_folder }) => {
      dev.logfunction({ path_to_folder });
      const archive_folder_path = _getArchiveFolderPath(path_to_folder);
      try {
        const full_archived_folder_path =
          utils.getPathToUserContent(archive_folder_path);
        await fs.remove(full_archived_folder_path);
      } catch (err) {
        dev.logverbose("No archives to remove");
        return;
      }
    },
  };

  function _getArchiveFolderPath(path_to_folder, media_filename) {
    if (!media_filename) return path.join("archives", path_to_folder);

    const file_name = path.parse(media_filename).name;
    return path.join("archives", path_to_folder, file_name);
  }

  return API;
})();
