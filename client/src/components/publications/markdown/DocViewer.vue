<template>
  <div class="_docViewer">
    <div class="_docViewer--menu">
      <ol>
        <li v-for="(chapter, index) in content_nodes.chapters" :key="index">
          <button
            type="button"
            class="u-buttonLink"
            :class="{
              'is--active':
                chapter.meta_filename === opened_chapter?.meta_filename,
            }"
            @click="$emit('openChapter', chapter.meta_filename)"
          >
            {{ chapter.title }}
          </button>
        </li>
      </ol>
    </div>
    <transition name="pagechange" mode="out-in">
      <div
        class="_docViewer--content"
        v-if="opened_chapter"
        :key="opened_chapter?.meta_filename"
      >
        <h1>{{ opened_chapter.title }}</h1>
        <div v-html="opened_chapter.content" />
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    content_nodes: {
      type: Object,
      required: true,
    },
    opened_chapter_meta_filename: String,
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
    opened_chapter() {
      if (!this.opened_chapter_meta_filename) return undefined;
      return this.content_nodes.chapters.find(
        (chapter) => chapter.meta_filename === this.opened_chapter_meta_filename
      );
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._docViewer {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 1);
  padding: calc(var(--spacing) / 1);
  background-color: var(--body-bg);
  position: relative;
  overflow: auto;
  height: 100%;

  ._docViewer--menu {
    flex: 0 0 20ch;
    position: sticky;
    top: 0;
    padding: calc(var(--spacing) / 1);

    ul,
    ol {
      list-style: none;
      padding: 0;
      margin: 0;
    }
  }
  ._docViewer--content {
    flex: 1 1 100%;
  }
}
</style>
