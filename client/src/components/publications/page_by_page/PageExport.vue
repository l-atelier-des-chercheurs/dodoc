<template>
  <div>
    <PageSlides
      :publication="publication"
      :is_serversidepreview="is_serversidepreview"
      @toggleFs="toggleFs"
    />
  </div>
</template>
<script>
import PageSlides from "@/components/publications/page_by_page/PageSlides.vue";
import screenfull from "screenfull";

export default {
  props: {
    publication: Object,
    is_serversidepreview: Boolean,
  },
  components: {
    PageSlides,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async toggleFs() {
      if (this.is_fullscreen) this.closeFs();
      else this.openFs();
    },
    async openFs() {
      await screenfull.request(this.$refs.fsContainer);
      this.is_fullscreen = true;
      screenfull.onchange(() => {
        if (!screenfull.isFullscreen) this.is_fullscreen = false;
      });
    },
    async closeFs() {
      await screenfull.exit();
      this.is_fullscreen = false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
