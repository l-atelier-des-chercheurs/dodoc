<template>
  <div class="_cover">
    <template v-if="can_be_edited">
      <sl-button
        v-if="!edit_mode"
        variant="neutral"
        class="_editBtn"
        size="small"
        circle
        @click="enableEditMode"
      >
        <sl-icon name="pencil-fill" :label="$t('edit')" />
      </sl-button>

      <template v-else>
        <ImageSelect
          v-if="edit_mode"
          class="_imageSelect"
          :existing_preview="false"
          :project_slug="project_slug"
          @newPreview="
            (value) => {
              new_cover_raw = value;
            }
          "
        />

        <div class="_footer">
          <SaveCancelButtons
            class="_scb"
            :is_saving="is_saving"
            :allow_save="allow_save"
            @save="updateCover"
            @cancel="cancel"
          />
        </div>
      </template>
    </template>
  </div>
</template>
<script>
export default {
  props: {
    cover: Object,
    project_slug: String,
    path: String,
  },
  components: {},
  data() {
    return {
      selected_file: [],
      new_cover_raw: "",
      allow_save: true,

      edit_mode: false,
      is_saving: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    can_be_edited() {
      return this.$api.is_logged_in;
    },
  },
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
    },
    async updateCover() {
      this.is_saving = true;

      try {
        await this.$api.updateCover({
          folder_type: "projects",
          folder_slug: this.project_slug,
          filename: "cover",
          rawData: this.new_cover_raw,
          // onProgress,
        });

        this.edit_mode = false;
        this.is_saving = false;
      } catch (e) {
        this.is_saving = false;
        this.edit_mode = false;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.couldntbesaved"));

        this.$alertify.closeLogOnClick(true).error(e.response);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._cover {
}

._imageSelect {
  position: relative;
  background: white;
}
</style>
