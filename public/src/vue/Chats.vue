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

            <CreateChat v-if="show_create_channel_modal" />
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
          <div
            v-for="(chat, index) in chats"
            :key="index"
            class="m_chats--list--item"
            :class="{
              'is--open':
                $root.settings.current_chat.slug === chat.slugFolderName,
            }"
            @click="openChat(chat.slugFolderName)"
          >
            <span
              v-if="unreadMessages(chat)"
              class="m_chats--list--item--unreadCounter"
              :content="$t('unread_messages')"
              v-tippy="{
                placement: 'bottom',
                delay: [600, 0],
              }"
            >
              {{ unreadMessages(chat) }}
            </span>
            <span class="m_chats--list--item--name">{{ chat.name }} </span>
            <small class="c-blanc">
              {{ $t("last_message") }}<br />{{
                $root.formatDateToPrecise(chat.date_modified)
              }}
            </small>
            <button
              type="button"
              class="buttonLink bg-rouge"
              @click.exact.stop="openChat(chat.slugFolderName)"
              @click.shift="removeChat(chat.slugFolderName)"
            >
              {{ $t("open") }}
            </button>
          </div>
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
import Chat from "./components/Chat.vue";

export default {
  props: {
    read_only: Boolean,
    chats: Object,
  },
  components: {
    CreateChat,
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
    unreadMessages(chat) {
      if (
        typeof chat.medias !== "object" ||
        Object.keys(chat.medias).length === 0 ||
        !this.$root.current_author
      )
        return false;

      const total_number_of_messages_in_chat = Object.keys(chat.medias).length;

      // find media with meta
      const last_messages_read_in_channels = this.$root.current_author
        .last_messages_read_in_channels;

      if (last_messages_read_in_channels) {
        const existing_info = last_messages_read_in_channels.find(
          (c) => c.channel === chat.slugFolderName
        );
        if (existing_info) {
          const last_message_metaFileName = existing_info.metaFileName;
          const index_of_past_message_read = Object.values(
            chat.medias
          ).findIndex((m) => m.metaFileName === existing_info.msg);
          return (
            total_number_of_messages_in_chat - index_of_past_message_read - 1
          );
        }
      }

      return total_number_of_messages_in_chat;
    },
    openChat(slug) {
      this.$root.settings.current_chat.slug = slug;
    },
    removeChat(slugFolderName) {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sure_to_remove_chat"),
          () => {
            this.$root.removeFolder({
              type: "chats",
              slugFolderName,
            });
          },
          () => {}
        );
    },
  },
};
</script>
<style lang="scss"></style>
