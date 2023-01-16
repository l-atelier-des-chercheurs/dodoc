<template>
  <div class="_pageSettings">
    <WidthHeightField :publication="publication" />

    <br />

    <ToggleField
      :label="$t('pages_spreads')"
      :field_name="'pages_spreads'"
      :content="publication.pages_spreads"
      :path="publication.$path"
      :can_edit="true"
    />
  </div>
</template>
<script>
import WidthHeightField from "@/components/publications/page_by_page/WidthHeightField.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    WidthHeightField,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._pageSettings {
  background: white;

  max-width: 380px;
  padding: calc(var(--spacing) * 1);
  margin: calc(var(--spacing) * 1) auto;
}
</style>
