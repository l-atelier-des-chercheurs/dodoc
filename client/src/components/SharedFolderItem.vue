<template>
  <div class="_sharedFolderItem">
    <!-- {{ file }} -->

    <div v-if="file.is_stack" class="_sharedFolderItem--previewStack">
      <MediaContent
        v-for="file in file._stack_files"
        :key="file.$path"
        :file="file"
        :context="'preview'"
      />
    </div>
    <MediaContent
      v-else
      class="_sharedFolderItem--preview"
      :file="file"
      :context="'preview'"
    />
    <small class="_titleKeywords">
      {{ file.title }} / {{ file.description }} / {{ file.keywords }}
    </small>
    <sl-icon-button
      name="trash3"
      circle
      class="_removeBtn"
      @click="removeMedia(file.$path)"
    />
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

  ._sharedFolderItem--preview {
    // width: 100%;
    // height: 100%;
  }

  ._sharedFolderItem--previewStack {
    // width: 100%;
    // height: 100%;
    position: relative;

    > * {
      &:nth-last-child(1) {
        position: relative;
        z-index: 1;
      }

      &:not(:nth-child(1)) {
        position: absolute;
        top: -10px;
      }
      &:nth-last-child(2) {
        top: -20px;
      }
      &:nth-last-child(3) {
        top: -30px;
      }
    }
  }

  ::v-deep ._mediaContent--image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}

._titleKeywords {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}
._removeBtn {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
