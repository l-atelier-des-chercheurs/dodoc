export default {
  computed: {},
  methods: {
    makeRelativeURLFromThumbs({ thumbs, type, project_path, resolution }) {
      if (!thumbs) return false;

      let thumb_path = "";
      try {
        if (type === "image") thumb_path = thumbs[resolution];
        if (type === "video") thumb_path = thumbs["0"][resolution];
        if (type === "audio") thumb_path = thumbs.waveform[resolution];
        if (type === "stl") thumb_path = thumbs["0"][resolution];
        if (type === "pdf") thumb_path = thumbs["page-1"][resolution];
        if (type === "url") thumb_path = thumbs["ogimage"][resolution];
      } catch (err) {
        return false;
      }

      // todo make this work with subfolders

      return `/thumbs/${project_path}/${thumb_path}`;
    },
  },
};
