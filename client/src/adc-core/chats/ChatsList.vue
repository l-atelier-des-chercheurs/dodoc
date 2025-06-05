<template>
  <div class="_chatsList">
    <div class="_chatsList--header">
      <h3>{{ $t("list_of_topics") }}</h3>

      <button
        type="button"
        class="u-button u-button_red"
        @click="show_create_chat_modal = true"
      >
        <b-icon icon="plus-lg" />
        {{ $t("create") }}
      </button>
    </div>
    <div class="_chatsList--content">
      <div class="_chat" v-for="chat in chats" :key="chat.$path">
        <h3>{{ chat.title }}</h3>
        <div class="_chat--infos">
          <div>
            <span v-if="chat.last_message_date">
              {{ $t("last_message_date") }}
              {{ formatDateTimeToHuman(chat.last_message_date) }}
            </span>
            <span v-else> – </span>
          </div>
          <div v-if="chat.last_message_count">
            {{
              $tc("message_count", chat.last_message_count, {
                count: chat.last_message_count,
              })
            }}
          </div>
        </div>
        <div class="_chat--actions">
          <button
            type="button"
            class="u-button u-button_red"
            @click="openChat(chat.$path)"
          >
            {{ $t("open") }}
          </button>
        </div>
      </div>
    </div>

    <transition name="pagechange">
      <OpenedChat
        v-if="opened_chat_slug"
        :chat_slug="opened_chat_slug"
        @close="opened_chat_slug = null"
      />
    </transition>

    <CreateFolder
      v-if="show_create_chat_modal"
      :modal_name="$t('create_a_chat')"
      :path="path"
      @close="show_create_chat_modal = false"
      @openNew="openNewChat"
    />
  </div>
</template>
<script>
import OpenedChat from "./OpenedChat.vue";

export default {
  props: {},
  components: {
    OpenedChat,
  },
  data() {
    return {
      chats: [],
      path: "chats",
      fetch_chats_error: null,
      show_create_chat_modal: false,
      opened_chat_slug: null,
    };
  },
  created() {
    this.loadChats();
    this.$api.join({ room: this.path });
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {},
  methods: {
    async loadChats() {
      this.chats = await this.$api
        .getFolders({
          path: this.path,
        })
        .catch((err) => {
          this.fetch_chats_error = err.response;
          // this.is_loading = false;
          return;
        });
    },
    openNewChat(new_chat_slug) {
      this.show_create_chat_modal = false;
      this.opened_chat_slug = new_chat_slug;
    },
    openChat(path) {
      this.opened_chat_slug = this.getFilename(path);
    },
  },
};
</script>
<style lang="scss" scoped>
._chatsList {
  --chat-left-padding: 2px;

  position: fixed;
  width: calc(var(--chats-list-width) - var(--chat-left-padding));
  margin-left: var(--chat-left-padding);
  height: 90vh;
  overflow: auto;
  background: var(--c-rouge_fonce);
  color: white;
  // border-top-left-radius: var(--border-radius);
  // border-bottom-left-radius: var(--border-radius);
  border-radius: var(--border-radius);

  ._chatsList--header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 calc(var(--spacing) / 1);
    padding: calc(var(--spacing) / 1) 0;

    border-bottom: 2px solid white;
  }

  ._chatsList--content {
    padding: calc(var(--spacing) / 1);
  }
}

._chat {
  background: var(--c-rouge);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 2);

  h3 {
    margin-bottom: calc(var(--spacing) / 2);
  }

  :deep(.u-label) {
    color: white;
  }
}

._chat--infos {
  // display: flex;
  // justify-content: space-between;
  // align-items: center;
}

._chat--actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

// display: flex;
// justify-content: space-between;
// align-items: center;
</style>
