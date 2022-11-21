<template>
  <div>
    <sl-spinner style="--indicator-color: currentColor" v-if="!publication" />
    <div v-else-if="fetch_publication_error">
      {{ fetch_publication_error }}
    </div>
    <template v-else>
      <div class="_topbar">
        <TitleField
          :label="$t('title')"
          :field_name="'title'"
          :content="publication.title"
          :path="publication.$path"
          :can_edit="true"
        />
        <TitleField
          :label="$t('template')"
          :field_name="'template'"
          :content="publication.template"
          :path="publication.$path"
          :can_edit="true"
        />
        <div>
          <button type="button" @click="removePublication()">Supprimer</button>
          <button type="button" @click="$emit('close')">Fermer</button>
        </div>
      </div>
      <StoryTemplate
        v-if="publication.template === 'story'"
        :publication="publication"
      />
    </template>
  </div>
</template>
<script>
import StoryTemplate from "@/components/publications/templates/StoryTemplate.vue";

export default {
  props: {
    publication_slug: String,
  },
  components: {
    StoryTemplate,
  },
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
    async removePublication() {
      await this.$api
        .deleteItem({
          path: this.publication.$path,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
._topbar {
  display: flex;
  width: 100%;
  background: white;
  padding: calc(var(--spacing) / 2);
}
</style>
