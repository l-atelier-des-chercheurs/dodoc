module.exports = {
  safe: {
    files: [
      {
        expand: true,
        cwd: "lib/",
        src: "index.js",
        dest: "dist/",
        rename: function(dest, src) {
          return dest + 'safe.js';
        }
      }
    ]
  }
};
