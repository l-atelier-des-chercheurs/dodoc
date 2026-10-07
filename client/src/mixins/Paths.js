import { pathToPublicPath } from "../../../shared/path_to_public_path.mjs";

export default {
  computed: {},
  methods: {
    createURLFromPath(path) {
      return pathToPublicPath(path);
    },
    makeNavigationToProjectPane({ project_path, pane }) {
      const path = this.createURLFromPath(project_path);

      // already in this project: only update this pane, to keep other panes open
      const is_current_project = this.$route.path === path;
      let panes = [];
      if (is_current_project && this.$route.query?.projectpanes)
        try {
          panes = JSON.parse(this.$route.query.projectpanes);
        } catch (err) {
          panes = [];
        }

      const index = panes.findIndex((p) => p.type === pane.type);
      if (index === -1) panes.push({ size: 100, ...pane });
      else panes.splice(index, 1, { size: panes[index].size, ...pane });

      return {
        path,
        query: {
          ...(is_current_project ? this.$route.query : {}),
          projectpanes: JSON.stringify(panes),
        },
      };
    },
    toastWithLink({ message, navigation }) {
      this.$toast.success(message + " — " + this.$t("click_to_show"), {
        timeout: 8000,
        onClick: () => this.$router.push(navigation).catch(() => {}),
      });
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
