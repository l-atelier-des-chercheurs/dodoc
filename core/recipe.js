const sharp = require('sharp');

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
            .toFile(new_media_path, function(err, info) {
              if (err) {
                return reject(err);
              } else {
                return resolve();
              }
            });
        } else {
          return reject(`Unknow recipe type`);
        }
      });
    }
  };
})();
