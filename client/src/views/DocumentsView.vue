<template>
  <CollectionsList @open="openCollection" />
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
        path: "/publish/" + slug,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
