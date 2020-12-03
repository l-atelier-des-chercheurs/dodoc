const path = require("path"),
  fs = require("fs-extra"),
  pathToFfmpeg = require("ffmpeg-static"),
  ffprobestatic = require("ffprobe-static"),
  ffmpeg = require("fluent-ffmpeg"),
  exifReader = require("exif-reader"),
  sharp = require("sharp");

sharp.cache(false);

const dev = require("./dev-log"),
  api = require("./api");

ffmpeg.setFfmpegPath(pathToFfmpeg);
ffmpeg.setFfprobePath(ffprobestatic.path);

module.exports = (function () {
  const API = {
    makeMediaThumbs: (slugFolderName, filename, mediaType, type, subtype) =>
      makeMediaThumbs(slugFolderName, filename, mediaType, type, subtype),
    removeMediaThumbs: (slugFolderName, type, filename) =>
      removeMediaThumbs(slugFolderName, type, filename),
    removeFolderThumbs: (slugFolderName, type) =>
      removeFolderThumbs(slugFolderName, type),

    getEXIFDataForImage: (mediaPath) => getEXIFDataForImage(mediaPath),
    getMediaEXIF: (d) => getMediaEXIF(d),
    getTimestampFromEXIF: (mediaPath) => getTimestampFromEXIF(mediaPath),
  };

  // this function is used both when creating a media and when all medias are listed.
  // this way, if thumbs are deleted or moved while the app is running, they will be recreated next time they are required
  function makeMediaThumbs(slugFolderName, filename, mediaType, type, subtype) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(
        `THUMBS — makeMediaThumbs — Making thumbs for media with slugFolderName = ${slugFolderName}, filename = ${filename}, mediaType: ${mediaType}, type: ${type}, subtype: ${subtype}`
      );
      if (!["image", "video", "audio", "stl"].includes(mediaType)) {
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
      fs.ensureDir(api.getFolderPath(thumbFolderPath))
        .then(() => {
          // regroup all thumbs promises so they can happen as fast as possible
          let makeThumbs = [];

          if (mediaType === "image") {
            thumbResolutions.forEach((thumbRes) => {
              let makeThumb = new Promise((resolve, reject) => {
                _makeImageThumb(mediaPath, thumbFolderPath, filename, thumbRes)
                  .then((thumbPath) => {
                    let thumbMeta = {
                      path: thumbPath,
                      size: thumbRes,
                    };
                    resolve(thumbMeta);
                  })
                  .catch((err) => {
                    dev.error(
                      `makeMediaThumbs / Failed to make image thumbs with error ${err}`
                    );
                    resolve();
                  });
              });
              makeThumbs.push(makeThumb);
            });
          } else if (mediaType === "video") {
            // make screenshot
            let screenshotsTimemarks = [0];
            screenshotsTimemarks.forEach((timeMark) => {
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

                    thumbResolutions.forEach((thumbRes) => {
                      let makeThumbFromScreenshot = new Promise(
                        (resolve, reject) => {
                          _makeImageThumb(
                            api.getFolderPath(screenshotPath),
                            thumbFolderPath,
                            screenshotName,
                            thumbRes
                          )
                            .then((thumbPath) => {
                              let thumbMeta = {
                                path: thumbPath,
                                size: thumbRes,
                              };
                              resolve(thumbMeta);
                            })
                            .catch((err) => {
                              dev.error(
                                `makeMediaThumbs / Failed to make video thumbs with error ${err}`
                              );
                              resolve();
                            });
                        }
                      );
                      makeThumbsFromScreenshot.push(makeThumbFromScreenshot);
                    });
                    Promise.all(makeThumbsFromScreenshot).then((thumbsData) => {
                      resolve({ timeMark, thumbsData });
                    });
                  })
                  .catch((err) => {
                    dev.error(`Couldn’t make video screenshots.`);
                    resolve();
                  });
              });
              makeThumbs.push(makeScreenshot);
            });
          } else if (mediaType === "audio") {
            // make screenshot
            let makeWaveform = new Promise((resolve, reject) => {
              _makeAudioWaveforms(mediaPath, thumbFolderPath, filename)
                .then(({ screenshotPath, screenshotName }) => {
                  // make screenshot, then make thumbs out of each screenshot and push this to thumbs
                  // naming :
                  // - mediaName.0.200.jpeg, mediaName.0.400.jpeg, etc.
                  // - mediaName.5.200.jpeg, mediaName.10.400.jpeg, etc.
                  let makeThumbsFromScreenshot = [];

                  thumbResolutions.forEach((thumbRes) => {
                    let makeThumbFromScreenshot = new Promise(
                      (resolve, reject) => {
                        _makeImageThumb(
                          api.getFolderPath(screenshotPath),
                          thumbFolderPath,
                          screenshotName,
                          thumbRes
                        )
                          .then((thumbPath) => {
                            let thumbMeta = {
                              path: thumbPath,
                              size: thumbRes,
                            };
                            resolve(thumbMeta);
                          })
                          .catch((err) => {
                            dev.error(
                              `makeMediaThumbs / Failed to make video thumbs with error ${err}`
                            );
                            resolve();
                          });
                      }
                    );
                    makeThumbsFromScreenshot.push(makeThumbFromScreenshot);
                  });
                  Promise.all(makeThumbsFromScreenshot).then((thumbsData) => {
                    resolve({ waveformType: "mono", thumbsData });
                  });
                })
                .catch((err) => {
                  dev.error(`Couldn’t make audio waveforms.`);
                  resolve();
                });
            });
            makeThumbs.push(makeWaveform);
          } else if (mediaType === "stl") {
            let screenshotsAngles = [0];
            screenshotsAngles.forEach((angle) => {
              let makeSTLScreenshot = new Promise((resolve, reject) => {
                _makeSTLScreenshot({
                  slugFolderName,
                  thumbFolderPath,
                  filename,
                  angle,
                })
                  .then(({ screenshotPath, screenshotName }) => {
                    // make screenshot, then make thumbs out of each screenshot and push this to thumbs
                    // naming :
                    // - mediaName.0.200.jpeg, mediaName.0.400.jpeg, etc.
                    // - mediaName.5.200.jpeg, mediaName.10.400.jpeg, etc.

                    let makeThumbsFromScreenshot = [];

                    thumbResolutions.forEach((thumbRes) => {
                      let makeThumbFromScreenshot = new Promise(
                        (resolve, reject) => {
                          _makeImageThumb(
                            api.getFolderPath(screenshotPath),
                            thumbFolderPath,
                            screenshotName,
                            thumbRes
                          )
                            .then((thumbPath) => {
                              let thumbMeta = {
                                path: thumbPath,
                                size: thumbRes,
                              };
                              resolve(thumbMeta);
                            })
                            .catch((err) => {
                              dev.error(
                                `makeMediaThumbs / Failed to make stl thumbs with error ${err}`
                              );
                              resolve();
                            });
                        }
                      );
                      makeThumbsFromScreenshot.push(makeThumbFromScreenshot);
                    });
                    Promise.all(makeThumbsFromScreenshot).then((thumbsData) => {
                      resolve({ angle, thumbsData });
                    });
                  })
                  .catch((err) => {
                    dev.error(`Couldn’t make stl screenshots.`);
                    resolve();
                  });
              });
              makeThumbs.push(makeSTLScreenshot);
            });
          }

          Promise.all(makeThumbs)
            .then((thumbData) => {
              resolve(thumbData);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          dev.error(`Error : ` + err);
          reject(err);
        });
    });
  }

  function getMediaEXIF({ type, mediaPath }) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(
        `THUMBS — getMediaEXIF for type = ${type} and mediaPath = ${mediaPath}`
      );
      if (type === "image") {
        getEXIFDataForImage(mediaPath)
          .then((exifdata) => {
            let meta = {};

            if (exifdata.width) meta.width = exifdata.width;
            if (exifdata.height) meta.height = exifdata.height;

            let ratio = exifdata.height / exifdata.width;
            if (
              exifdata.orientation &&
              (exifdata.orientation === 8 || exifdata.orientation === 6)
            ) {
              dev.log(`Media is portrait. Inverting ratio`);
              ratio = 1 / ratio;
            }
            meta.ratio = Number.parseFloat(ratio).toPrecision(4);

            if (exifdata.exif) {
              var parsed_exif_data = exifReader(exifdata.exif);
              if (parsed_exif_data && parsed_exif_data.hasOwnProperty("gps")) {
                meta.gps = JSON.stringify(parsed_exif_data.gps);
              }
            }

            return resolve(meta);
          })
          .catch((err) => reject(err));
      } else if (type === "video" || type === "audio") {
        getEXIFDataForVideoAndAudio(mediaPath)
          .then((metadata) => {
            let meta = {};

            if (
              metadata &&
              metadata.hasOwnProperty("format") &&
              metadata.format.hasOwnProperty("duration")
            ) {
              meta.duration = metadata.format.duration;
            }

            if (
              metadata &&
              metadata.hasOwnProperty("format") &&
              metadata.format.hasOwnProperty("tags")
            ) {
              const tags = metadata.format.tags;
              if (tags.hasOwnProperty("location"))
                meta.location = tags.location;
              else if (
                tags.hasOwnProperty("com.apple.quicktime.location.ISO6709")
              )
                meta.location = tags["com.apple.quicktime.location.ISO6709"];
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

                (meta.ratio = Number.parseFloat(ratio).toPrecision(4)),
                  (meta.width = metadata.streams[0].width);
                meta.height = metadata.streams[0].height;
              }
            }
            return resolve(meta);
          })
          .catch((err) => {
            dev.error(`No probe data to read from: ${err}`);
            return reject();
          });
      } else {
        return reject();
      }
    });
  }

  function getTimestampFromEXIF(mediaPath) {
    return new Promise(function (resolve, reject) {
      getEXIFDataForImage(mediaPath)
        .then((exifdata) => {
          let ts = _extractImageTimestamp(exifdata);
          dev.logverbose(`TS is ${ts}`);
          resolve(ts);
        })
        .catch((err) => reject(err));
    });
  }

  function getEXIFDataForImage(mediaPath) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(`THUMBS — readEXIFData — for: ${mediaPath}`);

      sharp(mediaPath)
        .metadata()
        .then((exifdata) => {
          if (typeof exifdata === "undefined") {
            return reject();
          }
          dev.logverbose(`Gotten metadata.`);
          return resolve(exifdata);
        })
        .catch((err) => reject(err));
    });
  }

  function removeMediaThumbs(slugFolderName, type, slugMediaName) {
    return new Promise(function (resolve, reject) {
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

      fs.ensureDir(fullThumbFolderPath).then(() => {
        // get all thumbs
        fs.readdir(fullThumbFolderPath, function (err, filenames) {
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
          var thumbs = filenames.filter((name) => {
            return name.indexOf(slugMediaName) === 0;
          });

          let tasks = [];

          thumbs.map((thumbName) => {
            let removeThisThumb = new Promise((resolve, reject) => {
              let pathToThumb = path.join(fullThumbFolderPath, thumbName);
              fs.unlink(pathToThumb, (err) => {
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
        }).catch((err) => {
          dev.error(`Error : ` + err);
          reject(err);
        });
      });
    });
  }

  function removeMediaThumbs(slugFolderName, type, slugMediaName) {
    return new Promise(function (resolve, reject) {
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

      fs.ensureDir(fullThumbFolderPath)
        .then(() => {
          // get all thumbs
          fs.readdir(fullThumbFolderPath, function (err, filenames) {
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
            var thumbs = filenames.filter((name) => {
              return name.indexOf(slugMediaName) === 0;
            });

            let tasks = [];

            thumbs.map((thumbName) => {
              let removeThisThumb = new Promise((resolve, reject) => {
                let pathToThumb = path.join(fullThumbFolderPath, thumbName);
                fs.unlink(pathToThumb, (err) => {
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
        })
        .catch((err) => {
          dev.error(`Error : ` + err);
          reject(err);
        });
    });
  }

  function removeFolderThumbs(slugFolderName, type) {
    return new Promise(function (resolve, reject) {
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
    return new Promise(function (resolve, reject) {
      dev.logverbose(
        `Looking/Making an image thumb for ${mediaPath} and resolution = ${thumbRes}`
      );

      let thumbName = `${filename}.${thumbRes}${global.settings.thumbExt}`;
      let thumbPath = path.join(thumbFolderPath, thumbName);
      let fullThumbPath = api.getFolderPath(thumbPath);

      _createOrGetImageThumb({ mediaPath, fullThumbPath, thumbRes })
        .then(() => _getThumbModifiedTimestamp(fullThumbPath))
        .then((ts) => {
          if (!ts) {
            return resolve(thumbPath);
          }
          return resolve(thumbPath + "?v=" + ts);
        })
        .catch((err) => reject(err));
    });
  }

  function _createOrGetImageThumb({ mediaPath, fullThumbPath, thumbRes }) {
    return new Promise(function (resolve, reject) {
      // check first if it exists, resolve if it does
      fs.access(fullThumbPath, fs.F_OK, function (err) {
        // if userDir folder doesn't exist yet at destination
        if (err) {
          dev.log(
            `Missing thumb for ${fullThumbPath} and resolution = ${thumbRes}, about to create it`
          );
          sharp(mediaPath)
            .rotate()
            .resize(thumbRes, thumbRes, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .flatten({ background: "white" })
            .withMetadata()
            .toFormat(global.settings.thumbFormat, {
              quality: global.settings.mediaThumbQuality,
            })
            .toFile(fullThumbPath)
            .then(() => resolve())
            .catch((err) => reject(err));
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
    return new Promise(function (resolve, reject) {
      // read stat for fullThumbPath
      fs.stat(fullThumbPath, function (err, stats) {
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
    return new Promise(function (resolve, reject) {
      dev.logfunction(
        `THUMBS — _makeVideoScreenshot — Looking to make a video screenshot for ${mediaPath} and timeMark = ${timeMark}`
      );

      let screenshotName = `${filename}.${timeMark}.jpeg`;
      let screenshotPath = path.join(thumbFolderPath, screenshotName);
      let fullScreenshotPath = api.getFolderPath(screenshotPath);

      // check first if it exists, resolve if it does
      fs.access(fullScreenshotPath, fs.F_OK, function (err) {
        // if userDir folder doesn't exist yet at destination
        if (err) {
          ffmpeg(mediaPath)
            // setup event handlers
            .on("end", function (files) {
              dev.logverbose(
                `Screenshots were saved : ${JSON.stringify(files, null, 4)}`
              );
              resolve({ screenshotPath, screenshotName });
            })
            .on("error", function (err) {
              dev.error(`ffmpeg failed: ${err.message}`);
              reject(err.message);
            })
            .screenshots({
              count: 1,
              timemarks: ["00:00:00"],
              filename: screenshotName,
              folder: api.getFolderPath(thumbFolderPath),
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

  function _makeAudioWaveforms(mediaPath, thumbFolderPath, filename) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(
        `THUMBS — _makeAudioWaveforms — Looking to make an audio waveform for ${mediaPath}`
      );

      let screenshotName = `${filename}.wf.png`;
      let screenshotPath = path.join(thumbFolderPath, screenshotName);
      let fullScreenshotPath = api.getFolderPath(screenshotPath);

      // check first if it exists, resolve if it does
      fs.access(fullScreenshotPath, fs.F_OK, function (err) {
        // if userDir folder doesn't exist yet at destination
        if (err) {
          ffmpeg()
            .input(mediaPath)
            .input(`color=white:s=3000x2000`)
            .inputFormat("lavfi")
            .complexFilter(
              "[0:a]aformat=channel_layouts=mono,showwavespic=s=3000x2000:colors=#fc4b60[fg];[1:v][fg]overlay=format=auto"
            )
            .outputOptions(["-vframes 1"])
            // setup event handlers
            .on("end", function (files) {
              dev.logverbose(
                `Audio waveform were saved : ${JSON.stringify(files, null, 4)}`
              );
              resolve({ screenshotPath, screenshotName });
            })
            .on("error", function (err) {
              dev.error(`ffmpeg failed: ${err.message}`);
              reject(err.message);
            })
            .save(fullScreenshotPath);
        } else {
          dev.logverbose(
            `Screenshots already exist at path ${fullScreenshotPath}`
          );
          resolve({ screenshotPath, screenshotName });
        }
      });
    });
  }

  function _makeSTLScreenshot({
    slugFolderName,
    thumbFolderPath,
    filename,
    angle,
  }) {
    return new Promise(function (resolve, reject) {
      dev.logverbose(
        `Looking to make a STL screenshot for ${slugFolderName}/${filename}`
      );

      // todo : use angle to get screenshots all around an stl

      let screenshotName = `${filename}.${angle}.png`;
      let screenshotPath = path.join(thumbFolderPath, screenshotName);
      let fullScreenshotPath = api.getFolderPath(screenshotPath);

      // check first if it exists, resolve if it does
      fs.pathExists(fullScreenshotPath).then((exists) => {
        if (!exists) {
          const { BrowserWindow } = require("electron");

          const url_to_load = `${global.appInfos.homeURL}/libs/stl/show_stl.html?mediaURL=/${slugFolderName}/${filename}`;
          dev.logverbose(`STL url to load ${url_to_load}`);

          let win = new BrowserWindow({
            // width: 800,
            // height: 600,
            width: 1800,
            height: 1800,
            show: false,
            webPreferences: {
              contextIsolation: true,
              allowRunningInsecureContent: true,
            },
          });
          win.loadURL(
            // `${global.appInfos.homeURL}/libs/stl/show_stl.html?mediaURL=/faire-de-la-3d-a-la-maison/bourlingue.stl`
            url_to_load
          );

          win.webContents.on("did-stop-loading", async () => {
            dev.logverbose(
              `THUMBS — _makeSTLScreenshot : finished loading page`
            );

            // Use default printing options
            setTimeout(() => {
              win.capturePage().then((image) => {
                win.close();
                fs.writeFile(fullScreenshotPath, image.toPNG(1.0), (error) => {
                  if (error) throw error;
                  dev.logverbose(
                    `THUMBS — _makeSTLScreenshot : created image at ${fullScreenshotPath}`
                  );
                  return resolve({ screenshotPath, screenshotName });
                });
              });
            }, 1000);
          });

          // var thumbnailer = new StlThumbnailer({
          //   filePath: mediaPath,
          //   requestThumbnails: [
          //     {
          //       width: 1800,
          //       height: 1800,
          //     },
          //   ],
          // }).then(function (thumbnails) {
          //   // thumbnails is an array (in matching order to your requests) of Canvas objects
          //   // you can write them to disk, return them to web users, etc
          //   // see node-canvas documentation at https://github.com/Automattic/node-canvas
          //   thumbnails[0].toBuffer(function (err, buf) {
          //     if (err) return reject();

          //     fs.writeFileSync(fullScreenshotPath, buf);
          //     return resolve({ screenshotPath, screenshotName });
          //   });
          // });
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
    return new Promise(function (resolve, reject) {
      dev.logfunction(`getEXIFDataForVideoAndAudio: ${mediaPath}`);
      ffmpeg.ffprobe(mediaPath, function (err, metadata) {
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
