const path = require('path'),
  fs = require('fs-extra'),
  ffmpegstatic = require('ffmpeg-static'),
  ffprobestatic = require('ffprobe-static'),
  ffmpeg = require('fluent-ffmpeg'),
  exifReader = require('exif-reader');

const sharp = require('sharp');

const settings = require('../settings.json'),
  dev = require('./dev-log'),
  api = require('./api');

ffmpeg.setFfmpegPath(ffmpegstatic.path);
ffmpeg.setFfprobePath(ffprobestatic.path);

module.exports = (function() {
  const API = {
    makeMediaThumbs: (slugFolderName, filename, mediaType, type) =>
      makeMediaThumbs(slugFolderName, filename, mediaType, type),
    removeMediaThumbs: (slugFolderName, filename) =>
      removeMediaThumbs(slugFolderName, filename),

    getEXIFData: mediaPath => getEXIFData(mediaPath),
    getRatioFromEXIF: mediaPath => getRatioFromEXIF(mediaPath),
    getTimestampFromEXIF: mediaPath => getTimestampFromEXIF(mediaPath),

    getMediaDuration: mediaPath => getMediaDuration(mediaPath),
    getMediaRatio: mediaPath => getMediaRatio(mediaPath)
  };

  // this function is used both when creating a media and when all medias are listed.
  // this way, if thumbs are deleted or moved while the app is running, they will be recreated next time they are required
  function makeMediaThumbs(slugFolderName, filename, mediaType, type) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `THUMBS — makeMediaThumbs — Making thumbs for media with slugFolderName = ${slugFolderName}, filename = ${filename}, mediaType: ${mediaType} and type: ${type}`
      );
      if (!['image', 'video'].includes(mediaType)) {
        dev.logverbose(
          `THUMBS — makeMediaThumbs — media is not of type image or video`
        );
        return resolve();
      }

      const thumbResolutions =
        settings.structure[type].medias.thumbs.resolutions;
      const baseFolderPath = settings.structure[type].path;
      const mainFolderPath = api.getFolderPath(baseFolderPath);

      let thumbFolderPath = path.join(
        settings.thumbFolderName,
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

        if (mediaType === 'image') {
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
                  dev.error(`Failed to make thumbs with error ${err}`);
                  resolve(err);
                });
            });
            makeThumbs.push(makeThumb);
          });
        }

        if (mediaType === 'video') {
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
                              `Failed to make thumbs with error ${err}`
                            );
                            resolve(err);
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

  function getRatioFromEXIF(mediaPath) {
    return new Promise(function(resolve, reject) {
      getEXIFData(mediaPath)
        .then(exifdata => {
          let mediaRatio;
          mediaRatio = exifdata.height / exifdata.width;
          if (
            exifdata.orientation &&
            (exifdata.orientation === 8 || exifdata.orientation === 6)
          ) {
            dev.log(`Media is portrait. Inverting ratio`);
            mediaRatio = 1 / mediaRatio;
          }
          resolve(mediaRatio);
        })
        .catch(err => reject());
    });
  }

  function getTimestampFromEXIF(mediaPath) {
    return new Promise(function(resolve, reject) {
      getEXIFData(mediaPath)
        .then(exifdata => {
          let ts = _extractImageTimestamp(exifdata);
          dev.logverbose(`TS is ${ts}`);
          resolve(ts);
        })
        .catch(err => reject(err));
    });
  }

  function getEXIFData(mediaPath) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`THUMBS — readEXIFData — for: ${mediaPath}`);

      sharp(mediaPath)
        .metadata()
        .then(exifdata => {
          if (typeof exifdata === 'undefined') {
            reject();
          }
          dev.logverbose(`Gotten metadata.`);
          resolve(exifdata);
        })
        .catch(err => reject(err));
    });
  }

  function removeMediaThumbs(slugFolderName, filename) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `THUMBS — removeMediaThumbs — for slugFolderName = ${slugFolderName}, filename = ${filename}`
      );

      let thumbFolderPath = path.join(settings.thumbFolderName, slugFolderName);
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

          var thumbs = filenames.filter(name => {
            return name.indexOf(filename) === 0;
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

      let thumbName = `${filename}.${thumbRes}${settings.thumbExt}`;
      let thumbPath = path.join(thumbFolderPath, thumbName);
      let fullThumbPath = api.getFolderPath(thumbPath);

      // check first if it exists, resolve if it does
      fs.access(fullThumbPath, fs.F_OK, function(err) {
        // if userDir folder doesn't exist yet at destination
        if (err) {
          dev.log(
            `Missing thumb for ${mediaPath} and resolution = ${thumbRes}, about to create it`
          );
          sharp(mediaPath)
            .rotate()
            .resize(thumbRes, thumbRes)
            .max()
            .withoutEnlargement()
            .withMetadata()
            .toFormat(settings.thumbFormat, {
              quality: settings.mediaThumbQuality
            })
            .background({ r: 255, g: 255, b: 255 })
            .flatten()
            .toFile(fullThumbPath)
            .then(function() {
              resolve(thumbPath);
            })
            .catch(err => reject(err));
        } else {
          resolve(thumbPath);
        }
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
            .on('end', function(files) {
              dev.logverbose(
                `Screenshots were saved : ${JSON.stringify(files, null, 4)}`
              );
              resolve({ screenshotPath, screenshotName });
            })
            .on('error', function(err) {
              dev.error(`ffmpeg failed: ${err.message}`);
              reject(err.message);
            })
            .screenshots({
              count: 1,
              timemarks: ['00:00:00'],
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

  function getMediaDuration(mediaPath) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`getMediaDuration: ${mediaPath}`);
      ffmpeg.ffprobe(mediaPath, function(err, metadata) {
        if (err || typeof metadata === 'undefined') {
          dev.log(`getMediaDuration: PROBE DATA isn’t valid`);
          reject();
        } else {
          dev.log(`PROBE DATA : ${JSON.stringify(metadata, null, 4)}`);
          resolve(metadata.format.duration);
        }
      });
    });
  }

  function getMediaRatio(mediaPath) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`getMediaRatio: ${mediaPath}`);
      ffmpeg.ffprobe(mediaPath, function(err, metadata) {
        if (err || typeof metadata === 'undefined') {
          dev.log(`getMediaRatio: PROBE DATA isn’t valid`);
          reject();
        } else {
          dev.log(`PROBE DATA : ${JSON.stringify(metadata, null, 4)}`);
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
              resolve(ratio);
            }
          }
          reject();
        }
      });
    });
  }

  return API;
})();
