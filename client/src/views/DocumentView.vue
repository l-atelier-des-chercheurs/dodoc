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
      if (this.$route.query?.edit_graphics)
        i.edit_graphics = this.$route.query.edit_graphics;
      if (this.$route.query?.style) i.style = this.$route.query.style;
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
        path: "/publish",
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
