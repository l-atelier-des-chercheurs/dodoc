export default {
  computed: {},
  methods: {
    createURLFromPath(path) {
      // from spaces/tiers-lieux-edu/projects/mon-premier-projet
      // to /+tiers-lieux-edu/projects/mon-premier-projet
      const path_without_space = path
        .replace("authors/", "/@")
        .replace("spaces/", "/+")
        .replace("projects/", "");
      return path_without_space;
      // return "/" + path;
    },
    getParent(path) {
      return path.substring(0, path.lastIndexOf("/"));
    },
    getFilename(path) {
      return path.substring(path.lastIndexOf("/") + 1);
    },
    createURLToSpace(url) {
      return url.split("/").splice(0, 1).join("/");
    },
    decomposePath(path) {
      let obj = {};
      const path_items = path.split("/");

      if (path_items.length === 0) return obj;
      if (path_items[0] === "spaces") {
        if (path_items[1]) obj.space_slug = path_items[1];
        if (path_items[3]) obj.project_slug = path_items[3];
      }
      if (path_items[0] === "authors") {
        if (path_items[1]) obj.author_slug = path_items[1];
      }

      return obj;
    },
    createPath({ space_slug, project_slug, author_slug } = {}) {
      if (author_slug) return `authors/${author_slug}`;
      let path = `spaces`;
      if (space_slug) path += `/${space_slug}`;
      if (project_slug) path += `/projects/${project_slug}`;
      return path;
    },
  },
};
