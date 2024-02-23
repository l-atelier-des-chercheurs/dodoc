<template>
  <div class="_collections">
    <CollectionsList @open="OpenedCollection" />
    <OpenedCollection
      v-if="opened_collection_slug"
      :opened_collection_slug="opened_collection_slug"
      @close="OpenedCollection"
    />
  </div>
</template>
<script>
import CollectionsList from "@/components/collections/CollectionsList.vue";
import OpenedCollection from "@/components/collections/OpenedCollection.vue";

export default {
  props: {},
  components: { CollectionsList, OpenedCollection },
  data() {
    return {};
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
    opened_collection_slug() {
      if (!this.$route.query?.collection) return undefined;
      return this.$route.query.collection;
    },
  },
  methods: {
    OpenedCollection(slug) {
      let query = Object.assign({}, this.$route.query) || {};
      if (slug) query.collection = slug;
      else delete query.collection;
      this.$router.push({ query });
    },
  },
};
</script>
<style lang="scss" scoped>
._collections {
  margin: calc(var(--spacing) / 2);
}
</style>
