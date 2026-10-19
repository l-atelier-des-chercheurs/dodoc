const path = require("path"),
  fs = require("fs-extra"),
  sharp = require("sharp"),
  exifr = require("exifr"),
  { parseDate } = require("@cantoo/pdf-lib"),
  ffmpegTracker = require("../ffmpeg-tracker");

sharp.cache(false);

const IMAGE_EXTS_FOR_CREATION_DATE = new Set([
  ".jpg",
  ".jpeg",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
  ".avif",
  ".webp",
  ".png",
]);
const MEDIA_EXTS_FOR_CREATION_DATE = new Set([
  ".mp4",
  ".m4v",
  ".mov",
  ".webm",
  ".mkv",
  ".avi",
  ".mp3",
  ".m4a",
  ".aac",
  ".wav",
  ".ogg",
  ".weba",
  ".flac",
]);

function toPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

// ffprobe frame rates are fractions like "30000/1001"
function parseFrameRate(rate) {
  if (typeof rate !== "string") return undefined;
  const [num, den] = rate.split("/").map(Number);
  if (!num || !den) return undefined;
  return Math.round((num / den) * 100) / 100;
}

function coerceToValidDate(value) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Ignore clearly bogus / epoch-zero dates
  if (date.getFullYear() < 1980) return null;
  return date;
}

// Parse a PDF date string (D:YYYYMMDDHHmmSSOHH'mm'), fall back to Date parsing
function parsePdfDate(date_str) {
  if (!date_str) return null;
  const value = String(date_str).trim();
  return coerceToValidDate(parseDate(value) || value);
}

function decodePdfHexString(hex) {
  const cleaned = String(hex).replace(/[^0-9A-Fa-f]/g, "");
  if (!cleaned) return null;
  let text = "";
  for (let i = 0; i < cleaned.length; i += 2) {
    text += String.fromCharCode(parseInt(cleaned.slice(i, i + 2), 16));
  }
  return text;
}

async function extractCreationDateFromImage(path_to_media) {
  const exif = await exifr.parse(path_to_media, {
    pick: [
      "DateTimeOriginal",
      "CreateDate",
      "DateCreated",
      "ModifyDate",
      "DateTimeDigitized",
    ],
  });
  if (!exif) return null;

  return (
    coerceToValidDate(exif.DateTimeOriginal) ||
    coerceToValidDate(exif.CreateDate) ||
    coerceToValidDate(exif.DateCreated) ||
    coerceToValidDate(exif.DateTimeDigitized) ||
    coerceToValidDate(exif.ModifyDate) ||
    null
  );
}

async function extractCreationDateFromPdf(path_to_media) {
  const data = await fs.readFile(path_to_media);
  const text = data.toString("latin1");

  // Prefer top-level XMP CreateDate (not nested Pantry / Ingredients)
  const xmp_start = text.indexOf("<x:xmpmeta");
  const xmp_end = text.indexOf("</x:xmpmeta>", xmp_start);
  if (xmp_start >= 0 && xmp_end > xmp_start) {
    const xmp = text.slice(xmp_start, xmp_end);
    // Strip pantry blocks so ingredient CreateDates are ignored
    const xmp_without_pantry = xmp.replace(
      /<xmpMM:Pantry\b[\s\S]*?<\/xmpMM:Pantry>/gi,
      ""
    );
    const xmp_match =
      xmp_without_pantry.match(
        /<xmp:CreateDate[^>]*>([^<]+)<\/xmp:CreateDate>/i
      ) || xmp_without_pantry.match(/\bxmp:CreateDate="([^"]+)"/i);
    const from_xmp = coerceToValidDate(xmp_match?.[1]);
    if (from_xmp) return from_xmp;
  }

  // Info dict: literal string (D:...) or hex string
  const literal_match = text.match(/\/CreationDate\s*\(([^)]+)\)/);
  if (literal_match) return parsePdfDate(literal_match[1]);

  const hex_match = text.match(/\/CreationDate\s*<([0-9A-Fa-f]+)>/);
  if (hex_match) return parsePdfDate(decodePdfHexString(hex_match[1]));

  return null;
}

module.exports = function createMediaUtils(API) {
  return {
    makeRatio({ w, h }) {
      return +Number.parseFloat(h / w).toPrecision(4);
    },

    async makeImageFromPath({
      full_path,
      new_path,
      resolution,
      format = "jpeg",
      withoutEnlargement = false,
    }) {
      if (format === "png")
        await sharp(full_path)
          .rotate()
          .resize(resolution, resolution, {
            fit: "inside",
            withoutEnlargement,
          })
          // .withMetadata()
          .toFormat("png", {})
          .toFile(new_path)
          .catch((err) => {
            // todo handle errors better
            // use cause to keep track throw new Error("Failed in some way", { cause: err });
            throw err;
          });
      else
        await sharp(full_path)
          .rotate()
          .resize(resolution, resolution, {
            fit: "inside",
            withoutEnlargement,
          })
          .flatten({ background: "white" })
          // .withMetadata()
          .toFormat("jpeg", {
            quality: global.settings.mediaThumbQuality,
          })
          .toFile(new_path)
          .catch((err) => {
            throw err;
          });
    },
    async convertAndCopyImage({ source, destination, width, height }) {
      await sharp(source)
        .rotate()
        .flatten({ background: "white" })
        .resize(width, height, {
          fit: "contain",
          withoutEnlargement: false,
          background: "black",
        })
        // .withMetadata()
        .toFile(destination)
        .catch((err) => {
          dev.error(`Failed to sharp create image to destination.`);
          throw err;
        });
    },

    async getImageMetadata({ full_media_path }) {
      return await sharp(full_media_path).metadata();
    },

    async imageBufferToFile({ image_buffer, full_path_to_thumb }) {
      return await sharp(image_buffer).toFile(full_path_to_thumb);
    },

    convertVideoToStandardFormat({
      source,
      destination,
      format = "mp4",
      image_width,
      image_height,
      video_bitrate = "4000k",
      audio_bitrate = "192k",
      trim_start,
      trim_end,
      reportProgress,
    }) {
      return new Promise(async (resolve, reject) => {
        const ffmpeg_cmd = ffmpegTracker.createTrackedFfmpeg();

        // Add input with trim options if specified
        if (trim_start !== undefined && trim_end !== undefined) {
          ffmpeg_cmd
            .input(source)
            .inputOptions([`-ss ${trim_start}`, `-to ${trim_end}`]);
        } else {
          ffmpeg_cmd.input(source);
        }

        // Configure video or audio based on requirements
        if (video_bitrate === "no_video") {
          // Audio-only export
          ffmpeg_cmd.noVideo();
          if (audio_bitrate !== "no_audio") {
            ffmpeg_cmd
              .withAudioCodec("aac")
              .withAudioBitrate(audio_bitrate)
              .audioFilter("aresample=44100");
          }
        } else {
          // Video export (with optional audio)
          const videoFilters = [];
          if (image_width && image_height) {
            videoFilters.push(
              `scale=${image_width}:${image_height}:force_original_aspect_ratio=decrease`,
              `pad=${image_width}:${image_height}:(ow-iw)/2:(oh-ih)/2:black`
            );
          }
          videoFilters.push("setsar=1", "fps=30", "format=yuv420p");

          ffmpeg_cmd
            .withVideoCodec("libx264")
            .withVideoBitrate(video_bitrate)
            .videoFilter(videoFilters);

          // Configure audio for video export
          if (audio_bitrate === "no_audio") {
            ffmpeg_cmd.noAudio();
          } else {
            ffmpeg_cmd
              .withAudioCodec("aac")
              .withAudioBitrate(audio_bitrate)
              .audioFilter("aresample=44100");
          }
        }

        // Set output format and options
        if (video_bitrate === "no_video") {
          // Audio-only export - use MP4/M4A container for browser-safe duration/seek.
          ffmpeg_cmd
            .inputOptions(["-fflags +genpts"])
            .toFormat("mp4")
            .addOptions([
              "-movflags +faststart",
              "-avoid_negative_ts make_zero",
            ]);
        } else if (format === "mp4") {
          ffmpeg_cmd
            .toFormat("mp4")
            .addOptions(["-movflags +faststart", "-preset fast", "-crf 23"]);
        } else if (format === "mpegts") {
          ffmpeg_cmd.toFormat("mpegts").addOptions(["-preset fast", "-crf 23"]);
        }

        // Execute
        ffmpeg_cmd
          .on("start", (commandLine) => {
            dev.logverbose("FFmpeg command: " + commandLine);
          })
          .on("progress", (progress) => {
            if (reportProgress && progress.percent) {
              reportProgress(progress.percent);
            }
          })
          .on("end", () => {
            dev.logverbose("Video conversion completed");
            resolve();
          })
          .on("error", (err, stdout, stderr) => {
            dev.error("FFmpeg error: " + err.message);
            dev.error("stderr: " + stderr);
            reject(err);
          })
          .save(destination);
      });
    },
    getVideoMetaData({ path: media_path }) {
      return new Promise(async (resolve, reject) => {
        const ffprobe_cmd = ffmpegTracker.ffprobe(media_path, (err, metadata) => {
          if (err || typeof metadata === "undefined") return reject(err);

          let duration;
          if (
            typeof metadata.format?.duration === "number" &&
            metadata.format.duration > 0
          ) {
            duration = +metadata.format.duration.toPrecision(3);
            // Additional validation to ensure duration is reasonable
            if (duration <= 0 || duration > 86400) {
              // More than 24 hours seems unreasonable
              dev.error(
                `Suspicious duration value: ${duration} seconds for file: ${media_path}`
              );
              duration = undefined;
            }
          }

          let location;
          if (metadata.format?.tags?.location)
            location = metadata.format.tags.location;
          if (metadata.format?.tags?.["com.apple.quicktime.location.ISO6709"])
            location =
              metadata.format.tags["com.apple.quicktime.location.ISO6709"];

          let width = metadata.streams[0]?.width;
          let height = metadata.streams[0]?.height;
          let ratio =
            width && height
              ? API.makeRatio({
                  w: width,
                  h: height,
                })
              : undefined;

          let streams = metadata.streams;
          const has_audio = streams.some((s) => s.codec_type === "audio");

          // cover art in audio files is a video stream flagged attached_pic
          const video_stream = streams.find(
            (s) => s.codec_type === "video" && !s.disposition?.attached_pic
          );
          const audio_stream = streams.find((s) => s.codec_type === "audio");
          const fps = parseFrameRate(video_stream?.avg_frame_rate);
          const bitrate = toPositiveNumber(metadata.format?.bit_rate);

          const creation_time =
            coerceToValidDate(metadata.format?.tags?.creation_time) ||
            coerceToValidDate(
              metadata.streams?.find((s) => s.tags?.creation_time)?.tags
                ?.creation_time
            ) ||
            null;

          return resolve({
            duration,
            location,
            width,
            height,
            ratio,
            streams,
            has_audio,
            video_codec: video_stream?.codec_name,
            fps,
            bitrate,
            audio_codec: audio_stream?.codec_name,
            audio_channels: toPositiveNumber(audio_stream?.channels),
            audio_sample_rate: toPositiveNumber(audio_stream?.sample_rate),
            creation_time,
          });
        });
      });
    },
    // peak volume of the first audio track, in dB (-Infinity for digital silence)
    getAudioMaxVolume({ path: media_path, max_duration = 120 }) {
      return new Promise((resolve, reject) => {
        let max_volume;
        ffmpegTracker
          .createTrackedFfmpeg()
          .input(media_path)
          .inputOptions([`-t ${max_duration}`])
          .noVideo()
          .outputOptions(["-map 0:a:0"])
          .audioFilters("volumedetect")
          .format("null")
          .on("stderr", (line) => {
            const match = line.match(/max_volume: (-?[\d.]+|-inf) dB/);
            if (match)
              max_volume = match[1] === "-inf" ? -Infinity : Number(match[1]);
          })
          .on("error", reject)
          .on("end", () => resolve(max_volume))
          .save("-");
      });
    },
    async hasAudioTrack({ video_path }) {
      try {
        const { streams } = await API.getVideoMetaData({ path: video_path });
        return streams?.some((s) => s.codec_type === "audio");
      } catch (err) {
        dev.error("Error getting video metadata in hasAudioTrack:", err);
        return false;
      }
    },

    async getGPSFromFile(full_media_path) {
      return await exifr.gps(full_media_path);
    },

    /**
     * Read an embedded creation date from the media file when available.
     * Covers common image EXIF/XMP, ffprobe creation_time for A/V, and PDF
     * Info/XMP CreateDate (ignores XMP Pantry ingredient dates).
     * @returns {Date|null}
     */
    async extractEmbeddedCreationDate({ path_to_media }) {
      if (!path_to_media) return null;

      const ext = path.extname(path_to_media).toLowerCase();

      try {
        if (IMAGE_EXTS_FOR_CREATION_DATE.has(ext)) {
          return await extractCreationDateFromImage(path_to_media);
        }

        if (MEDIA_EXTS_FOR_CREATION_DATE.has(ext)) {
          const { creation_time } = await API.getVideoMetaData({
            path: path_to_media,
          });
          return creation_time || null;
        }

        if (ext === ".pdf") {
          return await extractCreationDateFromPdf(path_to_media);
        }
      } catch (err) {
        dev.error(
          `Failed to extract embedded creation date from ${path_to_media}:`,
          err
        );
      }

      return null;
    },

    /**
     * Resolve $date_created for a newly imported/created file.
     * Priority: explicit meta > embedded metadata > browser lastModified > fs times > now.
     */
    async resolveFileCreationDate({
      path_to_media,
      explicit_date,
      client_last_modified,
    } = {}) {
      const from_explicit = coerceToValidDate(explicit_date);
      if (from_explicit) return from_explicit;

      if (path_to_media) {
        const from_embedded = await API.extractEmbeddedCreationDate({
          path_to_media,
        });
        if (from_embedded) return from_embedded;
      }

      const from_client = coerceToValidDate(client_last_modified);
      if (from_client) return from_client;

      if (path_to_media) {
        try {
          const stats = await fs.stat(path_to_media);
          const from_birth = coerceToValidDate(stats.birthtimeMs);
          if (from_birth) return from_birth;
          const from_mtime = coerceToValidDate(stats.mtimeMs);
          if (from_mtime) return from_mtime;
        } catch (err) {
          dev.error(
            `Failed to stat file for creation date ${path_to_media}:`,
            err
          );
        }
      }

      return API.getCurrentDate();
    },
  };
};
