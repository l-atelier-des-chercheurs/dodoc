<template>
  <div class="_allContent">
    <h2>{{ $t("all_content") }}</h2>
    <ol>
      <li v-for="folder in all_folders" :key="folder.$path">
        {{ folder.title }}
        <ol v-if="folder._children.length > 0">
          <li v-for="child in folder._children" :key="child.$path">
            {{ child.title }}
            <ol v-if="child._children.length > 0">
              <li v-for="subchild in child._children" :key="subchild.$path">
                {{ subchild.title }}
              </li>
            </ol>
          </li>
        </ol>
      </li>
    </ol>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      all_folders: [],
    };
  },
  created() {
    this.fetchPinnedPublications();
  },
  methods: {
    async fetchPinnedPublications() {
      this.all_folders = await this.loadAllFoldersInHierarchy(
        "spaces",
        "projects",
        "publications"
      );
    },
  },
};
</script>

<style lang="scss" scoped>
._allContent {
  min-height: 100vh;
}

ol {
  list-style-type: decimal;
  margin-left: 2rem;
}
</style>
