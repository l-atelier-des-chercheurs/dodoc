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
          <ChatRow
            v-for="(chat, index) in pinned_chats"
            :key="index"
            :chat="chat"
          />
          <ChatRow
            v-for="(chat, index) in non_pinned_chats"
            :key="index"
            :chat="chat"
          />
        </div>
      </div>
    </div>

    <transition name="slideright" :duration="500">
      <Chat :chat="$root.current_chat" v-if="$root.current_chat" />
    </transition>
  </div>
</template>
<script>
import CreateChat from "./components/modals/CreateChat.vue";
import ChatRow from "./components/ChatRow.vue";
import Chat from "./components/Chat.vue";

export default {
  props: {
    read_only: Boolean,
    chats: Object,
  },
  components: {
    CreateChat,
    ChatRow,
    Chat,
  },
  data() {
    return {
      show_create_channel_modal: false,
      new_channel_name: "",
    };
  },
  created() {},
  mounted() {
    this.$socketio.listFolders({ type: "chats" });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    pinned_chats() {
      if (Object.keys(this.chats).length === 0) return [];
      let pinned_chats = Object.values(this.chats).filter(
        (c) => c.pinned === true
      );
      pinned_chats = this.$_.sortBy(pinned_chats, (i) => i.name.toLowerCase());

      return pinned_chats;
    },
    non_pinned_chats() {
      if (Object.keys(this.chats).length === 0) return [];
      let non_pinned_chats = Object.values(this.chats).filter(
        (c) => !c.pinned || c.pinned === false
      );
      non_pinned_chats = this.$_.sortBy(non_pinned_chats, "date_modified");
      non_pinned_chats = non_pinned_chats.reverse();

      return non_pinned_chats;
    },
  },
  methods: {},
};
</script>
<style lang="scss"></style>
