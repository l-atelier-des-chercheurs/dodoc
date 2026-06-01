<template>
  <div class="_docViewer edition web">
    <component :is="'style'" v-html="css_styles" />
    <nav>
      <label>{{ $t("chapters") }}</label>
      <ol>
        <li
          v-for="(chapter, index) in content_nodes.chapters"
          :key="index"
          @click="$emit('openChapter', chapter.meta_filename)"
        >
          <button
            type="button"
            :class="{
              active: chapter.meta_filename === opened_chapter?.meta_filename,
            }"
          >
            {{ chapter.title || $t("untitled") + " " + (index + 1) }}
          </button>
        </li>
      </ol>
    </nav>
    <transition name="pagechange" mode="out-in">
      <section
        v-if="!opened_chapter && content_nodes.cover"
        class="cover"
        :data-layout-mode="content_nodes.cover.layout_mode"
      >
        <hgroup class="coverTitle" v-html="content_nodes.cover.title"></hgroup>
        <div class="coverImage" v-if="content_nodes.cover.image_url">
          <img :src="content_nodes.cover.image_url" />
        </div>
      </section>
      <section
        class="chapter"
        v-else-if="opened_chapter"
        :key="opened_chapter?.meta_filename"
      >
        <h1>{{ opened_chapter.title }}</h1>
        <div
          class="content"
          v-if="opened_chapter.section_type === 'text'"
          v-html="opened_chapter.content"
        />
        <div
          class="gallery"
          v-else-if="opened_chapter.section_type === 'gallery'"
          v-html="opened_chapter.content"
        />
        <div
          class="story"
          v-else-if="opened_chapter.section_type === 'story'"
          v-html="opened_chapter.content"
        />
        <div
          class="grid"
          v-else-if="opened_chapter.section_type === 'grid'"
          v-html="opened_chapter.content"
        />
      </section>
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
    css_styles: {
      type: String,
      required: true,
    },
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    opened_chapter_meta_filename() {
      this.$nextTick(() => this.scrollToTop());
    },
  },
  computed: {
    opened_chapter() {
      if (!this.opened_chapter_meta_filename) return undefined;
      return this.content_nodes.chapters.find(
        (chapter) => chapter.meta_filename === this.opened_chapter_meta_filename
      );
    },
  },
  methods: {
    getScrollParent(el) {
      while (el && el !== document.body) {
        const style = getComputedStyle(el);
        const overflow_y = style.overflowY;
        if (
          overflow_y === "auto" ||
          overflow_y === "scroll" ||
          overflow_y === "overlay"
        ) {
          return el;
        }
        el = el.parentElement;
      }
      return document.scrollingElement || document.documentElement;
    },
    scrollToTop() {
      const scroll_el = this.getScrollParent(this.$el);
      if (!scroll_el || scroll_el.scrollTop === 0) return;
      const duration = 250;
      const start = scroll_el.scrollTop;
      const start_time = performance.now();
      const step = (now) => {
        const elapsed = now - start_time;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - (1 - t) * (1 - t);
        scroll_el.scrollTop = start * (1 - eased);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
  },
};
</script>

<style lang="scss" scoped>
._docViewer {
  // max-width: 1000px;
  // background-color: var(--c-bodybg);

  ._docViewer--menu {
    flex: 0 0 20ch;
    position: sticky;
    top: 0;
    // background-color: var(--c-gris_clair);
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

    ._md ::v-deep > * {
      margin: 1em 0;
    }
  }
}
</style>
