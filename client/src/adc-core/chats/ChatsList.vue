<template>
  <div class="_chatsList">
    <div class="_content">
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
          <div class="_chat--title">
            <b>{{ chat.title }}</b>
          </div>
          <div class="_chat--infos">
            <div>
              {{ $t("last_message_date") }}
              {{ formatDateTimeToHuman(chat.$date_modified) }}
            </div>
            <div v-if="chat.$files_count">
              {{
                $tc("message_count", chat.$files_count, {
                  count: chat.$files_count,
                })
              }}
            </div>
          </div>
          <div class="_chat--actions">
            <button
              type="button"
              class="u-button u-button_red _openChat"
              :title="$t('open')"
              @click="openChat(chat.$path)"
            ></button>
          </div>
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
  --chat-padding: 2px;

  position: fixed;
  width: calc(var(--chats-list-width) - var(--chat-padding) * 2);
  margin-left: var(--chat-padding);
  margin-right: var(--chat-padding);
  background: var(--c-rouge_fonce);
  color: white;
  // border-top-left-radius: var(--border-radius);
  // border-bottom-left-radius: var(--border-radius);
  border-radius: var(--border-radius);
}

._content {
  height: 90vh;
  overflow: auto;
}

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

._chat {
  position: relative;
  background: var(--c-rouge);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 4);

  // min-height: 500px;

  h3 {
    margin-bottom: calc(var(--spacing) / 2);
  }

  :deep(.u-label) {
    color: white;
  }
}

._chat--infos {
  font-size: var(--sl-font-size-x-small);
}

._chat--actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

// display: flex;
// justify-content: space-between;
// align-items: center;

._openChat {
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.1s ease-in-out;

  &:hover {
    opacity: 0.5;
  }
}
</style>
