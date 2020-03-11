const path = require("path"),
  ffmpegstatic = require("ffmpeg-static"),
  ffprobestatic = require("ffprobe-static"),
  ffmpeg = require("fluent-ffmpeg"),
  fs = require("fs-extra"),
  pad = require("pad-left");

const sharp = require("sharp");
sharp.cache(false);

const dev = require("./dev-log"),
  api = require("./api"),
  file = require("./file"),
  thumbs = require("./thumbs");

ffmpeg.setFfmpegPath(ffmpegstatic.path);
ffmpeg.setFfprobePath(ffprobestatic.path);

const renice = 0;

module.exports = (function() {
  return {
    loadPublication: (slugPubliName, pageData) =>
      loadPublication(slugPubliName, pageData),

    copyFolderContent: ({ html, folders_and_medias, slugFolderName }) => {
      return new Promise(function(resolve, reject) {
        // create cache folder that we will need to copy the content
        let cacheFolderName =
          api.getCurrentDate() +
          "-" +
          slugFolderName +
          "-" +
          (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 2);

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
              let indexCacheFilepath = path.join(cachePath, "index.html");
              api
                .storeData(indexCacheFilepath, html, "create")
                .then(function(meta) {
                  resolve();
                })
                .catch(err => {
                  dev.error(`Failed to store HTML for export.`);
                  reject(err);
                });
            });
            tasks.push(storeHTMLInIndexFile);

            ["dist", "fonts", "images", "libs"].forEach(f => {
              const copyFrontEndFiles = new Promise((resolve, reject) => {
                let productionFolder = path.join(global.appRoot, "public", f);
                let productionFolderInCache = path.join(cachePath, "_" + f);
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
                    if (mediaMeta.hasOwnProperty("media_filename")) {
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
                      mediaMeta.hasOwnProperty("thumbs") &&
                      typeof mediaMeta.thumbs !== "undefined"
                    ) {
                      mediaMeta.thumbs.map(t => {
                        if (t.hasOwnProperty("path")) {
                          tasks.push(
                            new Promise((resolve, reject) => {
                              let thumb_path = t.path;
                              if (thumb_path.indexOf("?") > 0) {
                                thumb_path = thumb_path.substring(
                                  0,
                                  thumb_path.indexOf("?")
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
                        } else if (t.hasOwnProperty("thumbsData")) {
                          t.thumbsData.map(t => {
                            tasks.push(
                              new Promise((resolve, reject) => {
                                let thumb_path = t.path;
                                if (thumb_path.indexOf("?") > 0) {
                                  thumb_path = thumb_path.substring(
                                    0,
                                    thumb_path.indexOf("?")
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
                dev.log("Created complete archive of site.");
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
    makePDFForPubli: ({ slugPubliName, options }) => {
      return new Promise(function(resolve, reject) {
        dev.logfunction(
          `EXPORTER — makePDFForPubli with slugPubliName = ${slugPubliName}`
        );

        let urlToPubli = `${global.appInfos.homeURL}/_publications/print/${slugPubliName}`;

        if (options.hasOwnProperty("page_to_export")) {
          urlToPubli += `?page=${options.page_to_export}`;
        }

        const cachePath = path.join(
          global.tempStorage,
          global.settings.cacheDirname,
          "_publications"
        );

        file
          .getFolder({
            type: "publications",
            slugFolderName: slugPubliName
          })
          .then(publiData => {
            publiData = Object.values(publiData)[0];
            fs.mkdirp(cachePath, () => {
              dev.logverbose(
                `EXPORTER — makePDFForPubli : created cache folder at path ${cachePath}`
              );

              const { BrowserWindow } = require("electron");

              let win = new BrowserWindow({
                // width: 800,
                // height: 600,
                width: Math.floor(publiData.width * 3.78),
                height: Math.floor(publiData.height * 3.78) + 25, // totally arbitrary value… will have to find better
                show: false
              });
              win.loadURL(urlToPubli);

              win.webContents.on("did-finish-load", () => {
                // Use default printing options
                setTimeout(() => {
                  if (
                    !options ||
                    !options.hasOwnProperty("type") ||
                    options.type.toLowerCase() === "pdf"
                  ) {
                    const pdfName =
                      slugPubliName +
                      "-" +
                      api.getCurrentDate() +
                      "-" +
                      (Math.random().toString(36) + "00000000000000000").slice(
                        2,
                        3 + 2
                      ) +
                      ".pdf";
                    const docPath = path.join(cachePath, pdfName);

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
                        fs.writeFile(docPath, data, error => {
                          if (error) throw error;

                          dev.logverbose(
                            `EXPORTER — makePDFForPubli : created PDF at ${docPath}`
                          );

                          resolve({
                            pdfName,
                            docPath
                          });
                        });
                      }
                    );
                  } else if (options.type.toLowerCase() === "png") {
                    const imageName =
                      slugPubliName +
                      "-" +
                      api.getCurrentDate() +
                      "-" +
                      (Math.random().toString(36) + "00000000000000000").slice(
                        2,
                        3 + 2
                      ) +
                      ".png";
                    const docPath = path.join(cachePath, imageName);

                    win.capturePage(image => {
                      fs.writeFile(docPath, image.toPNG(), error => {
                        if (error) throw error;
                        dev.logverbose(
                          `EXPORTER — makePDFForPubli : created image at ${docPath}`
                        );

                        resolve({
                          docPath,
                          imageName
                        });
                      });
                    });
                  }
                }, 1000);
              });
            });
          });
      });
    },
    makeVideoForPubli: ({ slugPubliName, socket, options }) => {
      return new Promise(function(resolve, reject) {
        const videoName =
          slugPubliName +
          "-" +
          api.getCurrentDate() +
          "-" +
          (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 2) +
          ".mp4";

        const cachePath = path.join(
          global.tempStorage,
          global.settings.cacheDirname,
          "_publications"
        );

        let publication_meta = "";

        let resolution = {
          width: 1280,
          height: 720
        };
        if (options.hasOwnProperty("resolution")) {
          if (options.resolution.hasOwnProperty("width"))
            resolution.width = options.resolution.width;
          if (options.resolution.hasOwnProperty("height"))
            resolution.height = options.resolution.height;
        }

        let bitrate = options.hasOwnProperty("bitrate")
          ? options.bitrate
          : "6000k";

        loadPublication(slugPubliName, {})
          .then(pageData => {
            publication_meta = pageData.publiAndMediaData[slugPubliName];
            return _loadMediaFilenameFromPublicationSlugs(
              slugPubliName,
              pageData
            );
          })
          .then(medias_with_original_filepath => {
            fs.mkdirp(cachePath, function() {
              if (publication_meta.template === "video_assemblage") {
                _makeVideoAssemblage({
                  medias_with_original_filepath,
                  cachePath,
                  videoName,
                  resolution,
                  bitrate,
                  socket
                })
                  .then(() => {
                    return resolve(videoName);
                  })
                  .catch(err => {
                    return reject(err.message);
                  });
              } else if (publication_meta.template === "mix_audio_and_video") {
                // merge audio and video
                // see https://stackoverflow.com/questions/30595594/fluent-ffmpeg-merging-video-and-audio-wrong-frames
                _mixAudioAndVideo({
                  medias_with_original_filepath,
                  cachePath,
                  videoName,
                  socket
                })
                  .then(() => {
                    return resolve(videoName);
                  })
                  .catch(err => {
                    return reject(`${err}`);
                  });
              } else if (publication_meta.template === "mix_audio_and_image") {
                // merge audio and image
                _mixAudioAndImage({
                  medias_with_original_filepath,
                  cachePath,
                  videoName,
                  socket
                })
                  .then(() => {
                    return resolve(videoName);
                  })
                  .catch(err => {
                    return reject(`Failed to make a video: ${err}`);
                  });
              } else if (publication_meta.template === "video_effects") {
                if (!publication_meta.effects)
                  return reject("Missing effects field");

                _applyVideoEffects({
                  medias_with_original_filepath,
                  effects: publication_meta.effects,
                  cachePath,
                  videoName,
                  resolution,
                  bitrate,
                  socket
                })
                  .then(() => {
                    return resolve(videoName);
                  })
                  .catch(err => {
                    return reject(err.message);
                  });
              }
            });
          });
      });
    },

    // merger avec makeVideoForPubli // à terme
    makeVideoFromImagesInPubli: ({ slugPubliName, options, socket }) => {
      return new Promise(function(resolve, reject) {
        const videoName =
          slugPubliName +
          "-" +
          api.getCurrentDate() +
          "-" +
          (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 2) +
          ".mp4";

        const cacheFolderName =
          api.getCurrentDate(global.settings.metaDateFormat) +
          slugPubliName +
          "-" +
          (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 2);

        const cachePath = path.join(
          global.tempStorage,
          global.settings.cacheDirname,
          "_publications"
        );

        const imagesCachePath = path.join(cachePath, cacheFolderName);
        const videoCachePath = path.join(cachePath, videoName);
        let numberOfImagesToProcess = -1;

        const framerate =
          options && options.hasOwnProperty("framerate")
            ? options.framerate
            : 4;

        const video_height =
          options && options.hasOwnProperty("quality") ? options.quality : 640;

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

                  return _prepareImagesForStopmotion({
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
                  dev.logverbose(
                    `duration : ${numberOfImagesToProcess / framerate}`
                  );
                  const ffmpeg_cmd = new ffmpeg()
                    .renice(renice)
                    .input(path.join(imagesCachePath, "img-%04d.jpeg"))
                    .inputFPS(framerate)
                    .withVideoCodec("libx264")
                    .withVideoBitrate("4000k")
                    .input("anullsrc")
                    .inputFormat("lavfi")
                    .duration(numberOfImagesToProcess / framerate)
                    .size(`${resolution.width}x${resolution.height}`)
                    .outputFPS(30)
                    .autopad()
                    .addOptions(["-preset slow", "-tune animation"])
                    .toFormat("mp4")
                    .on("start", function(commandLine) {
                      dev.logverbose(
                        "Spawned Ffmpeg with command: \n" + commandLine
                      );
                    })
                    .on("progress", progress => {
                      _notifyFfmpegProgress({ socket, progress });
                    })
                    .on("end", () => {
                      dev.logverbose(`Stopmotion has been completed`);
                      return resolve(videoName);
                    })
                    .on("error", function(err, stdout, stderr) {
                      dev.error("An error happened: " + err.message);
                      dev.error("ffmpeg standard output:\n" + stdout);
                      dev.error("ffmpeg standard error:\n" + stderr);
                      return reject(error);
                    })
                    .save(videoCachePath);
                  global.ffmpeg_processes.push(ffmpeg_cmd);
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
      dev.logfunction(
        `EXPORTER — loadPublication with slugPubliName = ${slugPubliName}`
      );

      let slugFolderName = slugPubliName;
      let type = "publications";

      let publi_and_medias = {};

      // get publication
      file
        .getFolder({
          type,
          slugFolderName
        })
        .then(publiData => {
          publi_and_medias = publiData;
          pageData.pageTitle = publi_and_medias[slugFolderName].name;
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
                      type: "projects",
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
      dev.logfunction(
        `EXPORTER — _loadMediaFilenameFromPublicationSlugs with slugPubliName = ${slugPubliName}`
      );

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
            ].medias.hasOwnProperty(m.slugMediaName) &&
            !pageData.folderAndMediaData[m.slugProjectName].medias[
              m.slugMediaName
            ].hasOwnProperty("_isAbsent")
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
      const medias_with_original_filepath = mediasAndMetaInOrder.map(m => {
        const pathToProject = api.getFolderPath(m.publi_meta.slugProjectName);
        m.full_path = path.join(pathToProject, m.media_filename);
        return m;
      });

      return resolve(medias_with_original_filepath);
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

  function _prepareImagesForStopmotion({
    imagesFilePathInOrder,
    cachePath,
    resolution
  }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `EXPORTER — _prepareImagesForStopmotion ${JSON.stringify(
          resolution,
          null,
          4
        )}`
      );
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
              "img-" + pad(index, 4, "0") + ".jpeg"
            );

            // if image is something else than a jpg/jpeg, then use sharp to convert it

            let media_file_ext = new RegExp(
              global.settings.regexpGetFileExtension,
              "i"
            ).exec(media.full_path)[0];

            // if (
            //   media_file_ext.toLowerCase() === '.jpeg' ||
            //   media_file_ext.toLowerCase() === '.jpg'
            // ) {
            //   fs.copy(media.full_path, cache_image_path)
            //     .then(() => {
            //       resolve();
            //     })
            //     .catch(err => {
            //       dev.error(`Failed to copy image to cache with seq name.`);
            //       reject(err);
            //     });
            // } else {
            sharp(media.full_path)
              .rotate()
              .resize(resolution.width, resolution.height, {
                fit: "contain",
                withoutEnlargement: false,
                background: "black"
              })
              .flatten()
              .withMetadata()
              .toFile(cache_image_path)
              .then(() => resolve())
              .catch(err => {
                dev.error(
                  `Failed to sharp create image to cache with seq name.`
                );
                reject(err);
              });
            // }
          })
        );
      });
      Promise.all(tasks)
        .then(() => resolve(cachePath))
        .catch(err => reject(err));
    });
  }

  function _applyVideoEffects({
    medias_with_original_filepath,
    effects,
    cachePath,
    videoName,
    resolution,
    bitrate,
    socket
  }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction("EXPORTER — _makeVideoAssemblage");

      const videoPath = path.join(cachePath, videoName);
      const vm = medias_with_original_filepath[0];

      ffmpeg.ffprobe(vm.full_path, function(err, metadata) {
        const ffmpeg_cmd = new ffmpeg().renice(renice);

        ffmpeg_cmd.input(vm.full_path);

        // if (vm.duration) {
        //   ffmpeg_cmd.duration(vm.duration);
        // }

        // check if has audio track or not
        if (
          !err &&
          metadata &&
          metadata.streams.filter(s => s.codec_type === "audio").length === 0
        ) {
          ffmpeg_cmd.input("anullsrc").inputFormat("lavfi");
        }

        let temp_video_volume;
        if (vm.type === "video" && vm.publi_meta.hasOwnProperty("volume"))
          temp_video_volume = vm.publi_meta.volume / 100;

        if (temp_video_volume)
          ffmpeg_cmd.addOptions(["-af volume=" + temp_video_volume]);
        // We may need apad at this point, but it conflicts with the reverse effect.
        // please post on github with the video file if you get audio error with this recipe (and read this message…)

        let complexFilters = [
          {
            filter: "scale",
            options: `${resolution.width}:${resolution.height}:force_original_aspect_ratio=1`,
            // inputs: "[0]",
            outputs: "scaled"
          },
          {
            filter: "setsar=sar",
            options: 1,
            inputs: "scaled",
            outputs: "aspect"
          },
          {
            filter: "pad",
            options: `${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2`,
            inputs: "aspect",
            outputs: "output"
          }
        ];

        // just handle a single effect for now — will handle multiple simultaneous effects at once later
        const effect = effects[0];

        if (effect.type === "black_and_white") {
          complexFilters.push({
            filter: "hue",
            options: "s=0",
            inputs: "output",
            outputs: "output"
          });
          ffmpeg_cmd.withAudioCodec("copy");
        } else if (effect.type === "colored_filter") {
          if (
            !!effect.color &&
            typeof effect.color === "string" &&
            effect.color.startsWith("#")
          ) {
            ffmpeg_cmd
              .input(
                `color=${effect.color}:s=${resolution.width}x${resolution.height}`
              )
              .inputFormat("lavfi");
            complexFilters.push({
              filter: "blend=shortest=1:all_mode=overlay:all_opacity=1",
              inputs: "output",
              outputs: "output"
            });
            // .complexFilter(["color[c];[0:v][c]overlay=shortest=1"]);
            ffmpeg_cmd.withAudioCodec("copy");
          } else {
            reject(
              `Failed to create video for filter: color is not set correctly`
            );
          }
        } else if (effect.type === "reverse") {
          complexFilters.push(
            {
              filter: "reverse",
              inputs: "output",
              outputs: "output"
            },
            {
              filter: "areverse"
            }
          );
          ffmpeg_cmd.withAudioCodec("aac").withAudioBitrate("128k");
        } else if (effect.type === "slow_down" || effect.type === "speed_up") {
          if (!isNaN(effect.speed)) {
            complexFilters.push(
              {
                filter: "setpts",
                options: `${1 / effect.speed}\*PTS`,
                inputs: "output",
                outputs: "output"
              },
              {
                filter: "atempo",
                options: effect.speed
              }
            );
            ffmpeg_cmd.withAudioCodec("aac").withAudioBitrate("128k");
          } else {
            reject(
              `Failed to create video for filter: speed is not set correctly`
            );
          }
        } else if (effect.type === "rotate") {
          if (effect.rotation === "1" || effect.rotation === "2") {
            complexFilters.push({
              filter: "transpose",
              options: effect.rotation,
              inputs: "output",
              outputs: "output"
            });
            ffmpeg_cmd.withAudioCodec("copy");
          } else {
            reject(
              `Failed to create video for filter: flip is not set correctly`
            );
          }
        } else if (effect.type === "mirror") {
          if (
            effect.flip === "hflip" ||
            effect.flip === "vflip" ||
            effect.flip === "hflip, vflip"
          ) {
            complexFilters.push({
              filter: effect.flip,
              inputs: "output",
              outputs: "output"
            });
            ffmpeg_cmd.withAudioCodec("copy");
          } else {
            reject(
              `Failed to create video for filter: flip is not set correctly`
            );
          }
        }

        ffmpeg_cmd
          .native()
          .outputFPS(30)
          .withVideoCodec("libx264")
          .withVideoBitrate(bitrate)
          .complexFilter(complexFilters, "output")
          .addOptions(["-crf 22", "-preset fast", "-shortest"])
          .toFormat("mp4")
          .output(videoPath)
          .on("start", function(commandLine) {
            dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
          })
          .on("progress", progress => {
            _notifyFfmpegProgress({ socket, progress });
          })
          .on("end", () => {
            return resolve(videoPath);
          })
          .on("error", function(err, stdout, stderr) {
            dev.error("An error happened: " + err.message);
            dev.error("ffmpeg standard output:\n" + stdout);
            dev.error("ffmpeg standard error:\n" + stderr);
            throw err;
          })
          .run();

        global.ffmpeg_processes.push(ffmpeg_cmd);
      });
    });
  }

  function _makeVideoAssemblage({
    medias_with_original_filepath,
    cachePath,
    videoName,
    resolution,
    bitrate,
    socket
  }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction("EXPORTER — _makeVideoAssemblage");

      const videoPath = path.join(cachePath, videoName);

      let media_files_to_process = medias_with_original_filepath.filter(m =>
        ["video", "image"].includes(m.type)
      );
      if (media_files_to_process.length === 0)
        return reject(`No files to process`);

      let tasks = [];

      // tasks.push(new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     return reject(err);
      //   }, 1500);
      // });
      //

      let temp_videos_array = [];
      let index = 0;

      const executeSequentially = media_files_to_process => {
        const vm = media_files_to_process.shift();
        if (vm.type === "video") {
          return _prepareVideoForMontageAndWeb({
            vm,
            cachePath,
            resolution,
            bitrate,
            socket
          })
            .then(temp_video_path => {
              require("./sockets").notify({
                socket,
                localized_string: `preparing_video_from_montage`,
                not_localized_string: `
              ${index + 1}/${index + media_files_to_process.length + 1}
              `
              });

              index++;
              temp_videos_array.push({ full_path: temp_video_path });

              return media_files_to_process.length == 0
                ? ""
                : executeSequentially(media_files_to_process);
            })
            .catch(err => {
              return err;
            });
        } else if (vm.type === "image") {
          return _prepareImageForMontageAndWeb({
            vm,
            cachePath,
            resolution,
            bitrate,
            socket
          })
            .then(temp_video_path => {
              require("./sockets").notify({
                socket,
                localized_string: `preparing_video_from_montage`,
                not_localized_string: `
              ${index + 1}/${index + media_files_to_process.length + 1}
              `
              });

              index++;
              temp_videos_array.push({ full_path: temp_video_path });

              return media_files_to_process.length == 0
                ? ""
                : executeSequentially(media_files_to_process);
            })
            .catch(err => {
              return err;
            });
        }
      };

      executeSequentially(media_files_to_process).then(err => {
        if (err) return reject(err);

        dev.logverbose(
          `EXPORTER — _makeVideoAssemblage : finished preparing videos`
        );

        const ffmpeg_cmd = new ffmpeg().renice(renice);

        temp_videos_array.map(v => ffmpeg_cmd.addInput(v.full_path));

        ffmpeg_cmd.withVideoBitrate(bitrate);

        // let time_since_last_report = 0;
        ffmpeg_cmd
          // .complexFilter(['gltransition'])
          .on("start", function(commandLine) {
            dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
          })
          .on("progress", progress => {
            _notifyFfmpegProgress({ socket, progress });

            // if (+new Date() - time_since_last_report > 3000) {
            //   time_since_last_report = +new Date();
            //   require('./sockets').notify({
            //     socket,
            //     localized_string: `creating_video`,
            //     not_localized_string: progress.timemark
            //   });
            // }
          })
          .on("end", () => {
            dev.logverbose(`Video has been created`);
            return resolve();
          })
          .on("error", function(err, stdout, stderr) {
            dev.error("An error happened: " + err.message);
            dev.error("ffmpeg standard output:\n" + stdout);
            dev.error("ffmpeg standard error:\n" + stderr);
            return reject(err);
          })
          .mergeToFile(videoPath, cachePath);

        global.ffmpeg_processes.push(ffmpeg_cmd);

        // does not work that well with -f concat
        // reconverting with mergeToFile might seem overkill but yields much much better results
      });
    });
  }

  function _mixAudioAndVideo({
    medias_with_original_filepath,
    cachePath,
    videoName,
    socket
  }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction("EXPORTER — _mixAudioAndVideo");

      const videoPath = path.join(cachePath, videoName);
      let ffmpeg_cmd = new ffmpeg().renice(renice);

      let video_files = medias_with_original_filepath.filter(
        m => m.type === "video"
      );
      if (video_files.length === 0) return reject(`No video file`);
      const video_file_path = video_files[0].full_path;
      ffmpeg_cmd.addInput(video_file_path);

      let audio_files = medias_with_original_filepath.filter(
        m => m.type === "audio"
      );
      if (audio_files.length === 0) return reject(`No audio file`);
      const audio_file_path = audio_files[0].full_path;
      ffmpeg_cmd.addInput(audio_file_path);

      function findLongestMediaDuration(ms) {
        if (
          ms.filter(m => {
            !m.hasOwnProperty("duration");
          }).length > 0
        ) {
          return false;
        }

        const durations = ms.map(m => {
          return m.duration;
        });
        return Math.max(...durations);
      }

      const duration = findLongestMediaDuration(
        [].concat(audio_files[0]).concat(video_files[0])
      );
      if (duration) {
        dev.logverbose("Setting output to duration: " + duration);
        ffmpeg_cmd.duration(duration);
      }

      let time_since_last_report = 0;

      ffmpeg_cmd
        // .withVideoCodec('copy')
        .withVideoCodec("libx264")
        .withVideoBitrate("4000k")
        .withAudioCodec("aac")
        .withAudioBitrate("128k")
        .addOptions(["-map 0:v:0", "-map 1:a:0"])
        .toFormat("mp4")
        .on("start", function(commandLine) {
          dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
        })
        .on("progress", progress => {
          _notifyFfmpegProgress({ socket, progress });
        })
        .on("end", () => {
          dev.logverbose(`Video has been created`);
          return resolve();
        })
        .on("error", function(err, stdout, stderr) {
          dev.error("An error happened: " + err.message);
          dev.error("ffmpeg standard output:\n" + stdout);
          dev.error("ffmpeg standard error:\n" + stderr);
          return reject(`Couldn't convert a video : ${err.message}`);
        })
        .save(videoPath);
      global.ffmpeg_processes.push(ffmpeg_cmd);
    });
  }

  function _mixAudioAndImage({
    medias_with_original_filepath,
    cachePath,
    videoName,
    socket
  }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction("EXPORTER — _mixAudioAndImage");

      const videoPath = path.join(cachePath, videoName);
      const ffmpeg_cmd = new ffmpeg().renice(renice);

      let image_files = medias_with_original_filepath.filter(
        m => m.type === "image"
      );
      if (image_files.length === 0) return reject(`No image file`);
      const image_file_path = image_files[0].full_path;
      ffmpeg_cmd.addInput(image_file_path).loop();

      let audio_files = medias_with_original_filepath.filter(
        m => m.type === "audio"
      );
      if (audio_files.length === 0) return reject(`No audio file`);
      const audio_file_path = audio_files[0].full_path;
      ffmpeg_cmd.addInput(audio_file_path);

      let time_since_last_report = 0;

      let resolution = _calculateResolutionAccordingToRatio(
        image_files[0].ratio
      );

      dev.logverbose(
        `About to create a speaking picture with resolution = ${JSON.stringify(
          resolution
        )}`
      );

      ffmpeg_cmd
        .withVideoCodec("libx264")
        .withVideoBitrate("4000k")
        .addOptions(["-shortest"])
        .withAudioCodec("aac")
        .withAudioBitrate("128k")
        .videoFilters(
          `scale=w=${resolution.width}:h=${resolution.height}:force_original_aspect_ratio=increase`
        )
        .outputFPS(30)
        .toFormat("mp4")
        .on("start", function(commandLine) {
          dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
        })
        .on("progress", progress => {
          _notifyFfmpegProgress({ socket, progress });
        })
        .on("end", () => {
          dev.logverbose(`Video has been created`);
          return resolve();
        })
        .on("error", function(err, stdout, stderr) {
          dev.error("An error happened: " + err.message);
          dev.error("ffmpeg standard output:\n" + stdout);
          dev.error("ffmpeg standard error:\n" + stderr);
          return reject(`Couldn't convert a video : ${err.message}`);
        })
        .save(videoPath);
      global.ffmpeg_processes.push(ffmpeg_cmd);
    });
  }

  function _prepareVideoForMontageAndWeb({
    vm,
    cachePath,
    resolution,
    bitrate,
    socket
  }) {
    return new Promise(function(resolve, reject) {
      // used to process videos / images before merging them

      dev.logfunction("EXPORTER — _prepareVideoForMontageAndWeb");

      let temp_video_name =
        vm.media_filename +
        "_res=" +
        resolution.width +
        "x" +
        resolution.height +
        "_br=" +
        bitrate +
        ".ts";
      let temp_video_duration;
      let temp_video_volume;

      if (vm.type === "image") {
        // insert duration in filename to make sure the cache uses the right version
        if (vm.publi_meta.hasOwnProperty("duration")) {
          temp_video_duration = vm.publi_meta.duration;
        } else {
          temp_video_duration = 1;
        }
        temp_video_name =
          vm.media_filename +
          "_dur=" +
          temp_video_duration +
          "_res=" +
          resolution.width +
          "x" +
          resolution.height +
          "_br=" +
          bitrate +
          ".ts";
      }

      if (vm.type === "video" && vm.publi_meta.hasOwnProperty("volume")) {
        temp_video_volume = vm.publi_meta.volume / 100;
        temp_video_name =
          vm.media_filename +
          "_volume=" +
          temp_video_volume +
          "_res=" +
          resolution.width +
          "x" +
          resolution.height +
          "_br=" +
          bitrate +
          ".ts";
      }

      const temp_video_path = path.join(cachePath, temp_video_name);

      fs.access(temp_video_path, fs.F_OK, function(err) {
        if (err) {
          ffmpeg.ffprobe(vm.full_path, function(err, metadata) {
            const ffmpeg_cmd = new ffmpeg().renice(renice);

            ffmpeg_cmd.input(vm.full_path);

            if (vm.type === "image" && temp_video_duration) {
              ffmpeg_cmd.duration(temp_video_duration).loop();
            } else if (vm.duration) {
              dev.logverbose("Setting output to duration: " + vm.duration);
              ffmpeg_cmd.duration(vm.duration);
            }

            // check if has audio track or not
            if (
              !err &&
              metadata &&
              metadata.streams.filter(s => s.codec_type === "audio").length ===
                0
            ) {
              ffmpeg_cmd.input("anullsrc").inputFormat("lavfi");
            }

            if (temp_video_volume) {
              ffmpeg_cmd.addOptions([
                "-af volume=" + temp_video_volume + ",apad"
              ]);
            } else {
              ffmpeg_cmd.addOptions(["-af apad"]);
            }

            ffmpeg_cmd
              .native()
              .outputFPS(30)
              .withVideoCodec("libx264")
              .withVideoBitrate(bitrate)
              .withAudioCodec("aac")
              .withAudioBitrate("128k")
              .videoFilter([
                `scale=w=${resolution.width}:h=${resolution.height}:force_original_aspect_ratio=1,pad=${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2`
              ])
              .addOptions([
                "-crf 22",
                "-preset fast",
                "-shortest",
                "-bsf:v h264_mp4toannexb"
              ])
              .videoFilter(["setsar=1/1"])
              .toFormat("mpegts")
              .output(temp_video_path)
              .on("start", function(commandLine) {
                dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
              })
              .on("progress", progress => {
                _notifyFfmpegProgress({ socket, progress });
              })
              .on("end", () => {
                return resolve(temp_video_path);
              })
              .on("error", function(err, stdout, stderr) {
                dev.error("An error happened: " + err.message);
                dev.error("ffmpeg standard output:\n" + stdout);
                dev.error("ffmpeg standard error:\n" + stderr);
                throw err;
              })
              .run();
            global.ffmpeg_processes.push(ffmpeg_cmd);
          });
        } else {
          return resolve(temp_video_path);
        }
      });
    });
  }

  function _prepareImageForMontageAndWeb({
    vm,
    cachePath,
    resolution,
    bitrate,
    socket
  }) {
    return new Promise(function(resolve, reject) {
      // used to process videos / images before merging them

      dev.logfunction("EXPORTER — _prepareImageForMontageAndWeb");

      let temp_image_name = vm.media_filename + ".jpeg";
      let temp_video_name = vm.media_filename + ".ts";
      let temp_video_duration;
      let temp_video_volume;

      // insert duration in filename to make sure the cache uses the right version
      if (vm.publi_meta.hasOwnProperty("duration")) {
        temp_video_duration = vm.publi_meta.duration;
      } else {
        temp_video_duration = 1;
      }
      temp_video_name =
        vm.media_filename +
        "_dur=" +
        temp_video_duration +
        "_res=" +
        resolution.width +
        "x" +
        resolution.height +
        "_br=" +
        bitrate +
        ".ts";

      const temp_video_path = path.join(cachePath, temp_video_name);
      const temp_image_path = path.join(cachePath, temp_image_name);

      dev.logverbose(
        `EXPORTER — _prepareImageForMontageAndWeb: will store temp image in ${temp_image_path}`
      );
      dev.logverbose(
        `EXPORTER — _prepareImageForMontageAndWeb: will store temp video in ${temp_video_path}`
      );

      fs.access(temp_video_path, fs.F_OK, function(err) {
        if (err) {
          sharp(vm.full_path)
            .rotate()
            .resize(resolution.width, resolution.height, {
              fit: "contain",
              withoutEnlargement: false,
              background: "black"
            })
            .flatten()
            .withMetadata()
            .toFile(temp_image_path)
            .then(() => {
              dev.logverbose(
                `EXPORTER — _prepareImageForMontageAndWeb: created temp image`
              );
              const ffmpeg_cmd = new ffmpeg().renice(renice);

              ffmpeg_cmd.input(temp_image_path);

              ffmpeg_cmd.duration(temp_video_duration).loop();

              ffmpeg_cmd
                .input("anullsrc")
                .inputFormat("lavfi")
                .native()
                .outputFPS(30)
                .withVideoCodec("libx264")
                .withVideoBitrate(bitrate)
                .withAudioCodec("aac")
                .withAudioBitrate("128k")
                .addOptions(["-af apad"])
                .size(`${resolution.width}x${resolution.height}`)
                .autopad()
                .videoFilter(["setsar=1/1"])
                .addOptions(["-shortest", "-bsf:v h264_mp4toannexb"])
                .toFormat("mpegts")
                .output(temp_video_path)
                .on("start", function(commandLine) {
                  dev.logverbose(
                    "Spawned Ffmpeg with command: \n" + commandLine
                  );
                })
                .on("progress", progress => {
                  _notifyFfmpegProgress({ socket, progress });
                })
                .on("end", () => {
                  return resolve(temp_video_path);
                })
                .on("error", function(err, stdout, stderr) {
                  dev.error("An error happened: " + err.message);
                  dev.error("ffmpeg standard output:\n" + stdout);
                  dev.error("ffmpeg standard error:\n" + stderr);
                  throw err;
                })
                .run();
              global.ffmpeg_processes.push(ffmpeg_cmd);
            })
            .catch(err => {
              dev.error(`Failed to sharp create image for montage.`);
              reject(err);
            });
        } else {
          return resolve(temp_video_path);
        }
      });
    });
  }

  function _calculateResolutionAccordingToRatio(ratio) {
    let default_video_height = 720;
    let resolution = {
      width: 0,
      height: default_video_height
    };

    if (!ratio) {
      ratio = 0.75;
    }

    const new_width = 2 * Math.round(default_video_height / ratio / 2);
    resolution.width = new_width;

    return resolution;
  }

  function _notifyFfmpegProgress({ socket, progress }) {
    let not_localized_string;
    if (
      progress.hasOwnProperty("percent") &&
      !Number.isNaN(progress.percent) &&
      Number.parseFloat(progress.percent) >= 0
    ) {
      not_localized_string =
        Number.parseFloat(progress.percent).toFixed(1) + "%";
    } else if (progress.hasOwnProperty("timemark")) {
      not_localized_string = progress.timemark;
    }

    if (not_localized_string) {
      require("./sockets").notify({
        socket,
        localized_string: `creating_video`,
        not_localized_string
      });
    } else {
      require("./sockets").notify({
        socket,
        localized_string: `creating_video`
      });
    }

    console.log(`FFMPEG PROCESS • exporter: ${not_localized_string}`);
  }
})();
