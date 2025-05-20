<template>
  <div class="_fullUI">
    <DisconnectModal
      v-if="show_disconnect_modal"
      @close="show_disconnect_modal = false"
    />
    <TrackAuthorChanges />
    <DynamicCursor v-if="!$root.is_touch_device" />

    <transition name="pagetransition" mode="out-in">
      <div class="_spinner" v-if="$root.is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else>
        <GeneralPasswordModal
          v-if="show_general_password_modal"
          @close="show_general_password_modal = false"
        />
        <template v-else>
          <TopBar />
          <transition name="pagetransition" mode="out-in">
            <router-view v-slot="{ Component }" :key="$route.path">
              <component :is="Component" />
            </router-view>
          </transition>
          <!-- <TaskTracker /> -->
        </template>
      </div>
    </transition>
  </div>
</template>
<script>
import TopBar from "@/components/TopBar.vue";
import DynamicCursor from "@/components/DynamicCursor.vue";
import GeneralPasswordModal from "@/adc-core/modals/GeneralPasswordModal.vue";
import TrackAuthorChanges from "@/adc-core/author/TrackAuthorChanges.vue";
import TaskTracker from "@/adc-core/tasks/TaskTracker.vue";
import DisconnectModal from "@/adc-core/modals/DisconnectModal.vue";

export default {
  props: {},
  components: {
    TopBar,
    DynamicCursor,
    GeneralPasswordModal,
    TrackAuthorChanges,
    TaskTracker,
    DisconnectModal,
  },
  data() {
    return {
      show_general_password_modal: false,
      show_disconnect_modal: false,
    };
  },
  async created() {
    console.log("Loading FullUI");

    this.$eventHub.$on(
      `app.prompt_general_password`,
      this.promptGeneralPassword
    );
    this.$eventHub.$on(`app.notify_error`, this.notifyError);

    await this.$api.init({ debug_mode: this.$root.debug_mode });

    this.$eventHub.$on("socketio.connect", this.socketConnected);
    this.$eventHub.$on("socketio.reconnect", this.socketConnected);
    this.$eventHub.$on("socketio.disconnect", this.socketDisconnected);
    this.$eventHub.$on("socketio.connect_error", this.socketConnectError);
    this.$eventHub.$on("socketio.disconnect", this.showDisconnectModal);

    this.$root.is_loading = false;
  },
  mounted() {},
  beforeDestroy() {
    this.$eventHub.$off(
      `app.prompt_general_password`,
      this.promptGeneralPassword
    );
    this.$eventHub.$off(`app.notify_error`, this.notifyError);

    this.$eventHub.$off("socketio.connect", this.socketConnected);
    this.$eventHub.$off("socketio.reconnect", this.socketConnected);
    this.$eventHub.$off("socketio.disconnect", this.socketDisconnected);
    this.$eventHub.$off("socketio.connect_error", this.socketConnectError);
    this.$eventHub.$off("socketio.disconnect", this.showDisconnectModal);
  },
  watch: {},
  computed: {},
  methods: {
    socketConnected() {
      if (this.debug_mode)
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(`Connected or reconnected with id ${this.$api.socket.id}`);
    },
    socketDisconnected(reason) {
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .error(`Disconnected ${reason}`);
    },
    socketConnectError(reason) {
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .error(`Connect error ${reason}`);
    },
    showDisconnectModal() {
      this.show_disconnect_modal = true;
    },
    promptGeneralPassword() {
      this.show_general_password_modal = true;
    },
    notifyError(msg) {
      if (msg === "not_allowed")
        this.$alertify.delay(4000).error(this.$t("action_not_allowed"));
    },
  },
};
</script>
<style lang="scss" scoped>
._fullUI {
}
</style>
