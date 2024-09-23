const path = require("path"),
  fs = require("fs-extra"),
  ffmpeg = require("fluent-ffmpeg");

const utils = require("../utils");

const ffmpegPath = require("ffmpeg-static").replace(
  "app.asar",
  "app.asar.unpacked"
);
const ffprobePath = require("ffprobe-static").path.replace(
  "app.asar",
  "app.asar.unpacked"
);
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

module.exports = (function () {
  const API = {
    async applyVideoEffect({
      source,
      destination,
      quality_preset,
      effect_type,
      effect_opts,
      ffmpeg_cmd,
      reportProgress,
    }) {
      return new Promise(async (resolve, reject) => {
        ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options).input(source);

        // let resolution, bitrate;
        // if (quality_preset === "high") {
        //   resolution = { width: 1920, height: 1080 };
        //   bitrate = "4000k";
        // } else if (quality_preset === "medium") {
        //   resolution = { width: 1920, height: 1080 };
        //   bitrate = "2000k";
        // }

        const has_no_audio_track = !(await utils.hasAudioTrack({
          ffmpeg_cmd,
          video_path: source,
        }));

        // clashes with speedup and slowdown
        // const { duration } = await utils.getVideoDurationFromMetadata({
        //   ffmpeg_cmd,
        //   video_path: source,
        // });
        // if (duration) ffmpeg_cmd.duration(duration);

        const video_width = 1920;
        const video_height = 1080;

        let complexFilters = [
          {
            filter: "scale",
            options: `${video_width}:${video_height}:force_original_aspect_ratio=1`,
            inputs: "[0]",
            outputs: "scaled",
          },
          {
            filter: "setsar=sar",
            options: 1,
            inputs: "scaled",
            outputs: "aspect",
          },
          {
            filter: "pad",
            options: `${video_width}:${video_height}:(ow-iw)/2:(oh-ih)/2`,
            inputs: "aspect",
            outputs: "output",
          },
        ];

        if (effect_type === "black_and_white") {
          complexFilters.push({
            filter: "hue",
            options: "s=0",
            inputs: "output",
            outputs: "output",
          });
        } else if (effect_type === "colored_filter") {
          if (effect_opts?.color_filter?.startsWith("#")) {
            ffmpeg_cmd
              .input(
                `color=${effect_opts.color_filter}:s=${video_width}x${video_height}`
              )
              .inputFormat("lavfi");
            complexFilters.push({
              filter: "blend=shortest=1:all_mode=overlay:all_opacity=1",
              inputs: "output",
              outputs: "output",
            });
          } else {
            return reject(
              `Failed to create video for filter: color is not set correctly`
            );
          }
        } else if (effect_type === "reverse") {
          complexFilters.push(
            {
              filter: "reverse",
              inputs: "output",
              outputs: "output",
            },
            {
              filter: "areverse",
            }
          );
        } else if (effect_type === "slow_down" || effect_type === "speed_up") {
          let speed = effect_opts.playback_speed / 100;
          if (!speed)
            if (effect_type === "slow_down") speed = 0.5;
            else if (effect_type === "speed_up") speed = 2;

          complexFilters.push({
            filter: "setpts",
            options: `${1 / speed}\*PTS`,
            inputs: "output",
            outputs: "output",
          });

          if (speed >= 0.5 && !has_no_audio_track) {
            complexFilters.push({
              filter: "atempo",
              options: speed,
            });
            // ffmpeg_cmd.withAudioCodec("aac").withAudioBitrate("128k");
          } else {
            ffmpeg_cmd.noAudio();
          }
        } else if (effect_type === "rotate") {
          if (effect_opts.rotation === "cw" || effect_opts.rotation === "ccw") {
            const rotation = effect_opts.rotation === "cw" ? "1" : "2";
            complexFilters = [];
            complexFilters.push({
              filter: "transpose",
              options: rotation,
              inputs: "[0]",
              outputs: "output",
            });
            // ffmpeg_cmd.withAudioCodec("copy").addOptions(["-map 0:a?"]);
          } else {
            return reject(
              `Failed to create video for filter: flip is not set correctly`
            );
          }
        } else if (effect_type === "mirror") {
          if (
            effect_opts.flip === "hflip" ||
            effect_opts.flip === "vflip" ||
            effect_opts.flip === "hflip, vflip"
          ) {
            complexFilters.push({
              filter: effect_opts.flip,
              inputs: "output",
              outputs: "output",
            });
            // ffmpeg_cmd.withAudioCodec("copy").addOptions(["-map 0:a?"]);
          } else {
            return reject(
              `Failed to create video for filter: flip is not set correctly`
            );
          }
        } else if (effect_type === "watermark") {
          // DO NOT USE, CODE STRAIGHT FROM DODOC 9

          const im = medias_with_original_filepath.find(
            (m) => m.type === "image"
          );
          if (im) {
            // ffmpeg_cmd.input(im.full_path);
            complexFilters.push(
              {
                filter: "movie",
                options: im.full_path,
                outputs: "watermark",
              },
              {
                filter: "scale",
                options: `${resolution.width / 8}:${
                  resolution.height / 8
                }:force_original_aspect_ratio=1`,
                inputs: "watermark",
                outputs: "swatermark",
              },
              {
                filter: "setsar=sar=1",
                inputs: "swatermark",
                outputs: "swatermark",
              },
              // {
              //   filter: "format=argb,colorchannelmixer=aa",
              //   options: 0.5,
              //   inputs: "swatermark",
              //   outputs: "swatermark"
              // },
              // {
              //   filter: "format=rgba",
              //   inputs: "swatermark",
              //   outputs: "swatermark"
              // },
              // {
              //   filter: "setsar=sar=1,format=rgba",
              //   inputs: "output",
              //   outputs: "output"
              // },
              {
                // filter:   "overlay=36:main_h-overlay_h-45, blend=all_mode='overlay':all_opacity=0.7",
                filter: "overlay",
                // "blend:all_mode=overlay:all_opacity=0.7",
                // filter: "blend=all_mode='addition':repeatlast=1:all_opacity=1",
                // filter: "blend=all_mode=multiply",
                //
                options: "x=20:y=20",
                // options: "W-w-5:H-h-5",
                inputs: ["output", "swatermark"],
                // inputs: "output",
                outputs: "output",
              }
              // {
              //   filter: "blend=shortest=1:all_mode=overlay:all_opacity=1",
              //   inputs: "output",
              //   outputs: "output"
              // }
            );
            ffmpeg_cmd.withAudioCodec("copy").addOptions(["-map 0:a?"]);

            // if (metadata && metadata.format && metadata.format.duration)
            //   ffmpeg_cmd.duration(metadata.format.duration);
          } else {
            return reject(
              `Failed to create video for filter: image is not set correctly`
            );
          }
        } else {
          return reject(
            `Failed to create video for filter: effect type is not set correctly`
          );
        }

        try {
          ffmpeg_cmd
            .native()
            .outputFPS(30)
            .withVideoCodec("libx264")
            // .withVideoBitrate(bitrate)
            .complexFilter(complexFilters, "output")
            .addOptions(["-crf 22", "-preset fast"])
            .toFormat("mp4")
            .on("start", function (commandLine) {
              dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
            })
            .on("codecData", (data) => {
              totalTime = parseInt(data.duration.replace(/:/g, ""));
            })
            .on("progress", (progress) => {
              if (reportProgress) {
                const time = parseInt(progress.timemark.replace(/:/g, ""));
                if (time < 0 || time > totalTime) return;
                const percent = (time / totalTime) * 100;
                reportProgress(percent);
              }
            })
            .on("end", () => {
              return resolve();
            })
            .on("error", function (err, stdout, stderr) {
              dev.error("An error happened: " + err.message);
              dev.error("ffmpeg standard output:\n" + stdout);
              dev.error("ffmpeg standard error:\n" + stderr);
              return reject(err);
            })
            .save(destination);
        } catch (err) {
          dev.error(err);
          return reject(err);
        }
      });
    },
  };

  return API;
})();
