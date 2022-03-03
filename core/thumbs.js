const path = require("path"),
  fs = require("fs-extra"),
  { ffmpegPath, ffprobePath } = require("ffmpeg-ffprobe-static"),
  ffmpeg = require("fluent-ffmpeg"),
  exifReader = require("exif-reader"),
  sharp = require("sharp"),
  cheerio = require("cheerio"),
  fetch = require("node-fetch"),
  https = require("https");

sharp.cache(false);

const dev = require("./dev-log"),
  api = require("./api");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

module.exports = (function () {
  const API = {
    makeMediaThumbs: (
      slugFolderName,
      filename,
      mediaType,
      type,
      subtype,
      mediaData
    ) =>
      makeMediaThumbs(
        slugFolderName,
        filename,
        mediaType,
        type,
        subtype,
        mediaData
      ),
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
  function makeMediaThumbs(
    slugFolderName,
    filename,
    mediaType,
    type,
    subtype,
    mediaData
  ) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(
        `THUMBS — makeMediaThumbs — Making thumbs for media with slugFolderName = ${slugFolderName}, filename = ${filename}, mediaType: ${mediaType}, type: ${type}, subtype: ${subtype}`
      );
      if (
        !["image", "video", "audio", "stl", "document", "link"].includes(
          mediaType
        )
      ) {
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
            let screenshotsTimemarks = [
              {
                key: "00:00:00",
                filename_suffix: "0",
              },
              {
                key: "50%",
                filename_suffix: "50pc",
              },
            ];
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
                      resolve({ timeMark: timeMark.key, thumbsData });
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
          } else if (mediaType === "document") {
            let screenshotsPages = [0];
            screenshotsPages.forEach((page) => {
              let makePDFScreenshot = new Promise((resolve, reject) => {
                _makePDFScreenshot({
                  slugFolderName,
                  thumbFolderPath,
                  filename,
                  page,
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
                                `makeMediaThumbs / Failed to make pdf thumbs with error ${err}`
                              );
                              resolve();
                            });
                        }
                      );
                      makeThumbsFromScreenshot.push(makeThumbFromScreenshot);
                    });
                    Promise.all(makeThumbsFromScreenshot).then((thumbsData) => {
                      resolve({ page, thumbsData });
                    });
                  })
                  .catch((err) => {
                    dev.error(`Couldn’t make pdf screenshots.`);
                    resolve();
                  });
              });
              makeThumbs.push(makePDFScreenshot);
            });
          } else if (mediaType === "link") {
            // if link, we’ll get og: title, og: image and og: description from source page
            // create a .txt file and a thumb for the og: image
            let makeLinkCard = new Promise((resolve, reject) => {
              _getLinkOpenGraph({
                slugFolderName,
                thumbFolderPath,
                filename,
                mediaData,
              })
                .then(({ title, description, image, local_image }) => {
                  return resolve({
                    siteData: {
                      title,
                      description,
                      image,
                      local_image,
                    },
                  });
                })
                .catch((err) => {
                  dev.error(`Couldn’t make link og tags : ${err}`);
                  return resolve();
                });
            });

            makeThumbs.push(makeLinkCard);

            // and store
            // let screenshotsScroll = [0];
            // screenshotsScroll.forEach((scroll) => {
            //   let makeLinkScreenshot = new Promise((resolve, reject) => {
            //     _makeLinkThumb({
            //       slugFolderName,
            //       thumbFolderPath,
            //       filename,
            //       scroll,
            //       mediaData,
            //     })
            //       .then(({ screenshotPath, screenshotName }) => {
            //         // make screenshot, then make thumbs out of each screenshot and push this to thumbs
            //         // naming :
            //         // - mediaName.0.200.jpeg, mediaName.0.400.jpeg, etc.
            //         // - mediaName.5.200.jpeg, mediaName.10.400.jpeg, etc.
            //         let makeThumbsFromScreenshot = [];
            //         thumbResolutions.forEach((thumbRes) => {
            //           let makeThumbFromScreenshot = new Promise(
            //             (resolve, reject) => {
            //               _makeImageThumb(
            //                 api.getFolderPath(screenshotPath),
            //                 thumbFolderPath,
            //                 screenshotName,
            //                 thumbRes
            //               )
            //                 .then((thumbPath) => {
            //                   let thumbMeta = {
            //                     path: thumbPath,
            //                     size: thumbRes,
            //                   };
            //                   resolve(thumbMeta);
            //                 })
            //                 .catch((err) => {
            //                   dev.error(
            //                     `makeMediaThumbs / Failed to make link thumbs with error ${err}`
            //                   );
            //                   resolve();
            //                 });
            //             }
            //           );
            //           makeThumbsFromScreenshot.push(makeThumbFromScreenshot);
            //         });
            //         Promise.all(makeThumbsFromScreenshot).then((thumbsData) => {
            //           resolve({ scroll, thumbsData });
            //         });
            //       })
            //       .catch((err) => {
            //         dev.error(`Couldn’t make stl screenshots.`);
            //         resolve();
            //       });
            //   });
            //   makeThumbs.push(makeLinkScreenshot);
            // });
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

          // TODO : get all thumbs that match exactly (slugMediaName + . at the end)
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
        `THUMBS — _makeVideoScreenshot — Looking to make a video screenshot for ${mediaPath} and timeMark = ${timeMark.key}`
      );

      let screenshotName = `${filename}.${timeMark.filename_suffix}.jpeg`;
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
              timemarks: [timeMark.key],
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
      dev.logfunction(
        `THUMBS — _makeSTLScreenshot: ${slugFolderName}/${filename}`
      );

      // todo : use angle to get screenshots all around an stl

      let screenshotName = `${filename}.${angle}.png`;
      let screenshotPath = path.join(thumbFolderPath, screenshotName);
      let fullScreenshotPath = api.getFolderPath(screenshotPath);

      // check first if it exists, resolve if it does
      fs.pathExists(fullScreenshotPath).then((exists) => {
        if (!exists) {
          const url = `${global.appInfos.homeURL}/libs/stl/show_stl.html?mediaURL=/${slugFolderName}/${filename}`;

          screenshotWebsite({
            url,
          })
            .then((image) => {
              fs.writeFile(fullScreenshotPath, image.toPNG(1.0), (error) => {
                if (error) throw error;
                dev.logverbose(
                  `THUMBS — _makeSTLScreenshot : created image at ${fullScreenshotPath}`
                );
                return resolve({ screenshotPath, screenshotName });
              });
            })
            .catch((err) => {
              dev.error(
                `THUMBS — _makeSTLScreenshot / Failed to make stl thumbs with error ${err}`
              );
              return reject();
            });
        } else {
          dev.logverbose(
            `Screenshots already exist at path ${fullScreenshotPath}`
          );
          return resolve({ screenshotPath, screenshotName });
        }
      });
    });
  }

  function _makePDFScreenshot({
    slugFolderName,
    thumbFolderPath,
    filename,
    page,
  }) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(
        `THUMBS — _makePDFScreenshot: ${slugFolderName}/${filename}`
      );

      // todo : use page to get screenshots of each page
      let screenshotName = `${filename}.${page}.png`;
      let screenshotPath = path.join(thumbFolderPath, screenshotName);
      let fullScreenshotPath = api.getFolderPath(screenshotPath);

      // check first if it exists, resolve if it does
      fs.pathExists(fullScreenshotPath).then((exists) => {
        if (!exists) {
          const url = `${global.appInfos.homeURL}/${slugFolderName}/${filename}`;

          screenshotWebsite({
            url,
          })
            .then((image) => {
              fs.writeFile(fullScreenshotPath, image.toPNG(1.0), (error) => {
                if (error) throw error;
                dev.logverbose(
                  `THUMBS — _makePDFScreenshot : created image at ${fullScreenshotPath}`
                );
                return resolve({ screenshotPath, screenshotName });
              });
            })
            .catch((err) => {
              dev.error(
                `THUMBS — _makePDFScreenshot / Failed to make stl thumbs with error ${err}`
              );
              return reject();
            });
        } else {
          dev.logverbose(
            `Screenshots already exist at path ${fullScreenshotPath}`
          );
          return resolve({ screenshotPath, screenshotName });
        }
      });
    });
  }

  async function _getLinkOpenGraph({
    slugFolderName,
    thumbFolderPath,
    filename,
    mediaData,
  }) {
    dev.logfunction(
      `THUMBS — _getLinkOpenGraph: ${slugFolderName}/${filename}`
    );

    let url = mediaData.content;
    if (!url) {
      dev.error(`THUMBS — _getLinkOpenGraph / no URL`);
      throw `no url`;
    }

    function addhttp(url) {
      if (!/^(?:f|ht)tps?\:\/\//.test(url)) url = "http://" + url;
      return url;
    }
    url = addhttp(url);

    let meta_cache_filename = `${api.slug(url)}.sitemeta.json`;
    let meta_cache_path = path.join(thumbFolderPath, meta_cache_filename);
    let meta_cache_fullpath = api.getFolderPath(meta_cache_path);

    if (await fs.pathExists(meta_cache_fullpath)) {
      dev.logverbose(
        `Site metadata already exist at path ${meta_cache_fullpath}`
      );

      try {
        const results = await fs.readFileSync(
          meta_cache_fullpath,
          global.settings.textEncoding
        );
        return JSON.parse(results);
      } catch (err) {
        dev.error(`Err while reading stored opengraph meta: ${err}`);
        return {};
      }
    }

    let results = {};

    const _metadata = await _getPageMetadata({ url }).catch((err) => {
      dev.error(`THUMBS — _getLinkOpenGraph / failed loading meta ${err}`);
    });

    if (_metadata && _metadata.hasOwnProperty("title"))
      results.title = _metadata.title;
    if (_metadata && _metadata.hasOwnProperty("description"))
      results.description = _metadata.description;

    if (_metadata && _metadata.hasOwnProperty("image")) {
      let image_url;
      if (typeof _metadata.image === "string") image_url = _metadata.image;
      else if (
        typeof _metadata.image === "object" &&
        _metadata.image.hasOwnProperty("name")
      )
        image_url = _metadata.image.name;

      if (image_url) results.image = image_url;
    }

    if (!results.image) {
      function endsWithAny(suffixes, string) {
        return suffixes.some(function (suffix) {
          return string.endsWith(suffix);
        });
      }

      if (endsWithAny([".jpg", ".jpeg", ".png", ".gif"], url))
        results.image = url;
    }

    if (results.image) {
      try {
        results.local_image = await _fetchImage({
          thumbFolderPath,
          site_url: url,
          image_url: results.image,
        });
      } catch (err) {
        dev.error(
          `Couldn’t download site image ${url} to ${thumbFolderPath} : ${err}`
        );
      }
    }

    try {
      await fs.writeFileSync(meta_cache_fullpath, JSON.stringify(results));
      dev.logverbose(
        `THUMBS — _getLinkOpenGraph : stored meta ${JSON.stringify(
          results
        )} at ${meta_cache_fullpath}`
      );
      return results;
    } catch (err) {
      dev.error(
        `THUMBS — _getLinkOpenGraph : failed storing meta at ${meta_cache_fullpath} : ${err}`
      );
      throw err;
    }
  }

  function _getPageMetadata({ url }) {
    return new Promise((resolve, reject) => {
      dev.logfunction(`THUMBS — _getPageMetadata : ${url}`);

      const { BrowserWindow } = require("electron");
      let win = new BrowserWindow({
        show: false,
      });

      win.loadURL(url);
      win.webContents.setAudioMuted(true);

      let page_timeout = setTimeout(() => {
        clearTimeout(page_timeout);
        dev.error(`THUMBS — _getPageMetadata : page timeout for ${url}`);
        win.close();
        return reject();
      }, 10_000);

      win.webContents.once("did-finish-load", () => {
        dev.logverbose(
          `THUMBS — _getPageMetadata : finished loading page ${url}`
        );

        clearTimeout(page_timeout);

        let code = `var promise = Promise.resolve(document.documentElement.innerHTML); 
                  promise.then(data => data)`;

        if (!win || win.isDestroyed() || !win.webContents) {
          return reject();
        }
        win.webContents.executeJavaScript(code, true).then((html) => {
          // console.log(html); // will be your innherhtml
          const parsed_meta = _parseHTMLMetaTags({ html });
          win.close();
          return resolve(parsed_meta);
        });
      });
      win.webContents.once(
        "did-fail-load",
        (event, code, desc, url, isMainFrame) => {
          dev.error(
            `THUMBS — _getPageMetadata / Failed to load link page for ${url}`
          );
          clearTimeout(page_timeout);
          dev.error("did-fail-load: ", event, code, desc, url, isMainFrame);
          win.close();
          return reject();
        }
      );
    });
  }

  function _parseHTMLMetaTags({ html }) {
    var $ = cheerio.load(html);
    var page_meta = {};

    dev.logverbose(
      `THUMBS — _parseHTMLMetaTags : using cheerio to parse HTML tags`
    );

    if ($('meta[property="og:title"]').attr("content")) {
      page_meta.title = $('meta[property="og:title"]').attr("content");
    } else if ($("title").text()) {
      page_meta.title = $("title").text();
    }

    if ($('meta[property="og:description"]').attr("content")) {
      page_meta.description = $('meta[property="og:description"]').attr(
        "content"
      );
    } else if ($('meta[name="description"]').attr("content")) {
      page_meta.description = $('meta[name="description"]').attr("content");
    }

    if ($('meta[property="og:image"]').attr("content")) {
      page_meta.image = $('meta[property="og:image"]').attr("content");
    } else if ($('meta[name="og:image"]').attr("content")) {
      page_meta.image = $('meta[name="og:image"]').attr("content");
    } else if ($('link[rel="shortcut icon"]').attr("href")) {
      page_meta.image = $('link[rel="shortcut icon"][type="image/png"]').attr(
        "href"
      );
    }
    // see https://gist.github.com/waltir/82c94c834de630f9030f95f1d8ba81cf#file-cheerio_meta-js
    //   let post = {
    //     title: $('h1').text(),
    //     canonical: $('link[rel="canonical"]').attr('href'),
    //     description: $('meta[name="description"]').attr('content'),
    //     // Get OG Values
    //     og_title: $('meta[property="og:title"]').attr('content'),
    //     og_url: $('meta[property="og:url"]').attr('content'),
    //     og_img: $('meta[property="og:image"]').attr('content'),
    //     og_type: $('meta[property="og:type"]').attr('content'),
    //     // Get Twitter Values
    //     twitter_site: $('meta[name="twitter:site"]').attr('content'),
    //     twitter_domain: $('meta[name="twitter:domain"]').attr('content'),
    //     twitter_img_src: $('meta[name="twitter:image:src"]').attr('content'),
    //     // Get Facebook Values
    //     fb_appid: $('meta[property="fb:app_id"]').attr('content'),
    //     fb_pages: $('meta[property="fb:pages"]').attr('content'),
    // }
    // keys.forEach(function (key) {
    //   if (
    //     meta[key].attribs &&
    //     meta[key].attribs.property &&
    //     meta[key].attribs.property.indexOf("og") == 0
    //   ) {
    //     var og = meta[key].attribs.property.split(":");

    //     if (og.length > 2) {
    //       if (result[og[1]]) {
    //         if (
    //           typeof result[og[1]] == "string" ||
    //           result[og[1]] instanceof String
    //         ) {
    //           var set = {};
    //           set["name"] = result[og[1]];
    //           set[og[2]] = meta[key].attribs.content;
    //           result[og[1]] = set;
    //         } else {
    //           ex_set = result[og[1]];
    //           ex_set[og[2]] = meta[key].attribs.content;
    //           result[og[1]] = ex_set;
    //         }
    //       } else {
    //         var set = {};
    //         set[og[2]] = meta[key].attribs.content;
    //         result[og[1]] = set;
    //       }
    //     } else {
    //       result[og[1]] = meta[key].attribs.content;
    //     }
    //   }
    // });
    return page_meta;
  }

  function _makeLinkThumb({
    slugFolderName,
    thumbFolderPath,
    filename,
    scroll,
    mediaData,
  }) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(`THUMBS — _makeLinkThumb: ${slugFolderName}/${filename}`);
      // todo : use scroll to get screenshots all around an stl

      let screenshotName = `${filename}.${scroll}.png`;
      let screenshotPath = path.join(thumbFolderPath, screenshotName);
      let fullScreenshotPath = api.getFolderPath(screenshotPath);

      // check first if it exists, resolve if it does
      fs.pathExists(fullScreenshotPath).then((exists) => {
        if (!exists) {
          const url = mediaData.content;

          if (!url) {
            dev.error(`THUMBS — _makeLinkThumb / no URL`);
            return reject(`no url`);
          }

          screenshotWebsite({
            url,
          })
            .then((image) => {
              fs.writeFile(fullScreenshotPath, image.toPNG(1.0), (error) => {
                if (error) throw error;
                dev.logverbose(
                  `THUMBS — _makeLinkThumb : created image at ${fullScreenshotPath}`
                );
                return resolve({ screenshotPath, screenshotName });
              });
            })
            .catch((err) => {
              dev.error(
                `THUMBS — _makeLinkThumb / Failed to make link thumbs with error ${err}`
              );
              return reject(err);
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
          return resolve({ screenshotPath, screenshotName });
        }
      });
    });
  }

  function screenshotWebsite({ url }) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(`THUMBS — screenshotWebsite url ${url}`);

      const { BrowserWindow } = require("electron");

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
      win.loadURL(url);

      win.webContents.on("did-stop-loading", async () => {
        dev.logverbose(`THUMBS — _makeSTLScreenshot : finished loading page`);
        // Use default printing options
        setTimeout(() => {
          win.capturePage().then((image) => {
            win.close();
            return resolve(image);
          });
        }, 1000);
      });
      win.webContents.on("did-fail-load", (err) => {
        return reject(err);
      });
    });
  }

  function getEXIFDataForVideoAndAudio(mediaPath) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(`THUMBS — getEXIFDataForVideoAndAudio: ${mediaPath}`);
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

  async function _fetchImage({ thumbFolderPath, site_url, image_url }) {
    dev.logfunction(`THUMBS — _fetchImage: ${thumbFolderPath} to ${image_url}`);

    const url = new URL(image_url, site_url).href;

    const image_ext = url.split(".").pop();
    const image_filename = "preview." + image_ext;

    let siteimage_cache_filename = api.slug(url) + "." + image_filename;
    let siteimage_cache_path = path.join(
      thumbFolderPath,
      siteimage_cache_filename
    );
    let siteimage_cache_fullpath = api.getFolderPath(siteimage_cache_path);

    let headers = {};
    if (url.includes("https://"))
      headers.agent = new https.Agent({
        rejectUnauthorized: false,
      });

    try {
      const fimg = await fetch(url, headers);
      const fimgb = await fimg.buffer();
      await _createOrGetImageThumb({
        mediaPath: fimgb,
        fullThumbPath: siteimage_cache_fullpath,
        thumbRes: 1400,
      });
      dev.logverbose(`THUMBS — _fetchImage: image fetched`);
      return siteimage_cache_path;
    } catch (err) {
      dev.error(`THUMBS — _fetchImage: ${err}`);
      throw err;
    }
  }

  return API;
})();
