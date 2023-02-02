const path = require("path");

const utils = require("./utils");

module.exports = (function () {
  const API = {
    createStopmotionForCapture: ({}) => {
      // const ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
      //   .input(path.join(imagesCachePath, "img-%04d.jpeg"))
      //   .inputFPS(framerate)
      //   .withVideoCodec("libx264")
      //   .withVideoBitrate("4000k")
      //   .input("anullsrc")
      //   .inputFormat("lavfi")
      //   .duration(numberOfImagesToProcess / framerate)
      //   .size(`${resolution.width}x${resolution.height}`)
      //   .outputFPS(30)
      //   .autopad()
      //   .addOptions(["-preset slow", "-tune animation"])
      //   .toFormat("mp4")
      //   .on("start", function (commandLine) {
      //     dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
      //   })
      //   .on("progress", (progress) => {
      //     _notifyFfmpegProgress({ socket, progress });
      //   })
      //   .on("end", () => {
      //     dev.logverbose(`Stopmotion has been completed`);
      //     return resolve(videoName);
      //   })
      //   .on("error", function (err, stdout, stderr) {
      //     dev.error("An error happened: " + err.message);
      //     dev.error("ffmpeg standard output:\n" + stdout);
      //     dev.error("ffmpeg standard error:\n" + stderr);
      //     return reject(error);
      //   })
      //   .save(videoCachePath);
    },
  };

  async function template() {}

  return API;
})();
