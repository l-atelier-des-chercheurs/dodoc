<template>
  <div class="_fullUI">
    <ConnectionStatus
      v-if="show_connection_status"
      @close="show_connection_status = false"
    />
    <TrackAuthorChanges />
    <!-- <DynamicCursor v-if="!$root.is_touch_device" /> -->

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

          <div class="_mainContent">
            <transition name="pagetransition" mode="out-in">
              <div class="_routerView" :key="route_view_key">
                <router-view class="" v-slot="{ Component }">
                  <component :is="Component" />
                </router-view>
              </div>
            </transition>
            <div
              class="_chatsListContainer"
              :class="{ 'is--shown': $root.show_chats_list }"
            >
              <ChatsList v-if="$root.show_chats_list" />
            </div>
          </div>
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
import ConnectionStatus from "@/adc-core/ui/ConnectionStatus.vue";
import ChatsList from "@/adc-core/chats/ChatsList.vue";

export default {
  props: {},
  components: {
    TopBar,
    DynamicCursor,
    GeneralPasswordModal,
    TrackAuthorChanges,
    TaskTracker,
    ConnectionStatus,
    ChatsList,
  },
  data() {
    return {
      show_general_password_modal: false,
      show_connection_status: false,
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
    this.$eventHub.$on("socketio.disconnect", this.showConnectionStatus);

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
    this.$eventHub.$off("socketio.disconnect", this.showConnectionStatus);
  },
  watch: {},
  computed: {
    // the admin pages are child views of one layout: switching between them
    // must not re-create (and re-transition) the whole view
    route_view_key() {
      return this.$route.path.startsWith("/admin")
        ? "/admin"
        : this.$route.path;
    },
  },
  methods: {
    socketConnected() {
      // if (this.$root.debug_mode)
      //   this.$alertify
      //     .closeLogOnClick(true)
      //     .delay(4000)
      //     .success(`Connected or reconnected with id ${this.$api.socket.id}`);
    },
    socketDisconnected(reason) {
      if (!this.$root.debug_mode) return;
      // After sleep, background tab, or flaky Wi-Fi, Socket.IO often drops with
      // these reasons and reconnects by itself — not worth error toasts.
      const benign_when_idle = ["ping timeout", "transport close"];
      if (benign_when_idle.includes(reason)) {
        console.info(
          `[socket] disconnected (${reason}), reconnecting when possible`
        );
        return;
      }
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .error(`Disconnected ${reason}`);
    },
    socketConnectError(reason) {
      // if (this.$root.debug_mode)
      //   this.$alertify
      //     .closeLogOnClick(true)
      //     .delay(4000)
      //     .error(`Connect error ${reason}`);
    },
    showConnectionStatus() {
      this.show_connection_status = true;
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

._mainContent {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  flex: 1;
  // overflow: hidden;

  transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  // gap: var(--spacing);

  > * {
    transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  }

  ._routerView {
    flex: 1 1 auto;
    min-width: 0; /* Prevent flex item from overflowing */
  }

  ._chatsListContainer {
    position: relative;
    flex: 0 0 0;
    width: 0;
    overflow: hidden;

    --chats-list-width: 320px;
    --chats-list-padding: 4px;

    &.is--shown {
      flex: 0 0 var(--chats-list-width);
    }
  }
}
</style>
