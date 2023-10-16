<template>
  <MapView
    :publication="publication"
    :opened_view_path="opened_view_path"
    :can_edit="can_edit"
    @toggleView="toggleView"
  />
</template>
<script>
import MapView from "@/components/publications/cartography/MapView.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    MapView,
  },
  data() {
    return {
      page_opened_id: false,
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    opened_view_path() {
      return this.$route.query?.view || false;
    },
  },
  methods: {
    toggleView(view_meta) {
      this.updatePageQuery({ prop: "view", val: view_meta });
    },
  },
};
</script>
<style lang="scss" scoped></style>
