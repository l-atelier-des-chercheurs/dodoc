<template>
  <div
    class="_sharedFolderItem"
    :class="{
      'is--opened': is_opened,
    }"
    @click="$emit('open')"
  >
    <!-- {{ file }} -->
    <div class="_title">
      {{ file.title }}
    </div>

    <MediaContent
      class="_sharedFolderItem--preview"
      :file="file.is_stack ? file._stack_files[0] : file"
      :context="'preview'"
    />
    <template v-if="file.is_stack">
      <MediaContent
        class="_sharedFolderItem--preview _sharedFolderItem--preview_stacked"
        v-if="file._stack_files.length > 1"
        :file="file._stack_files[1]"
        :context="'preview'"
      />
      <MediaContent
        class="_sharedFolderItem--preview _sharedFolderItem--preview_stacked"
        v-if="file._stack_files.length > 2"
        :file="file._stack_files[2]"
        :context="'preview'"
      />
    </template>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    is_opened: Boolean,
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
  methods: {},
};
</script>
<style lang="scss" scoped>
._sharedFolderItem {
  --stack-step: 10px;

  position: relative;
  cursor: pointer;
  border-radius: 4px;
  // background: rgb(37, 39, 41);
  box-shadow: 0 0px 5px rgba(255 255 255 / 6%);
  // border: 1px solid rgb(67, 69, 71);

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus,
  &.is--opened {
    // background: rgb(67, 69, 71);
    transform: translateY(-15px);
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }

  ._title {
    position: absolute;
    width: 100%;
    top: 100%;
    word-break: break-word;

    background: white;
    padding: calc(var(--spacing) / 2);

    font-size: var(--sl-font-size-small);

    transform: translate(0, -100%);
    opacity: 0;

    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &:hover,
  &:focus,
  &.is--opened {
    z-index: 20;
    --stack-step: 30px;

    ._title {
      transform: translate(0, 0%);
      opacity: 1;
    }
  }
}
._sharedFolderItem--preview {
  background: white;
  z-index: 10;
  border-radius: 4px;
  overflow: hidden;
  // border: 2px solid white;
  border: 2px solid var(--sharedfolder-bg);

  ::v-deep ._mediaContent--image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}

._sharedFolderItem--preview_stacked {
  position: absolute;
  top: 0;
  left: 0;

  --back-position: 1;
  transform: translate(
    calc(var(--stack-step) * var(--back-position) / 2),
    calc(var(--stack-step) * -1 * var(--back-position))
  );
  width: calc(100% - var(--stack-step) * var(--back-position));

  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  z-index: 2;

  & + ._sharedFolderItem--preview_stacked {
    z-index: 1;
    --back-position: 2;
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
