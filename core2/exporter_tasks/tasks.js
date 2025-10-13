const path = require("path"),
  fs = require("fs-extra");

const utils = require("../utils"),
  ffmpegTracker = require("../ffmpeg-tracker");

module.exports = (function () {
  const API = {
    prepareImageForMontageAndWeb: async ({
      media_full_path,
      full_path_to_folder_in_cache,
      output_width,
      output_height,
      video_bitrate,
      image_duration = 2,
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
      full_path_to_new_video,
    }) => {
      return new Promise(async (resolve, reject) => {
        dev.log("mergeAllVideos with transitions enabled");

        const ffmpeg_cmd = ffmpegTracker.createTrackedFfmpeg();

        // Add all inputs
        temp_videos_array.map(({ video_path }) => {
          ffmpeg_cmd.addInput(video_path);
        });

        let complexFilters = [];
        let all_video_outputs = [];
        let all_audio_outputs = [];
        const transition_duration = 0.2;

        temp_videos_array.forEach(
          ({ duration, transition_in, transition_out }, index) => {
            // Ensure transition_duration doesn't exceed video duration
            const safe_transition_duration = Math.min(
              transition_duration,
              duration / 3
            );

            // STEP 1: Normalize video/audio inputs to ensure consistency
            complexFilters.push(
              {
                filter: "scale",
                options: "1920:1080:force_original_aspect_ratio=decrease",
                inputs: `${index}:v:0`,
                outputs: `v_scaled_${index}`,
              },
              {
                filter: "pad",
                options: "1920:1080:(ow-iw)/2:(oh-ih)/2",
                inputs: `v_scaled_${index}`,
                outputs: `v_padded_${index}`,
              },
              {
                filter: "setsar",
                options: "1",
                inputs: `v_padded_${index}`,
                outputs: `v_sar_${index}`,
              },
              {
                filter: "fps",
                options: "fps=30",
                inputs: `v_sar_${index}`,
                outputs: `v_fps_${index}`,
              },
              {
                filter: "format",
                options: "pix_fmts=yuv420p",
                inputs: `v_fps_${index}`,
                outputs: `v_normalized_${index}`,
              }
            );

            complexFilters.push(
              {
                filter: "aresample",
                options: "44100",
                inputs: `${index}:a:0`,
                outputs: `a_resampled_${index}`,
              },
              {
                filter: "aformat",
                options: "channel_layouts=stereo",
                inputs: `a_resampled_${index}`,
                outputs: `a_normalized_${index}`,
              }
            );

            // STEP 2: Split normalized streams into 3 parts for transitions
            complexFilters.push(
              {
                filter: "split=3",
                inputs: `v_normalized_${index}`,
                outputs: [
                  `v_start_${index}`,
                  `v_mid_${index}`,
                  `v_end_${index}`,
                ],
              },
              {
                filter: `trim=start=${0}:end=${safe_transition_duration},setpts=PTS-STARTPTS`,
                inputs: `v_start_${index}`,
                outputs: `vtrim_start_${index}`,
              },
              {
                filter: `trim=start=${safe_transition_duration}:end=${
                  duration - safe_transition_duration
                },setpts=PTS-STARTPTS`,
                inputs: `v_mid_${index}`,
                outputs: `vtrim_mid_${index}`,
              },
              {
                filter: `trim=start=${
                  duration - safe_transition_duration
                }:end=${duration},setpts=PTS-STARTPTS`,
                inputs: `v_end_${index}`,
                outputs: `vtrim_end_${index}`,
              }
            );

            complexFilters.push(
              {
                filter: "asplit=3",
                inputs: `a_normalized_${index}`,
                outputs: [
                  `a_start_${index}`,
                  `a_mid_${index}`,
                  `a_end_${index}`,
                ],
              },
              {
                filter: `atrim=start=${0}:end=${safe_transition_duration},asetpts=PTS-STARTPTS`,
                inputs: `a_start_${index}`,
                outputs: `atrim_start_${index}`,
              },
              {
                filter: `atrim=start=${safe_transition_duration}:end=${
                  duration - safe_transition_duration
                },asetpts=PTS-STARTPTS`,
                inputs: `a_mid_${index}`,
                outputs: `atrim_mid_${index}`,
              },
              {
                filter: `atrim=start=${
                  duration - safe_transition_duration
                }:end=${duration},asetpts=PTS-STARTPTS`,
                inputs: `a_end_${index}`,
                outputs: `atrim_end_${index}`,
              }
            );

            // STEP 3: Apply transitions
            if (index === 0) {
              // First video - fade in if requested
              if (transition_in === "fade") {
                complexFilters.push(
                  {
                    filter: "fade",
                    options: {
                      type: "in",
                      start_time: 0,
                      duration: safe_transition_duration,
                    },
                    inputs: `vtrim_start_${index}`,
                    outputs: `fadein_start_${index}`,
                  },
                  {
                    filter: "afade",
                    options: {
                      type: "in",
                      start_time: 0,
                      duration: safe_transition_duration,
                    },
                    inputs: `atrim_start_${index}`,
                    outputs: `afade_start_${index}`,
                  }
                );
                all_video_outputs.push(`fadein_start_${index}`);
                all_audio_outputs.push(`afade_start_${index}`);
              } else {
                all_video_outputs.push(`vtrim_start_${index}`);
                all_audio_outputs.push(`atrim_start_${index}`);
              }
            } else {
              // Not the first video - check for crossfade
              if (transition_in === "fade") {
                complexFilters.push(
                  // Video crossfade
                  {
                    filter: "format",
                    options: "pix_fmts=yuva420p",
                    inputs: `vtrim_start_${index}`,
                    outputs: `v_alpha_start_${index}`,
                  },
                  {
                    filter: "fade",
                    options: {
                      type: "in",
                      start_time: 0,
                      duration: safe_transition_duration,
                      alpha: 1,
                    },
                    inputs: `v_alpha_start_${index}`,
                    outputs: `fadein_${index}`,
                  },
                  {
                    filter: "format",
                    options: "pix_fmts=yuva420p",
                    inputs: `vtrim_end_${index - 1}`,
                    outputs: `v_alpha_end_${index - 1}`,
                  },
                  {
                    filter: "fade",
                    options: {
                      type: "out",
                      start_time: 0,
                      duration: safe_transition_duration,
                      alpha: 1,
                    },
                    inputs: `v_alpha_end_${index - 1}`,
                    outputs: `fadeout_${index}`,
                  },
                  {
                    filter: "overlay",
                    inputs: [`fadeout_${index}`, `fadein_${index}`],
                    outputs: `vcrossfade_${index}`,
                  },
                  // Audio crossfade
                  {
                    filter: "afade",
                    options: {
                      type: "in",
                      start_time: 0,
                      duration: safe_transition_duration,
                    },
                    inputs: `atrim_start_${index}`,
                    outputs: `afade_start_${index}`,
                  },
                  {
                    filter: "afade",
                    options: {
                      type: "out",
                      start_time: 0,
                      duration: safe_transition_duration,
                    },
                    inputs: `atrim_end_${index - 1}`,
                    outputs: `afade_end_${index - 1}`,
                  },
                  {
                    filter: "amix",
                    options: "inputs=2",
                    inputs: [`afade_end_${index - 1}`, `afade_start_${index}`],
                    outputs: `acrossfade_${index}`,
                  }
                );
                all_video_outputs.push(`vcrossfade_${index}`);
                all_audio_outputs.push(`acrossfade_${index}`);
              } else {
                // No transition - add previous end and current start separately
                all_video_outputs.push(`vtrim_end_${index - 1}`);
                all_audio_outputs.push(`atrim_end_${index - 1}`);
                all_video_outputs.push(`vtrim_start_${index}`);
                all_audio_outputs.push(`atrim_start_${index}`);
              }
            }

            // Always add the middle section
            all_video_outputs.push(`vtrim_mid_${index}`);
            all_audio_outputs.push(`atrim_mid_${index}`);

            // Last video - fade out if requested
            if (index === temp_videos_array.length - 1) {
              if (transition_out === "fade") {
                complexFilters.push(
                  {
                    filter: "fade",
                    options: {
                      type: "out",
                      start_time: 0,
                      duration: safe_transition_duration,
                    },
                    inputs: `vtrim_end_${index}`,
                    outputs: `fadeout_end_${index}`,
                  },
                  {
                    filter: "afade",
                    options: {
                      type: "out",
                      start_time: 0,
                      duration: safe_transition_duration,
                    },
                    inputs: `atrim_end_${index}`,
                    outputs: `afadeout_end_${index}`,
                  }
                );
                all_video_outputs.push(`fadeout_end_${index}`);
                all_audio_outputs.push(`afadeout_end_${index}`);
              } else {
                all_video_outputs.push(`vtrim_end_${index}`);
                all_audio_outputs.push(`atrim_end_${index}`);
              }
            }
          }
        );

        // STEP 4: Concat all segments
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

        ffmpeg_cmd
          .complexFilter(complexFilters)
          .addOptions(["-map [outv]", "-map [outa]"])
          .withVideoCodec("libx264")
          .withVideoBitrate(video_bitrate)
          .withAudioCodec("aac")
          .withAudioBitrate("192k")
          .toFormat("mp4")
          .on("start", (commandLine) => {
            dev.log("Spawned Ffmpeg with command: \n" + commandLine);
          })
          .on("progress", (progress) => {})
          .on("end", () => {
            dev.log(`Video has been created`);
            return resolve();
          })
          .on("error", (err, stdout, stderr) => {
            dev.error("An error happened: " + err.message);
            dev.error("ffmpeg standard output:\n" + stdout);
            dev.error("ffmpeg standard error:\n" + stderr);
            return reject(err);
          })
          .save(full_path_to_new_video);
      });
    },
  };

  function _makeVideoFromImage({
    temp_image_path,
    image_duration,
    temp_video_path,
    output_width,
    output_height,
    video_bitrate,
  }) {
    return new Promise(async (resolve, reject) => {
      ffmpegTracker
        .createTrackedFfmpeg()
        .input(temp_image_path)
        .duration(image_duration)
        .loop()
        .input("anullsrc=channel_layout=stereo:sample_rate=44100")
        .inputFormat("lavfi")
        .outputFPS(30)
        .withVideoCodec("libx264")
        .withVideoBitrate(video_bitrate)
        .addOptions(["-af apad", "-tune stillimage"])
        .videoFilter([
          `scale=w=${output_width}:h=${output_height}:force_original_aspect_ratio=decrease`,
          `pad=${output_width}:${output_height}:(ow-iw)/2:(oh-ih)/2`,
          "setsar=1/1",
        ])
        .addOptions(["-shortest", "-bsf:v h264_mp4toannexb"])
        .toFormat("mp4")
        .on("start", (commandLine) => {
          dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
        })
        .on("end", () => {
          return resolve();
        })
        .on("error", (err, stdout, stderr) => {
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
