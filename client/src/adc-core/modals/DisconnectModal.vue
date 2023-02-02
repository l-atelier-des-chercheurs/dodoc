<template>
  <BaseModal2 :title="$t('connection_lost')" :is_closable="false">
    <p>
      <span v-html="$t('connection_lost_reload_to_reconnect')" />
      <br />
      <a
        :href="'mailto:' + $root.app_infos.contactmail_of_instance"
        target="_blank"
      >
        {{ $root.app_infos.contactmail_of_instance }}
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
