<template>
  <div class="m_chatsview">
    <div class="m_actionbar">
      <div class="m_actionbar--buttonBar"></div>
      <div class="m_actionbar--text">{{ $t("channels_instructions") }}</div>
    </div>

    <div class="m_channels">
      <div class="m_channels--content">
        <h3 class="font-folder_title">{{ $t("channels_list") }}</h3>
        <div class="margin-vert-small">
          <template v-if="$root.current_author">
            <button
              type="button"
              class="barButton barButton_createChannel"
              @click="show_create_channel_modal = !show_create_channel_modal"
            >
              <span>{{ $t("create") }}</span>
            </button>

            <CreateChat
              v-if="show_create_channel_modal"
              @close="show_create_channel_modal = false"
            />
          </template>
          <template v-else>
            <div>
              <button
                type="button"
                class="button-thin bg-bleumarine margin-left-none"
                @click="$root.showAuthorsListModal = true"
              >
                {{ $t("login_to_create_channel") }}
              </button>
            </div>
          </template>
        </div>

        <div class="m_chats--list">
          <ChatRow v-for="(chat, index) in chats" :key="index" :chat="chat" />
        </div>
      </div>
    </div>

    <transition name="slideright" :duration="500">
      <Chat :chat="current_chat" v-if="current_chat" />
    </transition>
  </div>
</template>
<script>
import CreateChat from "./components/modals/CreateChat.vue";
import ChatRow from "./components/ChatRow.vue";
import Chat from "./components/Chat.vue";
import EditAccessControl from "./components/subcomponents/EditAccessControl.vue";

export default {
  props: {
    read_only: Boolean,
    chats: Object,
  },
  components: {
    CreateChat,
    ChatRow,
    Chat,
    EditAccessControl,
  },
  data() {
    return {
      show_create_channel_modal: false,
      new_channel_name: "",
    };
  },
  created() {},
  mounted() {
    this.reloadChats();
    this.$eventHub.$on("socketio.reconnect", this.reloadChats);
  },
  beforeDestroy() {
    this.$eventHub.$off("socketio.reconnect", this.reloadChats);
  },
  watch: {},
  computed: {
    current_chat() {
      if (!this.$root.settings.current_chat.slug) return false;

      return Object.values(this.$root.store.chats).find(
        (c) => c.slugFolderName === this.$root.settings.current_chat.slug
      );
    },
  },
  methods: {
    reloadChats() {
      this.$socketio.listFolders({ type: "chats" });
      this.$eventHub.$once("socketio.chats.folders_listed", () => {
        Object.keys(this.$root.store.chats).forEach((slugChatName) => {
          const project_meta = this.$root.store.chats[slugChatName];
          setTimeout(() => {
            this.$socketio.listMedias({
              type: "chats",
              slugFolderName: slugChatName,
            });
          }, 1000);
        });
      });
    },
  },
};
</script>
<style lang="scss"></style>
