<template>
  <div class="_uiView">
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        @click="dummy"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        :mode="'select'"
        @click="dummy"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        :mode="'add'"
        @click="dummy"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        :mode="'remove'"
        @click="dummy"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        :mode="'link'"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        :show_image_only="true"
        :mode="'link'"
      />
    </div>
    <hr />
    <div class="u-listOfAvatars" key="list">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        :show_image_only="true"
        :mode="'link'"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      authors: [],
    };
  },
  created() {},
  async mounted() {
    this.authors = await this.$api.getFolders({
      path: "authors",
    });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    authors_sublist() {
      return this.authors.slice(0, 5);
    },
  },
  methods: { dummy() {} },
};
</script>
<style lang="scss" scoped>
._uiView {
  max-width: 600px;
  margin: calc(var(--spacing) / 1) auto;
  width: 100%;
}

._authors {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}
</style>
