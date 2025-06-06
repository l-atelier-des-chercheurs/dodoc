<template>
  <div class="_chatsList">
    <component
      :is="open_in_modal ? 'BaseModal2' : 'div'"
      class="_baseModalLocal"
      :size="'large'"
      :nopadding="true"
      @close="open_in_modal = false"
    >
      <div class="_content">
        <div class="_chatsList--header">
          <h3>{{ $t("list_of_topics") }}</h3>
          <button
            type="button"
            class="u-button u-button_red u-button_icon"
            @click="open_in_modal = !open_in_modal"
          >
            <b-icon v-if="!open_in_modal" icon="fullscreen" />
            <b-icon v-else icon="fullscreen-exit" />
          </button>
        </div>
        <div class="_chatsList--content">
          <button
            type="button"
            class="u-button u-button_red u-spacingBottom _createChat"
            @click="show_create_chat_modal = true"
          >
            <b-icon icon="plus-lg" />
            {{ $t("create") }}
          </button>
          <div
            class="_chat"
            v-for="chat in sorted_chats"
            :key="chat.$path"
            :class="{
              'is--opened': opened_chat_slug === getFilename(chat.$path),
            }"
          >
            <div class="_chat--title">
              <b-icon v-if="chat.$private" icon="file-lock2-fill" />
              <TitleField :content="chat.title" :tag="'strong'" />
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
              <div class="_chat--participants">
                <AdminsAndContributorsField
                  :folder="chat"
                  :show_label="false"
                  :custom_label="$t('participants')"
                />
              </div>
            </div>
            <div class="_chat--actions">
              <button
                type="button"
                class="u-button u-button_red _openChat"
                :title="$t('open')"
                @click="toggleChat(chat.$path)"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <transition name="pagechange">
        <div
          v-if="opened_chat_slug"
          class="_openedChatContainer"
          :class="{ 'is--fullscreen': open_in_modal }"
        >
          <OpenedChat
            :key="opened_chat_slug"
            :chat_slug="opened_chat_slug"
            @close="opened_chat_slug = null"
          />
        </div>
      </transition>

      <CreateFolder
        v-if="show_create_chat_modal"
        :modal_name="$t('create_a_chat')"
        :path="path"
        @close="show_create_chat_modal = false"
        @openNew="openNewChat"
      />
    </component>
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
      open_in_modal: false,
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
  computed: {
    filtered_chats() {
      return this.chats.filter((chat) =>
        this.canLoggedinSeeFolder({
          folder: chat,
        })
      );
    },
    sorted_chats() {
      return this.filtered_chats.sort((a, b) => {
        return +new Date(b.$date_modified) - +new Date(a.$date_modified);
      });
    },
  },
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
    toggleChat(path) {
      const chat_slug = this.getFilename(path);
      this.opened_chat_slug =
        this.opened_chat_slug === chat_slug ? null : chat_slug;
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
  color: white;
  overscroll-behavior: contain;
  // border-top-left-radius: var(--border-radius);
  // border-bottom-left-radius: var(--border-radius);
}

._content {
  height: 90vh;
  background: var(--c-rouge_fonce);
  border-radius: var(--border-radius);
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

  &.is--opened {
    opacity: 0.5;
  }

  h3 {
    margin-bottom: calc(var(--spacing) / 2);
  }

  :deep(.u-label) {
    color: white;
  }
}

._chat--participants {
  // margin-top: calc(var(--spacing) / 2);
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

._openedChatContainer {
  --side-padding: 0px;

  position: absolute;
  top: 0;
  left: var(--side-padding);
  width: calc(100% - var(--side-padding) * 1);
  height: 100%;
  background: transparent;

  &.is--fullscreen {
    --side-padding: 20vw;
  }
}
</style>
