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
    <div v-if="file.is_stack" class="_sharedFolderItem--stackSign">
      <svg
        fill="none"
        height="40"
        viewBox="0 0 33 40"
        width="33"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m27.5 0h-17.5c-1.32608 0-2.59785.526784-3.53553 1.46447-.93769.93768-1.46447 2.20945-1.46447 3.53553-1.32608 0-2.59785.52678-3.53553 1.46447-.937686.93768-1.46447 2.20945-1.46447 3.53553v25c0 1.3261.526784 2.5979 1.46447 3.5355.93768.9377 2.20945 1.4645 3.53553 1.4645h17.5c1.3261 0 2.5979-.5268 3.5355-1.4645.9377-.9376 1.4645-2.2094 1.4645-3.5355 1.3261 0 2.5979-.5268 3.5355-1.4645.9377-.9376 1.4645-2.2094 1.4645-3.5355v-25c0-1.32608-.5268-2.59785-1.4645-3.53553-.9376-.937686-2.2094-1.46447-3.5355-1.46447zm0 32.5v-22.5c0-1.32608-.5268-2.59785-1.4645-3.53553-.9376-.93769-2.2094-1.46447-3.5355-1.46447h-15c0-.66304.26339-1.29893.73223-1.76777s1.10473-.73223 1.76777-.73223h17.5c.663 0 1.2989.26339 1.7678.73223.4688.46884.7322 1.10473.7322 1.76777v25c0 .663-.2634 1.2989-.7322 1.7678-.4689.4688-1.1048.7322-1.7678.7322zm-25-22.5c0-.66304.26339-1.29893.73223-1.76777s1.10473-.73223 1.76777-.73223h17.5c.663 0 1.2989.26339 1.7678.73223.4688.46884.7322 1.10473.7322 1.76777v25c0 .663-.2634 1.2989-.7322 1.7678-.4689.4688-1.1048.7322-1.7678.7322h-17.5c-.66304 0-1.29893-.2634-1.76777-.7322-.46884-.4689-.73223-1.1048-.73223-1.7678z"
          fill="#fff"
        />
      </svg>
    </div>
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
    ._title {
      transform: translate(0, 0%);
      opacity: 1;
    }
  }

  ._sharedFolderItem--preview {
    background: white;
  }

  ._sharedFolderItem--stackSign {
    position: absolute;

    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    > svg {
      width: 30px;
      height: auto;
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
