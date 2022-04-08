const bcrypt = require("bcryptjs");
const path = require("path"),
  fs = require("fs-extra"),
  validator = require("validator");

const sharp = require("sharp");

const dev = require("./dev-log"),
  api = require("./api"),
  thumbs = require("./thumbs"),
  cache = require("./cache"),
  recipe = require("./recipe"),
  auth = require("./auth");

module.exports = (function () {
  const API = {
    getPresentation() {
      return new Promise(function (resolve, reject) {
        let presentationMd = path.join(api.getFolderPath(), "presentation.md");
        fs.access(presentationMd, fs.F_OK, function (err) {
          if (err) {
            resolve(validator.unescape(global.appInfos.presentationMd));
          } else {
            let presentationContent = validator.unescape(
              fs.readFileSync(presentationMd, global.settings.textEncoding)
            );
            presentationContent = api.parseData(presentationContent);
            resolve(presentationContent);
          }
        });
      });
    },
    getFolder: async ({ type, slugFolderName }) => {
      if (!slugFolderName)
        dev.error(`COMMON — getFolder / missing slugFolderName`);

      dev.logfunction(
        `COMMON — getFolder type = ${type} with slugFolderName = ${slugFolderName}`
      );

      const cached = cache.get({ type, slugFolderName });
      if (cached) {
        dev.logverbose(
          `COMMON — getFolder / returning cache instead of parsing files.`
        );
        return { [slugFolderName]: cached };
      }

      const folder_path = api.getFullPath({ type, slugFolderName });
      const metaFolderPath = path.join(folder_path, "meta.txt");

      /*** ****/
      let folder_meta = await _readMetaFile(metaFolderPath).catch(() => {
        dev.error(`Missing ${metaFolderPath}`);
        return false;
      });
      folder_meta = _sanitizeMetaFromFile({ type, meta: folder_meta });
      folder_meta.slugFolderName = slugFolderName;

      if (global.settings.structure[type].hasOwnProperty("medias"))
        folder_meta.medias = {};

      // For each folder, find a preview (if it exists)
      if (global.settings.structure[type].hasOwnProperty("preview")) {
        dev.logverbose(`Finding preview for folder = ${slugFolderName}`);
        const preview = await _getFolderPreview({ type, slugFolderName });
        if (preview) folder_meta.preview = preview;
      }

      if (
        global.settings.structure[type].hasOwnProperty("medias") &&
        global.settings.structure[type].fields.hasOwnProperty(
          "number_of_medias"
        )
      ) {
        const list_metaFileName = await API.getMediaMetaNames({
          type,
          slugFolderName,
        });
        folder_meta.number_of_medias = list_metaFileName.length;
      }

      cache.put({ type, slugFolderName }, folder_meta);
      return { [slugFolderName]: folder_meta };
    },
    getFolders: async ({ type }) => {
      dev.logfunction(`COMMON — getFolders type = ${type}`);

      if (!global.settings.structure.hasOwnProperty(type))
        throw `Missing type ${type} in global.settings.json`;

      const folder_slugs = await _getFolderSlugs({ type });
      if (folder_slugs.length === 0) return {};

      let all_folders_data = {};
      for (let slugFolderName of folder_slugs) {
        const folder_meta = await API.getFolder({ type, slugFolderName });
        Object.assign(all_folders_data, folder_meta);
      }

      return all_folders_data;
    },
    createFolder: async ({ type, data }) => {
      dev.logfunction(
        `COMMON — createFolder : will create a new folder 
        for type = ${type} with: ${JSON.stringify(data)}`
      );

      if (!data.hasOwnProperty("name")) data.name = "Untitled Folder";
      if (!global.settings.structure.hasOwnProperty(type))
        throw `Missing type ${type} in global.settings.json`;

      let slugFolderName = data.hasOwnProperty("desired_foldername")
        ? api.slug(data.desired_foldername)
        : api.slug(data.name);
      if (slugFolderName === "") slugFolderName = api.slug(`untitled-${type}`);

      slugFolderName = await _preventFolderOverride({
        type,
        slugFolderName,
      });

      const folder_path = api.getFullPath({ type, slugFolderName });
      dev.logverbose(`Making a new folder at path ${folder_path}`);

      await fs.ensureDir(folder_path);

      if (
        data.hasOwnProperty("preview_rawdata") &&
        global.settings.structure[type].hasOwnProperty("preview")
      )
        await _storeFoldersPreview(slugFolderName, type, data.preview_rawdata);

      data = _makeDefaultMetaFromStructure({
        type,
        method: "create",
        existing: data,
      });

      const meta_path = path.join(folder_path, "meta.txt");

      const meta = await api
        .storeData(meta_path, data, "create")
        .catch((err) => {
          throw err;
        });

      dev.logverbose(
        `New folder meta file created at path: ${meta_path} 
        with meta: ${JSON.stringify(meta)}`
      );

      return slugFolderName;
    },
    editFolder: async ({
      type,
      slugFolderName,
      foldersData,
      newFoldersData,
    }) => {
      dev.logfunction(
        `COMMON — editFolder : will edit folder with type = ${type} and slugFolderName = ${slugFolderName}
          with ${JSON.stringify(newFoldersData)} 
          with existing data ${JSON.stringify(foldersData)}`
      );

      if (!global.settings.structure.hasOwnProperty(type))
        throw `Missing type ${type} in global.settings.json`;

      if (
        newFoldersData &&
        newFoldersData.hasOwnProperty("preview_rawdata") &&
        global.settings.structure[type].hasOwnProperty("preview")
      )
        await _storeFoldersPreview(
          slugFolderName,
          type,
          newFoldersData.preview_rawdata
        );

      foldersData = _makeDefaultMetaFromStructure({
        type,
        method: "create",
        existing: foldersData,
      });
      newFoldersData = _makeDefaultMetaFromStructure({
        type,
        method: "update",
        existing: newFoldersData,
      });

      // overwrite stored obj with new informations
      Object.assign(foldersData, newFoldersData);

      const meta_path = api.getFullPath({
        type,
        slugFolderName,
        file_name: "meta.txt",
      });

      const meta = await api
        .storeData(meta_path, foldersData, "update")
        .catch((err) => {
          throw err;
        });

      dev.logverbose(
        `COMMON — editFolder : now resolving with meta ${JSON.stringify(meta)}`
      );

      cache.del({ type, slugFolderName: slugFolderName });

      return {
        meta,
      };
    },

    removeFolder: async ({ type, slugFolderName }) => {
      dev.logfunction(
        `COMMON — removeFolder : will remove folder: ${slugFolderName}`
      );

      if (!global.settings.structure.hasOwnProperty(type))
        throw `Missing type ${type} in global.settings.json`;

      try {
        if (global.settings.removePermanently === true)
          await _removeFolder({ type, slugFolderName });
        else await _moveFolderToBin({ type, slugFolderName });

        await thumbs.removeFolderThumbs(slugFolderName, type);
        cache.del({ type, slugFolderName });

        // await hyperplateau ? par exemple :
        // await hyperdrive.remove({ slugFolderName });

        return;
      } catch (err) {
        throw err;
      }
    },
    copyFolder: ({
      type,
      slugFolderName: old_slugFolderName,
      new_slugFolderName,
    }) => {
      return new Promise(function (resolve, reject) {
        dev.logfunction(`COMMON — copyFolder`);

        if (!global.settings.structure.hasOwnProperty(type)) {
          return reject(`Missing type ${type} in global.settings.json`);
        }

        _getFolderSlugs({ type }).then((folders) => {
          let new_slugFolderName = api.slug(new_slugFolderName);
          if (new_slugFolderName === "") {
            new_slugFolderName = "untitled";
          }

          if (folders.length > 0) {
            let index = 0;
            let proposedSlugFolderName = new_slugFolderName;
            while (folders.indexOf(proposedSlugFolderName) !== -1) {
              index++;
              proposedSlugFolderName = `${new_slugFolderName}-${index}`;
            }
            new_slugFolderName = proposedSlugFolderName;
            dev.logverbose(`Proposed slug: ${new_slugFolderName}`);
          }

          const oldFolderPath = api.getFullPath({
            type,
            slugFolderName: old_slugFolderName,
          });
          const newFolderPath = api.getFullPath({
            type,
            slugFolderName: new_slugFolderName,
          });
          dev.logverbose(`Copying folder to path ${newFolderPath}`);

          fs.copy(oldFolderPath, newFolderPath)
            .then(() => {
              API.getFolder({ type, slugFolderName: new_slugFolderName }).then(
                (foldersData) => {
                  API.editFolder({
                    type,
                    slugFolderName: new_slugFolderName,
                    foldersData: foldersData[new_slugFolderName],
                    newFoldersData: {
                      name: new_slugFolderName,
                    },
                  }).then(() => {
                    return resolve(new_slugFolderName);
                  });
                }
              );
            })
            .catch((err) => {
              dev.error(`Failed to copy folder`);
              reject(err);
            });
        });
      });
    },

    getMediaMetaNames: ({ type, slugFolderName, metaFileName }) => {
      return new Promise(function (resolve, reject) {
        dev.logfunction(
          `COMMON — getMediaMetaNames in type = ${type}, with slugFolderName = ${slugFolderName} and metaFileName = ${metaFileName}`
        );
        if (slugFolderName === undefined) {
          dev.error(`Missing slugFolderName to read medias from.`);
          reject();
        }
        if (metaFileName === undefined) {
          dev.logverbose(
            `Missing metaFileName to read medias from ${slugFolderName}. Reading all medias instead.`
          );
        }
        dev.logverbose(
          `COMMON — getMediaMetaNames — slugFolderName: ${slugFolderName} — metaFileName: ${metaFileName}`
        );

        let slugFolderPath = api.getFolderPath(
          path.join(global.settings.structure[type].path, slugFolderName)
        );

        fs.readdir(slugFolderPath, function (err, filenames) {
          if (err) {
            dev.error(`Couldn't read content dir: ${err}`);
            return reject(err);
          }
          if (filenames === undefined) {
            dev.error(`No medias for folder found: ${err}`);
            return resolve();
          }

          dev.logverbose(
            `Found this many (${filenames.length}) filenames: ${filenames}`
          );

          let list_metaFileName = filenames.filter((_metaFileName) => {
            return (
              !new RegExp(global.settings.regexpMatchFolderNames, "i").test(
                _metaFileName
              ) &&
              // endswith global.settings.metaFileext
              _metaFileName.endsWith(".txt") &&
              // not meta.txt
              _metaFileName !== "meta.txt" &&
              // not a folder preview
              _metaFileName !== "meta_preview.jpeg" &&
              // not a dotfile
              _metaFileName.indexOf(".") !== 0 &&
              // if has metaFileName, only if it matches
              (metaFileName ? _metaFileName === metaFileName : true)
            );
          });
          dev.logverbose(
            `Number of medias that match in ${slugFolderPath} = ${
              list_metaFileName.length
            }. Media(s) is(are) ${list_metaFileName.join()}`
          );

          if (list_metaFileName.length === 0) {
            dev.logverbose(
              `Since no medias is in this folder, let’s abort right there.`
            );
            return resolve([]);
          } else {
            return resolve(list_metaFileName);
          }
        });
      });
    },
    readMediaAndThumbs: ({ type, slugFolderName, metaFileName }) =>
      readMediaAndThumbs({ type, slugFolderName, metaFileName }),
    readMediaList: async ({ type, medias_list }) => {
      dev.logfunction(
        `COMMON — readMediaList: medias_list = ${JSON.stringify(medias_list)}}`
      );

      if (medias_list.length === 0) return {};

      let folders_and_medias = {};
      for (const { slugFolderName, metaFileName } of medias_list) {
        if (!slugFolderName || !metaFileName) continue;

        if (!folders_and_medias.hasOwnProperty(slugFolderName))
          folders_and_medias[slugFolderName] = {
            medias: {},
          };

        let meta = await readMediaAndThumbs({
          type,
          slugFolderName,
          metaFileName,
        });

        // case of non-existent media
        // we need to return the absence of meta for this media
        if (!meta)
          meta = {
            _isAbsent: true,
          };
        meta.metaFileName = metaFileName;

        folders_and_medias[slugFolderName].medias[metaFileName] = meta;
      }

      return folders_and_medias;
    },

    createMediaMeta: ({ type, slugFolderName, additionalMeta }) => {
      return new Promise(function (resolve, reject) {
        dev.logfunction(
          `COMMON — createMediaMeta : will create a new meta file 
          in folder ${slugFolderName}
          `
        );
        if (Object.keys(additionalMeta).length > 0) {
          dev.logverbose(
            `Has additional meta: ${JSON.stringify(additionalMeta, null, 4)}`
          );
        }

        let mediaName;
        let mediaPath;
        let metaFileName;
        if (additionalMeta.hasOwnProperty("media_filename")) {
          mediaName = additionalMeta.media_filename;

          const folder_path = api.getFullPath({ type, slugFolderName });

          mediaPath = path.join(folder_path, mediaName);
          metaFileName = mediaName + ".txt";
        } else if (additionalMeta.hasOwnProperty("desired_filename")) {
          let randomString = (
            Math.random().toString(36) + "00000000000000000"
          ).slice(2, 3 + 2);
          metaFileName = `${api.slug(
            additionalMeta.desired_filename
          )}-${randomString}.txt`;
        } else {
          let timeCreated = api.getCurrentDate();
          let randomString = (
            Math.random().toString(36) + "00000000000000000"
          ).slice(2, 3 + 2);
          metaFileName = `${timeCreated}-${randomString}.txt`;
        }

        const folder_path = api.getFullPath({ type, slugFolderName });
        const metaFilePath = path.join(folder_path, metaFileName);

        // check that a meta with this name doesn't exist already
        fs.access(metaFilePath, fs.F_OK, function (err) {
          // if there's nothing at path, we’re all good
          if (err) {
            // guess file type from filename
            if (
              !additionalMeta.hasOwnProperty("type") &&
              additionalMeta.hasOwnProperty("media_filename") &&
              mediaName !== undefined
            ) {
              let mediaFileExtension = new RegExp(
                global.settings.regexpGetFileExtension,
                "i"
              ).exec(mediaName)[0];
              dev.logverbose(
                `Trying to guess filetype from extension: ${mediaFileExtension}`
              );
              switch (mediaFileExtension.toLowerCase()) {
                case ".jpeg":
                case ".jpg":
                case ".webp":
                case ".png":
                case ".gif":
                case ".tiff":
                case ".tif":
                case ".dng":
                case ".svg":
                  additionalMeta.type = "image";
                  break;
                case ".mp4":
                case ".flv":
                case ".mov":
                case ".webm":
                case ".avi":
                  additionalMeta.type = "video";
                  break;
                case ".stl":
                  additionalMeta.type = "stl";
                  break;
                case ".mp3":
                case ".wav":
                case ".m4a":
                case ".ogg":
                  additionalMeta.type = "audio";
                  break;
                case ".md":
                case ".rtf":
                  additionalMeta.type = "text";
                  break;
                // case ".ino":
                //   additionalMeta.type = "code";
                //   break;
                case ".pdf":
                  additionalMeta.type = "document";
                  break;
              }
              dev.logverbose(`Type determined to be: ${additionalMeta.type}`);
            }

            let mdata = _makeDefaultMetaFromStructure({
              type,
              type_two: "medias",
              method: "create",
              existing: additionalMeta,
            });

            let tasks = [];

            /***************************************************************************
                CREATED DATE
            ***************************************************************************/
            if (
              additionalMeta !== undefined &&
              additionalMeta.hasOwnProperty("fileCreationDate")
            ) {
              dev.logverbose(`Setting created from additionalMeta`);
              mdata.date_created = api.convertDate(
                additionalMeta.fileCreationDate
              );
            }

            if (mediaName !== undefined) {
              let getFileCreationDate = new Promise((resolve, reject) => {
                fs.stat(mediaPath, function (err, stats) {
                  if (err) {
                    return resolve();
                  }
                  if (!mdata.hasOwnProperty("date_created")) {
                    dev.logverbose(`Setting created from file birthtime`);
                    mdata.date_created = api.convertDate(
                      new Date(stats.birthtime)
                    );
                  }
                  if (!mdata.hasOwnProperty("file_meta")) mdata.file_meta = [];
                  mdata.file_meta.push({ size: stats.size });
                  return resolve();
                });
              });
              tasks.push(getFileCreationDate);
            }

            if (mdata.type === "image") {
              dev.logverbose(`Looking for EXIF for image`);
              let getEXIFTimestamp = new Promise((resolve, reject) => {
                thumbs
                  .getTimestampFromEXIF(mediaPath)
                  .then((ts) => {
                    if (ts === false) {
                      dev.logverbose(`No timestamp found in EXIF.`);
                    } else {
                      let localTS = api.parseUTCDate(ts);
                      dev.logverbose(
                        `getTimestampFromEXIF timestamp to date : ${api.convertDate(
                          localTS
                        )}`
                      );
                      mdata.date_created = api.convertDate(localTS);
                    }
                    resolve();
                  })
                  .catch((err) => {
                    dev.error(`No EXIF data to read from: ${err}`);
                    return resolve();
                  });
              });
              tasks.push(getEXIFTimestamp);
            }

            let getEXIFData = new Promise((resolve, reject) => {
              thumbs
                .getMediaEXIF({ type: mdata.type, mediaPath })
                .then((exif_meta) => {
                  dev.logverbose(`exif_meta = ${JSON.stringify(exif_meta)}}`);

                  if (!mdata.hasOwnProperty("file_meta")) mdata.file_meta = [];
                  Object.entries(exif_meta).map(([key, value]) => {
                    mdata.file_meta.push({ [key]: value });
                  });

                  if (exif_meta.hasOwnProperty("duration"))
                    mdata.duration = exif_meta.duration;
                  if (exif_meta.hasOwnProperty("ratio"))
                    mdata.ratio = exif_meta.ratio;

                  return resolve();
                })
                .catch((err) => {
                  dev.error(`No EXIF data to read from: ${err}`);
                  return resolve();
                });
            });
            if (mediaName !== undefined) tasks.push(getEXIFData);

            /***************************************************************************
                DO IT ALL
            ***************************************************************************/
            Promise.all(tasks).then(() => {
              api.storeData(metaFilePath, mdata, "create").then(
                function (meta) {
                  dev.logverbose(
                    `New media meta file created at path: ${metaFilePath} with meta: ${JSON.stringify(
                      meta,
                      null,
                      4
                    )}`
                  );
                  resolve(metaFileName);
                },
                function (err) {
                  reject(`Couldn't create media meta : ${err}`);
                }
              );
            });
          } else {
            // otherwise, something’s weird
            dev.error(`Found existing meta! Aborting`);
            reject();
          }
        });
      });
    },
    convertAndSaveMedia: async ({
      uploadDir,
      tempPath,
      newFileName,
      socketid,
    }) => {
      dev.logfunction(
        `COMMON — convertAndSaveMedia ${tempPath} to ${newFileName}`
      );

      if (
        newFileName.toLowerCase().endsWith(".jpeg") ||
        newFileName.toLowerCase().endsWith(".jpg")
      ) {
        let finalPath = path.join(uploadDir, newFileName);
        await sharp(tempPath)
          .rotate()
          .flatten()
          .withMetadata()
          .jpeg({
            quality: 90,
          })
          .toFile(finalPath)
          .catch((err) => {
            throw err;
          });

        dev.logverbose(`Removing raw uploaded file at ${tempPath}`);
        try {
          await fs.unlink(tempPath);
        } catch (err) {
          throw err;
        }

        dev.logverbose(`Stored captured image to ${finalPath}`);
      }
      // else if (
      //   newFileName.toLowerCase().endsWith('.webm') ||
      //   newFileName.toLowerCase().endsWith('.mov')
      // ) {
      //   newFileName = newFileName.replace('.webm', '.mp4');
      //   newFileName = newFileName.replace('.mov', '.mp4');
      //   let finalPath = path.join(uploadDir, newFileName);

      //   ffmpeg.ffprobe(tempPath, function(err, metadata) {
      //     let duration = '?';
      //     if (typeof metadata !== 'undefined') {
      //       dev.logverbose(`Found duration: ${metadata.format.duration}`);
      //       duration = metadata.format.duration;
      //     }
      //     let time_since_last_report = 0;
      //     var proc = new ffmpeg()
      //       .input(tempPath)
      //       .withVideoCodec('libx264')
      //       .withVideoBitrate('5000k')
      //       .withAudioCodec('libmp3lame')
      //       .withAudioBitrate('128k')
      //       .toFormat('mp4')
      //       .output(finalPath)
      //       .on('progress', progress => {
      //         if (+new Date() - time_since_last_report > 3000) {
      //           time_since_last_report = +new Date();
      //           require('./sockets').notify({
      //             socketid,
      //             not_localized_string: `Converting video for the web : ${
      //               progress.timemark
      //             } / ${duration}`
      //           });
      //         }
      //       })
      //       .on('end', () => {
      //         dev.logverbose(`Video has been converted`);
      //         fs.unlink(tempPath, err => {
      //           dev.logverbose(`Removing raw uploaded file at ${tempPath}`);
      //         });
      //         require('./sockets').notify({
      //           socketid,
      //           localized_string: `video_converted`
      //         });
      //         resolve(newFileName);
      //       })
      //       .on('error', function(err, stdout, stderr) {
      //         dev.error('An error happened: ' + err.message);
      //         dev.error('ffmpeg standard output:\n' + stdout);
      //         dev.error('ffmpeg standard error:\n' + stderr);
      //         reject(`couldn't convert a video`);
      //       })
      //       .run();
      //   });
      // }
      // else if (newFileName.toLowerCase().endsWith('.wav')) {
      //   newFileName = newFileName.replace('wav', 'mp3');
      //   let finalPath = path.join(uploadDir, newFileName);

      //   ffmpeg.ffprobe(tempPath, function(err, metadata) {
      //     let duration = '?';
      //     if (typeof metadata !== 'undefined') {
      //       dev.logverbose(`Found duration: ${metadata.format.duration}`);
      //       duration = metadata.format.duration;
      //     }
      //     let time_since_last_report = 0;

      //     ffmpeg(tempPath)
      //       .withAudioCodec('libmp3lame')
      //       .withAudioBitrate('192k')
      //       .output(finalPath)
      //       .on('progress', progress => {
      //         if (+new Date() - time_since_last_report > 3000) {
      //           time_since_last_report = +new Date();
      //           require('./sockets').notify({
      //             socketid,
      //             not_localized_string: `Converting audio for the web : ${
      //               progress.timemark
      //             } / ${duration}`
      //           });
      //         }
      //       })
      //       .on('end', () => {
      //         dev.logverbose(`Audio has been converted`);
      //         fs.unlink(tempPath, err => {
      //           dev.logverbose(`Removing raw uploaded file at ${tempPath}`);
      //         });
      //         resolve(newFileName);
      //       })
      //       .on('error', function(err, stdout, stderr) {
      //         dev.error('An error happened: ' + err.message);
      //         dev.error('ffmpeg standard output:\n' + stdout);
      //         dev.error('ffmpeg standard error:\n' + stderr);
      //         reject(`couldn't convert an audio file`);
      //       })
      //       .run();
      //   });
      // }
      else {
        let finalPath = path.join(uploadDir, newFileName);
        try {
          await fs.move(tempPath, finalPath);
        } catch (err) {
          throw err;
        }
        dev.logverbose(`Stored captured media to ${finalPath}`);
      }

      return newFileName;
    },

    editMedia: ({
      type,
      slugFolderName,
      metaFileName,
      data,
      recipe_with_data,
      socket,
    }) => {
      return new Promise(function (resolve, reject) {
        dev.logfunction(
          `COMMON — editMedia : will edit media for ${slugFolderName} at ${metaFileName} with ${JSON.stringify(
            data,
            null,
            4
          )}`
        );

        readMediaMeta({ type, slugFolderName, metaFileName })
          .then((meta) => {
            _editRawMedia({
              type,
              slugFolderName,
              metaFileName,
              meta,
              recipe_with_data,
              socket,
            }).then((meta) => {
              dev.logverbose(
                `Got meta for ${metaFileName} with ${JSON.stringify(
                  meta,
                  null,
                  4
                )}`
              );

              // cleaning up stored meta
              meta = _makeDefaultMetaFromStructure({
                type,
                type_two: "medias",
                method: "create",
                existing: meta,
              });

              let newMediaData = _makeDefaultMetaFromStructure({
                type,
                type_two: "medias",
                method: "update",
                existing: data,
              });

              dev.logverbose(
                `Following datas will replace existing data for this media meta: ${JSON.stringify(
                  newMediaData,
                  null,
                  4
                )}`
              );

              // overwrite stored obj with new informations
              Object.assign(meta, newMediaData);
              let tasks = [];

              let updateMediaMeta = new Promise((resolve, reject) => {
                const folder_path = api.getFullPath({ type, slugFolderName });
                let mediaMetaPath = path.join(folder_path, metaFileName);

                api.storeData(mediaMetaPath, meta, "update").then(
                  (meta) => {
                    dev.logverbose(
                      `Updated media meta file at path: ${mediaMetaPath} with meta: ${JSON.stringify(
                        meta,
                        null,
                        4
                      )}`
                    );
                    cache.del({
                      type: type + "/" + "medias",
                      slugFolderName: slugFolderName + "/" + metaFileName,
                    });
                    resolve();
                  },
                  function (err) {
                    reject(`Couldn't update folder meta : ${err}`);
                  }
                );
              });
              tasks.push(updateMediaMeta);

              if (
                (meta.type === "text" ||
                  meta.type === "marker" ||
                  meta.type === "planning" ||
                  meta.type === "composition" ||
                  meta.type === "embed" ||
                  meta.type === "link" ||
                  meta.type === "code") &&
                data.hasOwnProperty("content")
              ) {
                dev.logverbose(`Is text and need to update content.`);
                dev.logverbose(`New content: ${data.content}`);

                let updateTextMedia = new Promise((resolve, reject) => {
                  let mediaFileName = _legacyGetMediaFilename({
                    type,
                    meta,
                    metaFileName,
                  });

                  const folder_path = api.getFullPath({ type, slugFolderName });
                  let mediaPath = path.join(folder_path, mediaFileName);

                  let content = validator.escape(data.content + "");
                  api
                    .storeData(mediaPath, content, "update")
                    .then((content) => {
                      dev.logverbose(
                        `Updated media file at path: ${mediaPath} with content: ${content}`
                      );
                      resolve();
                    })
                    .catch((err) => {
                      reject(err);
                    });
                });
                tasks.push(updateTextMedia);
              }

              Promise.all(tasks).then(() => {
                resolve(slugFolderName);
              });
            });
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    removeMedia: async ({ type, slugFolderName, metaFileName }) => {
      dev.logfunction(
        `COMMON — removeMedia : will remove media at path: ${slugFolderName}/${metaFileName}`
      );

      const meta = await readMediaMeta({
        type,
        slugFolderName,
        metaFileName,
      });

      let mediaFileName = _legacyGetMediaFilename({ type, meta, metaFileName });

      try {
        if (global.settings.removePermanently === true)
          await _removeMedia({
            type,
            slugFolderName,
            metaFileName,
            mediaFileName,
          });
        else
          await _moveMediaToBin({
            type,
            slugFolderName,
            metaFileName,
            mediaFileName,
          });

        cache.del({
          type: type + "/" + "medias",
          slugFolderName: slugFolderName + "/" + metaFileName,
        });

        /* Should not be necessary, need to test */
        // cache.del({ type, slugFolderName });

        return thumbs.removeMediaThumbs(slugFolderName, type, mediaFileName);
      } catch (err) {
        throw err;
      }
    },
    createMedia: ({
      type,
      rawData,
      slugFolderName,
      additionalMeta = "",
      socket,
    }) => {
      return new Promise(function (resolve, reject) {
        dev.logfunction(
          `COMMON — createMedia with type = ${type}, 
          slugFolderName = ${slugFolderName} 
          and additionalMeta = ${JSON.stringify(additionalMeta, null, 4)}`
        );

        if (!additionalMeta.hasOwnProperty("type")) {
          dev.logverbose(
            "Missing type field, so this media doesn’t have an associated file"
          );
          return resolve(additionalMeta);
        }

        let timeCreated = api.getCurrentDate();
        let randomString = (
          Math.random().toString(36) + "00000000000000000"
        ).slice(2, 3 + 2);

        let mediaName = additionalMeta.hasOwnProperty("type")
          ? `${additionalMeta.type}-${timeCreated}-${randomString}`
          : `${timeCreated}-${randomString}`;

        // Depending on the type of media we will create, we will need to act differently:
        // - 'image' -> use sharp and create a .jpeg from the buffer
        // - 'video' -> store the content to a file with storeMediaToDisk
        // - 'stopmotion' -> assemble all images to a video
        // - 'audio' -> store content with storeMediaToDisk
        // - 'text' -> store content with storeData

        let tasks = [];

        const folder_path = api.getFullPath({ type, slugFolderName });

        // MOST OF THIS CODE ISN’T USED ANYMORE
        // before, for the capture page, dodoc, used to send medias with socketio as base64 strings
        // Now instead, it uses the same logic as when importing files :
        // axios uploads a blob that gets stored directly as a file server side

        // the only code that still uses this logic is for stopmotions

        if (additionalMeta.type === "image") {
          tasks.push(
            new Promise((resolve, reject) => {
              mediaName += ".jpeg";
              let pathToMedia = path.join(folder_path, mediaName);

              let imageBuffer = rawData;

              sharp(imageBuffer)
                .rotate()
                .flatten()
                .withMetadata()
                .toFormat("jpeg", {
                  quality: global.settings.mediaThumbQuality,
                })
                .toFile(pathToMedia, function (err, info) {
                  if (err) {
                    dev.error(err);
                    reject(err);
                  }
                  dev.logverbose(`Stored captured image to ${pathToMedia}`);
                  resolve();
                });
            })
          );
        } else if (additionalMeta.type === "video") {
          tasks.push(
            new Promise((resolve, reject) => {
              mediaName += ".webm";

              // only works for projects media (root) for now
              api
                .writeVideoToDisk(slugFolderName, mediaName, rawData)
                .then(() => {
                  resolve();
                })
                .catch((err) => {
                  reject(err);
                });
            })
          );
        } else if (additionalMeta.type === "audio") {
          tasks.push(
            new Promise((resolve, reject) => {
              mediaName += ".mp3";

              // only works for projects media (root) for now
              api
                .writeAudioToDisk(slugFolderName, mediaName, rawData)
                .then(() => {
                  resolve();
                })
                .catch((err) => {
                  reject(err);
                });
            })
          );
        } else if (additionalMeta.type === "svg") {
          tasks.push(
            new Promise((resolve, reject) => {
              mediaName += ".svg";
              let pathToMedia = path.join(folder_path, mediaName);
              additionalMeta.type = "image";

              var fileBuffer = new Buffer(rawData, "base64");
              fs.writeFile(pathToMedia, fileBuffer, function (err) {
                if (err) reject(err);
                resolve();
              });
            })
          );
        } else if (
          additionalMeta.type === "text" ||
          additionalMeta.type === "marker" ||
          additionalMeta.type === "planning" ||
          additionalMeta.type === "composition" ||
          additionalMeta.type === "embed" ||
          additionalMeta.type === "link" ||
          additionalMeta.type === "code"
        ) {
          tasks.push(
            new Promise((resolve, reject) => {
              mediaName += ".md";
              let pathToMedia = path.join(folder_path, mediaName);

              api.storeData(pathToMedia, rawData, "create").then(
                function (meta) {
                  resolve();
                },
                function (err) {
                  dev.error(`Failed to storeData for textmedia: ${err}`);
                  reject(err);
                }
              );
            })
          );
        } else if (additionalMeta.type === "stopmotion") {
          tasks.push(
            new Promise((resolve, reject) => {
              mediaName += ".mp4";
              let pathToMedia = path.join(folder_path, mediaName);
              additionalMeta.type = "video";

              // only works for projects media (root) for now
              api
                .makeStopmotionFromImageSequence({
                  pathToMedia,
                  images: rawData,
                  slugStopmotionName: additionalMeta.slugStopmotionName,
                  frameRate: additionalMeta.frameRate,
                  socket,
                })
                .then(() => {
                  resolve();
                })
                .catch((err) => {
                  reject(err);
                });
            })
          );
        } else if (additionalMeta.type === "other") {
          tasks.push(
            new Promise((resolve, reject) => {
              if (additionalMeta.extension)
                mediaName += "." + additionalMeta.extension;
              let pathToMedia = path.join(folder_path, mediaName);

              var fileBuffer = new Buffer(rawData, "base64");
              fs.writeFile(pathToMedia, fileBuffer)
                .then(() => {
                  resolve();
                })
                .catch((err) => {
                  reject(err);
                });
            })
          );
        }

        Promise.all(tasks)
          .then(() => {
            dev.logverbose(`Passed all tasks for captured medias`);
            let newMediaInfos = {
              media_filename: mediaName,
              fileCreationDate: api.parseDate(timeCreated),
            };
            if (typeof additionalMeta !== "undefined") {
              newMediaInfos = Object.assign({}, newMediaInfos, additionalMeta);
            }
            resolve(newMediaInfos);
          })
          .catch((err) => {
            dev.error(`Failed to store captured media as file: ${err}`);
            reject(`${err}`);
          });
      });
    },
    copyMediaToAnotherFolder: ({
      type,
      from_slugFolderName,
      to_slugFolderName,
      metaFileName,
      meta_to_edit,
    }) => {
      return new Promise(function (resolve, reject) {
        dev.logfunction(
          `COMMON — copyMediaToAnotherFolder : will copy media from folder (type ${type}) slugged ${from_slugFolderName} to folder slugged ${to_slugFolderName} with metaFileName: ${metaFileName}`
        );

        // lire le meta
        readMediaMeta({
          type,
          slugFolderName: from_slugFolderName,
          metaFileName,
        })
          .then((media_data) => {
            let tasks = [];

            const origin_slugFolderPath = api.getFolderPath(
              path.join(
                global.settings.structure[type].path,
                from_slugFolderName
              )
            );
            let destination_slugFolderPath = api.getFolderPath(
              path.join(global.settings.structure[type].path, to_slugFolderName)
            );

            // s’il contient un champ media_filename
            if (
              global.settings.structure[type].medias.fields.hasOwnProperty(
                "media_filename"
              ) &&
              media_data.hasOwnProperty("media_filename")
            ) {
              let copy_media = new Promise((resolve, reject) => {
                // copier le media_filename dans le nouveau dossier avec le premier nom disponible
                api
                  .findFirstFilenameNotTaken(
                    destination_slugFolderPath,
                    media_data.media_filename
                  )
                  .then(function (newFileName) {
                    const origin_path = path.join(
                      origin_slugFolderPath,
                      media_data.media_filename
                    );
                    const destination_path = path.join(
                      destination_slugFolderPath,
                      newFileName
                    );
                    fs.copy(origin_path, destination_path, function (err) {
                      if (err) {
                        dev.error(`Failed to copy: ${err}`);
                        // return reject(err);
                      }
                      return resolve({
                        media_filename: newFileName,
                      });
                    });
                  });
              });

              tasks.push(copy_media);
            }

            // s’il contient un champ original_media_filename
            if (
              global.settings.structure[type].medias.fields.hasOwnProperty(
                "original_media_filename"
              ) &&
              media_data.hasOwnProperty("original_media_filename")
            ) {
              let copy_original_media = new Promise((resolve, reject) => {
                // copier le media_filename dans le nouveau dossier avec le premier nom disponible
                api
                  .findFirstFilenameNotTaken(
                    destination_slugFolderPath,
                    media_data.original_media_filename
                  )
                  .then(function (newFileName) {
                    const origin_path = path.join(
                      origin_slugFolderPath,
                      media_data.original_media_filename
                    );
                    const destination_path = path.join(
                      destination_slugFolderPath,
                      newFileName
                    );
                    fs.copy(origin_path, destination_path, function (err) {
                      if (err) {
                        dev.error(`Failed to copy: ${err}`);
                        return reject(err);
                      }
                      return resolve({
                        original_media_filename: newFileName,
                      });
                    });
                  });
              });

              tasks.push(copy_original_media);
            }

            Promise.all(tasks).then((d_array) => {
              // updater le meta avec les nouvelles valeurs

              api
                .findFirstFilenameNotTaken(
                  destination_slugFolderPath,
                  metaFileName
                )
                .then(function (newFileName) {
                  dev.logverbose(
                    `Will copy meta to new folder with newFileName = ${newFileName}`
                  );

                  const origin_metaFilePath = path.join(
                    origin_slugFolderPath,
                    metaFileName
                  );

                  const destination_metaFilePath = path.join(
                    destination_slugFolderPath,
                    newFileName
                  );

                  fs.copy(
                    origin_metaFilePath,
                    destination_metaFilePath,
                    function (err) {
                      if (err) {
                        dev.error(`Failed to copy: ${err}`);
                        return reject(err);
                      }

                      _readMetaFile(destination_metaFilePath).then((meta) => {
                        d_array.map((i) => {
                          Object.assign(meta, i);
                        });
                        if (meta.hasOwnProperty("date_uploaded")) {
                          meta.date_uploaded = api.getCurrentDate();
                        }

                        Object.assign(meta, meta_to_edit);

                        api
                          .storeData(destination_metaFilePath, meta, "create")
                          .then(function (meta) {
                            return resolve(newFileName);
                          })
                          .catch((err) => {
                            return reject(err);
                          });
                      });
                    }
                  );
                })
                .catch((err) => {
                  dev.error(
                    `Failed to find available file name for meta: ${err}`
                  );
                  reject(err);
                });
            });
          })
          .catch((err) => {
            dev.error(`Failed to read media meta: ${err}`);
            reject(err);
          });
      });
    },
    addTempMediaToFolder: ({ from, to, additionalMeta }) => {
      return new Promise(function (resolve, reject) {
        const path_to_original_file = path.join(
          global.tempStorage,
          global.settings.cacheDirname,
          global.settings.structure[from.type].path,
          from.media_filename
        );

        let slugFolderPath = api.getFolderPath(
          path.join(global.settings.structure[to.type].path, to.slugFolderName)
        );

        api
          .findFirstFilenameNotTaken(slugFolderPath, from.media_filename)
          .then(function (newFileName) {
            dev.logverbose(`Following filename is available: ${newFileName}`);

            const destination_path = path.join(slugFolderPath, newFileName);
            fs.copy(path_to_original_file, destination_path, function (err) {
              if (err) {
                dev.error(`Failed to copy: ${err}`);
                return reject(err);
              }
              require("./sockets").createMediaMeta({
                type: to.type,
                slugFolderName: to.slugFolderName,
                additionalMeta: Object.assign(additionalMeta, {
                  media_filename: newFileName,
                }),
              });
              return resolve();
            });
          });
      });
    },
  };

  function readMediaMeta({ type, slugFolderName, metaFileName }) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(
        `COMMON — readMediaMeta: type = ${type} & slugFolderName = ${slugFolderName} & metaFileName = ${metaFileName}`
      );
      // pour chaque item, on regarde s’il contient un fichier méta (même nom + .txt)
      let slugFolderPath = api.getFolderPath(
        path.join(global.settings.structure[type].path, slugFolderName)
      );
      let metaFile = path.join(slugFolderPath, metaFileName);

      fs.access(metaFile, fs.F_OK, (err) => {
        // if there's no META file at path
        if (err) {
          dev.logverbose(`No meta for this media: ${err}`);
          return reject(`Meta is missing for ${metaFileName}`);
        }

        dev.logverbose(`Found meta there: ${metaFile}`);
        _readMetaFile(metaFile)
          .then((mediaData) => {
            mediaData = _sanitizeMetaFromFile({
              type,
              type_two: "medias",
              meta: mediaData,
            });

            const _metaFileName = _legacyGetMediaFilename({
              type,
              meta: mediaData,
              metaFileName,
            });

            mediaData.media_filename = _metaFileName;

            if (
              (mediaData.type === "text" ||
                mediaData.type === "marker" ||
                mediaData.type === "planning" ||
                mediaData.type === "composition" ||
                mediaData.type === "embed" ||
                mediaData.type === "link" ||
                mediaData.type === "code") &&
              mediaData.hasOwnProperty("media_filename")
            ) {
              // get text content
              let mediaPath = path.join(
                api.getFolderPath(
                  path.join(
                    global.settings.structure[type].path,
                    slugFolderName
                  )
                ),
                mediaData.media_filename
              );
              mediaData.content = validator.unescape(
                fs.readFileSync(mediaPath, global.settings.textEncoding)
              );
              dev.logverbose(`Got mediaData.content : ${mediaData.content}`);
              return resolve(mediaData);
            }
            return resolve(mediaData);
          })
          .catch((err) => {
            return reject(err);
          });
      });
    });
  }
  function readMediaAndThumbs({ type, slugFolderName, metaFileName }) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(
        `COMMON — readMediaAndThumbs: slugFolderName = ${slugFolderName} & metaFileName = ${metaFileName}`
      );

      const cached = cache.get({
        type: type + "/" + "medias",
        slugFolderName: slugFolderName + "/" + metaFileName,
      });
      if (cached) {
        dev.logverbose(
          `COMMON — readMediaAndThumbs / returning cache instead of parsing files.`
        );
        return resolve(cached);
      }

      readMediaMeta({ type, slugFolderName, metaFileName })
        .then((mediaData) => {
          dev.logverbose(
            `Read Meta, now getting thumbs for ${JSON.stringify(
              mediaData,
              null,
              4
            )}`
          );

          if (
            mediaData.hasOwnProperty("media_filename") &&
            global.settings.structure[type].medias.thumbs
          ) {
            // let’s find or create thumbs
            thumbs
              .makeMediaThumbs(
                slugFolderName,
                mediaData.media_filename,
                mediaData.type,
                type,
                "medias",
                mediaData
              )
              .then((thumbData) => {
                mediaData.thumbs = thumbData;
                cache.put(
                  {
                    type: type + "/" + "medias",
                    slugFolderName: slugFolderName + "/" + metaFileName,
                  },
                  mediaData
                );
                resolve(mediaData);
              })
              .catch((err) => {
                resolve();
              });
          } else {
            resolve(mediaData);
          }
        })
        .catch((err) => {
          resolve();
        });
    });
  }
  function _readMetaFile(metaPath) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(`COMMON — _readMetaFile: ${metaPath}`);
      var metaFileContent = fs.readFileSync(
        metaPath,
        global.settings.textEncoding
      );
      var metaFileContentParsed = api.parseData(metaFileContent);
      resolve(metaFileContentParsed);
    });
  }

  async function _getFolderSlugs({ type }) {
    dev.logfunction(`COMMON — _getFolderSlugs for type ${type}`);

    const folder_path = api.getFullPath({ type });
    try {
      let folders = (await fs.readdir(folder_path, { withFileTypes: true }))
        .filter(
          (dirent) =>
            dirent.isDirectory() &&
            !["_", "."].some((word) => dirent.name.startsWith(word))
        )
        .map((dirent) => dirent.name);
      dev.logverbose(
        `COMMON — _getFolderSlugs / number of folders that match in ${folder_path} = ${folders.length}.`
      );
      return folders;
    } catch (err) {
      dev.logverbose(`COMMON — _getFolderSlugs / no dir or no folder.`);
      return [];
    }
  }

  async function _preventFolderOverride({ type, slugFolderName }) {
    const all_folders_names = await _getFolderSlugs({ type });

    if (all_folders_names.length > 0) {
      let index = 0;
      let new_slugFolderName = slugFolderName;
      while (all_folders_names.indexOf(new_slugFolderName) !== -1) {
        index++;
        new_slugFolderName = `${slugFolderName}-${index}`;
      }
      slugFolderName = new_slugFolderName;
      dev.logverbose(`Proposed slug: ${slugFolderName}`);
    }

    return slugFolderName;
  }

  async function _getFolderPreview({ type, slugFolderName }) {
    dev.logfunction(
      `COMMON — _getFolderPreview : will get preview for type ${type} and folder ${slugFolderName}`
    );
    const preview_name = "meta_preview.jpeg";
    const folder_path = api.getFullPath({ type, slugFolderName });
    const pathToPreview = path.join(folder_path, preview_name);

    // check if preview exists, otherwise return
    if (!(await fs.pathExists(pathToPreview))) return false;

    const thumbData = thumbs.makeMediaThumbs(
      slugFolderName,
      preview_name,
      "image",
      type,
      "preview"
    );

    return thumbData;
  }

  function _storeFoldersPreview(slugFolderName, type, preview_rawdata) {
    return new Promise((resolve, reject) => {
      dev.logfunction(
        `COMMON — _storeFoldersPreview : will store preview for folder: ${slugFolderName}`
      );

      const baseFolderPath = global.settings.structure[type].path;
      const mainFolderPath = api.getFolderPath(baseFolderPath);
      const thisFolderPath = path.join(mainFolderPath, slugFolderName);

      const preview_filename = "meta_preview.jpeg";

      const pathToPreview = path.join(thisFolderPath, preview_filename);

      dev.logverbose(
        `COMMON — _storeFoldersPreview : Removing existing preview at ${pathToPreview}`
      );

      fs.remove(pathToPreview)
        .then(() => {
          return thumbs.removeMediaThumbs(
            slugFolderName,
            type,
            preview_filename
          );
        })
        .then(() => {
          if (preview_rawdata === "" || !preview_rawdata) {
            dev.logverbose(
              `COMMON — _storeFoldersPreview : No new preview data found, returning.`
            );
            return resolve();
          }

          // two cases: preview_rawdata can be a non "" string --> base 64 image

          // second case: preview_rawdata is an object that contains
          // a metaFileName,
          // a slugProjectName,
          // a type
          // in this case, we get the original media, check it’s an image, send it to sharp

          var tasks = [];

          if (typeof preview_rawdata === "object") {
            const { type, slugFolderName, metaFileName } = preview_rawdata;
            tasks.push(
              new Promise((resolve, reject) => {
                readMediaMeta({
                  type,
                  slugFolderName,
                  metaFileName,
                }).then(({ media_filename }) => {
                  const baseFolderPath = global.settings.structure[type].path;
                  const mainFolderPath = api.getFolderPath(baseFolderPath);

                  const mediaPath = path.join(
                    mainFolderPath,
                    slugFolderName,
                    media_filename
                  );

                  resolve(mediaPath);
                  // trouver le chemin vers l’image
                });
              })
            );
          } else {
            tasks.push(
              new Promise((resolve, reject) => {
                resolve(api.decodeBase64Image(preview_rawdata));
              })
            );
          }

          Promise.all(tasks).then(([image_buffer]) => {
            dev.logverbose(
              `COMMON — _storeFoldersPreview : Now making a folder preview at path ${pathToPreview}`
            );
            sharp(image_buffer)
              .rotate()
              .resize(
                global.settings.structure[type].preview.width,
                global.settings.structure[type].preview.height,
                {
                  fit: "cover",
                }
              )
              .flatten({ background: "white" })
              .withMetadata()
              .toFormat("jpeg", {
                quality: global.settings.mediaThumbQuality,
              })
              .toFile(pathToPreview)
              .then(function () {
                dev.logverbose(
                  `COMMON — _storeFoldersPreview : Finished making a folder preview at ${pathToPreview}`
                );
                resolve();
              })
              .catch((err) => {
                console.error(err);
                reject(err);
              });
          });
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  function _makeDefaultMetaFromStructure({
    type,
    type_two,
    method = "create",
    existing = {},
  }) {
    dev.logfunction(
      `COMMON — _makeDefaultMetaFromStructure : will '${method}' a new default meta object for type = ${type} and type_two = ${type_two}.`
    );
    if (!global.settings.structure.hasOwnProperty(type)) {
      dev.error(`Missing type ${type} in global.settings.json`);
    }

    let fields =
      type_two === undefined
        ? global.settings.structure[type].fields
        : global.settings.structure[type][type_two].fields;
    let output_obj = {};

    Object.entries(fields).forEach(([key, val]) => {
      // dev.logverbose(`Iterating through struct entries, at key ${key}`);
      if (!val.hasOwnProperty("type")) {
        dev.error(
          `Missing type property for field name ${key} in global.settings.json`
        );
      }
      let type = val.type;

      // if updating and "read_only", let’s stop right there for that key
      if (
        method === "update" &&
        val.hasOwnProperty("read_only") &&
        val.read_only === true
      ) {
        return;
      }

      // if updating a meta file and the new meta doesn’t have the iterated value
      // we stop except if that field has "override"
      if (
        method === "update" &&
        !existing.hasOwnProperty(key) &&
        !(val.hasOwnProperty("override") && val.override === true)
      ) {
        return;
      }

      if (type === "date") {
        // "override" means "reapply default everytime we update this file"
        if (
          (!val.hasOwnProperty("override") || val.override === false) &&
          existing.hasOwnProperty(key)
        ) {
          // get from original if it exists and if override is not set or set to false
          output_obj[key] = api.convertDate(existing[key] + "");
        } else if (val.hasOwnProperty("default")) {
          // get from default if set
          output_obj[key] =
            val.default === "current" ? api.getCurrentDate() : val.default;
        }
      } else if (type === "boolean") {
        if (
          (!val.hasOwnProperty("override") || val.override === false) &&
          existing.hasOwnProperty(key)
        ) {
          // get from original if it exists and if override is not set or set to false
          output_obj[key] = validator.toBoolean(existing[key] + "");
        } else if (
          val.hasOwnProperty("default") &&
          typeof val.default === "boolean"
        ) {
          output_obj[key] = val.default;
        }
      } else if (type === "string") {
        if (
          (!val.hasOwnProperty("override") || val.override === false) &&
          existing.hasOwnProperty(key)
        ) {
          if (val.hasOwnProperty("transform") && val.transform === "crypt") {
            if (!!existing[key]) {
              // do not re-hash if pass is already hashed
              if (existing[key].startsWith("$")) {
                output_obj[key] = existing[key];
              } else {
                output_obj[key] = bcrypt.hashSync(
                  validator.escape(existing[key] + ""),
                  10
                );
              }
            } else {
              output_obj[key] = "";
            }
          } else if (val.hasOwnProperty("options")) {
            let new_val = validator.escape(existing[key] + "");
            if (val.options.includes(new_val)) {
              output_obj[key] = new_val;
            } else if (val.hasOwnProperty("default")) {
              output_obj[key] = val.default;
            }
          } else {
            output_obj[key] = validator.escape(existing[key] + "");
          }
        } else if (val.hasOwnProperty("default")) {
          output_obj[key] = val.default;
        }
      } else if (type === "number") {
        if (
          (!val.hasOwnProperty("override") || val.override === false) &&
          existing.hasOwnProperty(key)
        ) {
          if (val.hasOwnProperty("clip")) {
            output_obj[key] = api.clip(
              validator.toFloat(existing[key] + ""),
              val.clip.min,
              val.clip.max
            );
          } else {
            output_obj[key] = validator.toFloat(existing[key] + "");
          }
        } else if (val.hasOwnProperty("default")) {
          output_obj[key] =
            val.default === "random" ? Math.random() : val.default;
        }
      } else if (type === "array") {
        if (
          (!val.hasOwnProperty("override") || val.override === false) &&
          existing.hasOwnProperty(key)
        ) {
          if (!Array.isArray(existing[key])) {
            return;
          }
          output_obj[key] = existing[key];
        } else if (val.hasOwnProperty("default")) {
          output_obj[key] = val.default;
        }
      }
    });

    dev.logverbose(
      `Finished creating output obj 
      with ${JSON.stringify(output_obj, null, 4)}`
    );

    return output_obj;
  }

  function _sanitizeMetaFromFile({ type, type_two, meta }) {
    // dev.logverbose(
    //   `COMMON — _sanitizeMetaFromFile :
    //   will sanitize a new default meta object
    //   for type ${type}
    //   and type_two ${type_two}
    //   with existing = ${JSON.stringify(meta)}
    //   `
    // );
    let new_meta = {};

    const fields =
      type_two === undefined
        ? global.settings.structure[type].fields
        : global.settings.structure[type][type_two].fields;

    Object.keys(meta).forEach((key) => {
      if (fields.hasOwnProperty(key) && fields[key].hasOwnProperty("type")) {
        const fieldType = fields[key].type;
        if (fieldType === "date") {
          new_meta[key] = api.parseDate(meta[key]);
        } else if (fieldType === "string") {
          new_meta[key] = validator.unescape(meta[key]);
        } else if (fieldType === "number") {
          new_meta[key] = validator.toFloat(meta[key]);
        } else if (fieldType === "boolean") {
          new_meta[key] = validator.toBoolean(meta[key]);
        } else if (fieldType === "array") {
          new_meta[key] = meta[key];
        } else {
          dev.error(`Unexpected field type ${fieldType}.`);
        }
      }
    });
    // dev.logverbose(
    //   `COMMON — _sanitizeMetaFromFile :
    //   sanitized to ${JSON.stringify(new_meta)}
    //   `
    // );
    return new_meta;
  }

  function _updateCurrentFields({ type, type_two, meta }) {
    const fields =
      type_two === undefined
        ? global.settings.structure[type].fields
        : global.settings.structure[type][type_two].fields;

    Object.keys(meta).forEach((key) => {
      if (
        fields.hasOwnProperty(key) &&
        fields[key].hasOwnProperty("default") &&
        fields[key]["default"] === "current"
      ) {
        meta[key] = api.getCurrentDate();
      }
    });
    return meta;
  }

  function _editRawMedia({
    type,
    slugFolderName,
    metaFileName,
    meta,
    recipe_with_data,
    socket,
  }) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(
        `COMMON — _editRawMedia : will edit media for ${slugFolderName} at ${metaFileName} with recipe = ${JSON.stringify(
          recipe_with_data,
          null,
          4
        )}`
      );

      if (!recipe_with_data) {
        dev.logverbose("No recipe data.");
        return resolve(meta);
      }

      if (!recipe_with_data.hasOwnProperty("apply_to")) {
        dev.err("Missing apply_to value to work out recipe.");
        return resolve(meta);
      }

      const slugFolderPath = api.getFolderPath(
        path.join(global.settings.structure[type].path, slugFolderName)
      );

      thumbs
        .removeMediaThumbs(slugFolderName, type, meta.media_filename)
        .then(() => {
          // check if meta has original_media_filename, which means media_filename is already the modified version
          if (
            meta.hasOwnProperty("original_media_filename") &&
            meta.original_media_filename !== ""
          ) {
            const base_media_path = path.join(
              slugFolderPath,
              meta.media_filename
            );

            if (
              recipe_with_data.hasOwnProperty("type") &&
              recipe_with_data.type === "reset"
            ) {
              fs.unlink(base_media_path, (err) => {
                meta.media_filename = meta.original_media_filename;
                meta.original_media_filename = "";

                const path_to_media = path.join(
                  slugFolderPath,
                  meta.media_filename
                );

                _refreshFileMeta({ meta, path_to_media }).then(({ _meta }) => {
                  Object.assign(meta, _meta);
                  return resolve(meta);
                });
              });
            } else {
              recipe
                .applyRecipe(
                  recipe_with_data,
                  base_media_path,
                  slugFolderPath,
                  meta.media_filename,
                  socket,
                  meta
                )
                .then((new_media_filename) => {
                  // return meta name
                  dev.logverbose(
                    `Applied recipe successfully, created ${new_media_filename}`
                  );

                  const path_to_media = path.join(
                    slugFolderPath,
                    new_media_filename
                  );
                  _refreshFileMeta({ meta, path_to_media }).then(
                    ({ _meta }) => {
                      Object.assign(meta, _meta);
                      return resolve(meta);
                    }
                  );
                })
                .catch((err) => {
                  dev.error(`Error applying recipe : ${err}`);
                  return resolve(meta);
                });
            }
          } else {
            api
              .findFirstFilenameNotTaken(slugFolderPath, meta.media_filename)
              .then(function (newFileName) {
                const base_media_path = path.join(
                  slugFolderPath,
                  meta.media_filename
                );

                recipe
                  .applyRecipe(
                    recipe_with_data,
                    base_media_path,
                    slugFolderPath,
                    newFileName,
                    socket,
                    meta
                  )
                  .then((new_media_filename) => {
                    // return meta name
                    dev.logverbose(
                      `Applied recipe successfully, created ${new_media_filename}`
                    );
                    meta.original_media_filename = meta.media_filename;
                    meta.media_filename = new_media_filename;

                    const path_to_media = path.join(
                      slugFolderPath,
                      meta.media_filename
                    );

                    _refreshFileMeta({ meta, path_to_media }).then(
                      ({ _meta }) => {
                        Object.assign(meta, _meta);
                        return resolve(meta);
                      }
                    );
                  })
                  .catch((err) => {
                    dev.error(`Error applying recipe : ${err}`);
                    return resolve(meta);
                  });
              });
          }
        });
    });
  }

  function _refreshFileMeta({ meta, path_to_media }) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(`COMMON — _refreshFileMeta`);

      let tasks = [];
      let _meta = {
        file_meta: [],
      };

      let getFileSize = new Promise((resolve, reject) => {
        fs.stat(path_to_media, function (err, stats) {
          if (err || !stats.hasOwnProperty("size")) return resolve();
          _meta.file_meta.push({ size: stats.size });
          return resolve();
        });
      });
      tasks.push(getFileSize);

      let getEXIFData = new Promise((resolve, reject) => {
        thumbs
          .getMediaEXIF({ type: meta.type, mediaPath: path_to_media })
          .then((exif_meta) => {
            Object.entries(exif_meta).map(([key, value]) => {
              _meta.file_meta.push({ [key]: value });
            });

            if (exif_meta.hasOwnProperty("duration"))
              _meta.duration = exif_meta.duration;
            if (exif_meta.hasOwnProperty("ratio"))
              _meta.ratio = exif_meta.ratio;

            return resolve();
          })
          .catch((err) => {
            dev.error(`No EXIF data to read from: ${err}`);
            return resolve();
          });
      });
      tasks.push(getEXIFData);

      Promise.all(tasks).then(() => {
        resolve({ _meta });
      });
    });
  }

  async function _removeFolder({ type, slugFolderName }) {
    const mainFolderPath = api.getFolderPath(
      global.settings.structure[type].path
    );
    const thisFolderPath = path.join(mainFolderPath, slugFolderName);

    try {
      await fs.remove(thisFolderPath);
    } catch (err) {
      throw err;
    }
  }
  async function _moveFolderToBin({ type, slugFolderName }) {
    const mainFolderPath = api.getFolderPath(
      global.settings.structure[type].path
    );

    const thisFolderPath = path.join(mainFolderPath, slugFolderName);
    const movedFolderPath = path.join(
      mainFolderPath,
      global.settings.deletedFolderName,
      slugFolderName
    );

    try {
      await fs.move(thisFolderPath, movedFolderPath, { overwrite: true });
      dev.logfunction(
        `COMMON — removeFolder : folder ${slugFolderName} has been moved to ${movedFolderPath}`
      );
      return;
    } catch (err) {
      throw err;
    }
  }

  async function _removeMedia({
    type,
    slugFolderName,
    metaFileName,
    mediaFileName,
  }) {
    const slugFolderPath = api.getFolderPath(
      path.join(global.settings.structure[type].path, slugFolderName)
    );
    const mediaMetaPath = path.join(slugFolderPath, metaFileName);

    try {
      await fs.remove(mediaMetaPath);
      if (mediaFileName === "") return;
      await fs.remove(path.join(slugFolderPath, mediaFileName));
    } catch (err) {
      throw err;
    }
  }

  async function _moveMediaToBin({
    type,
    slugFolderName,
    metaFileName,
    mediaFileName,
  }) {
    const slugFolderPath = api.getFolderPath(
      path.join(global.settings.structure[type].path, slugFolderName)
    );

    const mediaMetaPath = path.join(slugFolderPath, metaFileName);
    const movedMediaMetaPath = path.join(
      slugFolderPath,
      global.settings.deletedFolderName,
      metaFileName
    );

    try {
      await fs.move(mediaMetaPath, movedMediaMetaPath, { overwrite: true });
      if (mediaFileName === "") return;

      const mediaPath = path.join(slugFolderPath, mediaFileName);
      const movedMediaPath = path.join(
        slugFolderPath,
        global.settings.deletedFolderName,
        mediaFileName
      );
      await fs.move(mediaPath, movedMediaPath, {
        overwrite: true,
      });
    } catch (err) {
      dev.error(`Failed to delete/move media: ${err}`);
      return;
    }
  }

  // Legacy: if no filename in meta file when it is expected in blueprint
  // then it means its in the name of the text file
  function _legacyGetMediaFilename({ type, meta, metaFileName }) {
    if (global.settings.structure[type].medias.fields.media_filename) {
      if (meta.media_filename) return meta.media_filename;
      else {
        const metaFileName_without_ext = new RegExp(
          global.settings.regexpRemoveFileExtension,
          "i"
        ).exec(metaFileName)[1];
        if (metaFileName_without_ext.includes("."))
          return metaFileName_without_ext;
      }
    }
    return "";
  }

  return API;
})();
