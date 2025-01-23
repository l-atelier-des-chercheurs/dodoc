<template>
  <div class="_viewContent">
    <!-- <div>view mode: {{ view_mode }}</div>
    <div>content: {{ content }}</div> -->
    <div ref="bookpreview"></div>
  </div>
</template>
<script>
import { Previewer } from "pagedjs";

export default {
  props: {
    content: String,
    view_mode: String,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {
    this.generateBook();
  },
  beforeDestroy() {},
  watch: {
    content() {
      this.generateBook();
    },
  },
  computed: {},
  methods: {
    generateBook() {
      const bookpreview = this.$refs.bookpreview;
      if (!bookpreview) return;
      bookpreview.innerHTML = "";

      let paged = new Previewer();

      debugger;

      // let flow = paged.preview(DOMContent, ["path/to/css/file.css"], document.body).then((flow) => {
      paged.preview(this.content, [], bookpreview).then((flow) => {
        console.log("Rendered", flow.total, "pages.");
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._viewContent {
  padding: calc(var(--spacing) * 2);
  --color-background: whitesmoke;
  --color-pageSheet: #cfcfcf;
  --color-pageBox: violet;
  --color-paper: white;
  --color-marginBox: transparent;
  --pagedjs-crop-color: black;
  --pagedjs-crop-shadow: white;
  --pagedjs-crop-stroke: 1px;
}
</style>
