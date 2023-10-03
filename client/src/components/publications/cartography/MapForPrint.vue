<template>
  <div>
    <MapTemplate
      :publication="publication"
      :section_opened_meta="layer_opened_meta"
      :can_edit="false"
      @toggleSection="toggleSection"
    />
  </div>
</template>
<script>
import MapTemplate from "@/components/publications/templates/MapTemplate.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    MapTemplate,
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
    layer_opened_meta() {
      return this.$route.query?.layer || false;
    },
  },
  methods: {
    toggleSection(section_meta) {
      this.updatePageQuery({ section_meta });
    },
    updatePageQuery({ section_meta }) {
      let query = {};

      if (this.$route.query)
        query = JSON.parse(JSON.stringify(this.$route.query));

      if (section_meta === false) delete query.layer;
      else if (section_meta) query.layer = section_meta;

      this.$router.push({ query });
    },
  },
};
</script>
<style lang="scss" scoped></style>
