<template>
  <div class="_disconnectModal">
    <template v-if="!$api.connected">
      <p class="" v-if="!is_reconnecting">
        <span v-html="$t('connection_lost_in')" />&nbsp;
        <span v-html="$t('attempting_to_reconnect_in')" />&nbsp;<strong>
          <span :key="reconnecting_in"> {{ reconnecting_in }}s </span>
        </strong>
      </p>

      <div class="_reconnectButton">
        <button
          type="button"
          class="u-button u-button_bleumarine u-button_small"
          @click="reconnectSocket"
          :disabled="is_reconnecting"
        >
          <template v-if="!is_reconnecting">
            {{ $t("try_reconnect_now") }}
          </template>
          <template v-else>
            {{ $t("reconnecting") }}
            <LoaderSpinner class="_spinner" />
          </template>
        </button>
      </div>

      <p v-if="$root.app_infos.instance_meta.contactmail && !is_reconnecting">
        <small>
          {{ $t("if_issues_contact") }}

          <a
            :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
            target="_blank"
          >
            {{ $root.app_infos.instance_meta.contactmail }} </a
          >.
        </small>
      </p>
    </template>
  </div>
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
    };
  },
  async created() {
    // try to reconnect first
    this.$api.reconnectSocket();
    await new Promise((r) => setTimeout(r, 1000));

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
._disconnectModal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  display: flex;
  flex-flow: row wrap;
  background-color: var(--c-gris);
  background-color: var(--c-rouge);
  // color: white;
  justify-content: center;
  align-items: center;
  gap: var(--spacing);
  padding: calc(var(--spacing) / 2);
}
._reconnectingMsg {
  position: relative;
}
._spinner {
  position: relative;
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  background-color: transparent;

  ::v-deep ._spinner {
    width: 1.25rem;
    height: 1.25rem;
    // border-width: 2px;
  }
}
</style>
