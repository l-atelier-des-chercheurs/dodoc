export default {
  computed: {},
  methods: {
    createURLFromPath(path) {
      // from spaces/tiers-lieux-edu/projects/mon-premier-projet
      // to /+tiers-lieux-edu/projects/mon-premier-projet
      const path_without_space = path
        .replace("authors/", "/@")
        .replace("spaces/", "/+")
        .replace("events/", "/#")
        .replace("pages/", "/p/")
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
    getFilenameWithoutExt(filename) {
      return filename.substring(0, filename.lastIndexOf("."));
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
    createPath({
      space_slug,
      project_slug,
      author_slug,
      event_slug,
      page_slug,
    } = {}) {
      if (author_slug) return `authors/${author_slug}`;
      if (event_slug) return `events/${event_slug}`;
      if (space_slug)
        if (project_slug)
          return `spaces/${space_slug}/projects/${project_slug}`;
        else return `spaces/${space_slug}`;
      if (page_slug) return `pages/${page_slug}`;
      return false;
    },
    getRandomString() {
      return (Math.random().toString(36) + "00000000000000000").slice(2, 2 + 3);
    },
  },
};
