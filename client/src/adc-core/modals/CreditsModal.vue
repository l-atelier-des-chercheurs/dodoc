<template>
  <BaseModal2 :title="$t('about_dodoc')" @close="$emit('close')">
    <div class="_creditsModal">
      <p v-html="$t('about_dodoc_txt')" />
      <br />
      <p v-html="$t('about_dodoc_links')" />
      <br />
      <p v-html="$t('about_dodoc_contributors')" />
    </div>
  </BaseModal2>
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
._creditsModal {
  ::v-deep {
    li {
      margin-left: 1.5em;
    }
  }
}
</style>
