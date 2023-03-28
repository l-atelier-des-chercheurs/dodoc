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
    createURLToSpace(path) {
      return path.split("/").splice(0, 1).join("/");
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
