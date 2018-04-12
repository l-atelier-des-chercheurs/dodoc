const path = require('path'),
  fs = require('fs-extra'),
  validator = require('validator'),
  sharp = require('sharp');

const settings = require('../settings.json'),
  dev = require('./dev-log'),
  api = require('./api'),
  thumbs = require('./thumbs');

module.exports = (function() {
  const API = {
    getPresentation: () => getPresentation(),
    getAuthors: () => getAuthors(),

    getFolder: slugFolderName => getFolder(slugFolderName),
    getMetaFileOfFolder: slugFolderName => getMetaFileOfFolder(slugFolderName),
    createFolder: fdata => createFolder(fdata),
    editFolder: (foldersData, fdata) => editFolder(foldersData, fdata),
    removeFolder: slugFolderName => removeFolder(slugFolderName),

    gatherAllMedias: (slugFolderName, slugMediaName, mediaID) =>
      gatherAllMedias(slugFolderName, slugMediaName, mediaID),
    createMediaMeta: (slugFolderName, slugMediaName, additionalMeta) =>
      createMediaMeta(slugFolderName, slugMediaName, additionalMeta),
    editMediaMeta: mdata => editMediaMeta(mdata),
    removeMedia: (slugFolderName, slugMediaName) =>
      removeMedia(slugFolderName, slugMediaName),

    createTextMedia: mdata => createTextMedia(mdata),
    createMediaFromCapture: mdata => createMediaFromCapture(mdata)
  };

  function getPresentation() {
    return new Promise(function(resolve, reject) {
      let presentationMd = path.join(api.getFolderPath(), 'presentation.md');
      fs.access(presentationMd, fs.F_OK, function(err) {
        if (err) {
          resolve(validator.unescape(global.appInfos.presentationMd));
        } else {
          let presentationContent = validator.unescape(
            fs.readFileSync(presentationMd, settings.textEncoding)
          );
          presentationContent = api.parseData(presentationContent);
          resolve(presentationContent);
        }
      });
    });
  }

  function getAuthors() {
    return new Promise(function(resolve, reject) {
      let authorsFile = path.join(
        api.getFolderPath(),
        settings.authorsFolderName
      );

      fs.access(authorsFile, fs.F_OK, err => {
        if (err) {
          dev.logverbose(`No authors info: ${err}`);
          return resolve({});
        }

        fs.readdir(authorsFile, function(err, filenames) {
          // read all meta files,
          if (err) {
            dev.error(`Couldn't read content dir: ${err}`);
            return reject(err);
          }
          if (filenames === undefined) {
            dev.error(`No files for folder found: ${err}`);
            return resolve();
          }

          let metaFiles = filenames.filter(slug => {
            // not a folder
            return (
              !new RegExp(settings.regexpMatchFolderNames, 'i').test(slug) &&
              // is a text file
              new RegExp(settings.regexpGetFileExtension, 'i').exec(slug)[0] ===
                '.txt' &&
              // not deleted
              slug.indexOf(settings.deletedPrefix) &&
              // not a dotfile
              slug.indexOf('.') !== 0
            );
          });
          dev.logverbose(
            `Number of authors files that match in ${
              settings.authorsFolderName
            } = ${metaFiles.length}. Meta file(s) is(are) ${metaFiles}`
          );

          if (metaFiles.length === 0) {
            dev.logverbose(
              `Since no authors meta is in this folder, let’s abort right there.`
            );
            return resolve({});
          }

          var allAuthorsMeta = [];
          metaFiles.forEach(filename => {
            let fmeta = new Promise((resolve, reject) => {
              dev.log(filename);
              const pathToAuthorMeta = path.join(authorsFile, filename);
              // todo : resolve meta file
              readMetaFile(pathToAuthorMeta).then(authorsData => {
                resolve({ [filename]: authorsData });
              });
            });
            allAuthorsMeta.push(fmeta);

            let portrait = new Promise((resolve, reject) => {
              // find if a file named "name.jpeg" exist in the same folder
              const fileNameWithoutExtension = new RegExp(
                settings.regexpRemoveFileExtension,
                'i'
              ).exec(filename)[1];

              const potentialPortraitFilename =
                fileNameWithoutExtension + '.jpeg';

              const pathToPotentialPortrait = path.join(
                authorsFile,
                potentialPortraitFilename
              );
              fs.access(pathToPotentialPortrait, fs.F_OK, err => {
                if (err) {
                  dev.logverbose(`Missing portrait for ${filename}: ${err}`);
                  return resolve({});
                }
                return resolve({
                  [filename]: { portrait: potentialPortraitFilename }
                });
              });
            });
            allAuthorsMeta.push(portrait);
          });

          Promise.all(allAuthorsMeta).then(parsedAuthorsData => {
            // reunite array items as a single big object
            dev.logverbose(
              `All authors meta have been processed`,
              JSON.stringify(parsedAuthorsData, null, 4)
            );

            const authorsObj = {};
            parsedAuthorsData.map(d => {
              let filename = Object.keys(d)[0];
              if (typeof d === 'object' && Object.keys(d).length === 0) {
                return;
              }

              if (!authorsObj.hasOwnProperty(filename)) {
                authorsObj[filename] = {};
              }
              authorsObj[filename] = Object.assign(
                authorsObj[filename],
                d[filename]
              );
            });
            resolve(authorsObj);
          });
        });
      });
    });
  }

  function getMetaFileOfFolder(slugFolderName) {
    let folderPath = api.getFolderPath(slugFolderName);
    let metaPath = path.join(
      folderPath,
      settings.folderMetafilename + settings.metaFileext
    );
    return metaPath;
  }
  function getMetaFileOfMedia(slugFolderName, slugMediaName) {
    let mediaPath = path.join(api.getFolderPath(slugFolderName), slugMediaName);
    let mediaMetaPath = mediaPath + settings.metaFileext;
    return mediaMetaPath;
  }

  function readFolderMeta(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — readFolderMeta: ${slugFolderName}`);
      var metaFolderPath = getMetaFileOfFolder(slugFolderName);
      var folderData = readMetaFile(metaFolderPath);
      resolve(folderData);
    });
  }
  function readOrCreateMediaMeta(slugFolderName, slugMediaName) {
    return new Promise(function(resolve, reject) {
      // pour chaque item, on regarde s’il contient un fichier méta (même nom + .txt)
      let potentialMetaFile = getMetaFileOfMedia(slugFolderName, slugMediaName);
      fs.access(potentialMetaFile, fs.F_OK, err => {
        // if there's no META file at path
        let tasks = [];

        if (err) {
          dev.logverbose(`No meta for this media: ${err}`);
          // let’s get creation date and modification date, guess the type, and return this whole thing afterwards
          let createNewMediaMeta = new Promise((resolve, reject) => {
            createMediaMeta(slugFolderName, slugMediaName).then(mediaData => {
              mediaData = _sanitizeMetaFromFile({
                type: 'media',
                meta: mediaData
              });
              resolve(mediaData);
            });
          });
          tasks.push(createNewMediaMeta);
        } else {
          dev.logverbose(`Found meta there: ${potentialMetaFile}`);
          let readMediaMeta = new Promise((resolve, reject) => {
            readMetaFile(potentialMetaFile).then(mediaData => {
              mediaData = _sanitizeMetaFromFile({
                type: 'media',
                meta: mediaData
              });
              resolve(mediaData);
            });
          });
          tasks.push(readMediaMeta);
        }

        Promise.all(tasks).then(mediaData => {
          mediaData = mediaData[0];

          if (mediaData.type === 'text' || mediaData.type === 'marker') {
            // get text content
            let mediaPath = path.join(
              api.getFolderPath(slugFolderName),
              slugMediaName
            );
            mediaData.content = validator.unescape(
              fs.readFileSync(mediaPath, settings.textEncoding)
            );
            dev.logverbose(`Got mediaData.content : ${mediaData.content}`);
            resolve(mediaData);
          }

          resolve(mediaData);
        });
      });
    });
  }
  function readMediaAndThumbs(slugFolderName, slugMediaName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — readMediaAndThumbs: slugFolderName = ${slugFolderName} & slugMediaName = ${slugMediaName}`
      );

      readOrCreateMediaMeta(slugFolderName, slugMediaName)
        .then(mediaData => {
          dev.logverbose(
            `Read Meta, now getting thumbs for ${JSON.stringify(
              mediaData,
              null,
              4
            )}`
          );

          // let’s find or create thumbs
          thumbs
            .makeMediaThumbs(slugFolderName, slugMediaName, mediaData.type)
            .then(thumbData => {
              mediaData.thumbs = thumbData;
              resolve(mediaData);
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  function readMetaFile(metaPath) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — readMetaFile: ${metaPath}`);
      var metaFileContent = fs.readFileSync(metaPath, settings.textEncoding);
      var metaFileContentParsed = api.parseData(metaFileContent);
      resolve(metaFileContentParsed);
    });
  }

  function getFolder(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — getFolder: ${slugFolderName}`);
      let mainFolderPath = api.getFolderPath();

      fs.readdir(mainFolderPath, function(err, filenames) {
        if (err) {
          dev.error(`Couldn't read content dir: ${err}`);
          reject(err);
        }
        if (filenames === undefined) {
          dev.error(`No folder found: ${err}`);
          reject(err);
        }

        var folders = filenames.filter(function(thisSlugFolderName) {
          // is a folder
          return (
            new RegExp(settings.regexpMatchFolderNames, 'i').test(
              thisSlugFolderName
            ) &&
            // if slugFolderName isset, filter to get only requested folder
            (slugFolderName ? thisSlugFolderName === slugFolderName : true) &&
            // if not deleted
            thisSlugFolderName.indexOf(settings.deletedPrefix) !== 0 &&
            // if doesn’t start with _ (these folders are generated by the tool, can’t be created through the interface)
            thisSlugFolderName.indexOf('_') !== 0
          );
        });

        dev.logverbose(
          `Number of folders that match in ${mainFolderPath} = ${
            folders.length
          }. Folder(s) is(are) ${folders}`
        );

        if (folders.length === 0) {
          resolve();
        }

        var allFoldersData = [];
        folders.forEach(slugFolderName => {
          let fmeta = new Promise((resolve, reject) => {
            let prepareFolderMetaForClient = (slugFolderName, meta) => {
              meta = _sanitizeMetaFromFile({ type: 'folder', meta });
              meta.slugFolderName = slugFolderName;
              meta.medias = {};
              meta.fullFolderPath = api.getFolderPath(slugFolderName);
              return meta;
            };

            // read meta
            readFolderMeta(slugFolderName)
              .then(meta => {
                let preparedMeta = prepareFolderMetaForClient(
                  slugFolderName,
                  meta
                );
                resolve(preparedMeta);
              })
              .catch(err => {
                dev.error(
                  `Couldn’t read folder meta, most probably because it doesn’t exist: ${err}`
                );
                // edge case : creating folders in user dir
                // createFolder(
                //   { name: slugFolderName },
                //   (folderAlreadyCreated = true)
                // )
                //   .then(meta => {
                //     let preparedMeta = prepareFolderMetaForClient(
                //       slugFolderName,
                //       meta
                //     );
                //     resolve(preparedMeta);
                //   })
                //   .catch(err => {
                //     reject(err);
                //   });
              });
          });
          allFoldersData.push(fmeta);
        });
        Promise.all(allFoldersData).then(parsedFoldersData => {
          dev.logverbose(
            `All folders meta have been processed`,
            JSON.stringify(parsedFoldersData, null, 4)
          );
          // reunite array items as a single big object
          let flatObjFoldersData = {};
          parsedFoldersData.forEach(fmeta => {
            flatObjFoldersData[fmeta.slugFolderName] = fmeta;
          });
          resolve(flatObjFoldersData);
        });
      });
    });
  }

  function createFolder(fdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — createFolder : will create a new folder with: ${JSON.stringify(
          fdata,
          null,
          4
        )}`
      );

      if (!fdata.hasOwnProperty('name')) {
        fdata.name = 'Untitled Folder';
      }

      slugFolderName = api.slug(fdata.name);

      getFolder().then(
        foldersData => {
          if (foldersData !== undefined) {
            let allFoldersSlug = Object.keys(foldersData);

            if (allFoldersSlug.length > 0) {
              let index = 0;
              let newSlugFolderName = slugFolderName;
              while (allFoldersSlug.indexOf(newSlugFolderName) !== -1) {
                index++;
                newSlugFolderName = `${newSlugFolderName}-${index}`;
              }
              slugFolderName = newSlugFolderName;
              dev.logverbose(`All slugs: ${allFoldersSlug.join()}`);
            }
            dev.logverbose(`Proposed slug: ${slugFolderName}`);
          }

          // créer un fichier meta avec : nom humain, date de création, date de début, date de fin, mot de passe hashé, nom des auteurs
          dev.logverbose(
            `Making a new folder at path ${api.getFolderPath(slugFolderName)}`
          );
          fs.mkdirp(
            api.getFolderPath(slugFolderName),
            function() {
              fdata = _makeDefaultMetaFromStructure({
                type: 'folder',
                method: 'create',
                existing: fdata
              });
              let folderMetaPath = getMetaFileOfFolder(slugFolderName);

              api
                .storeData(folderMetaPath, fdata, 'create')
                .then(function(meta) {
                  dev.logverbose(
                    `New folder meta file created at path: ${folderMetaPath} with meta: ${JSON.stringify(
                      meta,
                      null,
                      4
                    )}`
                  );
                  resolve(slugFolderName);
                })
                .catch(err => {
                  reject(err);
                });
            },
            function(err, p) {
              dev.error(`Failed to create folder ${slugFolderName}: ${err}`);
              reject(err);
            }
          );
        },
        function(err, p) {
          dev.error(`Failed to get folders data: ${err}`);
          reject(err);
        }
      );
    });
  }

  function editFolder(foldersData, newFoldersData) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — editFolder : will edit folder with ${JSON.stringify(
          newFoldersData,
          null,
          4
        )} with existing data ${JSON.stringify(foldersData, null, 4)}`
      );
      // remove slugFolderKey
      let slugFolderName = foldersData.slugFolderName;

      // cleaning up stored meta
      foldersData = _makeDefaultMetaFromStructure({
        type: 'folder',
        method: 'create',
        existing: foldersData
      });

      newFoldersData = _makeDefaultMetaFromStructure({
        type: 'folder',
        method: 'update',
        existing: newFoldersData
      });

      // overwrite stored obj with new informations
      Object.assign(foldersData, newFoldersData);

      let folderMetaPath = getMetaFileOfFolder(slugFolderName);
      api.storeData(folderMetaPath, foldersData, 'update').then(
        function(meta) {
          dev.logverbose(
            `Update folder meta file at path: ${folderMetaPath} with meta: ${JSON.stringify(
              meta,
              null,
              4
            )}`
          );
          resolve(slugFolderName);
        },
        function(err) {
          reject(`Couldn't update folder meta: ${err}`);
        }
      );
    });
  }

  function removeFolder(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — removeFolder : will remove folder: ${slugFolderName}`
      );

      let folderPath = api.getFolderPath(slugFolderName);
      let movedFolderPath = path.join(
        api.getFolderPath(),
        settings.deletedFolderName,
        slugFolderName
      );

      fs
        .move(folderPath, movedFolderPath, { overwrite: true })
        .then(() => {
          dev.logfunction(
            `COMMON — removeFolder : folder ${slugFolderName} has been moved to ${movedFolderPath}`
          );
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  function _getMedia(slugFolderName, slugMediaName = '') {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — _getMedia`);
      if (slugFolderName === undefined) {
        dev.error(`Missing slugFolderName to read medias from.`);
        reject();
      }
      if (slugMediaName === '') {
        dev.logverbose(
          `Missing slugMediaName to read medias from ${slugFolderName}. Reading all medias instead.`
        );
      }
      dev.logverbose(
        `COMMON — _getMedia — slugFolderName: ${slugFolderName} — slugMediaName: ${slugMediaName}`
      );

      let slugFolderPath = api.getFolderPath(slugFolderName);
      fs.readdir(slugFolderPath, function(err, filenames) {
        if (err) {
          dev.error(`Couldn't read content dir: ${err}`);
          reject(err);
        }
        if (filenames === undefined) {
          dev.error(`No medias for folder found: ${err}`);
          resolve();
        }

        dev.logverbose(
          `Found this many (${filenames.length}) filenames: ${filenames}`
        );
        let medias = filenames.filter(function(thisSlugMediaName) {
          // not a folder
          return (
            !new RegExp(settings.regexpMatchFolderNames, 'i').test(
              thisSlugMediaName
            ) &&
            // not meta.txt
            thisSlugMediaName !==
              settings.folderMetafilename + settings.metaFileext &&
            // not a text file
            new RegExp(settings.regexpGetFileExtension, 'i').exec(
              thisSlugMediaName
            )[0] !== '.txt' &&
            // not deleted
            thisSlugMediaName.indexOf(settings.deletedPrefix) &&
            // not a dotfile
            thisSlugMediaName.indexOf('.') !== 0 &&
            // if has slugMediaName, only if it matches
            (slugMediaName ? thisSlugMediaName === slugMediaName : true)
          );
        });
        dev.logverbose(
          `Number of medias that match in ${slugFolderPath} = ${
            medias.length
          }. Media(s) is(are) ${medias}`
        );

        if (medias.length === 0) {
          dev.logverbose(
            `Since no medias is in this folder, let’s abort right there.`
          );
          resolve({});
        } else {
          var allMediasData = [];
          medias.forEach(function(slugMediaName) {
            let fmeta = new Promise((resolve, reject) => {
              readMediaAndThumbs(slugFolderName, slugMediaName).then(meta => {
                meta.slugMediaName = slugMediaName;
                resolve(meta);
              });
            });
            allMediasData.push(fmeta);
          });

          Promise.all(allMediasData).then(parsedMediasData => {
            // reunite array items as a single big object
            let flatObjMediasData = {};
            parsedMediasData.forEach(fmeta => {
              let slugMediaName = fmeta.slugMediaName;
              delete fmeta.slugMediaName;
              flatObjMediasData[slugMediaName] = fmeta;
            });
            dev.logverbose(
              `All medias meta have been processed`,
              JSON.stringify(flatObjMediasData, null, 4)
            );
            resolve(flatObjMediasData);
          });
        }
      });
    });
  }

  function gatherAllMedias(slugFolderName, slugMediaName, mediaID) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — gatherAllMedias : will gather medias for folder ${slugFolderName} with opt slugMediaName = ${slugMediaName}`
      );

      _getMedia(slugFolderName, slugMediaName).then(
        mediasData => {
          for (let slugMediaName in mediasData) {
            let mediaData = mediasData[slugMediaName];

            /*******************************************************
            PRE 1.0.0 beta 3 legacy
            ******************************************************/
            // LEGACY : rename 'created' to 'date_created', and set date_timeline
            {
              if (mediaData.hasOwnProperty('created')) {
                mediaData.date_created = mediaData.created;
                if (!mediaData.hasOwnProperty('date_timeline')) {
                  mediaData.date_timeline = mediaData.created;
                }
                delete mediaData.created;
              }
              if (
                mediaData.hasOwnProperty('modified') &&
                !mediaData.hasOwnProperty('date_modified')
              ) {
                mediaData.date_modified = mediaData.modified;
                delete mediaData.modified;
              }
            }
            /*******************************************************
            END
            ******************************************************/

            if (mediaID) {
              mediaData.mediaID = mediaID;
            }

            mediasData[slugMediaName] = mediaData;
          }
          resolve(mediasData);
        },
        function(err) {
          dev.error(`Failed to list medias! Error: ${err}`);
          reject(err);
        }
      );
    });
  }

  function createMediaMeta(slugFolderName, slugMediaName, additionalMeta = {}) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — createMediaMeta : will create a new meta file for media ${slugMediaName} in folder ${slugFolderName}`
      );
      if (Object.keys(additionalMeta).length > 0) {
        dev.logverbose(
          `Has additional meta: ${JSON.stringify(additionalMeta, null, 4)}`
        );
      }

      let mediaPath = path.join(
        api.getFolderPath(slugFolderName),
        slugMediaName
      );
      let potentialMetaFile = getMetaFileOfMedia(slugFolderName, slugMediaName);

      // check that a meta with this name doesn't exist already
      fs.access(potentialMetaFile, fs.F_OK, function(err) {
        // if there's nothing at path, we’re all good
        if (err) {
          // guess file type from filename
          if (!additionalMeta.hasOwnProperty('type')) {
            let mediaFileExtension = new RegExp(
              settings.regexpGetFileExtension,
              'i'
            ).exec(slugMediaName)[0];
            dev.logverbose(
              `Trying to guess filetype from extension: ${mediaFileExtension}`
            );
            switch (mediaFileExtension.toLowerCase()) {
              case '.jpeg':
              case '.jpg':
              case '.png':
              case '.gif':
              case '.tiff':
              case '.tif':
              case '.dng':
                additionalMeta.type = 'image';
                break;
              case '.mp4':
              case '.mov':
              case '.webm':
                additionalMeta.type = 'video';
                break;
              case '.mp3':
              case '.wav':
              case '.m4a':
                additionalMeta.type = 'audio';
                break;
              case '.md':
              case '.rtf':
                additionalMeta.type = 'text';
                break;
            }
            dev.logverbose(`Type determined to be: ${additionalMeta.type}`);
          }

          let mdata = _makeDefaultMetaFromStructure({
            type: 'media',
            method: 'create',
            existing: additionalMeta
          });

          let tasks = [];

          /***************************************************************************
              CREATED DATE
          ***************************************************************************/

          if (
            additionalMeta !== undefined &&
            additionalMeta.hasOwnProperty('fileCreationDate')
          ) {
            dev.logverbose(`Setting created from additionalMeta`);
            mdata.date_created = api.convertDate(
              additionalMeta.fileCreationDate
            );
          } else {
            dev.logverbose(`Setting created from file birthtime`);
            let getFileCreationDate = new Promise((resolve, reject) => {
              fs.stat(mediaPath, function(err, stats) {
                if (err) {
                  resolve();
                }
                mdata.date_created = api.convertDate(new Date(stats.birthtime));
                resolve();
              });
            });
            tasks.push(getFileCreationDate);
          }

          if (mdata.type === 'image') {
            dev.logverbose(`Looking for EXIF for image`);
            let getEXIFTimestamp = new Promise((resolve, reject) => {
              thumbs
                .getTimestampFromEXIF(mediaPath)
                .then(ts => {
                  if (ts === false) {
                    dev.logverbose(`No timestamp found in EXIF.`);
                  } else {
                    let localTS = api.parseUTCDate(ts);
                    dev.logverbose(
                      `getEXIFData timestamp to date : ${api.convertDate(
                        localTS
                      )}`
                    );
                    mdata.date_created = api.convertDate(localTS);
                  }
                  resolve();
                })
                .catch(err => {
                  dev.logverbose(`No EXIF data to read from: ${err}`);
                  resolve();
                });
            });
            tasks.push(getEXIFTimestamp);
          }

          /***************************************************************************
              RATIO
          ***************************************************************************/
          if (mdata.type === 'image') {
            let getEXIFRatio = new Promise((resolve, reject) => {
              thumbs
                .getRatioFromEXIF(mediaPath)
                .then(mediaRatio => {
                  dev.log(`getEXIFData mediaRatio : ${mediaRatio}`);
                  if (mediaRatio !== undefined) {
                    mdata.ratio = mediaRatio;
                  }
                  resolve();
                })
                .catch(err => {
                  dev.error(`No EXIF data to read from: ${err}`);
                  resolve();
                });
            });
            tasks.push(getEXIFRatio);
          } else if (mdata.type === 'video' || mdata.type === 'audio') {
            let getMediaRatio = new Promise((resolve, reject) => {
              thumbs
                .getMediaRatio(mediaPath)
                .then(mediaRatio => {
                  dev.log(`getMediaRatio : ${mediaRatio}`);
                  if (mediaRatio !== undefined) {
                    mdata.ratio = mediaRatio;
                  }
                  resolve();
                })
                .catch(err => {
                  dev.error(`No probe data to read from: ${err}`);
                  resolve();
                });
            });
            tasks.push(getMediaRatio);
          }

          /***************************************************************************
              DURATION
          ***************************************************************************/
          if (mdata.type === 'video' || mdata.type === 'audio') {
            // get video or audio duration
            let getMediaDuration = new Promise((resolve, reject) => {
              dev.logverbose(`Will attempt to get media duration.`);
              thumbs
                .getMediaDuration(mediaPath)
                .then(duration => {
                  dev.log(`getMediaDuration: ${duration}`);
                  if (duration) {
                    mdata.duration = duration;
                  }
                  resolve();
                })
                .catch(err => {
                  dev.error(`No probe data to read from: ${err}`);
                  resolve();
                });
            });
            tasks.push(getMediaDuration);
          }

          /***************************************************************************
              DURATION
          ***************************************************************************/
          if (mdata.type === 'image') {
            let getFullEXIF = new Promise((resolve, reject) => {
              thumbs.getEXIFData(mediaPath).then(exifdata => {
                if (exifdata) {
                  // mdata.exif = validator.escape(JSON.stringify(exifdata));
                }
                resolve();
              });
            });
            tasks.push(getFullEXIF);
          }

          /***************************************************************************
              DO IT ALL
          ***************************************************************************/
          Promise.all(tasks).then(() => {
            if (mdata.hasOwnProperty('date_created')) {
              // if there is a created date, the timeline date should match this one in priority
              mdata.date_timeline = mdata.date_created;
            }
            api.storeData(potentialMetaFile, mdata, 'create').then(
              function(meta) {
                dev.logverbose(
                  `New media meta file created at path: ${potentialMetaFile} with meta: ${JSON.stringify(
                    meta,
                    null,
                    4
                  )}`
                );
                resolve(meta);
              },
              function(err) {
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
  }

  function editMediaMeta(mdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — editMediaMeta : will edit media with ${JSON.stringify(
          mdata,
          null,
          4
        )}`
      );

      let slugFolderName = mdata.slugFolderName;
      let slugMediaName = mdata.slugMediaName;

      readOrCreateMediaMeta(slugFolderName, slugMediaName).then(meta => {
        dev.logverbose(
          `Got meta, now updating for ${slugMediaName} with ${JSON.stringify(
            meta,
            null,
            4
          )}`
        );

        // cleaning up stored meta
        meta = _makeDefaultMetaFromStructure({
          type: 'media',
          method: 'create',
          existing: meta
        });

        let newMediaData = _makeDefaultMetaFromStructure({
          type: 'media',
          method: 'update',
          existing: mdata
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
          let potentialMetaFile = getMetaFileOfMedia(
            slugFolderName,
            slugMediaName
          );
          api.storeData(potentialMetaFile, meta, 'update').then(
            meta => {
              dev.logverbose(
                `Updated media meta file at path: ${potentialMetaFile} with meta: ${JSON.stringify(
                  meta,
                  null,
                  4
                )}`
              );
              resolve();
            },
            function(err) {
              reject(`Couldn't update folder meta : ${err}`);
            }
          );
        });
        tasks.push(updateMediaMeta);

        if (
          (meta.type === 'text' || meta.type === 'marker') &&
          mdata.hasOwnProperty('content')
        ) {
          dev.logverbose(`Is text or marker and need to update content.`);
          dev.logverbose(`New content: ${mdata.content}`);
          let updateTextMedia = new Promise((resolve, reject) => {
            let mediaPath = path.join(
              api.getFolderPath(slugFolderName),
              slugMediaName
            );
            let content = validator.escape(mdata.content + '');
            api
              .storeData(mediaPath, content, 'update')
              .then(content => {
                dev.logverbose(
                  `Updated media file at path: ${mediaPath} with content: ${content}`
                );
                resolve();
              })
              .catch(err => {
                reject(err);
              });
          });
          tasks.push(updateTextMedia);
        }

        Promise.all(tasks).then(() => {
          resolve(slugFolderName);
        });
      });
    });
  }

  function removeMedia(slugFolderName, slugMediaName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — removeMedia : will remove media at path: ${slugFolderName}/${slugMediaName}`
      );

      let mediaPath = path.join(
        api.getFolderPath(slugFolderName),
        slugMediaName
      );
      let movedMediaPath = path.join(
        api.getFolderPath(slugFolderName),
        settings.deletedFolderName,
        slugMediaName
      );

      let mediaMetaPath = mediaPath + settings.metaFileext;
      let movedMediaMetaPath = movedMediaPath + settings.metaFileext;

      fs
        .move(mediaPath, movedMediaPath, { overwrite: true })
        .then(() => {
          return fs.move(mediaMetaPath, movedMediaMetaPath, {
            overwrite: true
          });
        })
        .then(() => {
          return thumbs.removeMediaThumbs(slugFolderName, slugMediaName);
        })
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  function createTextMedia(mdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — createTextMedia : will create text media in: ${
          mdata.slugFolderName
        }`
      );

      let slugFolderName = mdata.slugFolderName;
      let timeCreated = api.getCurrentDate();
      let randomString = (
        Math.random().toString(36) + '00000000000000000'
      ).slice(2, 3 + 2);
      let textMediaName = `${mdata.type}-${timeCreated}-${randomString}.md`;

      let pathToTextMedia = path.join(
        api.getFolderPath(slugFolderName),
        textMediaName
      );

      api.storeData(pathToTextMedia, '', 'create').then(
        () => {
          let newMediaInfos = {
            slugMediaName: textMediaName,
            additionalMeta: {
              fileCreationDate: api.parseDate(timeCreated)
            }
          };

          // will be sanitized later in createMediaMeta
          if (mdata.hasOwnProperty('type')) {
            newMediaInfos.additionalMeta['type'] = mdata.type;
          }
          if (mdata.hasOwnProperty('color')) {
            newMediaInfos.additionalMeta['color'] = mdata.color;
          }
          if (mdata.hasOwnProperty('collapsed')) {
            newMediaInfos.additionalMeta['collapsed'] = mdata.collapsed;
          }
          resolve(newMediaInfos);
        },
        function(err) {
          dev.error(`Failed to storeData for textmedia`);
          reject(`${err}`);
        }
      );
    });
  }

  function createMediaFromCapture(mdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — createMediaFromCapture : will create media in: ${
          mdata.slugFolderName
        }`
      );

      let slugFolderName = mdata.slugFolderName;
      let timeCreated = api.getCurrentDate();
      let randomString = (
        Math.random().toString(36) + '00000000000000000'
      ).slice(2, 3 + 2);
      let mediaName = `${mdata.type}-${timeCreated}-${randomString}`;

      // Depending on the type of media we will create, we will need to act differently:
      // - 'image' -> use sharp and create a .jpeg from the buffer
      // - 'video' -> store the content to a file with writeMediaDataToDisk
      // - 'stopmotion' -> assemble all images to a video
      // - 'audio' -> store content with writeMediaDataToDisk

      let tasks = [];

      if (mdata.type === 'image') {
        tasks.push(
          new Promise((resolve, reject) => {
            mediaName += '.jpeg';
            let pathToMedia = path.join(
              api.getFolderPath(slugFolderName),
              mediaName
            );

            let imageBuffer = api.decodeBase64Image(mdata.rawData);
            sharp(imageBuffer)
              .rotate()
              .withMetadata()
              .background({ r: 255, g: 255, b: 255 })
              .flatten()
              .jpeg({
                quality: 100
              })
              .toFile(pathToMedia, function(err, info) {
                if (err) reject(err);
                resolve();
              });
          })
        );
      } else if (mdata.type === 'video') {
        tasks.push(
          new Promise((resolve, reject) => {
            mediaName += '.mp4';
            let pathToMedia = path.join(
              api.getFolderPath(slugFolderName),
              mediaName
            );

            api
              .writeMediaDataToDisk(pathToMedia, mdata.rawData)
              .then(() => {
                resolve();
              })
              .catch(err => {
                reject(err);
              });
          })
        );
      } else if (mdata.type === 'audio') {
        tasks.push(
          new Promise((resolve, reject) => {
            mediaName += '.wav';
            let pathToMedia = path.join(
              api.getFolderPath(slugFolderName),
              mediaName
            );

            api
              .writeMediaDataToDisk(pathToMedia, mdata.rawData)
              .then(() => {
                resolve();
              })
              .catch(err => {
                reject(err);
              });
          })
        );
      }

      Promise.all(tasks)
        .then(() => {
          let newMediaInfos = {
            slugMediaName: mediaName,
            additionalMeta: {
              type: mdata.type,
              fileCreationDate: api.parseDate(timeCreated)
            }
          };
          if (mdata.hasOwnProperty('authors')) {
            console.log('HAS AUTHOR');
            newMediaInfos.additionalMeta.authors = mdata.authors;
          }
          resolve(newMediaInfos);
        })
        .catch(err => {
          dev.error(`Failed to store captured media as file: ${err}`);
          reject(`${err}`);
        });
    });
  }

  function _makeDefaultMetaFromStructure({
    type,
    method = 'create',
    existing = {}
  }) {
    dev.logfunction(
      `COMMON — _makeDefaultMetaFromStructure : will '${method}' a new default meta object for type ${type} with existing = ${JSON.stringify(
        existing,
        null,
        4
      )}`
    );
    if (!settings.structure.hasOwnProperty(type)) {
      dev.error(`Missing type ${type} in settings.json`);
    }

    let struct = settings.structure[type];
    let output_obj = {};

    Object.entries(struct).forEach(([key, val]) => {
      // dev.logverbose(`Iterating through struct entries, at key ${key}`);
      if (!val.hasOwnProperty('type')) {
        dev.error(
          `Missing type property for field name ${key} in settings.json`
        );
      }
      let type = val.type;

      // if updating and "read_only", let’s stop right there for that key
      if (
        method === 'update' &&
        val.hasOwnProperty('read_only') &&
        val.read_only === true
      ) {
        return;
      }

      // if updating a meta file and the new meta doesn’t have the iterated value
      // we stop except if that field has "override"
      if (
        method === 'update' &&
        !existing.hasOwnProperty(key) &&
        !(val.hasOwnProperty('override') && val.override === true)
      ) {
        return;
      }

      if (type === 'date') {
        // "override" means "reapply default everytime we update this file"
        if (
          (!val.hasOwnProperty('override') || val.override === false) &&
          existing.hasOwnProperty(key)
        ) {
          // get from original if it exists and if override is not set or set to false
          output_obj[key] = api.convertDate(existing[key] + '');
        } else if (val.hasOwnProperty('default')) {
          // get from default if set
          output_obj[key] =
            val.default === 'current' ? api.getCurrentDate() : val.default;
        }
      } else if (type === 'boolean') {
        if (
          (!val.hasOwnProperty('override') || val.override === false) &&
          existing.hasOwnProperty(key)
        ) {
          // get from original if it exists and if override is not set or set to false
          output_obj[key] = validator.toBoolean(existing[key] + '');
        } else if (
          val.hasOwnProperty('default') &&
          typeof val.default === 'boolean'
        ) {
          output_obj[key] = val.default;
        }
      } else if (type === 'string') {
        if (
          (!val.hasOwnProperty('override') || val.override === false) &&
          existing.hasOwnProperty(key)
        ) {
          if (val.hasOwnProperty('options')) {
            let new_val = validator.escape(existing[key] + '');
            if (val.options.includes(new_val)) {
              output_obj[key] = new_val;
            } else if (val.hasOwnProperty('default')) {
              output_obj[key] = val.default;
            }
          } else {
            output_obj[key] = validator.escape(existing[key] + '');
          }
        } else if (val.hasOwnProperty('default')) {
          output_obj[key] = val.default;
        }
      } else if (type === 'number') {
        if (
          (!val.hasOwnProperty('override') || val.override === false) &&
          existing.hasOwnProperty(key)
        ) {
          if (val.hasOwnProperty('clip')) {
            output_obj[key] = api.clip(
              validator.toFloat(existing[key] + ''),
              val.clip.min,
              val.clip.max
            );
          } else {
            output_obj[key] = validator.toFloat(existing[key] + '');
          }
        } else if (val.hasOwnProperty('default')) {
          output_obj[key] =
            val.default === 'random' ? Math.random() * 0.5 : val.default;
        }
      }
    });

    dev.logverbose(
      `Finished creating output obj with ${JSON.stringify(output_obj, null, 4)}`
    );

    return output_obj;
  }

  function _sanitizeMetaFromFile({ type, meta }) {
    dev.logverbose(
      `COMMON — _sanitizeMetaFromFile : 
      will sanitize a new default meta object for type ${type} with existing = ${JSON.stringify(
        meta
      )}
      `
    );
    let new_meta = {};
    Object.keys(meta).forEach(key => {
      if (
        settings.structure[type].hasOwnProperty(key) &&
        settings.structure[type][key].hasOwnProperty('type')
      ) {
        if (settings.structure[type][key].type === 'date') {
          new_meta[key] = api.parseDate(meta[key]);
        } else if (settings.structure[type][key].type === 'string') {
          new_meta[key] = validator.unescape(meta[key]);
        } else if (settings.structure[type][key].type === 'number') {
          new_meta[key] = validator.toFloat(meta[key]);
        } else if (settings.structure[type][key].type === 'boolean') {
          new_meta[key] = validator.toBoolean(meta[key]);
        } else {
          dev.error(
            `Unexpected field type ${settings.structure[type][key].type}.`
          );
        }
      }
    });
    dev.logverbose(
      `COMMON — _sanitizeMetaFromFile : 
      sanitized to ${JSON.stringify(new_meta)}
      `
    );
    return new_meta;
  }

  return API;
})();
