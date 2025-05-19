export default {
  methods: {
    async loadAllFolders(...pathSegments) {
      if (!pathSegments.length) return [];

      const currentPath = pathSegments[0];
      const remainingPaths = pathSegments.slice(1);

      let folders = await this.$api
        .getFolders({
          path: currentPath,
        })
        .catch((err) => {
          return err;
        });

      folders = folders.filter((s) =>
        this.canLoggedinSeeFolder({
          folder: s,
        })
      );

      if (folders.length === 0) return [];
      if (remainingPaths.length === 0) return folders;

      let all_folders = [];
      for (const folder of folders) {
        const nestedFolders = await this.loadAllFolders(
          folder.$path + "/" + remainingPaths[0],
          ...remainingPaths.slice(1)
        );
        if (nestedFolders.length > 0) {
          all_folders = all_folders.concat(nestedFolders);
        }
      }
      return all_folders;
    },

    async loadAllFoldersInHierarchy(...pathSegments) {
      if (!pathSegments.length) return [];

      const currentPath = pathSegments[0];
      const remainingPaths = pathSegments.slice(1);

      let folders = await this.$api
        .getFolders({
          path: currentPath,
        })
        .catch((err) => {
          return err;
        });

      folders = folders.filter((s) =>
        this.canLoggedinSeeFolder({
          folder: s,
        })
      );

      if (folders.length === 0) return [];

      // Add hierarchy information to each folder
      folders = folders.map((folder) => ({
        ...folder,
        _children: [],
        level: pathSegments.length,
      }));

      if (remainingPaths.length === 0) return folders;

      for (const folder of folders) {
        const nestedFolders = await this.loadAllFoldersInHierarchy(
          folder.$path + "/" + remainingPaths[0],
          ...remainingPaths.slice(1)
        );
        if (nestedFolders.length > 0) {
          folder._children = nestedFolders;
        }
      }

      return folders;
    },
  },
};
