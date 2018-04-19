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
    // getAuthors: () => getAuthors(),

    getFolder: ({ type, slugFolderName }) =>
      getFolder({ type, slugFolderName }),
    createFolder: ({ type, data }) => createFolder({ type, data }),
    editFolder: ({ type, foldersData, newFoldersData }) =>
      editFolder({ type, foldersData, newFoldersData }),
    removeFolder: ({ type, slugFolderName }) =>
      removeFolder({
        type,
        slugFolderName
      }),

    gatherAllMedias: (slugFolderName, slugMediaName, mediaID) =>
      gatherAllMedias(slugFolderName, slugMediaName, mediaID),
    createMediaMeta: (slugFolderName, slugMediaName, additionalMeta) =>
      createMediaMeta(slugFolderName, slugMediaName, additionalMeta),
    editMediaMeta: mdata => editMediaMeta(mdata),
    removeMedia: ({ slugFolderName, slugMediaName }) =>
      removeMedia({ slugFolderName, slugMediaName }),

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

  function getMetaFileOfMedia(slugFolderName, slugMediaName) {
    let mediaPath = path.join(api.getFolderPath(slugFolderName), slugMediaName);
    let mediaMetaPath = mediaPath + settings.metaFileext;
    return mediaMetaPath;
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

  // Applies to projects, authors and publications
  function getFolder({ type, slugFolderName }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — getFolder type = ${type} with slugFolderName = ${slugFolderName}`
      );

      if (!settings.structure.hasOwnProperty(type)) {
        reject(`Missing type ${type} in settings.json`);
      }
      const baseFolderPath = settings.structure[type].path;
      const mainFolderPath = api.getFolderPath(baseFolderPath);

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
          const thisFolderPath = path.join(mainFolderPath, slugFolderName);
          // For each folder, read their meta file
          allFoldersData.push(
            new Promise((resolve, reject) => {
              dev.logverbose(`Finding meta for folder = ${thisFolderPath}`);
              const metaFolderPath = path.join(
                thisFolderPath,
                settings.folderMetaFilename + settings.metaFileext
              );

              readMetaFile(metaFolderPath)
                .then(meta => {
                  meta = _sanitizeMetaFromFile({ type, meta });
                  meta.slugFolderName = slugFolderName;
                  meta.medias = {};
                  meta.fullFolderPath = thisFolderPath;

                  resolve({ [slugFolderName]: meta });
                })
                .catch(err => {
                  dev.error(
                    `Couldn’t read folder meta, most probably because it doesn’t exist: ${err}`
                  );
                });
            })
          );

          // For each folder, find a preview (if it exists)
          allFoldersData.push(
            new Promise((resolve, reject) => {
              dev.logverbose(`Finding preview for folder = ${thisFolderPath}`);
              const pathToPreview = path.join(
                thisFolderPath,
                settings.folderPreviewFilename + settings.thumbExt
              );
              fs.access(pathToPreview, fs.F_OK, err => {
                let preview_name = '';
                if (!err) {
                  preview_name =
                    settings.folderPreviewFilename + settings.thumbExt;
                }
                resolve({
                  [slugFolderName]: {
                    preview: preview_name
                  }
                });
              });
            })
          );
        });
        Promise.all(allFoldersData).then(parsedFoldersData => {
          dev.logverbose(
            `All folders meta have been processed`,
            JSON.stringify(parsedFoldersData, null, 4)
          );

          // on se balade dans l’array, on attrappe la key
          // et on merge tout ça dans un nouvel objet du type :
          /*
            { 
              mon-dossier: {
                name: "Mon Dossier",
                date_crated: "",
                preview: "meta_preview.jpeg"
              },
              mon-deuxième-dossier: { 

              }
            }
          */

          // Reunite array items as a single big object
          let flatObjFoldersData = {};
          parsedFoldersData.forEach(fmeta => {
            if (Object.keys(fmeta).length > 0) {
              let slugFolderName = Object.keys(fmeta)[0];
              if (!flatObjFoldersData.hasOwnProperty(slugFolderName)) {
                flatObjFoldersData[slugFolderName] = {};
              }
              Object.assign(
                flatObjFoldersData[slugFolderName],
                fmeta[slugFolderName]
              );
            }
          });
          resolve(flatObjFoldersData);
        });
      });
    });
  }

  function createFolder({ type, data }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — createFolder : will create a new folder for type = ${type} with: ${JSON.stringify(
          data,
          null,
          4
        )}`
      );

      if (!data.hasOwnProperty('name')) {
        data.name = 'Untitled Folder';
      }

      if (!settings.structure.hasOwnProperty(type)) {
        reject(`Missing type ${type} in settings.json`);
      }
      const baseFolderPath = settings.structure[type].path;
      const mainFolderPath = api.getFolderPath(baseFolderPath);
      let slugFolderName = api.slug(data.name);

      getFolder({ type }).then(
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

          const thisFolderPath = path.join(mainFolderPath, slugFolderName);
          dev.logverbose(`Making a new folder at path ${thisFolderPath}`);

          fs.mkdirp(
            thisFolderPath,
            () => {
              let tasks = [];

              if (data.hasOwnProperty('preview_rawdata')) {
                tasks.push(
                  _storeFoldersPreview(thisFolderPath, data.preview_rawdata)
                );
              }

              tasks.push(
                new Promise(function(resolve, reject) {
                  data = _makeDefaultMetaFromStructure({
                    type,
                    method: 'create',
                    existing: data
                  });

                  const metaFolderPath = path.join(
                    thisFolderPath,
                    settings.folderMetaFilename + settings.metaFileext
                  );

                  api
                    .storeData(metaFolderPath, data, 'create')
                    .then(function(meta) {
                      dev.logverbose(
                        `New folder meta file created at path: ${metaFolderPath} with meta: ${JSON.stringify(
                          meta,
                          null,
                          4
                        )}`
                      );
                      resolve();
                    })
                    .catch(err => {
                      reject(err);
                    });
                })
              );

              Promise.all(tasks).then(() => {
                resolve(slugFolderName);
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

  function editFolder({ type, foldersData, newFoldersData }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — editFolder : will edit folder with type = ${type} 
        with ${JSON.stringify(newFoldersData, null, 4)} 
        with existing data ${JSON.stringify(foldersData, null, 4)}`
      );

      if (!settings.structure.hasOwnProperty(type)) {
        reject(`Missing type ${type} in settings.json`);
      }
      const baseFolderPath = settings.structure[type].path;
      const mainFolderPath = api.getFolderPath(baseFolderPath);

      // remove slugFolderKey
      let slugFolderName = foldersData.slugFolderName;
      const thisFolderPath = path.join(mainFolderPath, slugFolderName);
      let tasks = [];

      if (newFoldersData.hasOwnProperty('preview_rawdata')) {
        dev.logverbose('Updating folders preview');
        let preview_rawdata = newFoldersData.preview_rawdata;
        // store preview with sharp
        tasks.push(_storeFoldersPreview(thisFolderPath, preview_rawdata));
      }

      let updateFoldersMeta = new Promise((resolve, reject) => {
        dev.logverbose('Updating folders meta');
        // cleaning up stored meta
        foldersData = _makeDefaultMetaFromStructure({
          type,
          method: 'create',
          existing: foldersData
        });

        newFoldersData = _makeDefaultMetaFromStructure({
          type,
          method: 'update',
          existing: newFoldersData
        });

        // overwrite stored obj with new informations
        Object.assign(foldersData, newFoldersData);

        const metaFolderPath = path.join(
          thisFolderPath,
          settings.folderMetaFilename + settings.metaFileext
        );

        api.storeData(metaFolderPath, foldersData, 'update').then(
          function(meta) {
            dev.logverbose(
              `Update folder meta file at path: ${metaFolderPath} with meta: ${JSON.stringify(
                meta,
                null,
                4
              )}`
            );
            resolve();
          },
          function(err) {
            reject(`Couldn't update folder meta: ${err}`);
          }
        );
      });
      tasks.push(updateFoldersMeta);

      Promise.all(tasks)
        .then(() => {
          dev.logverbose(`COMMON — editFolder : now resolving`);
          resolve(slugFolderName);
        })
        .catch(err => {
          dev.error(
            `Failed to edit folder slugFolderName = ${slugFolderName}: ${err}`
          );
          reject(err);
        });
    });
  }

  function _storeFoldersPreview(thisFolderPath, preview_rawdata) {
    return new Promise((resolve, reject) => {
      dev.logfunction(
        `COMMON — _storeFoldersPreview : will store preview for folder at path: ${thisFolderPath}`
      );
      const pathToPreview = path.join(
        thisFolderPath,
        settings.folderPreviewFilename + settings.thumbExt
      );

      dev.logverbose(
        `COMMON — _storeFoldersPreview : Removing existing preview at ${pathToPreview}`
      );
      fs
        .remove(pathToPreview)
        .then(() => {
          if (preview_rawdata === '') {
            dev.logverbose(
              `COMMON — _storeFoldersPreview : No new preview data found, returning.`
            );
            return resolve();
          }
          dev.logverbose(
            `COMMON — _storeFoldersPreview : Now making a folder preview at path ${pathToPreview}`
          );
          let imageBuffer = api.decodeBase64Image(preview_rawdata);
          sharp(imageBuffer)
            .rotate()
            .resize(600, 600)
            .max()
            .withoutEnlargement()
            .background({ r: 255, g: 255, b: 255 })
            .withMetadata()
            .toFormat(settings.thumbFormat, {
              quality: settings.mediaThumbQuality
            })
            .toFile(pathToPreview)
            .then(function() {
              dev.logverbose(
                `COMMON — _storeFoldersPreview : Finished making a folder preview at ${pathToPreview}`
              );
              resolve();
            })
            .catch(err => {
              console.error(err);
              reject(err);
            });
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }

  function removeFolder({ type, slugFolderName }) {
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
              settings.folderMetaFilename + settings.metaFileext &&
            // not a folder preview
            thisSlugMediaName !==
              settings.folderPreviewFilename + settings.thumbExt &&
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

  function editMediaMeta({ slugFolderName, slugMediaName, data }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — editMediaMeta : will edit media with ${JSON.stringify(
          data,
          null,
          4
        )}`
      );

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
          existing: data
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
          data.hasOwnProperty('content')
        ) {
          dev.logverbose(`Is text or marker and need to update content.`);
          dev.logverbose(`New content: ${data.content}`);
          let updateTextMedia = new Promise((resolve, reject) => {
            let mediaPath = path.join(
              api.getFolderPath(slugFolderName),
              slugMediaName
            );
            let content = validator.escape(data.content + '');
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

  function removeMedia({ slugFolderName, slugMediaName }) {
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

  function createTextMedia({ slugProjectName, type, additionalMeta }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — createTextMedia : will create text media in: ${slugProjectName}`
      );

      let timeCreated = api.getCurrentDate();
      let randomString = (
        Math.random().toString(36) + '00000000000000000'
      ).slice(2, 3 + 2);
      let textMediaName = `${type}-${timeCreated}-${randomString}.md`;

      let pathToTextMedia = path.join(
        api.getFolderPath(slugProjectName),
        textMediaName
      );

      api.storeData(pathToTextMedia, '', 'create').then(
        () => {
          let newMediaInfos = {
            slugMediaName: textMediaName,
            additionalMeta: {
              fileCreationDate: api.parseDate(timeCreated),
              type
            }
          };

          if (additionalMeta.hasOwnProperty('color')) {
            newMediaInfos.additionalMeta.color = additionalMeta.color;
          }
          if (additionalMeta.hasOwnProperty('collapsed')) {
            newMediaInfos.additionalMeta.collapsed = additionalMeta.collapsed;
          }
          resolve(newMediaInfos);
        },
        function(err) {
          dev.error(`Failed to storeData for textmedia: ${err}`);
          reject(err);
        }
      );
    });
  }

  function createMediaFromCapture({
    type,
    rawData,
    slugProjectName,
    additionalMeta
  }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — createMediaFromCapture with type = ${type}, 
        slugProjectName = ${slugProjectName} 
        and additionalMeta = ${additionalMeta}`
      );

      let timeCreated = api.getCurrentDate();
      let randomString = (
        Math.random().toString(36) + '00000000000000000'
      ).slice(2, 3 + 2);
      let mediaName = `${type}-${timeCreated}-${randomString}`;

      // Depending on the type of media we will create, we will need to act differently:
      // - 'image' -> use sharp and create a .jpeg from the buffer
      // - 'video' -> store the content to a file with writeMediaDataToDisk
      // - 'stopmotion' -> assemble all images to a video
      // - 'audio' -> store content with writeMediaDataToDisk

      let tasks = [];

      if (type === 'image') {
        tasks.push(
          new Promise((resolve, reject) => {
            mediaName += '.jpeg';
            let pathToMedia = path.join(
              api.getFolderPath(slugProjectName),
              mediaName
            );

            let imageBuffer = api.decodeBase64Image(rawData);
            sharp(imageBuffer)
              .rotate()
              .withMetadata()
              .background({ r: 255, g: 255, b: 255 })
              .flatten()
              .jpeg({
                quality: 90
              })
              .toFile(pathToMedia, function(err, info) {
                if (err) {
                  dev.error(err);
                  reject(err);
                }
                dev.logverbose(`Stored captured image to ${pathToMedia}`);
                resolve();
              });
          })
        );
      } else if (type === 'video') {
        tasks.push(
          new Promise((resolve, reject) => {
            mediaName += '.mp4';
            let pathToMedia = path.join(
              api.getFolderPath(slugProjectName),
              mediaName
            );

            api
              .writeMediaDataToDisk(pathToMedia, rawData)
              .then(() => {
                resolve();
              })
              .catch(err => {
                reject(err);
              });
          })
        );
      } else if (type === 'audio') {
        tasks.push(
          new Promise((resolve, reject) => {
            mediaName += '.wav';
            let pathToMedia = path.join(
              api.getFolderPath(slugProjectName),
              mediaName
            );

            api
              .writeMediaDataToDisk(pathToMedia, rawData)
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
          dev.logverbose(`Passed all tasks for captured medias`);
          let newMediaInfos = {
            slugMediaName: mediaName,
            additionalMeta: {
              type: type,
              fileCreationDate: api.parseDate(timeCreated)
            }
          };
          if (typeof additionalMeta !== 'undefined') {
            newMediaInfos.additionalMeta = Object.assign(
              {},
              newMediaInfos.additionalMeta,
              additionalMeta
            );
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
      `COMMON — _makeDefaultMetaFromStructure : will '${method}' a new default meta object for type ${type}.`
    );
    if (!settings.structure.hasOwnProperty(type)) {
      dev.error(`Missing type ${type} in settings.json`);
    }

    let fields = settings.structure[type].fields;
    let output_obj = {};

    Object.entries(fields).forEach(([key, val]) => {
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
        settings.structure[type].fields.hasOwnProperty(key) &&
        settings.structure[type].fields[key].hasOwnProperty('type')
      ) {
        const fieldType = settings.structure[type].fields[key].type;
        if (fieldType === 'date') {
          new_meta[key] = api.parseDate(meta[key]);
        } else if (fieldType === 'string') {
          new_meta[key] = validator.unescape(meta[key]);
        } else if (fieldType === 'number') {
          new_meta[key] = validator.toFloat(meta[key]);
        } else if (fieldType === 'boolean') {
          new_meta[key] = validator.toBoolean(meta[key]);
        } else {
          dev.error(`Unexpected field type ${fieldType}.`);
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
