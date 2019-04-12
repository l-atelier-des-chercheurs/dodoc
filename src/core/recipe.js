const sharp = require('sharp');
const fs = require('fs-extra');

module.exports = (function() {
  return {
    applyRecipe: ({ type, detail }, base_media_path, new_media_path) => {
      return new Promise(function(resolve, reject) {
        if (!type || !detail) {
          return reject(`Missing type or detail to make recipe`);
        }

        if (type === 'rotate_image') {
          sharp(base_media_path)
            .rotate(detail.angle)
            .withMetadata()
            .toBuffer(function(err, buffer) {
              if (err) {
                return reject(err);
              } else {
                fs.writeFile(new_media_path, buffer, function(e) {
                  return resolve();
                });
              }
            });
        } else {
          return reject(`Unknow recipe type`);
        }
      });
    }
  };
})();
