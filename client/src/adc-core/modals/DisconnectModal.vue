<template>
  <BaseModal2 :title="$t('connection_lost')" :is_closable="false">
    <p class="u-spacingBottom">
      <span v-html="$t('connection_lost_reload_to_reconnect')" />
      <br />
      <a
        :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
        target="_blank"
      >
        {{ $root.app_infos.instance_meta.contactmail }}
      </a>
    </p>

    <button type="button" class="u-button" @click="$router.go()">
      {{ $t("reload_page") }}
    </button>
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
<style lang="scss" scoped></style>
