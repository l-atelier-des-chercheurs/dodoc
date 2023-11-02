<template>
  <div class="_mediaPicker">
    <div class="_mpContent">
      <MediaContent
        v-if="selected_media"
        :file="selected_media"
        :resolution="220"
        :context="'preview'"
      />
      <div class="_changeBtn">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          v-if="!content"
          @click="show_media_picker = true"
        >
          <b-icon icon="image" />
          {{ $t("pick_base_image") }}
        </button>
        <button
          type="button"
          class="u-button u-button_small u-button_red"
          v-else
          @click="show_media_picker = true"
        >
          <b-icon icon="dash-circle" />
          {{ $t("change_base_media") }}
        </button>

        <PickMediaFromProjects
          v-if="show_media_picker"
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
        pick_base_image: "Choisir le média de référence",
        change_base_media: "Changer le média de référence",
      },
      en: {
        pick_base_image: "Pick base image",
        change_base_media: "Change base media",
      },
    },
  },
  data() {
    return {
      show_media_picker: !this.content ? true : false,
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
._mediaPicker {
  display: flex;

  > ._mpContent {
    display: flex;
    flex-flow: row wrap;
    align-items: center;

    margin: 0 auto;
    width: 100%;
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
  flex: 1;
  text-align: center;
}
</style>
