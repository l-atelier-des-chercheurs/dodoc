export default {
  computed: {},
  methods: {
    getStackFilesInOrder({ stack }) {
      if (stack?.$files?.length === 0 || !stack?.stack_files_metas) return [];
      return stack.stack_files_metas.reduce((acc, meta_filename) => {
        const file = stack.$files.find(
          (f) => this.getFilename(f.$path) === meta_filename
        );
        if (file) acc.push(file);
        return acc;
      }, []);
    },
  },
};
