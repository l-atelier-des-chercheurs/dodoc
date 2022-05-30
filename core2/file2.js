const path = require("path"),
  fs = require("fs-extra");

const utils = require("./utils");

// all items (projects, medias, etc.) must have those props :
// date_created
// date_modified<
// file_meta

// cache structure :
/* 
[{
  path: 'projects/',

}]

*/

module.exports = (function () {
  const API = {
    getFolders: async ({ folder_type }) => {
      dev.logfunction({ folder_type });
      // TODO cache get all folders

      const folder_path = utils.makeFullPath({ folder_type });
      const folders_slugs = await _getFolderSlugs({ folder_path });

      const all_folders_with_meta = [];
      for (let folder_slug of folders_slugs) {
        const folder_meta = await API.getFolder({
          folder_type,
          folder_slug,
        }).catch((err) => {
          dev.error(`Error with folder ${folder_slug}`, err);
        });
        if (folder_meta) all_folders_with_meta.push(folder_meta);
      }

      return all_folders_with_meta;
    },

    getFolder: async ({ folder_type, folder_slug }) => {
      dev.logfunction({ folder_type, folder_slug });

      // TODO cache unique folder
      let folder_meta = await _readMetaFile({ folder_type, folder_slug });

      dev.logverbose("finished readmeta");
      // get preview if exist

      // get number of files if files in schema

      // add to cache

      return folder_meta;
    },
  };

  async function readFolders({ folder_type }) {}

  async function _getFolderSlugs({ folder_path }) {
    dev.logfunction({ folder_path });

    try {
      let folders = (await fs.readdir(folder_path, { withFileTypes: true }))
        .filter(
          (dirent) =>
            dirent.isDirectory() &&
            !["_", "."].some((char) => dirent.name.startsWith(char))
        )
        .map((dirent) => dirent.name);

      dev.logfunction({ folders });
      return folders;
    } catch (err) {
      dev.logfunction("No dir or folder found");
      return [];
    }
  }

  async function _readMetaFile({
    folder_type,
    folder_slug,
    file_slug = "meta.txt",
  }) {
    dev.logfunction({ folder_type, folder_slug });

    const meta_path = utils.makeFullPath(
      { folder_type },
      folder_slug,
      file_slug
    );

    const meta_file_content = await fs.readFile(
      meta_path,
      global.settings.textEncoding
    );

    let meta = utils.parseMeta(meta_file_content);
    meta = utils.sanitizeMetaFromFile({ folder_type, meta });
    meta.slug = folder_slug;

    return meta;
  }

  return API;
})();
