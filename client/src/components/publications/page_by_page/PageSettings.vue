<template>
  <div class="_pageSettings">
    <WidthHeightField :publication="publication" />

    <br />

    <ToggleField
      :label="$t('page_spreads')"
      :field_name="'page_spreads'"
      :content="publication.page_spreads"
      :path="publication.$path"
      :can_edit="true"
    />

    <br />

    <SetMargins
      :publication="publication"
      :is_spread="publication.page_spreads === true"
    />

    <br />

    <PaginationOption
      :publication="publication"
      :is_spread="publication.page_spreads === true"
    />
  </div>
</template>
<script>
import WidthHeightField from "@/adc-core/fields/WidthHeightField.vue";
import SetMargins from "@/components/publications/page_by_page/SetMargins.vue";
import PaginationOption from "@/components/publications/page_by_page/PaginationOption.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    WidthHeightField,
    SetMargins,
    PaginationOption,
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
}
</style>
