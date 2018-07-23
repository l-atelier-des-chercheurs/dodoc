const path = require('path'),
  fs = require('fs-extra');

const settings = require('../settings.json'),
  dev = require('./dev-log'),
  api = require('./api'),
  file = require('./file');

module.exports = (function() {
  return {
    copyWebsiteContent: ({ html, slugFolderName }) => {
      return new Promise(function(resolve, reject) {
        // create cache folder that we will need to copy the content
        let cacheFolderName =
          api.getCurrentDate() +
          slugFolderName +
          '-' +
          (Math.random().toString(36) + '00000000000000000').slice(2, 3 + 2);

        let cachePath = path.join(
          global.tempStorage,
          settings.cacheDirname,
          cacheFolderName
        );

        fs.mkdirp(
          cachePath,
          function() {
            let tasks = [];
            // Générer le html a partir du pug au render, avec une variable qui contient tous les médias.
            tasks.push(
              new Promise((resolve, reject) => {
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
              })
            );

            // Copier les dépendances : bundle.js dans un sous dossier.
            tasks.push(
              new Promise((resolve, reject) => {
                let productionFolder = path.join(
                  global.appRoot,
                  'public',
                  'dist'
                );
                let productionFolderInCache = path.join(cachePath, 'dist');
                fs.copy(productionFolder, productionFolderInCache)
                  .then(() => {
                    resolve();
                  })
                  .catch(err => {
                    dev.error(`Failed to copy production JS and CSS files.`);
                    reject(err);
                  });
              })
            );

            tasks.push(
              new Promise((resolve, reject) => {
                const relativePathToThumbFolder = path.join(
                  settings.thumbFolderName,
                  slugFolderName
                );

                const fullThumbSlugFolderPath = api.getFolderPath(
                  relativePathToThumbFolder
                );
                const thumbFolderInCache = path.join(
                  cachePath,
                  relativePathToThumbFolder
                );

                fs.copy(fullThumbSlugFolderPath, thumbFolderInCache)
                  .then(() => {
                    resolve();
                  })
                  .catch(err => {
                    dev.error(`Failed to copy thumbs JS and CSS.`);
                    reject(err);
                  });
              })
            );

            // Copier tous les médias dans un dossier.
            tasks.push(
              new Promise((resolve, reject) => {
                let fullSlugFolderPath = api.getFolderPath(slugFolderName);
                let slugFolderInCache = path.join(cachePath, slugFolderName);

                fs.copy(fullSlugFolderPath, slugFolderInCache)
                  .then(() => {
                    resolve();
                  })
                  .catch(err => {
                    dev.error(`Failed to copy medias files.`);
                    reject(err);
                  });
              })
            );

            Promise.all(tasks).then(d_array => {
              dev.log('Created complete archive of site.');
              resolve(cachePath);
            });
          },
          function(err, p) {
            dev.error(`Failed to create cache folder: ${err}`);
            reject(err);
          }
        );
      });
    },
    copyPubliContent: ({ html, folders_and_medias, slugPubliName }) => {
      return new Promise(function(resolve, reject) {
        // create cache folder that we will need to copy the content
        let cacheFolderName =
          api.getCurrentDate() +
          '-' +
          slugPubliName +
          '-' +
          (Math.random().toString(36) + '00000000000000000').slice(2, 3 + 2);

        let cachePath = path.join(
          global.tempStorage,
          settings.cacheDirname,
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
                  path.join(settings.thumbFolderName, slugFolderName)
                );
                const slugFolderInCache_thumbs = path.join(
                  cachePath,
                  settings.thumbFolderName,
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
                              const fullPathToThumb = api.getFolderPath(t.path);
                              const fullPathToThumb_cache = path.join(
                                cachePath,
                                t.path
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
                                const fullPathToThumb = api.getFolderPath(
                                  t.path
                                );
                                const fullPathToThumb_cache = path.join(
                                  cachePath,
                                  t.path
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
        const pdfName =
          slugPubliName +
          '-' +
          api.getCurrentDate() +
          '-' +
          (Math.random().toString(36) + '00000000000000000').slice(2, 3 + 2) +
          '.pdf';

        const cachePath = path.join(
          global.tempStorage,
          settings.cacheDirname,
          '_publications'
        );

        const pdfPath = path.join(cachePath, pdfName);

        const urlToPubli = `${
          global.appInfos.homeURL
        }/publication/${slugPubliName}`;

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
                          pdfName,
                          pdfPath
                        });
                      });
                    }
                  );
                }, 1000);
              });
            });
          });
      });
    }
  };
})();
