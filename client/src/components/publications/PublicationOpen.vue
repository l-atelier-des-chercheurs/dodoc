<template>
  <div>
    <sl-spinner style="--indicator-color: currentColor" v-if="!publication" />
    <div v-else-if="fetch_publication_error">
      {{ fetch_publication_error }}
    </div>
    <template v-else>
      <button type="button" class="u-buttonLink" @click="$emit('close')">
        {{ $t("close") }}
      </button>

      <div class="_topbar">
        <TitleField
          :label="$t('title')"
          :field_name="'title'"
          :tag="'h2'"
          :content="publication.title"
          :path="publication.$path"
          :can_edit="can_edit_publication"
        />
        <!-- <TitleField
          :label="$t('template')"
          :field_name="'template'"
          :content="publication.template"
          :path="publication.$path"
          :can_edit="false"
        /> -->
        <!-- <AuthorField
          :label="$t('contributors')"
          :authors_paths="publication.$authors"
          :path="publication.$path"
          :can_edit="can_edit_publication"
        /> -->

        <div class="_buttonRow">
          <button
            type="button"
            class="u-buttonLink"
            v-if="can_edit_publication"
            @click="removePublication()"
          >
            {{ $t("remove") }}
          </button>
        </div>
      </div>
      <StoryTemplate
        v-if="publication.template === 'story'"
        :publication="publication"
        :can_edit="can_edit_publication"
      />
    </template>
  </div>
</template>
<script>
import StoryTemplate from "@/components/publications/templates/StoryTemplate.vue";

export default {
  props: {
    project_path: String,
    publication_slug: String,
    can_edit: Boolean,
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
  beforeDestroy() {
    this.$api.leave({ room: this.publication.$path });
  },
  watch: {},
  computed: {
    can_edit_publication() {
      return this.can_edit;
    },
  },
  methods: {
    async listPublication() {
      const publication = await this.$api
        .getFolder({
          path: `${this.project_path}/publications/${this.publication_slug}`,
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
  padding: calc(var(--spacing) / 1) calc(var(--spacing) * 2);
  margin: calc(var(--spacing) / 1) auto 0;

  border-bottom: 2px solid var(--c-gris_fonce);
  max-width: 800px;
}

._buttonRow {
  display: flex;
  justify-content: flex-end;
}
</style>
