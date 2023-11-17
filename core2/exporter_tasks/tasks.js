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
    prepareImageForMontageAndWeb: async ({
      media_full_path,
      full_path_to_folder_in_cache,
      resolution,
      bitrate,
      ffmpeg_cmd,
    }) => {
      // used to process videos / images before merging them
      dev.logfunction();

      const temp_video_duration = 2;

      const image_filename = utils.createUniqueName("image");
      const temp_image_path = path.join(
        full_path_to_folder_in_cache,
        image_filename + ".jpeg"
      );

      let temp_video_name =
        image_filename +
        "_dur=" +
        temp_video_duration +
        "_res=" +
        resolution.width +
        "x" +
        resolution.height +
        "_br=" +
        bitrate +
        ".ts";

      const temp_video_path = path.join(
        full_path_to_folder_in_cache,
        temp_video_name
      );

      if (!(await fs.pathExists(temp_video_path))) {
        await utils.convertAndCopyImage({
          source: media_full_path,
          destination: temp_image_path,
          resolution,
        });
        await _makeVideoFromImage({
          ffmpeg_cmd,
          temp_image_path,
          temp_video_duration,
          temp_video_path,
          bitrate,
          resolution,
        });
      }

      return {
        video_path: temp_video_path,
        duration: temp_video_duration,
      };
    },
    prepareVideoForMontageAndWeb: async ({
      media_full_path,
      full_path_to_folder_in_cache,
      resolution,
      bitrate,
      ffmpeg_cmd,
    }) => {
      const temp_video_volume = 100;

      const temp_video_name =
        utils.createUniqueName("video") +
        "_volume=" +
        temp_video_volume +
        "_res=" +
        resolution.width +
        "x" +
        resolution.height +
        "_br=" +
        bitrate +
        ".ts";

      const temp_video_path = path.join(
        full_path_to_folder_in_cache,
        temp_video_name
      );

      if (!(await fs.pathExists(temp_video_path))) {
        await _convertVideoToStandardFormat({
          ffmpeg_cmd,
          media_full_path,
          temp_video_path,
          bitrate,
          resolution,
        });
      }

      const { duration } = await _getVideoDurationFromMetadata({
        ffmpeg_cmd,
        video_path: temp_video_path,
      });

      return {
        video_path: temp_video_path,
        duration,
      };
    },

    mergeAllVideos: async ({
      temp_videos_array,
      bitrate,
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

        ffmpeg_cmd.withVideoBitrate(bitrate);

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
    temp_video_duration,
    temp_video_path,
    bitrate,
    resolution,
  }) {
    return new Promise(async (resolve, reject) => {
      ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options)
        .input(temp_image_path)
        .duration(temp_video_duration)
        .loop()
        .input("anullsrc=channel_layout=stereo:sample_rate=44100")
        .inputFormat("lavfi")
        .outputFPS(30)
        .withVideoCodec("libx264")
        .withVideoBitrate(bitrate)
        .addOptions(["-af apad", "-tune stillimage"])
        .size(`${resolution.width}x${resolution.height}`)
        .autopad()
        .videoFilter(["setsar=1/1"])
        .addOptions(["-shortest", "-bsf:v h264_mp4toannexb"])
        .toFormat("mpegts")
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

  function _convertVideoToStandardFormat({
    ffmpeg_cmd,
    media_full_path,
    temp_video_path,
    bitrate,
    resolution,
  }) {
    return new Promise(async (resolve, reject) => {
      ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options);

      ffmpeg_cmd.input(media_full_path);
      const { duration, streams } = await _getVideoDurationFromMetadata({
        ffmpeg_cmd,
        video_path: media_full_path,
      });

      if (duration) ffmpeg_cmd.duration(duration);

      // check if has audio track or not
      if (streams?.some((s) => s.codec_type === "audio"))
        ffmpeg_cmd.withAudioCodec("aac").withAudioBitrate("128k");
      else ffmpeg_cmd.input("anullsrc").inputFormat("lavfi");

      const filter = _makeFilterToPadMatchDurationAudioVideo({ streams });
      if (filter) ffmpeg_cmd.addOptions([filter]);

      // if (streams?.some((s) => s.codec_type === "audio"))

      // if (temp_video_volume) {
      //   ffmpeg_cmd.addOptions(["-af volume=" + temp_video_volume + ",apad"]);
      // } else {
      // }

      ffmpeg_cmd
        .native()
        .outputFPS(30)
        .withVideoCodec("libx264")
        .withVideoBitrate(bitrate)
        .videoFilter([
          `scale=w=${resolution.width}:h=${resolution.height}:force_original_aspect_ratio=1,pad=${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2`,
        ])
        .addOptions([
          "-crf 22",
          "-preset fast",
          "-shortest",
          "-bsf:v h264_mp4toannexb",
        ])
        .videoFilter(["setsar=1/1"])
        .toFormat("mpegts")
        .on("start", function (commandLine) {
          dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
        })
        .on("progress", (progress) => {})
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

  function _getVideoDurationFromMetadata({ ffmpeg_cmd, video_path }) {
    return new Promise(async (resolve, reject) => {
      ffmpeg_cmd = ffmpeg.ffprobe(video_path, (err, metadata) => {
        if (err) return reject(err);

        const duration = metadata.format?.duration;
        const streams = metadata.streams;
        return resolve({ duration, streams });
      });
    });
  }

  function _makeFilterToPadMatchDurationAudioVideo({ streams = [] }) {
    const audio_stream = streams.find((s) => s.codec_type === "audio");
    const video_stream = streams.find((s) => s.codec_type === "video");
    if (audio_stream && video_stream) {
      if (audio_stream.duration > video_stream.duration) {
        // audio is longer than video, we need to pad video
        const diff = audio_stream.duration - video_stream.duration;
        return `-vf tpad=stop_mode=clone:stop_duration=${diff}`;
      } else if (video_stream.duration > audio_stream.duration) {
        // video is longer than audio, we need to pad audio
        return "-af apad";
      }
    }
    return false;
  }

  return API;
})();
