const path = require("path"),
  fs = require("fs-extra"),
  pathToFfmpeg = require("ffmpeg-static"),
  ffprobestatic = require("ffprobe-static"),
  ffmpeg = require("fluent-ffmpeg"),
  exifReader = require("exif-reader");

const sharp = require("sharp");
sharp.cache(false);

const dev = require("./dev-log"),
  api = require("./api");

ffmpeg.setFfmpegPath(pathToFfmpeg);
ffmpeg.setFfprobePath(ffprobestatic.path);

module.exports = (function() {
  const API = {
    makeMediaThumbs: (slugFolderName, filename, mediaType, type, subtype) =>
      makeMediaThumbs(slugFolderName, filename, mediaType, type, subtype),
    removeMediaThumbs: (slugFolderName, type, filename) =>
      removeMediaThumbs(slugFolderName, type, filename),
    removeFolderThumbs: (slugFolderName, type) =>
      removeFolderThumbs(slugFolderName, type),

    getEXIFDataForImage: mediaPath => getEXIFDataForImage(mediaPath),
    getMediaEXIF: d => getMediaEXIF(d),
    getTimestampFromEXIF: mediaPath => getTimestampFromEXIF(mediaPath)
  };

  // this function is used both when creating a media and when all medias are listed.
  // this way, if thumbs are deleted or moved while the app is running, they will be recreated next time they are required
  function makeMediaThumbs(slugFolderName, filename, mediaType, type, subtype) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `THUMBS — makeMediaThumbs — Making thumbs for media with slugFolderName = ${slugFolderName}, filename = ${filename}, mediaType: ${mediaType}, type: ${type}, subtype: ${subtype}`
      );
      if (!["image", "video"].includes(mediaType)) {
        dev.logverbose(
          `THUMBS — makeMediaThumbs — media is not of type image or video`
        );
        return resolve();
      }

      const thumbResolutions =
        global.settings.structure[type][subtype].thumbs.resolutions;
      const baseFolderPath = global.settings.structure[type].path;
      const mainFolderPath = api.getFolderPath(baseFolderPath);

      let thumbFolderPath = path.join(
        global.settings.thumbFolderName,
        baseFolderPath,
        slugFolderName
      );
      let mediaPath = path.join(mainFolderPath, slugFolderName, filename);

      // let’s make sure that our thumb folder exists first
      fs.mkdirp(api.getFolderPath(thumbFolderPath), function(err) {
        if (err) {
          reject(err);
        }

        // regroup all thumbs promises so they can happen as fast as possible
        let makeThumbs = [];

        if (mediaType === "image") {
          thumbResolutions.forEach(thumbRes => {
            let makeThumb = new Promise((resolve, reject) => {
              _makeImageThumb(mediaPath, thumbFolderPath, filename, thumbRes)
                .then(thumbPath => {
                  let thumbMeta = {
                    path: thumbPath,
                    size: thumbRes
                  };
                  resolve(thumbMeta);
                })
                .catch(err => {
                  dev.error(
                    `makeMediaThumbs / Failed to make image thumbs with error ${err}`
                  );
                  resolve();
                });
            });
            makeThumbs.push(makeThumb);
          });
        }

        if (mediaType === "video") {
          // make screenshot
          let screenshotsTimemarks = [0];
          screenshotsTimemarks.forEach(timeMark => {
            let makeScreenshot = new Promise((resolve, reject) => {
              _makeVideoScreenshot(
                mediaPath,
                thumbFolderPath,
                filename,
                timeMark
              )
                .then(({ screenshotPath, screenshotName }) => {
                  // make screenshot, then make thumbs out of each screenshot and push this to thumbs
                  // naming :
                  // - mediaName.0.200.jpeg, mediaName.0.400.jpeg, etc.
                  // - mediaName.5.200.jpeg, mediaName.10.400.jpeg, etc.

                  let makeThumbsFromScreenshot = [];

                  thumbResolutions.forEach(thumbRes => {
                    let makeThumbFromScreenshot = new Promise(
                      (resolve, reject) => {
                        _makeImageThumb(
                          api.getFolderPath(screenshotPath),
                          thumbFolderPath,
                          screenshotName,
                          thumbRes
                        )
                          .then(thumbPath => {
                            let thumbMeta = {
                              path: thumbPath,
                              size: thumbRes
                            };
                            resolve(thumbMeta);
                          })
                          .catch(err => {
                            dev.error(
                              `makeMediaThumbs / Failed to make video thumbs with error ${err}`
                            );
                            resolve();
                          });
                      }
                    );
                    makeThumbsFromScreenshot.push(makeThumbFromScreenshot);
                  });
                  Promise.all(makeThumbsFromScreenshot).then(thumbsData => {
                    resolve({ timeMark, thumbsData });
                  });
                })
                .catch(err => {
                  dev.error(`Couldn’t make video screenshots.`);
                  resolve();
                });
            });
            makeThumbs.push(makeScreenshot);
          });
        }

        Promise.all(makeThumbs)
          .then(thumbData => {
            resolve(thumbData);
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }

  function getMediaEXIF({ type, mediaPath }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `THUMBS — getMediaEXIF for type = ${type} and mediaPath = ${mediaPath}`
      );
      if (type === "image") {
        getEXIFDataForImage(mediaPath)
          .then(exifdata => {
            let ratio = exifdata.height / exifdata.width;
            if (
              exifdata.orientation &&
              (exifdata.orientation === 8 || exifdata.orientation === 6)
            ) {
              dev.log(`Media is portrait. Inverting ratio`);
              ratio = 1 / ratio;
            }

            return resolve({
              ratio: Number.parseFloat(ratio).toPrecision(4),
              width: exifdata.width,
              height: exifdata.height
            });
          })
          .catch(err => reject());
      } else if (type === "video" || type === "audio") {
        getEXIFDataForVideoAndAudio(mediaPath)
          .then(metadata => {
            let values = {};

            if (
              metadata &&
              metadata.hasOwnProperty("format") &&
              metadata.format.hasOwnProperty("duration")
            ) {
              values.duration = metadata.format.duration;
            }

            if (
              metadata.streams !== undefined &&
              typeof Array.isArray(metadata.streams)
            ) {
              if (
                metadata.streams[0].height !== undefined &&
                metadata.streams[0].width !== undefined
              ) {
                let ratio =
                  metadata.streams[0].height / metadata.streams[0].width;

                (values.ratio = Number.parseFloat(ratio).toPrecision(4)),
                  (values.width = metadata.streams[0].width);
                values.height = metadata.streams[0].height;
              }
            }

            return resolve(values);
          })
          .catch(err => {
            dev.error(`No probe data to read from: ${err}`);
            return reject();
          });
      } else {
        return reject();
      }
    });
  }

  function getTimestampFromEXIF(mediaPath) {
    return new Promise(function(resolve, reject) {
      getEXIFDataForImage(mediaPath)
        .then(exifdata => {
          let ts = _extractImageTimestamp(exifdata);
          dev.logverbose(`TS is ${ts}`);
          resolve(ts);
        })
        .catch(err => reject(err));
    });
  }

  function getEXIFDataForImage(mediaPath) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`THUMBS — readEXIFData — for: ${mediaPath}`);

      sharp(mediaPath)
        .metadata()
        .then(exifdata => {
          if (typeof exifdata === "undefined") {
            reject();
          }
          dev.logverbose(`Gotten metadata.`);
          resolve(exifdata);
        })
        .catch(err => reject(err));
    });
  }

  function removeMediaThumbs(slugFolderName, type, slugMediaName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `THUMBS — removeMediaThumbs — for slugFolderName = ${slugFolderName}, slugMediaName = ${slugMediaName}`
      );

      const baseFolderPath = global.settings.structure[type].path;
      let thumbFolderPath = path.join(
        global.settings.thumbFolderName,
        baseFolderPath,
        slugFolderName
      );

      let fullThumbFolderPath = api.getFolderPath(thumbFolderPath);

      fs.mkdirp(fullThumbFolderPath, function(err) {
        if (err) {
          reject(err);
        }

        // get all thumbs
        fs.readdir(fullThumbFolderPath, function(err, filenames) {
          //         dev.logverbose(`Found filenames: ${filenames}`);
          if (err) {
            dev.error(`Couldn't read content dir: ${err}`);
            reject(err);
          }
          if (filenames === undefined) {
            dev.error(`No folder found: ${err}`);
            reject(err);
          }

          // get all thumbs that start with
          var thumbs = filenames.filter(name => {
            return name.indexOf(slugMediaName) === 0;
          });

          let tasks = [];

          thumbs.map(thumbName => {
            let removeThisThumb = new Promise((resolve, reject) => {
              let pathToThumb = path.join(fullThumbFolderPath, thumbName);
              fs.unlink(pathToThumb, err => {
                dev.logverbose(`Removing thumb ${thumbName}`);
                if (err) {
                  reject(`${err}`);
                } else {
                  resolve();
                }
              });
            });
            tasks.push(removeThisThumb);
          });

          Promise.all(tasks).then(() => {
            resolve();
          });
        });
      });
    });
  }

  function removeMediaThumbs(slugFolderName, type, slugMediaName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `THUMBS — removeMediaThumbs — for slugFolderName = ${slugFolderName}, slugMediaName = ${slugMediaName}`
      );

      const baseFolderPath = global.settings.structure[type].path;
      let thumbFolderPath = path.join(
        global.settings.thumbFolderName,
        baseFolderPath,
        slugFolderName
      );

      let fullThumbFolderPath = api.getFolderPath(thumbFolderPath);

      fs.mkdirp(fullThumbFolderPath, function(err) {
        if (err) {
          reject(err);
        }

        // get all thumbs
        fs.readdir(fullThumbFolderPath, function(err, filenames) {
          //         dev.logverbose(`Found filenames: ${filenames}`);
          if (err) {
            dev.error(`Couldn't read content dir: ${err}`);
            reject(err);
          }
          if (filenames === undefined) {
            dev.error(`No folder found: ${err}`);
            reject(err);
          }

          // get all thumbs that start with
          var thumbs = filenames.filter(name => {
            return name.indexOf(slugMediaName) === 0;
          });

          let tasks = [];

          thumbs.map(thumbName => {
            let removeThisThumb = new Promise((resolve, reject) => {
              let pathToThumb = path.join(fullThumbFolderPath, thumbName);
              fs.unlink(pathToThumb, err => {
                dev.logverbose(`Removing thumb ${thumbName}`);
                if (err) {
                  reject(`${err}`);
                } else {
                  resolve();
                }
              });
            });
            tasks.push(removeThisThumb);
          });

          Promise.all(tasks).then(() => {
            resolve();
          });
        });
      });
    });
  }

  function removeFolderThumbs(slugFolderName, type) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `THUMBS — removeFolderThumbs — for slugFolderName = ${slugFolderName}, type = ${type}`
      );

      const baseFolderPath = global.settings.structure[type].path;
      let thumbFolderPath = path.join(
        global.settings.thumbFolderName,
        baseFolderPath,
        slugFolderName
      );

      let fullThumbFolderPath = api.getFolderPath(thumbFolderPath);

      fs.remove(fullThumbFolderPath).then(() => {
        resolve();
      });
    });
  }

  // from https://github.com/pchaussalet/photo_triage/blob/61f5d53d697c3db102e91ad7f674f61c72f4c4bf/lib/maintenance.js
  function _extractImageTimestamp(metadata) {
    let timestamp;
    if (metadata.exif) {
      var parsedMetadata = exifReader(metadata.exif);
      if (parsedMetadata) {
        if (
          parsedMetadata.exif &&
          (parsedMetadata.exif.DateTimeOriginal ||
            parsedMetadata.exif.DateTimeDigitized)
        ) {
          var exif = parsedMetadata.exif;
          if (exif.DateTimeOriginal) {
            timestamp = exif.DateTimeOriginal.getTime();
          } else {
            timestamp = exif.DateTimeDigitized.getTime();
          }
        } else {
          if (parsedMetadata.image && parsedMetadata.image.ModifyDate) {
            timestamp = parsedMetadata.image.ModifyDate.getTime();
          }
        }
      }
    }
    return timestamp !== undefined ? timestamp : false;
  }

  function _makeImageThumb(mediaPath, thumbFolderPath, filename, thumbRes) {
    return new Promise(function(resolve, reject) {
      dev.logverbose(
        `Looking/Making an image thumb for ${mediaPath} and resolution = ${thumbRes}`
      );

      let thumbName = `${filename}.${thumbRes}${global.settings.thumbExt}`;
      let thumbPath = path.join(thumbFolderPath, thumbName);
      let fullThumbPath = api.getFolderPath(thumbPath);

      _createOrGetImageThumb({ mediaPath, fullThumbPath, thumbRes })
        .then(() => _getThumbModifiedTimestamp(fullThumbPath))
        .then(ts => {
          if (!ts) {
            return resolve(thumbPath);
          }
          return resolve(thumbPath + "?v=" + ts);
        })
        .catch(err => reject(err));
    });
  }

  function _createOrGetImageThumb({ mediaPath, fullThumbPath, thumbRes }) {
    return new Promise(function(resolve, reject) {
      // check first if it exists, resolve if it does
      fs.access(fullThumbPath, fs.F_OK, function(err) {
        // if userDir folder doesn't exist yet at destination
        if (err) {
          dev.log(
            `Missing thumb for ${fullThumbPath} and resolution = ${thumbRes}, about to create it`
          );
          sharp(mediaPath)
            .rotate()
            .resize(thumbRes, thumbRes, {
              fit: "inside",
              withoutEnlargement: true
            })
            .flatten({ background: "white" })
            .withMetadata()
            .toFormat(global.settings.thumbFormat, {
              quality: global.settings.mediaThumbQuality
            })
            .toFile(fullThumbPath)
            .then(() => resolve())
            .catch(err => reject(err));
        } else {
          dev.logverbose(
            `Thumb exists for ${fullThumbPath} and resolution = ${thumbRes}.`
          );
          return resolve();
        }
      });
    });
  }

  function _getThumbModifiedTimestamp(fullThumbPath) {
    return new Promise(function(resolve, reject) {
      // read stat for fullThumbPath
      fs.stat(fullThumbPath, function(err, stats) {
        if (err) {
          return resolve();
        }
        // append modified to filename
        return resolve(Math.floor(stats.mtimeMs));
      });
    });
  }

  function _makeVideoScreenshot(
    mediaPath,
    thumbFolderPath,
    filename,
    timeMark
  ) {
    return new Promise(function(resolve, reject) {
      dev.logverbose(
        `Looking to make a video screenshot for ${mediaPath} and timeMark = ${timeMark}`
      );

      let screenshotName = `${filename}.${timeMark}.jpeg`;
      let screenshotPath = path.join(thumbFolderPath, screenshotName);
      let fullScreenshotPath = api.getFolderPath(screenshotPath);

      // check first if it exists, resolve if it does
      fs.access(fullScreenshotPath, fs.F_OK, function(err) {
        // if userDir folder doesn't exist yet at destination
        if (err) {
          ffmpeg(mediaPath)
            // setup event handlers
            .on("end", function(files) {
              dev.logverbose(
                `Screenshots were saved : ${JSON.stringify(files, null, 4)}`
              );
              resolve({ screenshotPath, screenshotName });
            })
            .on("error", function(err) {
              dev.error(`ffmpeg failed: ${err.message}`);
              reject(err.message);
            })
            .screenshots({
              count: 1,
              timemarks: ["00:00:00"],
              filename: screenshotName,
              folder: api.getFolderPath(thumbFolderPath)
            });
        } else {
          dev.logverbose(
            `Screenshots already exist at path ${fullScreenshotPath}`
          );
          resolve({ screenshotPath, screenshotName });
        }
      });
    });
  }

  function getEXIFDataForVideoAndAudio(mediaPath) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`getEXIFDataForVideoAndAudio: ${mediaPath}`);
      ffmpeg.ffprobe(mediaPath, function(err, metadata) {
        if (err || typeof metadata === "undefined") {
          dev.log(`getEXIFDataForVideoAndAudio: PROBE DATA isn’t valid`);
          return reject();
        } else {
          return resolve(metadata);
        }
      });
    });
  }

  return API;
})();
