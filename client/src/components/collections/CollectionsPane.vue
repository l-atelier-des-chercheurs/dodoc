<template>
  <div class="_collections">
    <CollectionsList @open="openCollection" />
    <OpenedCollection
      v-if="pane_infos?.opened_collection_slug"
      :pane_infos="pane_infos"
      @updatePane="updatePane"
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
    pane_infos() {
      let i = {};
      if (this.$route.query?.collection)
        i.opened_collection_slug = this.$route.query.collection;
      if (this.$route.query?.section) i.section = this.$route.query.section;
      if (this.$route.query?.chapter) i.chapter = this.$route.query.chapter;
      return i;
    },
  },
  methods: {
    openCollection(slug) {
      this.updateCollectionQuery(slug);
    },
    closeCollection() {
      this.updateCollectionQuery(false);
    },
    updatePane({ key, value }) {
      this.updatePageQuery({
        prop: key,
        val: value,
      });
    },
    async updateCollectionQuery(slug) {
      this.updatePageQuery({
        prop: "collection",
        val: slug,
      });
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
