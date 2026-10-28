<template>
  <span class="_tabLink">
    <router-link v-if="url" :to="url" @click.native="$emit('close')">
      {{ label }}
    </router-link>
    <span v-else>{{ label }}</span>
    <small
      v-if="path === $api.self_path"
      class="_here"
      v-text="$t('you_are_here')"
    />
  </span>
</template>
<script>
export default {
  props: {
    path: String,
    // set by the server when the viewer can't open this private folder
    path_hidden: Boolean,
    // set by the server: folder titles from the root, ie [space, project]
    path_titles: Array,
  },
  computed: {
    label() {
      if (this.path_hidden) return this.$t("in_a_private_folder");
      if (!this.path) return this.$t("unknown_location");
      if (this.path === "/") return this.$t("home");
      if (this.path === "404") return this.$t("page_not_found");
      if (this.path === "authors") return this.$t("authors");
      if (this.path_titles?.length > 0) return this.path_titles.join(" › ");
      const folder = this.$api.store[this.path];
      return folder?.title || folder?.name || this.path;
    },
    url() {
      if (!this.path || this.path === "404") return false;
      if (this.path === "/") return "/";
      if (this.path === "authors") return "/@";
      return this.createURLFromPath(this.path);
    },
  },
};
</script>
<style lang="scss" scoped>
._tabLink {
  display: inline-flex;
  flex-flow: row wrap;
  align-items: baseline;
  gap: calc(var(--spacing) / 2);
}
._here {
  color: var(--c-bleumarine);
}
</style>
