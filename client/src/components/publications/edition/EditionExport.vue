<template>
  <div class="_editionExport">
    <ViewContent
      :publication="publication"
      :opened_chapter_meta_filename="opened_chapter_meta_filename"
      :viewer_type="'div'"
      :can_edit="false"
      @openChapter="toggleChapter"
    />
  </div>
</template>
<script>
import ViewContent from "@/components/publications/edition/ViewContent.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    ViewContent,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    opened_chapter_meta_filename() {
      const query = JSON.parse(JSON.stringify(this.$route.query));
      if (query.chapter) return query.chapter;
      return "";
    },
  },
  methods: {
    toggleChapter(chapter_meta_filename) {
      this.updatePageQuery({
        prop: "chapter",
        val: chapter_meta_filename,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._editionExport {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
