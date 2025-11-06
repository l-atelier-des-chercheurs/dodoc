<template>
  <div class="_chatsList">
    <component
      :is="in_modal ? 'BaseModal2' : 'div'"
      :size="modal_size"
      :nopadding="true"
      @close="closeModal"
    >
      <div class="_content" :class="{ 'is--mobileview': $root.is_mobile_view }">
        <div class="_chatsList--header">
          <h3>{{ $t("list_of_topics") }}</h3>
          <button
            type="button"
            v-if="!$root.is_mobile_view"
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
            v-if="is_instance_admin || is_instance_contributor"
            @click="show_create_chat_modal = true"
          >
            <b-icon icon="plus-lg" />
            {{ $t("create") }}
          </button>

          <PinnedNonpinnedFolder
            :field_name="'topics_pinned'"
            :label="$tc('topics_pinned', topics_pinned.length)"
            :content="topics_pinned"
            :path="''"
            :folders="sorted_chats"
            :direction="'vertical'"
            :can_edit="is_instance_admin"
            v-slot="slotProps"
          >
            <ChatPreview
              :chat="slotProps.item"
              :is-opened="
                opened_chat_slug === getFilename(slotProps.item.$path)
              "
              @toggle="toggleChat"
            />
          </PinnedNonpinnedFolder>
        </div>
      </div>

      <transition name="pagechange">
        <div
          v-if="opened_chat_slug"
          class="_openedChatContainer"
          :class="{
            'is--fullscreen': in_modal,
            'is--mobileview': $root.is_mobile_view,
          }"
        >
          <!-- <div class="_openedChatContainer--overlay" /> -->
          <OpenedChat
            :key="opened_chat_slug"
            :chat_slug="opened_chat_slug"
            @close="opened_chat_slug = null"
          />
        </div>
      </transition>

      <CreateFolder
        v-if="show_create_chat_modal"
        :modal_name="$t('create_a_topic')"
        :path="path"
        @close="show_create_chat_modal = false"
        @openNew="openNewChat"
      />
    </component>
  </div>
</template>
<script>
import OpenedChat from "./OpenedChat.vue";
import ChatPreview from "./ChatPreview.vue";
import authorMessageMixin from "./mixins/authorMessageMixin";

import PinnedNonpinnedFolder from "@/adc-core/ui/PinnedNonpinnedFolder.vue";

export default {
  props: {},
  components: {
    OpenedChat,
    ChatPreview,
    PinnedNonpinnedFolder,
  },
  mixins: [authorMessageMixin],
  data() {
    return {
      settings: undefined,
      chats: [],
      path: "chats",
      fetch_chats_error: null,
      show_create_chat_modal: false,
      opened_chat_slug: null,
      open_in_modal: false,
    };
  },
  async created() {
    this.loadSettings();
    await this.loadChats();
    this.$api.join({ room: this.path });
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    modal_size() {
      if (this.$root.is_mobile_view) return "full";
      if (this.opened_chat_slug) return "large";
      return "medium";
    },
    in_modal() {
      return this.open_in_modal || this.$root.is_mobile_view;
    },
    topics_pinned() {
      if (
        !this.settings?.topics_pinned ||
        !Array.isArray(this.settings.topics_pinned)
      )
        return [];
      return this.settings.topics_pinned;
    },
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
    async loadSettings() {
      this.settings = await this.$api
        .getFolder({
          path: "",
        })
        .catch((err) => {
          return err;
        });
      this.$api.join({ room: "." });
    },
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
    closeModal() {
      this.open_in_modal = false;
      if (this.$root.is_mobile_view) {
        this.$root.show_chats_list = false;
      }
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
  overscroll-behavior: contain;
  // border-top-left-radius: var(--border-radius);
  // border-bottom-left-radius: var(--border-radius);
}

._content {
  height: 90vh;
  background: var(--c-rouge_fonce);
  color: white;
  border-radius: var(--border-radius);
  overflow: auto;
  padding-bottom: calc(var(--spacing) * 1);

  &.is--mobileview {
    height: calc(100vh - var(--spacing) * 1);
    --side-padding: 0px;
    // overflow: hidden;
  }
}

._chatsList--header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 calc(var(--spacing) / 1);
  padding: calc(var(--spacing) / 2) 0;

  border-bottom: 2px solid white;
}

._chatsList--content {
  padding: calc(var(--spacing) / 1);

  :deep(.u-label),
  :deep(.u-instructions),
  :deep(._pinSpace) {
    color: white;
  }

  :deep(._pinSpace) {
    right: 0;
    left: auto;
  }
  :deep(._list_pinned) {
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.3) 2px,
      transparent 2px
    );
  }
}

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
  z-index: 100;
  top: 0;
  left: var(--side-padding);
  width: calc(100% - var(--side-padding) * 1);
  height: 100%;
  background: transparent;

  &.is--fullscreen {
    --side-padding: 20vw;
  }
  &.is--mobileview {
    --side-padding: 0px;
  }
}
._openedChatContainer--overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
</style>
