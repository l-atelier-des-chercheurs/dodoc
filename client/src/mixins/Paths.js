export default {
  computed: {},
  methods: {
    createURLFromPath(path) {
      // from spaces/tiers-lieux-edu/projects/mon-premier-projet
      // to /+tiers-lieux-edu/projects/mon-premier-projet
      const path_without_space = path
        .replace("spaces/", "/+")
        .replace("projects/", "");
      return path_without_space;
      // return "/" + path;
    },
    urlToSpace({ space_slug }) {
      return "/" + this.pathToProject({ space_slug });
    },
    getParent(path) {
      return path.substring(0, path.lastIndexOf("/"));
    },
    createURLToSpace(path) {
      return path.split("/").splice(0, 1).join("/");
    },
    pathToProject({ space_slug, project_slug }) {
      let path = `spaces/${space_slug}`;
      if (project_slug) path += `/projects/${project_slug}`;
      return path;
    },
  },
};
