<template>
  <div>
    <fieldset>
      <legend class="u-label">{{ $t("margins") }}</legend>

      <RangeValueInput
        :label="$t('margin_left')"
        :value.sync="margin_left"
        :default_value="10"
      />

      margin_left = {{ margin_left }}
    </fieldset>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      margin_left: 1,
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
<style lang="scss" scoped></style>
