<template>
  <div>
    <sl-spinner style="--indicator-color: currentColor" v-if="!publication" />
    <div v-else-if="fetch_publication_error">
      {{ fetch_publication_error }}
    </div>
    <template v-else>
      {{ publication.title }}
      {{ publication.title }}
    </template>
  </div>
</template>
<script>
export default {
  props: {
    publication_slug: String,
  },
  components: {},
  data() {
    return {
      publication: null,
      fetch_publication_error: null,
    };
  },
  created() {},
  async mounted() {
    await this.listPublication();
    this.$eventHub.$on("folder.removed", this.closeOnRemove);
    this.$api.join({ room: this.publication.$path });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async listPublication() {
      const publication = await this.$api
        .getFolder({
          path: this.$route.path + `publications/${this.publication_slug}`,
        })
        .catch((err) => {
          this.fetch_publication_error = err.response;
          this.is_loading = false;
        });
      this.publication = publication;
    },
    closeOnRemove({ path }) {
      if (path === this.publication.$path) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t("notifications.publication_was_removed"));
        this.$emit("close");
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
