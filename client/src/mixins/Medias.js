export default {
  computed: {},
  methods: {
    makeRelativeURLFromThumbs({ $type, $path, $thumbs, resolution }) {
      if (!$thumbs) return false;

      let thumb_path = "";
      try {
        if ($type === "image") thumb_path = $thumbs[resolution];
        if ($type === "video")
          if ($thumbs["50pc"]) thumb_path = $thumbs["50pc"][resolution];
          else thumb_path = $thumbs[0][resolution];
        if ($type === "audio") thumb_path = $thumbs.waveform[resolution];
        if ($type === "stl") thumb_path = $thumbs["0"][resolution];
        if ($type === "pdf") thumb_path = $thumbs["page-1"][resolution];
        if ($type === "url") thumb_path = $thumbs["ogimage"][resolution];
      } catch (err) {
        return false;
      }
      if ($path === "" || window.app_infos.page_is_standalone_html)
        return `./thumbs/${thumb_path}`;
      return `./thumbs/${$path}/${thumb_path}`;
    },
    makeURLFromThumbs({ $type, $path, $thumbs, resolution }) {
      if (!$thumbs) return false;
      const relative_url = this.makeRelativeURLFromThumbs({
        $type,
        $path,
        $thumbs,
        resolution,
      });
      return window.location.origin + relative_url;
    },

    getFirstThumbURLForMedia({ file, resolution }) {
      const path_to_parent = file.$path.substring(
        0,
        file.$path.lastIndexOf("/")
      );
      return this.makeRelativeURLFromThumbs({
        $thumbs: file.$thumbs,
        $type: file.$type,
        $path: path_to_parent,
        resolution: resolution,
      });
    },
    makeMediaFilePath({
      $path,
      $media_filename,
      $date_created,
      with_timestamp,
    }) {
      if (window.app_infos.page_is_standalone_html)
        return "./medias/" + $media_filename;

      const path_to_parent_folder = $path.substring(0, $path.lastIndexOf("/"));
      let full_path = "/" + path_to_parent_folder + "/" + $media_filename;

      if (with_timestamp) {
        let timestamp = +new Date().getTime();
        if ($date_created) timestamp = +new Date($date_created);
        full_path += "?v=" + timestamp;
      }

      return full_path;
    },
    makeMediaFileURL({ $path, $media_filename }) {
      const full_path = this.makeMediaFilePath({ $path, $media_filename });
      if (!window.app_infos.page_is_standalone_html)
        return window.location.origin + full_path;
      else return full_path;
    },
    getSourceMedia({ source_media, folder_path }) {
      // three cases : source_media contains
      // - meta_filename, meaning media belongs to publication path
      // - meta_filename_in_project, meaning media belongs to project path
      // - path, meaning media has full path to project or publi media (legacy)

      let source_path = undefined;
      let meta_filename = undefined;

      if (source_media._media) return source_media._media;
      else if (source_media.meta_filename) {
        source_path = folder_path;
        meta_filename = source_media.meta_filename;
      } else if (source_media.meta_filename_in_project) {
        source_path = this.getParent(this.getParent(folder_path));
        meta_filename = source_media.meta_filename_in_project;
      } else if (source_media.path) {
        if (source_media.path.includes("publications")) {
          source_path = folder_path;
        } else {
          source_path = this.getParent(this.getParent(folder_path));
        }
        meta_filename = this.getFilename(source_media.path);
      }
      if (!source_path) {
        // this.$alertify.delay(4000).error("couldnt find media");
        return;
      }
      return this.getMediaInFolder({ folder_path: source_path, meta_filename });
    },
    getMediaInFolder({
      path_to_source_media_meta,
      folder_path,
      meta_filename,
    }) {
      if (path_to_source_media_meta && !folder_path && !meta_filename) {
        folder_path = this.getParent(path_to_source_media_meta);
        meta_filename = this.getFilename(path_to_source_media_meta);
      }

      if (window.app_infos.page_is_standalone_html) {
        return window.folder_data.$files?.find(
          ({ $path }) => $path === folder_path + "/" + meta_filename
        );
      }

      return this.$api.store[folder_path]?.$files?.find(
        ({ $path }) => $path === folder_path + "/" + meta_filename
      );
    },

    transformURL({ url: og_url, autoplay }) {
      function addhttp(url) {
        if (!/^(?:f|ht)tps?:\/\//.test(url)) {
          url = "http://" + url;
        }
        return url;
      }
      const cleaned_up_url = addhttp(og_url);
      function urlContains(url, strings) {
        return strings.some((s) => url.includes(s));
      }

      if (urlContains(cleaned_up_url, ["peertube.fr"]))
        return {
          type: "peertube",
          src: this.getPeertubeEmbedFromUrl(cleaned_up_url, autoplay),
        };
      else if (urlContains(cleaned_up_url, ["youtube.com", "youtu.be"]))
        return {
          type: "youtube",
          src: this.getYoutubeEmbedURLFromURL(cleaned_up_url, autoplay),
        };
      else if (urlContains(cleaned_up_url, ["vimeo.com"]))
        return {
          type: "vimeo",
          src: this.getVimeoEmbedURLFromURL(cleaned_up_url, autoplay),
        };
      else if (urlContains(cleaned_up_url, ["soundcloud.com"]))
        return {
          type: "soundcloud",
          src: this.getSoundcloudEmbedURLFromURL(cleaned_up_url, autoplay),
        };
      else if (
        urlContains(cleaned_up_url, ["scratch.mit.edu/projects"]) &&
        !cleaned_up_url.endsWith("/embed")
      )
        return {
          type: "scratch",
          src: this.getScratchEmbedURLFromURL(cleaned_up_url),
        };
      else if (urlContains(cleaned_up_url, ["tinkercad.com/things/"]))
        return {
          type: "tinkercad",
          src: this.getTinkercadEmbedURLFromURL(cleaned_up_url),
        };

      return {
        type: "any",
        src: cleaned_up_url,
      };
    },

    getPeertubeEmbedFromUrl(url, autoplay_value) {
      const video_id = url.split("/").at(-1);
      return `https://peertube.fr/videos/embed/${video_id}?autoplay=${autoplay_value}`;

      // const MATCH_URL = new RegExp("(https?)://(.*)(/videos/watch/|/w/)(.*)");
      // const m = MATCH_URL.exec(url);
      // return `${m[1]}://${m[2]}/videos/embed/${m[3]}?api=1&controls=${true}`;
    },
    getTweetIdFromURL(url) {
      let tweetRegex =
        /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/([0-9]{19})/;
      return url.match(tweetRegex)[3];
    },
    getYoutubeEmbedURLFromURL(url, autoplay_value) {
      function getId(url) {
        const regExp =
          /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
      }

      function getTimestamp(url) {
        // Handle different timestamp formats: t=123, t=1m23s, #t=123, &t=123
        const timeRegex = /[?&#]t=([0-9]+h)?([0-9]+m)?([0-9]+s?)?/i;
        const match = url.match(timeRegex);

        if (!match) return null;

        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const seconds = match[3] ? parseInt(match[3]) : 0;

        return hours * 3600 + minutes * 60 + seconds;
      }

      const video_id = getId(url);
      const timestamp = getTimestamp(url);

      let embedUrl = `https://www.youtube.com/embed/${video_id}?autoplay=${autoplay_value}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`;

      if (timestamp) {
        embedUrl += `&start=${timestamp}`;
      }

      return embedUrl;
    },
    getVimeoEmbedURLFromURL(url, autoplay_value) {
      function getId(url) {
        const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
        const match = url.match(regExp);
        return match ? match[1] : null;
      }
      const video_id = getId(url);
      return `https://player.vimeo.com/video/${video_id}?autoplay=${autoplay_value}loop=false&byline=false&portrait=false&title=false&transparent=0&dnt=true&playsinline=true`;
    },
    getSoundcloudEmbedURLFromURL(url, autoplay_value) {
      return `https://w.soundcloud.com/player/?url=${url}&color=0066cc&auto_play=${autoplay_value}&show_artwork=true`;
    },
    getScratchEmbedURLFromURL(url) {
      return url + "/embed";
    },
    getTinkercadEmbedURLFromURL(url) {
      // https://www.tinkercad.com/things/2FggyQfGlI3-cube-50 to
      // https://www.tinkercad.com/embed/2FggyQfGlI3
      function getId(url) {
        const regExp = /https:\/\/www\.tinkercad\.com\/things\/(\w+)/;
        const match = url.match(regExp);
        return match ? match[1] : null;
      }
      const id = getId(url);
      return `https://www.tinkercad.com/embed/${id}`;
    },
    groupFilesBy(files, fields, group_by) {
      const grouped = files.reduce((group, file) => {
        // var key = file.$date_uploaded;

        const date_field_to_use = fields.find((field) =>
          Object.prototype.hasOwnProperty.call(file, field)
        );

        var dateObj = new Date(file[date_field_to_use]);

        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        let key;
        if (group_by === "day") key = year + "/" + month + "/" + day;
        if (group_by === "month") key = year + "/" + month + "/" + "1";
        if (group_by === "year") key = year;

        if (!Object.prototype.hasOwnProperty.call(group, key)) group[key] = [];
        group[key].push(file);
        return group;
      }, {});
      let ordered = [];
      for (const k in grouped)
        if (!Object.prototype.hasOwnProperty.call(ordered, k)) ordered.push(k);
      ordered.sort((a, b) => {
        return +new Date(b) - +new Date(a);
      });
      return ordered.map((o) => {
        let date_label;
        if (group_by === "day")
          date_label = this.formatDate(o, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        else if (group_by === "month")
          date_label = this.formatDate(o, {
            year: "numeric",
            month: "long",
          });
        else date_label = o;
        return {
          label: date_label,
          files: grouped[o],
        };
      });
    },
    displayDuration({ media }) {
      if (["video", "audio"].includes(media.$type))
        if (media.$infos.duration)
          return this.formatDurationToHoursMinutesSeconds(
            media.$infos.duration
          );
        else return "•:••";
      return false;
    },
    fileShouldBeOptimized({ filename }) {
      if (!filename) return false;
      const ext = [
        ".heic",

        ".cr3",
        ".cr2",
        ".raf",
        ".dng",
        ".rwl",
        ".nef",
        ".rw2",
        ".x3f",
        ".arw",

        ".tif",
        ".tiff",
        ".webp",

        ".amr",
        ".wma",
        ".aif",
        ".flac",

        ".flv",
        ".mov",
        ".avi",
      ];
      return ext.some((e) => filename.toLowerCase().endsWith(e));
    },
    fileCanBeOptimized({ filename }) {
      if (!filename) return false;
      if (this.fileShouldBeOptimized({ filename })) return true;
      const ext = [
        ".webm",
        ".mp4",

        ".jpeg",
        ".jpg",
        ".png",

        ".wav",
        ".m4a",
        ".ogg",
        ".mp3",
        ".aac",
      ];
      return ext.some((e) => filename.toLowerCase().endsWith(e));
    },
    dataURLtoBlob(dataurl) {
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },
  },
};
