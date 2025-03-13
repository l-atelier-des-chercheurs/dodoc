<template>
  <div class="_fullUI">
    <DisconnectModal
      v-if="show_disconnect_modal"
      @close="show_disconnect_modal = false"
    />
    <TrackAuthorChanges />
    <DynamicCursor v-if="!$root.is_touch_device" />

    <div class="_spinner" v-if="$root.is_loading" key="loader">
      <LoaderSpinner />
    </div>

    <template v-else>
      <GeneralPasswordModal
        v-if="show_general_password_modal"
        @close="show_general_password_modal = false"
      />

      <template v-else>
        <AuthorList
          v-if="show_authors_modal"
          :is_closable="!!connected_as"
          @close="show_authors_modal = false"
        />
        <transition name="pagechange" mode="out-in">
          <router-view v-slot="{ Component }" :key="$route.path">
            <component :is="Component" />
          </router-view>
        </transition>
        <TaskTracker />
      </template>
    </template>
  </div>
</template>
<script>
import GeneralPasswordModal from "@/adc-core/modals/GeneralPasswordModal.vue";
import TrackAuthorChanges from "@/adc-core/author/TrackAuthorChanges.vue";
import TaskTracker from "@/adc-core/tasks/TaskTracker.vue";
import DisconnectModal from "@/adc-core/modals/DisconnectModal.vue";

export default {
  props: {},
  components: {
    GeneralPasswordModal,
    TrackAuthorChanges,
    TaskTracker,
    DisconnectModal,
  },
  data() {
    return {
      show_general_password_modal: false,
      show_disconnect_modal: false,
      show_authors_modal: false,
    };
  },
  async created() {
    console.log("Loading FullUI");

    this.$eventHub.$on(
      `app.prompt_general_password`,
      this.promptGeneralPassword
    );
    this.$eventHub.$on(`app.show_welcome_modal`, this.showWelcomeModal);
    this.$eventHub.$on(`showAuthorModal`, this.showAuthorModal);
    this.$eventHub.$on(`app.notify_error`, this.notifyError);

    await this.$api.init({ debug_mode: this.$root.debug_mode });

    this.$eventHub.$on("socketio.connect", this.socketConnected);
    this.$eventHub.$on("socketio.reconnect", this.socketConnected);
    this.$eventHub.$on("socketio.disconnect", this.socketDisconnected);
    this.$eventHub.$on("socketio.connect_error", this.socketConnectError);

    this.$root.is_loading = false;
  },
  mounted() {},
  beforeDestroy() {
    this.$eventHub.$off(
      `app.prompt_general_password`,
      this.promptGeneralPassword
    );
    this.$eventHub.$off(`app.show_welcome_modal`, this.showWelcomeModal);
    this.$eventHub.$off(`showAuthorModal`, this.showAuthorModal);
    this.$eventHub.$off(`app.notify_error`, this.notifyError);

    this.$eventHub.$off("socketio.connect", this.socketConnected);
    this.$eventHub.$off("socketio.reconnect", this.socketConnected);
    this.$eventHub.$off("socketio.disconnect", this.socketDisconnected);
    this.$eventHub.$off("socketio.connect_error", this.socketConnectError);
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

    showAuthorModal() {
      this.show_authors_modal = true;
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
  height: 100%;
}
</style>
