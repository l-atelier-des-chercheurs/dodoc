<template>
  <BaseModal2 :title="$t('connection_lost')" :is_closable="false">
    <template v-if="!$root.is_connected">
      <p class="u-spacingBottom">
        <span v-html="$t('connection_lost_in')" /><br />
        <template v-if="!is_reconnecting">
          <span v-html="$t('attempting_to_reconnect_in')" />&nbsp;<strong
            >{{ seconds_before_reconnecting }}s</strong
          >
        </template>
      </p>

      <div class="u-spacingBottom">
        <button
          v-if="!is_reconnecting"
          type="button"
          class="u-button u-button_bleumarine"
          @click="reconnectSocket"
        >
          {{ $t("try_reconnect_now") }}
        </button>
        <div class="_reconnectingMsg" v-else>
          <LoaderSpinner />
          {{ $t("reconnecting") }}
        </div>
      </div>

      <p>
        {{ $t("if_issues_contact") }}
        <br />
        <a
          :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
          target="_blank"
        >
          {{ $root.app_infos.instance_meta.contactmail }}
        </a>
      </p>

      <!-- <button
        type="button"
        class="u-button u-button_bleumarine"
        @click="$router.go()"
      >
        {{ $t("reload_page") }}
      </button> -->
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      seconds_before_reconnecting: 10,
      is_reconnecting: false,
      countdown: undefined,
    };
  },
  created() {
    (this.countdown = async () => {
      this.seconds_before_reconnecting -= 1;
      if (this.seconds_before_reconnecting === 0) {
        await this.reconnectSocket();
        this.seconds_before_reconnecting = 10;
      }
      if (!this.$root.is_connected) window.setTimeout(this.countdown, 1000);
    })();
  },
  mounted() {},
  beforeDestroy() {
    window.clearTimeout(this.countdown);
  },
  watch: {
    "$root.is_connected": function () {
      if (this.$root.is_connected) {
        this.$emit("close");
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(this.$t("connection_back"));
      }
    },
  },
  computed: {},
  methods: {
    async reconnectSocket() {
      this.is_reconnecting = true;
      this.$api.reconnectSocket();

      await new Promise((r) => setTimeout(r, 2000));
      this.is_reconnecting = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._reconnectingMsg {
  position: relative;
}
</style>
