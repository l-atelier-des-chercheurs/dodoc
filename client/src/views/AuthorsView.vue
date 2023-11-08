<template>
  <div>
    <template v-for="author in authors">
      <AuthorCard
        v-if="!connected_as"
        :key="author.$path"
        :author="author"
        :links_to_author_page="true"
      />
      <AuthorCard
        v-else
        :key="author.$path"
        :author="author"
        :links_to_author_page="true"
      />
    </template>
  </div>
</template>
<script>
import AuthorCard from "@/adc-core/author/AuthorCard.vue";

export default {
  props: {},
  components: {
    AuthorCard,
  },
  data() {
    return {
      path: "authors",
      authors: [],
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  async mounted() {
    this.authors = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
