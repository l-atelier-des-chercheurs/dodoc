export default {
  computed: {},
  methods: {
    makeRelativeURLFromThumbs({ $type, $path, $thumbs, resolution }) {
      if (!$thumbs) return false;

      let thumb_path = "";
      try {
        if ($type === "image") thumb_path = $thumbs[resolution];
        if ($type === "video") thumb_path = $thumbs["0"][resolution];
        if ($type === "audio") thumb_path = $thumbs.waveform[resolution];
        if ($type === "stl") thumb_path = $thumbs["0"][resolution];
        if ($type === "pdf") thumb_path = $thumbs["page-1"][resolution];
        if ($type === "url") thumb_path = $thumbs["ogimage"][resolution];
      } catch (err) {
        return false;
      }

      // todo make this work with subfolders
      return `/thumbs/${$path}/${thumb_path}`;
    },
    makeMediaFilePath({ $path, $media_filename }) {
      const path_to_parent_folder = $path.substring(0, $path.lastIndexOf("/"));
      const full_path = path_to_parent_folder + "/" + $media_filename;
      return full_path;
    },
    makeMediaFileURL({ $path, $media_filename }) {
      const full_path = this.makeMediaFilePath({ $path, $media_filename });
      return window.location.origin + "/" + full_path;
    },
    getSourceMedia({ source_media, folder_path }) {
      // three cases : source_media contains
      // - meta_filename, meaning media belongs to publication path
      // - meta_filename_in_project, meaning media belongs to project path
      // - path, meaning media has full path to project or publi media (legacy)

      let source_path = undefined;
      let meta_filename = undefined;

      if (source_media.meta_filename) {
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
        return this.$alertify.delay(4000).error("couldnt find media");
      }
      return this.getMediaInFolder({ folder_path: source_path, meta_filename });
    },
    getMediaInFolder({ folder_path, meta_filename }) {
      return this.$api.store[folder_path]?.$files?.find(
        ({ $path }) => $path === folder_path + "/" + meta_filename
      );
    },

    transformURL(og_url) {
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
          src: this.getPeertubeEmbedFromUrl(cleaned_up_url),
        };
      else if (urlContains(cleaned_up_url, ["youtube.com", "youtu.be"]))
        return {
          type: "youtube",
          src: this.getYoutubeEmbedURLFromURL(cleaned_up_url),
        };
      else if (urlContains(cleaned_up_url, ["vimeo.com"]))
        return {
          type: "vimeo",
          src: this.getVimeoEmbedURLFromURL(cleaned_up_url),
        };
      else if (urlContains(cleaned_up_url, ["soundcloud.com"]))
        return {
          type: "soundcloud",
          src: this.getSoundcloudEmbedURLFromURL(this.media.content),
        };

      return {
        type: "any",
        src: cleaned_up_url,
      };
    },

    getPeertubeEmbedFromUrl(url) {
      const video_id = url.split("/").at(-1);
      return "https://peertube.fr/videos/embed/" + video_id;

      // const MATCH_URL = new RegExp("(https?)://(.*)(/videos/watch/|/w/)(.*)");
      // const m = MATCH_URL.exec(url);
      // return `${m[1]}://${m[2]}/videos/embed/${m[3]}?api=1&controls=${true}`;
    },
    getTweetIdFromURL(url) {
      let tweetRegex =
        /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/([0-9]{19})/;
      return url.match(tweetRegex)[3];
    },
    getYoutubeEmbedURLFromURL(url) {
      function getId(url) {
        const regExp =
          /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
      }
      const videoId = getId(url);
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`;
    },
    getVimeoEmbedURLFromURL(url) {
      function getId(url) {
        const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
        const match = url.match(regExp);
        return match ? match[1] : null;
      }
      const videoId = getId(url);
      return `https://player.vimeo.com/video/${videoId}?loop=false&byline=false&portrait=false&title=false&transparent=0&dnt=true&playsinline=true`;
      // return `https://player.vimeo.com/video/${videoId}`;
    },
    getSoundcloudEmbedURLFromURL(url) {
      return `https://w.soundcloud.com/player/?url=${url}&color=0066cc`;
    },
  },
};
