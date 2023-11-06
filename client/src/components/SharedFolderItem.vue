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
      <template v-if="file && file.title">
        {{ file.title }}
      </template>
      <template v-else>-</template>
    </div>
    <MediaContent
      class="_sharedFolderItem--preview"
      v-if="first_file"
      :file="first_file"
      :context="'preview'"
      :img_loading="'lazy'"
      :resolution="360"
    />
    <template v-if="_is_stack">
      <MediaContent
        class="_sharedFolderItem--preview _sharedFolderItem--preview_stacked"
        v-if="_stack_files.length > 1"
        :file="_stack_files[1]"
        :img_loading="'lazy'"
        :context="'preview'"
      />
      <MediaContent
        class="_sharedFolderItem--preview _sharedFolderItem--preview_stacked"
        v-if="_stack_files.length > 2"
        :file="_stack_files[2]"
        :img_loading="'lazy'"
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
  computed: {
    first_file() {
      if (!this.file) return false;
      return this._is_stack ? this.file._stack_files[0] : this.file;
    },
    _is_stack() {
      return (
        this.file.is_stack &&
        this.file._stack_files &&
        Array.isArray(this.file._stack_files) &&
        this.file._stack_files[0] &&
        this.file._stack_files[0].$type
      );
    },
    _stack_files() {
      return this.file?._stack_files;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._sharedFolderItem {
  --stack-step: 10px;

  position: relative;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus,
  &.is--opened {
    // background: rgb(67, 69, 71);
    z-index: 100;
    transform: translateY(-10px);
    box-shadow: 0 13px 10px rgba(0, 0, 0, 0.1);
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

    transform: translate(0, -50px);
    opacity: 0;

    pointer-events: none;

    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &:hover,
  &:focus,
  &.is--opened {
    z-index: 20;
    --stack-step: 20px;

    ._title {
      transform: translate(0, 0%);
      opacity: 1;
      pointer-events: auto;
    }
  }
}
._sharedFolderItem--preview {
  background: white;
  z-index: 10;
  // border-radius: 4px;
  // border-radius: 4px 4px 0 0;

  overflow: hidden;
  // border: 2px solid white;
  border-bottom: 1px solid white;

  min-height: 20px;
  max-height: 150px;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;

  ::v-deep {
    ._mediaContent--image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .ql-container {
      font-size: 50%;
      .ql-editor {
        > *:not(:first-child) {
          display: none;
        }
      }
    }
  }
}

._sharedFolderItem--preview_stacked {
  position: absolute;
  top: 0;
  left: 0;
  height: 50px;

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

  ::v-deep {
    ._mediaContent--image {
      object-position: top left;
    }
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
