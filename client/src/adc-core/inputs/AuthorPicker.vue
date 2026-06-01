<template>
  <div class="_authorPicker">
    <div class="_searchField">
      <SearchInput
        v-model="search_author_name"
        :search_placeholder="$t('search_by_author_name')"
        :name="'search_author'"
      />
    </div>

    <div v-if="available_groups.length > 0" class="u-spacingBottom">
      <DLabel :str="$t('add_by_group')" />
      <TagsList
        :tags="available_groups"
        :tag_type="'accountgroup'"
        :mode="'add'"
        @tagClick="addAuthorsFromGroup($event)"
      />
    </div>

    <div v-if="filtered_authors.length === 0" class="u-instructions">
      {{ $t("no_authors_to_show") }}
    </div>
    <transition-group tag="div" class="_list" name="listComplete" appear>
      <AuthorTag
        v-for="{ $path } in filtered_authors"
        :path="$path"
        :key="$path"
        :mode="'add'"
        @click="$emit('addAuthor', $path)"
      />
    </transition-group>
  </div>
</template>
<script>
export default {
  props: {
    current_authors: Array,
  },
  components: {},
  data() {
    return {
      all_authors: [],
      search_author_name: "",
    };
  },
  async created() {
    this.all_authors = await this.$api.getFolders({
      path: `authors`,
    });
  },
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    available_groups() {
      const groups = new Set();
      this.all_authors_except_current.forEach((author) => {
        if (author.group && Array.isArray(author.group)) {
          author.group.forEach((g) => {
            if (g) groups.add(g);
          });
        }
      });
      return Array.from(groups).sort();
    },
    all_authors_except_current() {
      return this.all_authors.filter((a) => {
        if (this.current_authors.length > 0)
          return !this.current_authors.includes(a.$path);
        return true;
      });
    },
    sorted_authors() {
      return this.all_authors_except_current.slice().sort((a, b) => {
        if (this.connected_as?.$path && a.$path === this.connected_as?.$path)
          return -1;
        if (this.connected_as?.$path && b.$path === this.connected_as?.$path)
          return 1;
        return a.name.localeCompare(b.name);
      });
    },
    filtered_authors() {
      return this.sorted_authors.filter((a) => {
        if (this.search_author_name)
          return this.twoStringsSearch(a.name, this.search_author_name);
        return true;
      });
    },
  },
  methods: {
    addAuthorsFromGroup(group_name) {
      const authors_in_group = this.all_authors_except_current.filter(
        (author) => {
          return (
            author.group &&
            Array.isArray(author.group) &&
            author.group.includes(group_name)
          );
        }
      );
      authors_in_group.forEach((author) => {
        this.$emit("addAuthor", author.$path);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._searchField {
  margin-bottom: calc(var(--spacing) / 4);
}
._maxlength {
  flex: 0 0 auto;
  padding: calc(var(--spacing) / 4) 0;
}
._label {
}

._authorPicker {
  // border: 2px solid var(--c-bleumarine);
}
._list {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}
</style>
