<template>
  <div class="_documentsView">
    <CollectionsList @open="openCollection" />
  </div>
</template>
<script>
import CollectionsList from "@/components/collections/CollectionsList.vue";

export default {
  props: {},
  components: {
    CollectionsList,
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
    openCollection(slug) {
      this.$router.push({
        path: "/documents/" + slug,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._documentsView {
  padding: calc(var(--spacing) / 2);
  height: 100%;
  overflow: auto;
}
</style>
