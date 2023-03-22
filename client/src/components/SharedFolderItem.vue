<template>
  <div class="_sharedFolderItem">
    <MediaContent
      class="_sharedFolderItem--preview"
      :file="file"
      :context="'preview'"
    />
    <span class="_titleKeywords">
      {{ file.title }}
      {{ file.keywords }}
    </span>
    <button
      type="button"
      class="u-button u-button_transparent _removeBtn"
      @click="removeMedia(file.$path)"
    >
      <sl-icon name="trash3" />
    </button>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
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
    removeMedia(path) {
      this.$api.deleteItem({ path });
    },
  },
};
</script>
<style lang="scss" scoped>
._sharedFolderItem {
  position: relative;
  aspect-ratio: 1/1;
  border-radius: 4px;
  flex: 0 0 auto;
  overflow: hidden;

  ._sharedFolderItem--preview {
    width: 100%;
    height: 100%;
  }

  ::v-deep ._mediaContent--image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
}

._titleKeywords {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}
</style>
