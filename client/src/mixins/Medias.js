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
    getSourceMedia({ source_media_path }) {
      const folder_path = source_media_path.substring(
        0,
        source_media_path.lastIndexOf("/")
      );
      return this.$api.store[folder_path]?.$files?.find(
        ({ $path }) => $path === source_media_path
      );
      // const source_project = this.$api.store.find()
    },
  },
};
