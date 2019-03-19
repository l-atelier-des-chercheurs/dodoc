const path = require('path'),
  moment = require('moment'),
  parsedown = require('dodoc-parsedown'),
  fs = require('fs-extra'),
  slugg = require('slugg'),
  os = require('os'),
  writeFileAtomic = require('write-file-atomic'),
  ffmpegstatic = require('ffmpeg-static'),
  ffmpeg = require('fluent-ffmpeg'),
  pad = require('pad-left');

const dev = require('./dev-log');

ffmpeg.setFfmpegPath(ffmpegstatic.path);

module.exports = (function() {
  const API = {
    getFolderPath: (slugFolderName = '') => getFolderPath(slugFolderName),
    findFirstFilenameNotTaken: (thisPath, fileName) =>
      findFirstFilenameNotTaken(thisPath, fileName),
    getCurrentDate: (format = global.settings.metaDateFormat) =>
      getCurrentDate(format),
    convertDate: (date, format = global.settings.metaDateFormat) =>
      convertDate(date, format),
    parseUTCDate: date => parseUTCDate(date),
    parseDate: (date, format = global.settings.metaDateFormat) =>
      parseDate(date, format),
    storeData: (mpath, d, e) => storeData(mpath, d, e),
    parseData: d => parseData(d),
    eventAndContent: (sendEvent, objectJson) =>
      eventAndContent(sendEvent, objectJson),
    sendEventWithContent: (sendEvent, objectContent, io, socket) =>
      sendEventWithContent(sendEvent, objectContent, io, socket),
    getNetworkInfos: () => getNetworkInfos(),
    slug: term => slug(term),
    clip: (value, min, max) => clip(value, min, max),
    decodeBase64Image: dataString => decodeBase64Image(dataString),
    writeAudioToDisk: (slugFolderName, mediaName, dataURL) =>
      writeAudioToDisk(slugFolderName, mediaName, dataURL),
    writeVideoToDisk: (slugFolderName, mediaName, dataURL) =>
      writeVideoToDisk(slugFolderName, mediaName, dataURL),
    makeStopmotionFromImageSequence: d => makeStopmotionFromImageSequence(d)
  };

  function _getUserPath() {
    return global.pathToUserContent;
  }

  function getFolderPath(slugFolderName = '') {
    return path.join(_getUserPath(), slugFolderName);
  }

  function getCurrentDate(f) {
    return moment().format(f);
  }

  function convertDate(date, f) {
    if (moment(date).isValid()) return moment(date).format(f);
    else return '';
  }
  function parseUTCDate(date) {
    return moment.utc(date);
  }

  function parseDate(date, f) {
    if (moment(date, f, true).isValid()) {
      return moment(date, f).format('YYYY-MM-DD HH:mm:ss');
    } else {
      return '';
    }
  }

  // check whether media (such as 'hello-world.mp4') already exists in the folder
  function findFirstFilenameNotTaken(thisPath, fileName) {
    return new Promise(function(resolve, reject) {
      // let's find the extension if it exists
      var fileExtension = new RegExp(
        global.settings.regexpGetFileExtension,
        'i'
      ).exec(fileName);
      fileExtension = fileExtension === null ? '' : fileExtension[0];

      // remove extension
      var fileNameWithoutExtension = new RegExp(
        global.settings.regexpRemoveFileExtension,
        'i'
      ).exec(fileName)[1];
      // slug the rest of the name
      fileNameWithoutExtension = slug(fileNameWithoutExtension);

      let newFileName = `${fileNameWithoutExtension}${fileExtension}`;
      let newMetaFileName = `${newFileName}${global.settings.metaFileext}`;
      let newPathToFile = path.join(thisPath, newFileName);
      let newPathToMeta = path.join(thisPath, newMetaFileName);
      let index = 0;

      dev.logverbose(`2. about to look for existing files.`);
      try {
        // OPTIMIZATION : make an array of filenames instead, and use that as the condition
        while (
          !fs.accessSync(newPathToFile, fs.F_OK) &&
          !fs.accessSync(newPathToMeta, fs.F_OK)
        ) {
          dev.logverbose(
            `- - following path is already taken : newPathToFile = ${newPathToFile} or newPathToMeta = ${newPathToMeta}`
          );
          index++;
          newFileName = `${fileNameWithoutExtension}-${index}${fileExtension}`;
          newMetaFileName = `${newFileName}${global.settings.metaFileext}`;
          newPathToFile = path.join(thisPath, newFileName);
          newPathToMeta = path.join(thisPath, newMetaFileName);
        }
      } catch (err) {
        // no file of this name has been found
      }
      dev.logverbose(`3. this filename is not taken : ${newFileName}`);
      resolve(newFileName);
    });
  }

  function parseData(d) {
    dev.logverbose(`Will parse data`);
    var parsed = parsedown.parse(d);
    return parsed;
  }

  function storeData(mpath, d, e) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — storeData at path ${mpath}`);
      //       dev.logfunction(`with content ${d}`);
      if (typeof d === 'object') {
        d = parsedown.textify(d);
      }
      writeFileAtomic(mpath, d, err => {
        if (err) {
          reject(err);
        }
        resolve(parseData(d));
      });
    });
  }

  function eventAndContent(sendEvent, objectJson) {
    var eventContentJSON = {
      socketevent: sendEvent,
      content: objectJson
    };
    return eventContentJSON;
  }

  function sendEventWithContent(sendEvent, objectContent, io, socket) {
    let eventAndContentJson = eventAndContent(sendEvent, objectContent);
    let eventAndContentJson_string = JSON.stringify(
      eventAndContentJson.socketevent,
      null,
      4
    );
    if (socket) {
      // content sent only to one user
      dev.logpackets(
        `sendEventWithContent for user ${
          socket.id
        } = ${eventAndContentJson_string}`
      );
      socket.emit(
        eventAndContentJson['socketevent'],
        eventAndContentJson['content']
      );
    } else {
      // content broadcasted to all connected users
      dev.logpackets(
        `sendEventWithContent for all users = ${eventAndContentJson_string}`
      );
      io.sockets.emit(
        eventAndContentJson['socketevent'],
        eventAndContentJson['content']
      );
    }
    dev.logpackets(
      `sendEventWithContent — sending packet with content = ${JSON.stringify(
        eventAndContentJson['content'],
        null,
        4
      )}`
    );
    dev.logpackets(
      `eventAndContentJson — sending packet with string length = ${
        JSON.stringify(eventAndContentJson['content']).length
      }`
    );
  }

  // from http://stackoverflow.com/a/8440736
  function getLocalIP() {
    return new Promise(function(resolve, reject) {
      const ifaces = os.networkInterfaces();
      let ip_adresses = {};
      Object.keys(ifaces).forEach(function(ifname) {
        ifaces[ifname].forEach(function(iface) {
          if ('IPv4' === iface.family && iface.internal === false) {
            ip_adresses[ifname] = iface.address;
          }
        });
      });
      resolve(ip_adresses);
    });
  }

  function getNetworkInfos() {
    return new Promise(function(resolve, reject) {
      getLocalIP().then(ip_adresses => {
        resolve({
          ip: Object.values(ip_adresses),
          port: global.appInfos.port
        });
      });
    });
  }

  function slug(term) {
    return slugg(term);
  }

  function clip(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  // http://stackoverflow.com/a/20272545
  function decodeBase64Image(dataString) {
    dev.logfunction(
      `COMMON — decodeBase64Image for dataString.length ${dataString.length}`
    );
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches.length !== 3) {
      dev.error('Error parsing base64 image');
      return new Error('Invalid input string');
    }
    // let response = {};
    // response.type = matches[1];
    // response.data = new Buffer(matches[2], 'base64');
    let response = new Buffer(matches[2], 'base64');
    dev.logverbose(`Just parsed string to bugger`);
    return response;
  }

  function writeAudioToDisk(slugFolderName, mediaName, dataURL) {
    return new Promise(function(resolve, reject) {
      dev.logfunction('COMMON — writeAudioToDisk');
      if (dataURL === undefined) {
        dev.error('No media data content gotten for ' + mediaName);
        reject('No media sent');
      }
      dataURL = dataURL.split(',').pop();
      var fileBuffer = new Buffer(dataURL, 'base64');

      let cachePath = path.join(
        global.tempStorage,
        global.settings.cacheDirname,
        '_medias'
      );
      fs.mkdirp(cachePath, function() {
        let pathToTempMedia = path.join(cachePath, mediaName);

        fs.writeFile(pathToTempMedia, fileBuffer, function(err) {
          if (err) reject(err);

          let pathToMedia = path.join(getFolderPath(slugFolderName), mediaName);
          ffmpeg(pathToTempMedia)
            .audioCodec('libmp3lame')
            .save(pathToMedia)
            .on('end', function() {
              console.log('Processing finished !');
              resolve();
            });
        });
      });
    });
  }

  function writeVideoToDisk(slugFolderName, mediaName, dataURL) {
    return new Promise(function(resolve, reject) {
      dev.logfunction('COMMON — writeVideoToDisk');
      if (dataURL === undefined) {
        dev.error('No media data content gotten for ' + mediaName);
        reject('No media sent');
      }
      dataURL = dataURL.split(',').pop();
      var fileBuffer = new Buffer(dataURL, 'base64');

      let cachePath = path.join(
        global.tempStorage,
        global.settings.cacheDirname,
        '_medias'
      );
      fs.mkdirp(cachePath, function() {
        let pathToMedia = path.join(getFolderPath(slugFolderName), mediaName);
        fs.writeFile(pathToMedia, fileBuffer, function(err) {
          if (err) reject(err);
          resolve();
        });

        // fs.writeFile(pathToTempMedia, fileBuffer, function(err) {
        //   if (err) reject(err);

        //   let pathToMedia = path.join(
        //     getFolderPath(slugFolderName),
        //     mediaName
        //   );
        //   ffmpeg(pathToTempMedia)
        //     .audioCodec('aac')
        //     .videoCodec('libx264')
        //     .format('mp4')
        //     .save(pathToMedia)
        //     .on('end', function() {
        //       console.log('Processing finished !');
        //       resolve();
        //     });
        // });
      });
    });
  }

  function makeStopmotionFromImageSequence({
    slugFolderName,
    pathToMedia,
    images,
    slugStopmotionName,
    frameRate
  }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction('COMMON — makeStopmotionFromImageSequence');

      const numberOfImagesToProcess = images.length;

      _copyToTempAndRenameImages({ slugStopmotionName, images })
        .then(tempFolder => {
          // ask ffmpeg to make a video from the cache images
          var proc = new ffmpeg()
            .input(path.join(tempFolder, 'img-%04d.jpeg'))
            .inputFPS(frameRate)
            .fps(frameRate)
            .withVideoCodec('libx264')
            .withVideoBitrate('8000k')
            .addOptions(['-preset slow', '-tune animation'])
            .noAudio()
            .toFormat('mp4')
            .output(pathToMedia)
            .on('progress', progress => {
              dev.logverbose(
                `Processing new stopmotion: image ${
                  progress.frames
                }/${numberOfImagesToProcess}`
              );
            })
            .on('end', () => {
              dev.logverbose(`Stopmotion has been completed`);
              resolve();
            })
            .on('error', function(err, stdout, stderr) {
              dev.error('An error happened: ' + err.message);
              dev.error('ffmpeg standard output:\n' + stdout);
              dev.error('ffmpeg standard error:\n' + stderr);
              reject(`couldn't create a stopmotion animation`);
            })
            .run();
        })
        .catch(err => reject(err));
    });
  }

  function _copyToTempAndRenameImages({ slugStopmotionName, images }) {
    return new Promise(function(resolve, reject) {
      let cacheFolderName =
        getCurrentDate(global.settings.metaDateFormat) +
        slugStopmotionName +
        '-' +
        (Math.random().toString(36) + '00000000000000000').slice(2, 3 + 2);

      let cachePath = path.join(
        global.tempStorage,
        global.settings.cacheDirname,
        cacheFolderName
      );

      fs.mkdirp(
        cachePath,
        function() {
          let slugStopmotionPath = getFolderPath(
            path.join(
              global.settings.structure['stopmotions'].path,
              slugStopmotionName
            )
          );
          let tasks = [];
          images.forEach((image_filename, index) => {
            tasks.push(
              new Promise((resolve, reject) => {
                const original_image_path = path.join(
                  slugStopmotionPath,
                  image_filename
                );
                const cache_image_path = path.join(
                  cachePath,
                  'img-' + pad(index, 4, '0') + '.jpeg'
                );

                fs.copy(original_image_path, cache_image_path)
                  .then(() => {
                    resolve();
                  })
                  .catch(err => {
                    dev.error(`Failed to copy image to cache with seq name.`);
                    reject(err);
                  });
              })
            );

            Promise.all(tasks)
              .then(() => resolve(cachePath))
              .catch(err => reject(err));
          });
        },
        function(err, p) {
          dev.error(`Failed to create cache folder: ${err}`);
          reject(err);
        }
      );
    });
  }

  return API;
})();
