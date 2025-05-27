const path = require("path"),
  fs = require("fs-extra"),
  ffmpeg = require("fluent-ffmpeg");

const utils = require("../utils");

const ffmpegPath = require("ffmpeg-static").replace(
  "app.asar",
  "app.asar.unpacked"
);
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = (function () {
  const API = {
    prepareImageForMontageAndWeb: async ({
      media_full_path,
      full_path_to_folder_in_cache,
      output_width,
      output_height,
      video_bitrate,
      image_duration = 2,
      ffmpeg_cmd,
    }) => {
      // used to process videos / images before merging them
      dev.logfunction();

      const image_filename = utils.createUniqueName("image");
      const temp_image_path = path.join(
        full_path_to_folder_in_cache,
        image_filename + ".jpeg"
      );

      let temp_video_name =
        image_filename +
        "_dur=" +
        image_duration +
        "_res=" +
        output_width +
        "x" +
        output_height +
        "_br=" +
        video_bitrate +
        ".ts";

      const temp_video_path = path.join(
        full_path_to_folder_in_cache,
        temp_video_name
      );

      if (!(await fs.pathExists(temp_video_path))) {
        await utils.convertAndCopyImage({
          source: media_full_path,
          destination: temp_image_path,
          width: output_width,
          height: output_height,
        });
        await _makeVideoFromImage({
          ffmpeg_cmd,
          temp_image_path,
          image_duration,
          temp_video_path,
          video_bitrate,
          output_width,
          output_height,
        });
      }

      await fs.remove(temp_image_path);

      return {
        video_path: temp_video_path,
        duration: image_duration,
      };
    },
    prepareVideoForMontageAndWeb: async ({
      media_full_path,
      full_path_to_folder_in_cache,
      output_width,
      output_height,
      video_bitrate,
      ffmpeg_cmd,
      reportProgress,
    }) => {
      const temp_video_volume = 100;

      const temp_video_name =
        utils.createUniqueName("video") +
        "_volume=" +
        temp_video_volume +
        "_res=" +
        output_width +
        "x" +
        output_height +
        "_br=" +
        video_bitrate +
        ".ts";

      const temp_video_path = path.join(
        full_path_to_folder_in_cache,
        temp_video_name
      );

      if (!(await fs.pathExists(temp_video_path))) {
        await utils.convertVideoToStandardFormat({
          ffmpeg_cmd,
          source: media_full_path,
          destination: temp_video_path,
          format: "mpegts",
          image_width: output_width,
          image_height: output_height,
          video_bitrate,
          reportProgress,
        });
      }

      let duration;
      try {
        const infos = await utils.getVideoMetaData({
          ffmpeg_cmd,
          path: temp_video_path,
        });
        if (infos.duration) duration = infos.duration;
      } catch (err) {
        dev.error(err);
      }

      return {
        video_path: temp_video_path,
        duration,
      };
    },

    mergeAllVideos: async ({
      temp_videos_array,
      video_bitrate,
      ffmpeg_cmd,
      full_path_to_new_video,
    }) => {
      return new Promise(async (resolve, reject) => {
        ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options);

        temp_videos_array.map(({ video_path }) => {
          ffmpeg_cmd.addInput(video_path);
        });

        let complexFilters = [];
        let all_video_outputs = [];
        let all_audio_outputs = [];
        const transition_duration = 0.08;

        temp_videos_array.map(
          ({ duration, transition_in, transition_out }, index) => {
            // pour chaque extrait, créer plusieurs pistes :
            // une piste du début, TRIM +
            /* 
  [0:v]trim=start=0:end=9,setpts=PTS-STARTPTS[firstclip]; \
  [1:v]trim=start=1,setpts=PTS-STARTPTS[secondclip]; \
  [0:v]trim=start=9:end=10,setpts=PTS-STARTPTS[fadeoutsrc]; \
  [1:v]trim=start=0:end=1,setpts=PTS-STARTPTS[fadeinsrc]; \
  [fadeinsrc]format=pix_fmts=yuva420p,fade=t=in:st=0:d=1:alpha=1[fadein]; \
  [fadeoutsrc]format=pix_fmts=yuva420p,fade=t=out:st=0:d=1:alpha=1[fadeout]; \
  [fadein]fifo[fadeinfifo]; \
  [fadeout]fifo[fadeoutfifo]; \
  [fadeoutfifo][fadeinfifo]overlay[crossfade]; \
  [firstclip][crossfade][secondclip]concat=n=3[output] \
        */

            // si vidéo est la première
            // -- on créé deux flux : de 0 à (duration - 1) et de (duration - 1) à duration
            // si vidéo est pas la première ni la dernière
            // -- on créé trois flux : de 0 à 1

            // on créé trois flux : de 0 à 1, de 1 à duration - 1, de duration - 1 à 1
            complexFilters.push(
              // video
              {
                filter: "split=3",
                inputs: index + ":v",
                outputs: [
                  "v_start_" + index,
                  "v_mid_" + index,
                  "v_end_" + index,
                ],
              },
              {
                filter: `trim=start=${0}:end=${transition_duration},setpts=PTS-STARTPTS`,
                inputs: "v_start_" + index,
                outputs: "vtrim_start_" + index,
              },
              {
                filter: `trim=start=${transition_duration}:end=${
                  duration - transition_duration
                },setpts=PTS-STARTPTS`,
                inputs: "v_mid_" + index,
                outputs: "vtrim_mid_" + index,
              },
              {
                filter: `trim=start=${
                  duration - transition_duration
                }:end=${duration},setpts=PTS-STARTPTS`,
                inputs: "v_end_" + index,
                outputs: "vtrim_end_" + index,
              },

              // audio
              {
                filter: "asplit=3",
                inputs: index + ":a",
                outputs: [
                  "a_start_" + index,
                  "a_mid_" + index,
                  "a_end_" + index,
                ],
              },
              {
                filter: `atrim=start=${0}:end=${transition_duration},asetpts=PTS-STARTPTS`,
                inputs: "a_start_" + index,
                outputs: "atrim_start_" + index,
              },
              {
                filter: `atrim=start=${transition_duration}:end=${
                  duration - transition_duration
                },asetpts=PTS-STARTPTS`,
                inputs: "a_mid_" + index,
                outputs: "atrim_mid_" + index,
              },
              {
                filter: `atrim=start=${
                  duration - transition_duration
                }:end=${duration},asetpts=PTS-STARTPTS`,
                inputs: "a_end_" + index,
                outputs: "atrim_end_" + index,
              }
            );

            if (index === 0) {
              if (transition_in === "fade") {
                complexFilters.push(
                  // video
                  {
                    filter: `fade`,
                    options: {
                      type: "in",
                      start_time: 0,
                      duration: transition_duration,
                    },
                    inputs: "vtrim_start_" + index,
                    outputs: "fadein_start_" + index,
                  },
                  // audio
                  {
                    filter: "afade",
                    options: {
                      type: "in",
                      start_time: 0,
                      duration: transition_duration,
                    },
                    inputs: "atrim_start_" + index,
                    outputs: "afade_start_" + index,
                  }
                );
                all_video_outputs.push("fadein_start_" + index);
                all_audio_outputs.push("afade_start_" + index);
              } else {
                all_video_outputs.push("vtrim_start_" + index);
                all_audio_outputs.push("atrim_start_" + index);
              }
            } else {
              // if there are videos before
              // we get vtrim_end_(index - 1) and vtrim_start_(index) and merge them

              // some great docs :
              // -- https://superuser.com/questions/1001039/what-is-an-efficient-way-to-do-a-video-crossfade-with-ffmpeg
              // -- https://video.stackexchange.com/questions/23006/how-to-concatenate-multiple-videos-with-fades-from-and-to-black-in-between

              if (transition_in === "fade") {
                // we grab the previous media and crossfade with it
                complexFilters.push(
                  // video
                  {
                    filter: `format=pix_fmts=yuva420p,fade=t=in:st=0:d=${transition_duration}:alpha=1`,
                    inputs: "vtrim_start_" + index,
                    outputs: "fadein_" + index,
                  },
                  {
                    filter: `format=pix_fmts=yuva420p,fade=t=out:st=0:d=${transition_duration}:alpha=1`,
                    inputs: "vtrim_end_" + (index - 1),
                    outputs: "fadeout_" + index,
                  },
                  {
                    filter: `fifo`,
                    inputs: "fadein_" + index,
                    outputs: "fadeinfifo_" + index,
                  },
                  {
                    filter: `fifo`,
                    inputs: "fadeout_" + index,
                    outputs: "fadeoutfifo_" + index,
                  },
                  {
                    filter: "overlay",
                    inputs: ["fadeinfifo_" + index, "fadeoutfifo_" + index],
                    outputs: "vcrossfade_" + index,
                  },

                  // audio
                  {
                    filter: "afade",
                    options: {
                      type: "in",
                      start_time: 0,
                      duration: transition_duration,
                    },
                    inputs: "atrim_start_" + index,
                    outputs: "afade_start_" + index,
                  },
                  {
                    filter: "afade",
                    options: {
                      type: "out",
                      start_time: 0,
                      duration: transition_duration,
                    },
                    inputs: "atrim_end_" + (index - 1),
                    outputs: "afade_end_" + (index - 1),
                  },
                  {
                    filter: "amix=inputs=2",
                    inputs: [
                      "afade_start_" + index,
                      "afade_end_" + (index - 1),
                    ],
                    outputs: "acrossfade_" + index,
                  }
                );
                all_video_outputs.push("vcrossfade_" + index);
                all_audio_outputs.push("acrossfade_" + index);
              } else {
                all_video_outputs.push("vtrim_end_" + (index - 1));
                all_audio_outputs.push("atrim_end_" + (index - 1));
                all_video_outputs.push("vtrim_start_" + index);
                all_audio_outputs.push("atrim_start_" + index);
              }
            }

            all_video_outputs.push("vtrim_mid_" + index);
            all_audio_outputs.push("atrim_mid_" + index);

            if (index === temp_videos_array.length - 1) {
              if (transition_out === "fade") {
                complexFilters.push(
                  {
                    filter: `fade`,
                    options: {
                      type: "out",
                      start_time: 0,
                      duration: transition_duration,
                    },
                    inputs: "vtrim_end_" + index,
                    outputs: "fadeout_end_" + index,
                  },
                  {
                    filter: "afade",
                    options: {
                      type: "out",
                      start_time: 0,
                      duration: transition_duration,
                    },
                    inputs: "atrim_end_" + index,
                    outputs: "afadeout_end_" + index,
                  }
                );
                all_video_outputs.push("fadeout_end_" + index);
                all_audio_outputs.push("afadeout_end_" + index);
              } else {
                all_video_outputs.push("vtrim_end_" + index);
                all_audio_outputs.push("atrim_end_" + index);
              }
            }
          }
        );

        ffmpeg_cmd.withVideoBitrate(video_bitrate);

        // todo set https://trac.ffmpeg.org/wiki/Encode/H.264#Profile ?
        complexFilters.push(
          {
            filter: "concat",
            options: {
              n: all_video_outputs.length,
              v: 1,
              a: 0,
            },
            inputs: all_video_outputs,
            outputs: "outv",
          },
          {
            filter: "concat",
            options: {
              n: all_audio_outputs.length,
              v: 0,
              a: 1,
            },
            inputs: all_audio_outputs,
            outputs: "outa",
          }
        );

        // let time_since_last_report = 0;
        ffmpeg_cmd
          // .complexFilter(['gltransition'])
          .on("start", function (commandLine) {
            dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
          })
          .on("progress", (progress) => {})
          .on("end", () => {
            dev.logverbose(`Video has been created`);
            return resolve();
          })
          .on("error", function (err, stdout, stderr) {
            dev.error("An error happened: " + err.message);
            dev.error("ffmpeg standard output:\n" + stdout);
            dev.error("ffmpeg standard error:\n" + stderr);
            return reject(err);
          })
          // .mergeToFile(videoPath, cachePath);
          .complexFilter(complexFilters)
          .addOptions(["-map [outv]", "-map [outa]"])
          .save(full_path_to_new_video);

        // does not work that well with -f concat
        // reconverting with mergeToFile might seem overkill but yields much much better results
      });
    },
  };

  function _makeVideoFromImage({
    ffmpeg_cmd,
    temp_image_path,
    image_duration,
    temp_video_path,
    output_width,
    output_height,
    video_bitrate,
  }) {
    return new Promise(async (resolve, reject) => {
      ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
        .input(temp_image_path)
        .duration(image_duration)
        .loop()
        .input("anullsrc=channel_layout=stereo:sample_rate=44100")
        .inputFormat("lavfi")
        .outputFPS(30)
        .withVideoCodec("libx264")
        .withVideoBitrate(video_bitrate)
        .addOptions(["-af apad", "-tune stillimage"])
        .size(`${output_width}x${output_height}`)
        .autopad()
        .videoFilter(["setsar=1/1"])
        .addOptions(["-shortest", "-bsf:v h264_mp4toannexb"])
        .toFormat("mp4")
        .on("start", function (commandLine) {
          dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
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
        .save(temp_video_path);
    });
  }

  return API;
})();
