export default {
  computed: {},
  methods: {
    openInFinder({ absolute_path, path }) {
      if (absolute_path)
        window.electronAPI.send("toMain", {
          type: "open_path",
          absolute_path,
        });
      else if (path)
        window.electronAPI.send("toMain", {
          type: "open_path",
          path,
        });
    },
  },
};
