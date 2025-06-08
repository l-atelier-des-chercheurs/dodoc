<template>
  <div class="_fullUI">
    <DisconnectModal
      v-if="show_disconnect_modal"
      @close="show_disconnect_modal = false"
    />
    <TrackAuthorChanges />
    <!-- <DynamicCursor v-if="!$root.is_touch_device" /> -->

    <div class="_spinner" v-if="$root.is_loading" key="loader">
      <LoaderSpinner />
    </div>

    <template v-else>
      <WelcomeModal
        v-if="show_welcome_modal"
        @close="show_welcome_modal = false"
      />
      <GeneralPasswordModal
        v-else-if="show_general_password_modal"
        @close="show_general_password_modal = false"
      />
      <template v-else>
        <AuthorList
          v-if="show_authors_modal || !connected_as"
          :is_closable="!!connected_as"
          @close="show_authors_modal = false"
        />
        <template v-else>
          <div class="_fullUI--content">
            <TopBar class="_fullUI--content--topBar" />
            <transition name="pagechange" mode="out-in">
              <router-view
                class="_fullUI--content--view"
                v-slot="{ Component }"
                :key="$route.path"
              >
                <component :is="Component" />
              </router-view>
            </transition>
          </div>
        </template>
        <TaskTracker />
      </template>
    </template>
  </div>
</template>
<script>
import WelcomeModal from "@/components/WelcomeModal.vue";
import GeneralPasswordModal from "@/adc-core/modals/GeneralPasswordModal.vue";
import TrackAuthorChanges from "@/adc-core/author/TrackAuthorChanges.vue";
import TaskTracker from "@/adc-core/tasks/TaskTracker.vue";
import DisconnectModal from "@/adc-core/modals/DisconnectModal.vue";
import TopBar from "@/components/TopBar.vue";
import AuthorList from "@/adc-core/author/AuthorList.vue";

export default {
  props: {},
  components: {
    WelcomeModal,
    GeneralPasswordModal,
    TrackAuthorChanges,
    TaskTracker,
    DisconnectModal,
    TopBar,
    AuthorList,
  },
  data() {
    return {
      show_general_password_modal: false,
      show_disconnect_modal: false,
      show_authors_modal: false,
      show_welcome_modal: false,
    };
  },
  async created() {
    console.log("Loading FullUI");

    this.$eventHub.$on(
      `app.prompt_general_password`,
      this.promptGeneralPassword
    );
    this.$eventHub.$on(`app.notify_error`, this.notifyError);

    this.$eventHub.$on(`app.show_welcome_modal`, this.showWelcomeModal);
    this.$eventHub.$on(`showAuthorModal`, this.showAuthorModal);
    await this.$api.init({ debug_mode: this.$root.debug_mode });

    this.$eventHub.$on("socketio.connect", this.socketConnected);
    this.$eventHub.$on("socketio.reconnect", this.socketConnected);
    this.$eventHub.$on("socketio.disconnect", this.socketDisconnected);
    this.$eventHub.$on("socketio.connect_error", this.socketConnectError);
    this.$eventHub.$on("socketio.disconnect", this.showDisconnectModal);

    this.$root.is_loading = false;

    const authors = await this.$api.getFolders({
      path: "authors",
    });
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
    showWelcomeModal() {
      this.show_welcome_modal = true;
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
  display: flex;
  flex-direction: column;
}

._fullUI--content {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;

  ._fullUI--content--topBar {
    flex: 0 0 auto;
  }

  ._fullUI--content--view {
    position: relative;
    flex: 1;
    overflow-y: hidden;
  }
}

._mainContent {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  flex: 1;
  overflow: hidden;

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
