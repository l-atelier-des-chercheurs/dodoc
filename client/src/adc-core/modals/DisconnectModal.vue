<template>
  <BaseModal2
    :title="$t('connection_lost')"
    :is_closable="false"
    :hide_modal="hide_disconnect_modal"
  >
    <template v-if="!$api.connected">
      <p class="u-spacingBottom">
        <span v-html="$t('connection_lost_in')" /><br />
        <template v-if="!is_reconnecting">
          <span v-html="$t('attempting_to_reconnect_in')" />&nbsp;<strong>
            <span :key="reconnecting_in"> {{ reconnecting_in }}s </span>
          </strong>
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

      <p v-if="$root.app_infos.instance_meta.contactmail">
        {{ $t("if_issues_contact") }}
        <br />
        <a
          :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
          target="_blank"
        >
          {{ $root.app_infos.instance_meta.contactmail }}
        </a>
      </p>
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      reconnecting_in: 4,
      subsequent_reconnection_delay: 10,

      is_reconnecting: false,
      countdown: undefined,
      hide_disconnect_modal: true,
    };
  },
  async created() {
    // try to reconnect first
    this.$api.reconnectSocket();
    await new Promise((r) => setTimeout(r, 1000));
    this.hide_disconnect_modal = false;

    (this.countdown = async () => {
      if (this.reconnecting_in > 1) this.reconnecting_in--;
      else await this.reconnectSocket();
      if (!this.$api.connected) window.setTimeout(this.countdown, 1000);
    })();
  },
  mounted() {},
  beforeDestroy() {
    window.clearTimeout(this.countdown);
  },
  watch: {
    "$api.connected": function () {
      if (this.$api.connected) {
        this.$emit("close");
        // this.$alertify
        //   .closeLogOnClick(true)
        //   .delay(4000)
        //   .success(this.$t("connection_back"));
      }
    },
  },
  computed: {},
  methods: {
    async reconnectSocket() {
      this.is_reconnecting = true;
      this.$api.reconnectSocket();

      await new Promise((r) => setTimeout(r, 1000));
      this.is_reconnecting = false;
      this.reconnecting_in = this.subsequent_reconnection_delay;
    },
  },
};
</script>
<style lang="scss" scoped>
._reconnectingMsg {
  position: relative;
}
</style>
