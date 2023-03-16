<template>
  <div>
    <sl-spinner style="--indicator-color: currentColor" v-if="!publication" />
    <div v-else-if="fetch_publication_error">
      {{ fetch_publication_error }}
    </div>
    <template v-else>
      <button type="button" class="u-buttonLink" @click="$emit('close')">
        <sl-icon name="arrow-left-short" />
        {{ $t("back_to_publications") }}
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

        <div class="_buttonRow" v-if="can_edit_publication">
          <div class="">
            <button
              type="button"
              class="u-buttonLink"
              @click="exportPublication"
            >
              <sl-icon name="filetype-pdf" />
              {{ $t("export") }}
            </button>
          </div>
          <div class="">
            <router-link
              :to="{ path: createURLFromPath(publication.$path) }"
              target="_blank"
              class="u-buttonLink"
            >
              <sl-icon name="share" />
              {{ $t("share") }}
            </router-link>
          </div>
          <RemoveMenu :remove_text="$t('remove')" @remove="removePublication" />
        </div>
      </div>
      <StoryTemplate
        v-if="publication.template === 'story'"
        :publication="publication"
        :can_edit="can_edit_publication"
      />
      <PageTemplate
        v-else-if="publication.template === 'page_by_page'"
        :publication="publication"
        :can_edit="can_edit_publication"
        :page_opened_id="page_opened_id"
        @togglePage="$emit('togglePage', $event)"
        @closePublication="$emit('close')"
      />
    </template>
  </div>
</template>
<script>
export default {
  props: {
    project_path: String,
    publication_slug: String,
    page_opened_id: String,
    can_edit: Boolean,
  },
  components: {
    StoryTemplate: () =>
      import("@/components/publications/templates/StoryTemplate.vue"),
    PageTemplate: () =>
      import("@/components/publications/templates/PageTemplate.vue"),
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
    this.$eventHub.$off("folder.removed", this.closeOnRemove);
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
        });
      this.publication = publication;
    },
    async exportPublication() {
      let instructions = {
        recipe: "pdf",
        page_width: this.publication.page_width,
        page_height: this.publication.page_height,
      };

      if (this.publication.page_spreads === true) instructions.page_width *= 2;

      await this.$api.exportFolder({
        path: this.publication.$path,
        instructions,
      });
      this.$alertify.delay(4000).log(this.$t("compilation_started"));
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
      this.fetch_status = "pending";
      this.fetch_error = null;
      try {
        const response = await this.$api.deleteItem({
          path: this.publication.$path,
        });
        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
        // this.$alertify.delay(4000).error(err);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._topbar {
  display: flex;
  align-items: center;
  width: 100%;
  background: white;
  padding: calc(var(--spacing) / 1) calc(var(--spacing) * 1);
  margin: calc(var(--spacing) / 1) auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  // max-width: 800px;
}

._buttonRow {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 2);
}
</style>
