<template>
  <div class="_singleBaseMediaPicker">
    <button
      type="button"
      class="u-button u-button_bleuvert"
      v-if="!make.base_media_filename"
      @click="show_media_picker = true"
    >
      <b-icon icon="image" />
      {{ $t("pick_image") }}
    </button>
    <button
      type="button"
      class="u-button u-button_small u-button_red"
      v-else
      @click="show_media_picker = true"
    >
      <b-icon icon="dash-circle" />
      {{ $t("change_base_image") }}
    </button>

    <PickMediaFromProjects
      v-if="show_media_picker"
      :path="project_path"
      :select_mode="'single'"
      :pick_from_type="media_type_to_pick"
      @addMedias="pickMedia"
      @close="show_media_picker = false"
    />
  </div>
</template>
<script>
export default {
  props: {
    make: Object,
    project_path: String,
    media_type_to_pick: String,
  },
  components: {},
  data() {
    return {
      show_media_picker: !this.make.base_media_filename ? true : false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async pickMedia({ path_to_source_media_metas }) {
      const path_to_source_media_meta = path_to_source_media_metas[0];
      const base_media_filename = this.getFilename(path_to_source_media_meta);
      await this.updatePubliMeta({ base_media_filename });
    },
    async updatePubliMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.make.$path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
