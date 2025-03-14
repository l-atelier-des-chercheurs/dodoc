<template>
  <div class="_collections">
    <CollectionsList v-if="!opened_collection_slug" @open="openCollection" />
    <OpenedCollection
      v-else
      :opened_collection_slug="opened_collection_slug"
      @close="closeCollection"
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
    openCollection(slug) {
      let query = Object.assign({}, this.$route.query) || {};
      if (slug && query.collection !== slug) query.collection = slug;
      else delete query.collection;
      this.$router.push({ query });
    },
    closeCollection() {
      this.openCollection();
    },
  },
};
</script>
<style lang="scss" scoped>
._collections {
  padding: calc(var(--spacing) / 2);
  height: 100%;
  overflow: auto;
}
</style>
