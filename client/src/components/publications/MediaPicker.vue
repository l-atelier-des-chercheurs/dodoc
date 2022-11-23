<template>
  <div class="_mediaPicker">
    <div>
      <sl-button
        variant="edit"
        class="editBtn"
        size="small"
        pill
        v-if="!show_media_picker"
        @click="showMediaPicker"
      >
        <sl-icon name="plus-circle-fill" :label="$t('edit')" />
        {{ $t("add_media") }}
      </sl-button>
      <sl-button
        size="small"
        variant="default"
        pill
        v-else
        @click="hideMediaPicker"
      >
        <sl-icon name="x-circle" />
        {{ $t("back") }}
      </sl-button>
    </div>

    <template v-if="show_media_picker">
      <!-- OPTIONS -->
      <!-- create a text -->
      <button type="button" @click="createText">
        {{ $t("create_text") }}
      </button>

      <!-- select from this or another project library -->
      <PickMediaFromProjects
        :publication_path="publication_path"
        @selectMedia="appendMediaFromProject"
        @close="show_media_picker = false"
      />
    </template>
  </div>
</template>
<script>
import PickMediaFromProjects from "@/components/publications/PickMediaFromProjects.vue";

export default {
  props: {
    publication_path: String,
  },
  components: {
    PickMediaFromProjects,
  },
  data() {
    return {
      show_media_picker: false,
    };
  },
  async created() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    showMediaPicker() {
      this.show_media_picker = true;
    },
    hideMediaPicker() {
      this.show_media_picker = false;
    },
    async createText() {
      const filename = "text.txt";
      const content = "";
      const additional_meta = {
        caption: "plip",
      };

      const meta_filename = await this.$api.uploadText({
        path: this.publication_path,
        filename,
        content,
        additional_meta,
      });
      this.$emit("appendMetaFilenameToList", { meta_filename });
    },
    async appendMediaFromProject(path_to_source_media) {
      const meta_filename = await this.$api
        .uploadFile({
          path: this.publication_path,
          additional_meta: {
            path_to_source_media,
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      this.$emit("appendMetaFilenameToList", { meta_filename });
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaPicker {
  width: 100%;
  background: var(--c-gris_clair);
}
</style>
