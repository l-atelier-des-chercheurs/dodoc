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
  },
};
</script>
<style lang="scss" scoped></style>
