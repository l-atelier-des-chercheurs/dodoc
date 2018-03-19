const path = require('path'),
  fs = require('fs-extra');

const settings = require('../settings.json'),
  dev = require('./dev-log'),
  api = require('./api');

module.exports = (function() {
  return {
    copyWebsiteContent: function({ html, slugFolderName }) {
      return new Promise(function(resolve, reject) {
        // create cache folder that we will need to copy the content
        let cacheFolderName =
          api.getCurrentDate() +
          slugFolderName +
          '-' +
          (Math.random().toString(36) + '00000000000000000').slice(2, 3 + 2);

        let cachePath = path.join(
          global.appRoot,
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
                fs
                  .copy(productionFolder, productionFolderInCache)
                  .then(() => {
                    resolve();
                  })
                  .catch(err => {
                    dev.error(`Failed to copy production JS and CSS files.`);
                    reject(err);
                  });
              })
            );

            // Copie le dossier _thumbs/slugFolderName vers cache/_thumbs/slugFolderName
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

                fs
                  .copy(fullThumbSlugFolderPath, thumbFolderInCache)
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

                fs
                  .copy(fullSlugFolderPath, slugFolderInCache)
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
    }
  };
})();
