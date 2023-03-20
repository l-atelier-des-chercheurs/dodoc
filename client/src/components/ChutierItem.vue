<template>
  <div class="_chutierItem">
    <input
      type="checkbox"
      :checked="is_selected"
      @change="$emit('toggleSelect')"
      class="_selectBox"
    />
    <MediaContent
      class="_chutierItem--preview"
      :file="file"
      :context="'preview'"
    />
    <TitleField
      :field_name="'title'"
      class="_title"
      :content="file.title || file.$media_filename"
      :path="file.$path"
      :required="true"
      :maxlength="40"
      :can_edit="true"
    />
    <TitleField
      :field_name="'description'"
      class="_description"
      :content="file.description"
      :path="file.$path"
      :required="false"
      :maxlength="240"
      :can_edit="true"
    />

    <button type="button" class="u-button u-button_transparent" @click="remove">
      <sl-icon name="trash3" />
    </button>
    <button
      type="button"
      class="u-button u-button_transparent"
      @click="moveToSharedSpace"
    >
      <sl-icon name="arrow-right-square" />
    </button>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    is_selected: Boolean,
    shared_space_path: String,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async moveToSharedSpace() {
      const destination_path_to_folder = this.shared_space_path;
      await this.$api.copyFile({
        path: this.file.$path,
        destination_path_to_folder,
      });
      await this.remove();
    },
    async remove() {
      this.$api.deleteItem({ path: this.file.$path });
    },
  },
};
</script>
<style lang="scss" scoped>
._chutierItem {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  width: 100%;
  border-top: 1px solid black;
}
._chutierItem--preview {
  height: 100px;
  width: 100px;
  flex: 0 0 auto;
  overflow: hidden;

  ::v-deep ._mediaContent--image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}
</style>
