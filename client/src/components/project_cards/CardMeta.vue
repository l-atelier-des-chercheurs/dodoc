<template>
  <DetailsPane
    :header="$t('informations')"
    :icon="'info-square'"
    :is_open_initially="true"
    :can_be_toggled="false"
  >
  </DetailsPane>
</template>
<script>
export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
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
<style lang="scss" scoped></style>
