<template>
  <BaseModal2
    v-show="show_disconnect_modal"
    :title="$t('connection_lost')"
    :is_closable="false"
  >
    <template v-if="!$api.connected">
      <p class="u-spacingBottom">
        <span v-html="$t('connection_lost_in')" /><br />
        <template v-if="!is_reconnecting">
          <span v-html="$t('attempting_to_reconnect_in')" />&nbsp;<strong>
            <span :key="seconds_before_reconnecting">
              {{ seconds_before_reconnecting }}s
            </span>
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
      seconds_before_reconnecting: 3,
      is_reconnecting: false,
      countdown: undefined,
      show_disconnect_modal: false,
      duration_before_reconnecting: 3,
    };
  },
  async created() {
    // try to reconnect first
    await this.reconnectSocket();
    this.duration_before_reconnecting = 10;
    this.show_disconnect_modal = true;

    (this.countdown = async () => {
      this.seconds_before_reconnecting -= 1;
      if (this.seconds_before_reconnecting === 0) {
        await this.reconnectSocket();
      }
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

      await new Promise((r) => setTimeout(r, 1000));
      this.is_reconnecting = false;
      this.seconds_before_reconnecting = this.duration_before_reconnecting;
    },
  },
};
</script>
<style lang="scss" scoped>
._reconnectingMsg {
  position: relative;
}
</style>
