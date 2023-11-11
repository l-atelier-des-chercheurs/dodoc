<template>
  <div class="_singleBaseMediaPicker">
    <div class="_mpContent">
      <MediaContent
        v-if="selected_media"
        :file="selected_media"
        :resolution="220"
        :context="'preview'"
      />
      <span v-else-if="content">
        {{ $t("media_not_found") }}
      </span>
      <div class="_changeBtn">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          v-if="!content"
          @click="show_media_picker = true"
        >
          <b-icon icon="image" />
          <!-- {{ $t("pick_base_media") }} -->
          {{ title }}
        </button>
        <button
          type="button"
          class="u-button u-button_small u-button_red"
          v-else
          @click="show_media_picker = true"
        >
          <b-icon icon="plus-circle" />
          <!-- {{ $t("change_base_media") }} -->
          {{ title }}
        </button>

        <PickMediaFromProjects
          v-if="show_media_picker"
          :title="title"
          :path="path"
          :select_mode="'single'"
          :pick_from_type="media_type_to_pick"
          @addMedias="pickMedia"
          @close="show_media_picker = false"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    field_name: String,
    content: {
      type: String,
      default: "",
    },
    path: String,
    media_type_to_pick: String,
  },
  components: {},
  i18n: {
    messages: {
      fr: {
        not_found: "Média introuvable",
        pick_base_media: "Choisir le média de référence",
        change_base_media: "Changer le média de référence",
      },
      en: {
        not_found: "Media not found",
        pick_base_media: "Pick base media",
        change_base_media: "Change base media",
      },
    },
  },
  data() {
    return {
      show_media_picker: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    selected_media() {
      const meta_filename_in_project = this.content;
      if (meta_filename_in_project)
        return this.getSourceMedia({
          source_media: { meta_filename_in_project },
          folder_path: this.path,
        });
      return false;
    },
  },
  methods: {
    async pickMedia({ path_to_source_media_metas }) {
      const path_to_source_media_meta = path_to_source_media_metas[0];
      const selected_media_filename = this.getFilename(
        path_to_source_media_meta
      );
      const new_meta = {
        [this.field_name]: selected_media_filename,
      };
      return await this.$api.updateMeta({
        path: this.path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._singleBaseMediaPicker {
  display: flex;

  > ._mpContent {
    display: flex;
    flex-flow: row wrap;
    align-items: center;

    margin: 0 auto;
    width: auto;
    // width: 100%;
    max-width: 320px;

    color: white;
    background: var(--c-bleumarine_fonce);
    gap: calc(var(--spacing) / 4);
    padding: calc(var(--spacing) / 4);
    border-radius: 4px;

    ::v-deep ._mediaContent {
      width: 50px;
      height: 50px;

      ._mediaContent--image {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        max-width: none;
        border-radius: 1px;
      }
    }
  }
}
._changeBtn {
  flex: 1 0 auto;
  text-align: center;
}
</style>
