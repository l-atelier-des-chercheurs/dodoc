<template>
  <div>
    <label for="" class="u-label">
      {{ $t("keywords") }}
    </label>
    <sl-badge variant="primary">Primary</sl-badge>
    <sl-badge variant="success">Success</sl-badge>
    <sl-badge variant="neutral">Neutral</sl-badge>
    <sl-badge variant="warning">Warning</sl-badge>
    <sl-badge variant="danger">Danger</sl-badge>
    <sl-button variant="neutral" class="_editBtn" size="small" circle>
      <sl-icon name="pencil-fill" :label="$t('edit')" />
    </sl-button>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
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
label {
  display: block;
}
</style>
