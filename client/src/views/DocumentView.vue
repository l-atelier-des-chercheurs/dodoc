<template>
  <div class="_documentView">
    <OpenedCollection
      :opened_collection_slug="opened_collection_slug"
      :pane_infos="pane_infos"
      @updatePane="updatePane"
      @close="closeCollection"
    />
  </div>
</template>
<script>
import OpenedCollection from "@/components/collections/OpenedCollection.vue";

export default {
  props: {},
  components: {
    OpenedCollection,
  },
  data() {
    return {
      opened_collection_slug: this.$route.params.document_slug,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    pane_infos() {
      let i = {};
      if (this.$route.query?.section) i.section = this.$route.query.section;
      if (this.$route.query?.chapter) i.chapter = this.$route.query.chapter;
      return i;
    },
  },
  methods: {
    updatePane({ key, value }) {
      this.updatePageQuery({
        prop: key,
        val: value,
      });
    },
    closeCollection() {
      this.$router.push({
        path: "/documents",
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
