<template>
  <div class="_sharedFolderItem">
    <!-- {{ file }} -->
    <div v-if="file.is_stack" class="_sharedFolderItem--stackSign">
      <sl-button circle class="">
        <sl-icon class="" name="files" />
      </sl-button>
    </div>
    <MediaContent
      class="_sharedFolderItem--preview"
      :file="file.is_stack ? file._stack_files[0] : file"
      :context="'preview'"
    />
    <small class="_titleKeywords">
      {{ file.title }} / {{ file.description }} / {{ file.keywords }}
    </small>
    <!-- <sl-icon-button
      name="trash3"
      circle
      class="_removeBtn"
      @click="removeMedia(file.$path)"
    /> -->
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
  }

  ._sharedFolderItem--stackSign {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    > * {
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
