<template>
  <div class="_pageSettings">
    <DLabel :str="$t('format')" />
    <SelectField
      :field_name="'format'"
      :content="publication.format"
      :path="publication.$path"
      :can_edit="true"
      :options="format_options"
    />
  </div>
</template>
<script>
export default {
  props: {
    publication: Object,
  },
  components: {},
  data() {
    return {
      format_options: [
        {
          key: "A4_portrait",
          text: this.$t("A4_portrait"),
          instruction: this.$t("A4_portrait_explanations"),
        },
        {
          key: "A4_landscape",
          text: this.$t("A4_landscape"),
          instruction: this.$t("A4_landscape_explanations"),
        },
        {
          key: "A5_portrait",
          text: this.$t("A5_portrait"),
          instruction: this.$t("A5_portrait_explanations"),
        },
        {
          key: "A5_landscape",
          text: this.$t("A5_landscape"),
          instruction: this.$t("A5_landscape_explanations"),
        },
        {
          key: "custom",
          text: this.$t("custom"),
          instruction: this.$t("custom_format_explanations"),
        },
      ],
    };
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

  max-width: 400px;
  padding: calc(var(--spacing) * 1);
  margin: calc(var(--spacing) * 1) auto;
}
</style>
