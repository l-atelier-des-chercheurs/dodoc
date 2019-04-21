const path = require('path'),
  ffmpegstatic = require('ffmpeg-static'),
  ffprobestatic = require('ffprobe-static'),
  ffmpeg = require('fluent-ffmpeg'),
  fs = require('fs-extra'),
  pad = require('pad-left');

const sharp = require('sharp');

const dev = require('./dev-log'),
  api = require('./api'),
  file = require('./file');

ffmpeg.setFfmpegPath(ffmpegstatic.path);
ffmpeg.setFfprobePath(ffprobestatic.path);

module.exports = (function() {
  return {
    loadPublication: (slugPubliName, pageData) =>
      loadPublication(slugPubliName, pageData),

    copyFolderContent: ({ html, folders_and_medias, slugFolderName }) => {
      return new Promise(function(resolve, reject) {
        // create cache folder that we will need to copy the content
        let cacheFolderName =
          api.getCurrentDate() +
          '-' +
          slugFolderName +
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
            let tasks = [];

            const storeHTMLInIndexFile = new Promise((resolve, reject) => {
              let indexCacheFilepath = path.join(cachePath, 'index.html');
              api
                .storeData(indexCacheFilepath, html, 'create')
                .then(function(meta) {
                  resolve();
                })
                .catch(err => {
                  dev.error(`Failed to store HTML for export.`);
                  reject(err);
                });
            });
            tasks.push(storeHTMLInIndexFile);

            ['dist', 'fonts', 'images'].forEach(f => {
              const copyFrontEndFiles = new Promise((resolve, reject) => {
                let productionFolder = path.join(global.appRoot, 'public', f);
                let productionFolderInCache = path.join(cachePath, '_' + f);
                fs.copy(productionFolder, productionFolderInCache)
                  .then(() => {
                    resolve();
                  })
                  .catch(err => {
                    dev.error(`Failed to copy front-end files.`);
                    reject(err);
                  });
              });
              tasks.push(copyFrontEndFiles);
            });

            Object.entries(folders_and_medias).forEach(
              ([slugFolderName, folderMeta]) => {
                const fullSlugFolderPath = api.getFolderPath(slugFolderName);
                const slugFolderInCache = path.join(cachePath, slugFolderName);

                const fullSlugFolderPath_inThumbs = api.getFolderPath(
                  path.join(global.settings.thumbFolderName, slugFolderName)
                );
                const slugFolderInCache_thumbs = path.join(
                  cachePath,
                  global.settings.thumbFolderName,
                  slugFolderName
                );

                Object.entries(folderMeta.medias).forEach(
                  ([metaFileName, mediaMeta]) => {
                    if (mediaMeta.hasOwnProperty('media_filename')) {
                      const media_filename = mediaMeta.media_filename;

                      tasks.push(
                        new Promise((resolve, reject) => {
                          const fullPathToMedia = path.join(
                            fullSlugFolderPath,
                            media_filename
                          );
                          const fullPathToMedia_cache = path.join(
                            slugFolderInCache,
                            media_filename
                          );
                          fs.copy(fullPathToMedia, fullPathToMedia_cache)
                            .then(() => {
                              resolve();
                            })
                            .catch(err => {
                              dev.error(`Failed to copy medias files: ${err}`);
                              reject(err);
                            });
                        })
                      );
                    }
                    if (
                      mediaMeta.hasOwnProperty('thumbs') &&
                      typeof mediaMeta.thumbs !== 'undefined'
                    ) {
                      mediaMeta.thumbs.map(t => {
                        if (t.hasOwnProperty('path')) {
                          tasks.push(
                            new Promise((resolve, reject) => {
                              let thumb_path = t.path;
                              if (thumb_path.indexOf('?') > 0) {
                                thumb_path = thumb_path.substring(
                                  0,
                                  thumb_path.indexOf('?')
                                );
                              }

                              const fullPathToThumb = api.getFolderPath(
                                thumb_path
                              );
                              const fullPathToThumb_cache = path.join(
                                cachePath,
                                thumb_path
                              );

                              fs.copy(fullPathToThumb, fullPathToThumb_cache)
                                .then(() => {
                                  resolve();
                                })
                                .catch(err => {
                                  dev.error(
                                    `Failed to copy thumb files: ${err}`
                                  );
                                  reject(err);
                                });
                            })
                          );
                        } else if (t.hasOwnProperty('thumbsData')) {
                          t.thumbsData.map(t => {
                            tasks.push(
                              new Promise((resolve, reject) => {
                                let thumb_path = t.path;
                                if (thumb_path.indexOf('?') > 0) {
                                  thumb_path = thumb_path.substring(
                                    0,
                                    thumb_path.indexOf('?')
                                  );
                                }

                                const fullPathToThumb = api.getFolderPath(
                                  thumb_path
                                );
                                const fullPathToThumb_cache = path.join(
                                  cachePath,
                                  thumb_path
                                );

                                fs.copy(fullPathToThumb, fullPathToThumb_cache)
                                  .then(() => {
                                    resolve();
                                  })
                                  .catch(err => {
                                    dev.error(
                                      `Failed to copy thumb files: ${err}`
                                    );
                                    reject(err);
                                  });
                              })
                            );
                          });
                        }
                      });
                    }
                  }
                );
              }
            );

            Promise.all(tasks)
              .then(d_array => {
                dev.log('Created complete archive of site.');
                resolve(cachePath);
              })
              .catch(err => {
                dev.error(`Failed to create cache folder: ${err}`);
                reject(err);
              });
          },
          function(err, p) {
            dev.error(`Failed to create cache folder: ${err}`);
            reject(err);
          }
        );
      });
    },
    makePDFForPubli: ({ slugPubliName }) => {
      return new Promise(function(resolve, reject) {
        const urlToPubli = `${
          global.appInfos.homeURL
        }/publication/${slugPubliName}`;

        const pdfName =
          slugPubliName +
          '-' +
          api.getCurrentDate() +
          '-' +
          (Math.random().toString(36) + '00000000000000000').slice(2, 3 + 2) +
          '.pdf';

        const cachePath = path.join(
          global.tempStorage,
          global.settings.cacheDirname,
          '_publications'
        );

        const pdfPath = path.join(cachePath, pdfName);

        file
          .getFolder({
            type: 'publications',
            slugFolderName: slugPubliName
          })
          .then(publiData => {
            publiData = Object.values(publiData)[0];
            fs.mkdirp(cachePath, () => {
              const { BrowserWindow } = require('electron');
              let win = new BrowserWindow({
                width: 800,
                height: 600,
                show: false
              });
              win.loadURL(urlToPubli);

              win.webContents.on('did-finish-load', () => {
                // Use default printing options
                setTimeout(() => {
                  win.webContents.printToPDF(
                    {
                      marginsType: 1,
                      pageSize: {
                        width: publiData.width * 1000,
                        height: publiData.height * 1000
                      }
                    },
                    (error, data) => {
                      if (error) throw error;
                      fs.writeFile(pdfPath, data, error => {
                        if (error) throw error;
                        console.log('Write PDF successful');
                        resolve({
                          pdfName
                        });
                      });
                    }
                  );
                }, 1000);
              });
            });
          });
      });
    },
    makeVideoForPubli: ({ slugPubliName, socket }) => {
      return new Promise(function(resolve, reject) {
        const videoName =
          slugPubliName +
          '-' +
          api.getCurrentDate() +
          '-' +
          (Math.random().toString(36) + '00000000000000000').slice(2, 3 + 2) +
          '.mp4';

        const cachePath = path.join(
          global.tempStorage,
          global.settings.cacheDirname,
          '_publications'
        );

        const videoPath = path.join(cachePath, videoName);

        let type_of_publication = '';

        loadPublication(slugPubliName, {})
          .then(pageData => {
            type_of_publication =
              pageData.publiAndMediaData[slugPubliName].template;
            return _loadMediaFilenameFromPublicationSlugs(
              slugPubliName,
              pageData
            );
          })
          .then(filePathsInOrder => {
            fs.mkdirp(cachePath, function() {
              if (type_of_publication === 'video_assemblage') {
                var ffmpeg_task = new ffmpeg();

                filePathsInOrder.map(vm => {
                  ffmpeg_task.addInput(vm.full_path);
                });

                let time_since_last_report = 0;
                ffmpeg_task
                  .withVideoCodec('libx264')
                  .withVideoBitrate('4000k')
                  .withAudioCodec('libmp3lame')
                  .withAudioBitrate('128k')
                  .toFormat('mp4')
                  .on('progress', progress => {
                    if (+new Date() - time_since_last_report > 3000) {
                      time_since_last_report = +new Date();
                      require('./sockets').notify({
                        socket,
                        not_localized_string: `Creating video: ${
                          progress.timemark
                        }`
                      });
                    }
                  })
                  .on('end', () => {
                    dev.logverbose(`Video has been created`);
                    resolve({ videoName });
                  })
                  .on('error', function(err, stdout, stderr) {
                    ffmpeg_task = null;
                    dev.error('An error happened: ' + err.message);
                    dev.error('ffmpeg standard output:\n' + stdout);
                    dev.error('ffmpeg standard error:\n' + stderr);
                    reject(`couldn't convert a video`);
                  })
                  .mergeToFile(videoPath, cachePath);
              } else if (type_of_publication === 'mix_audio_and_video') {
                // merge audio and video
                // see https://stackoverflow.com/questions/30595594/fluent-ffmpeg-merging-video-and-audio-wrong-frames

                let video_files = filePathsInOrder.filter(
                  f =>
                    f.full_path.toLowerCase().endsWith('.mp4') ||
                    f.full_path.toLowerCase().endsWith('.mov')
                );
                if (video_files.length === 0) {
                  return reject(`No video file`);
                }
                const video_file = video_files[0].full_path;

                let audio_files = filePathsInOrder.filter(
                  f =>
                    f.full_path.toLowerCase().endsWith('.mp3') ||
                    f.full_path.toLowerCase().endsWith('.wav')
                );
                if (audio_files.length === 0) {
                  return reject(`No audio file`);
                }
                const audio_file = audio_files[0].full_path;

                var ffmpeg_task = new ffmpeg();

                let time_since_last_report = 0;
                ffmpeg_task
                  .addInput(video_file)
                  .addInput(audio_file)
                  .addOptions(['-c:v copy', '-c:a aac'])
                  .addOptions(['-map 0:v:0', '-map 1:a:0'])
                  .withVideoCodec('libx264')
                  .withVideoBitrate('4000k')
                  .withAudioCodec('libmp3lame')
                  .withAudioBitrate('128k')
                  .toFormat('mp4')
                  .on('progress', progress => {
                    if (+new Date() - time_since_last_report > 3000) {
                      time_since_last_report = +new Date();
                      require('./sockets').notify({
                        socket,
                        not_localized_string: `Creating video: ${
                          progress.timemark
                        }`
                      });
                    }
                  })
                  .on('end', () => {
                    dev.logverbose(`Video has been created`);
                    resolve({ videoName });
                  })
                  .on('error', function(err, stdout, stderr) {
                    ffmpeg_task = null;
                    dev.error('An error happened: ' + err.message);
                    dev.error('ffmpeg standard output:\n' + stdout);
                    dev.error('ffmpeg standard error:\n' + stderr);
                    reject(`couldn't convert a video`);
                  })
                  .save(videoPath);
              }
            });
          });
      });
    },
    makeVideoFromImagesInPubli: ({ slugPubliName, options, socket }) => {
      return new Promise(function(resolve, reject) {
        const videoName =
          slugPubliName +
          '-' +
          api.getCurrentDate() +
          '-' +
          (Math.random().toString(36) + '00000000000000000').slice(2, 3 + 2) +
          '.mp4';

        const cacheFolderName =
          api.getCurrentDate(global.settings.metaDateFormat) +
          slugPubliName +
          '-' +
          (Math.random().toString(36) + '00000000000000000').slice(2, 3 + 2);

        const cachePath = path.join(
          global.tempStorage,
          global.settings.cacheDirname,
          '_publications'
        );

        const imagesCachePath = path.join(cachePath, cacheFolderName);
        const videoCachePath = path.join(cachePath, videoName);
        let numberOfImagesToProcess = -1;

        const framerate =
          options && options.hasOwnProperty('framerate')
            ? options.framerate
            : 4;

        const video_height =
          options && options.hasOwnProperty('quality') ? options.quality : 640;

        let resolution = {
          width: 0,
          height: video_height
        };

        fs.mkdirp(cachePath, function() {
          fs.mkdirp(
            imagesCachePath,
            function() {
              loadPublication(slugPubliName, {})
                .then(pageData => {
                  let ratio = _getMediaRatioFromFirstFilename(
                    slugPubliName,
                    pageData
                  );

                  if (!ratio) {
                    ratio = 0.75;
                  }

                  const new_width = 2 * Math.round(video_height / ratio / 2);
                  resolution.width = new_width;

                  return _loadMediaFilenameFromPublicationSlugs(
                    slugPubliName,
                    pageData
                  );
                })
                .then(imagesFilePathInOrder => {
                  numberOfImagesToProcess = imagesFilePathInOrder.length;
                  return _prepareImageForStopmotion({
                    imagesFilePathInOrder,
                    cachePath: imagesCachePath,
                    resolution
                  });
                })
                .then(imagesCachePath => {
                  dev.logverbose(`About to create stopmotion`);
                  dev.logverbose(
                    `Size : ${resolution.width}x${resolution.height}`
                  );
                  dev.logverbose(`framerate : ${framerate}`);
                  var proc = new ffmpeg()
                    .input(path.join(imagesCachePath, 'img-%04d.jpeg'))
                    .inputFPS(framerate)
                    .fps(framerate)
                    .withVideoCodec('libx264')
                    .withVideoBitrate('8000k')
                    .addOptions(['-preset slow', '-tune animation'])
                    .addOption(
                      '-vf',
                      `scale=w=${resolution.width}:h=${
                        resolution.height
                      }:force_original_aspect_ratio=1,pad=${resolution.width}:${
                        resolution.height
                      }:(ow-iw)/2:(oh-ih)/2:white`
                    )
                    .noAudio()
                    .size(`${resolution.width}x${resolution.height}`)
                    .toFormat('mp4')
                    .output(videoCachePath)
                    .on('progress', progress => {
                      dev.logverbose(
                        `Processing new stopmotion: image ${
                          progress.frames
                        }/${numberOfImagesToProcess}`
                      );
                      require('./sockets').notify({
                        socket,
                        not_localized_string: `Processing new stopmotion: image ${
                          progress.frames
                        }/${numberOfImagesToProcess}`
                      });
                    })
                    .on('end', () => {
                      dev.logverbose(`Stopmotion has been completed`);
                      return resolve(videoName);
                    })
                    .on('error', function(err, stdout, stderr) {
                      dev.error('An error happened: ' + err.message);
                      dev.error('ffmpeg standard output:\n' + stdout);
                      dev.error('ffmpeg standard error:\n' + stderr);
                      return reject(`couldn't create a stopmotion animation`);
                    })
                    .run();
                })
                .catch(err => {
                  dev.error(`Error : ` + err);
                  reject(err);
                });
            },
            function(err, p) {
              dev.error(`Failed to create cache folder: ${err}`);
              reject(err);
            }
          );
        });
      });
    }
  };

  function loadPublication(slugPubliName, pageData) {
    return new Promise((resolve, reject) => {
      let slugFolderName = slugPubliName;
      let type = 'publications';

      let publi_and_medias = {};

      // get publication
      file
        .getFolder({
          type,
          slugFolderName
        })
        .then(publiData => {
          publi_and_medias = publiData;
          file
            .getMediaMetaNames({
              type,
              slugFolderName
            })
            .then(list_metaFileName => {
              let medias_list = list_metaFileName.map(metaFileName => {
                return {
                  slugFolderName,
                  metaFileName
                };
              });
              file
                .readMediaList({
                  type,
                  medias_list
                })
                .then(publi_medias => {
                  publi_and_medias[slugFolderName].medias =
                    publi_medias[slugFolderName].medias;
                  pageData.publiAndMediaData = publi_and_medias;

                  // we need to get the list of original medias in the publi
                  var list_of_linked_medias = [];

                  Object.entries(publi_medias[slugFolderName].medias).forEach(
                    ([key, value]) => {
                      list_of_linked_medias.push({
                        slugFolderName: value.slugProjectName,
                        metaFileName: value.slugMediaName
                      });
                    }
                  );

                  file
                    .readMediaList({
                      type: 'projects',
                      medias_list: list_of_linked_medias
                    })
                    .then(folders_and_medias => {
                      pageData.folderAndMediaData = folders_and_medias;
                      resolve(pageData);
                    });
                });
            });
        });
    });
  }

  function _loadMediaFilenameFromPublicationSlugs(slugPubliName, pageData) {
    return new Promise((resolve, reject) => {
      // all publimedias name in order are there : pageData.publiAndMediaData['montage'].medias_slugs
      // all publimedias meta : pageData.publiAndMediaData['montage'].medias
      // all actual medias :

      const publiMeta = pageData.publiAndMediaData[slugPubliName];
      const publiMedias = pageData.publiAndMediaData[slugPubliName].medias;

      const mediasNameInOrder = publiMeta.medias_slugs.map(
        item => item.slugMediaName
      );

      const mediasMetaInOrder = mediasNameInOrder
        .filter(n => {
          return publiMedias.hasOwnProperty(n);
        })
        .map(n => publiMedias[n]);

      let mediasAndMetaInOrder = mediasMetaInOrder
        .filter(m => {
          return (
            pageData.folderAndMediaData.hasOwnProperty(m.slugProjectName) &&
            pageData.folderAndMediaData[
              m.slugProjectName
            ].medias.hasOwnProperty(m.slugMediaName)
          );
        })
        .map(m => {
          let videomediameta =
            pageData.folderAndMediaData[m.slugProjectName].medias[
              m.slugMediaName
            ];
          videomediameta.publi_meta = m;
          return videomediameta;
        });

      // return only media_filename
      const mediasFilePathInOrder = mediasAndMetaInOrder.map(vm => {
        const pathToProject = api.getFolderPath(vm.publi_meta.slugProjectName);
        return {
          full_path: path.join(pathToProject, vm.media_filename)
        };
      });

      return resolve(mediasFilePathInOrder);
    });
  }

  function _getMediaRatioFromFirstFilename(slugPubliName, pageData) {
    const publiMeta = pageData.publiAndMediaData[slugPubliName];
    const publiMedias = pageData.publiAndMediaData[slugPubliName].medias;

    const mediasNameInOrder = publiMeta.medias_slugs.map(
      item => item.slugMediaName
    );

    const mediasMetaInOrder = mediasNameInOrder
      .filter(n => {
        return publiMedias.hasOwnProperty(n);
      })
      .map(n => publiMedias[n]);

    let mediasAndMetaInOrder = mediasMetaInOrder
      .filter(m => {
        return (
          pageData.folderAndMediaData.hasOwnProperty(m.slugProjectName) &&
          pageData.folderAndMediaData[m.slugProjectName].medias.hasOwnProperty(
            m.slugMediaName
          )
        );
      })
      .map(m => {
        let videomediameta =
          pageData.folderAndMediaData[m.slugProjectName].medias[
            m.slugMediaName
          ];
        videomediameta.publi_meta = m;
        return videomediameta;
      });

    return mediasAndMetaInOrder[0].ratio;
  }

  function _prepareImageForStopmotion({
    imagesFilePathInOrder,
    cachePath,
    resolution
  }) {
    return new Promise(function(resolve, reject) {
      // let slugStopmotionPath = getFolderPath(
      //   path.join(
      //     global.settings.structure['stopmotions'].path,
      //     slugStopmotionName
      //   )
      // );
      let tasks = [];

      imagesFilePathInOrder.forEach((media, index) => {
        tasks.push(
          new Promise((resolve, reject) => {
            const cache_image_path = path.join(
              cachePath,
              'img-' + pad(index, 4, '0') + '.jpeg'
            );

            fs.copy(media.full_path, cache_image_path)
              .then(() => {
                resolve();
              })
              .catch(err => {
                dev.error(`Failed to copy image to cache with seq name.`);
                reject(err);
              });
          })
        );
      });
      Promise.all(tasks)
        .then(() => resolve(cachePath))
        .catch(err => reject(err));
    });
  }
})();
