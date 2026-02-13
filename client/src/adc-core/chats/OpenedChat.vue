<template>
  <div class="_openedChat">
    <LoaderSpinner v-if="is_loading" />
    <div v-else-if="!chat && err_loading_chat" class="_error">
      {{ $t("error:") }} {{ err_loading_chat }}
    </div>
    <template v-else>
      <div class="_openedChat--header" key="chat">
        <div class="_openedChat--header--row">
          <button
            type="button"
            class="u-button u-button_icon _backBtn"
            @click="closeChat"
          >
            <b-icon icon="arrow-left-circle" :aria-label="$t('back')" />
          </button>
          <TitleField
            :field_name="'title'"
            class="_openedChat--header--title"
            :label="$t('title')"
            :show_label="false"
            :content="chat.title"
            :path="chat.$path"
            :tag="'h3'"
            :required="true"
            :can_edit="can_edit_chat"
          />

          <DropDown
            v-if="can_edit_chat"
            class="_actions"
            :show_label="false"
            :right="true"
          >
            <button
              type="button"
              class="u-buttonLink u-buttonLink_red"
              @click="show_remove_modal = true"
            >
              <b-icon icon="trash" />
              {{ $t("remove") }}
            </button>
          </DropDown>
          <div v-else />
        </div>
        <RemoveMenu2
          v-if="show_remove_modal"
          :modal_title="$t('remove_chat', { name: chat.title })"
          :success_notification="$t('chat_was_removed')"
          :path="chat.$path"
          @removedSuccessfully="$emit('close')"
          @close="show_remove_modal = false"
        />

        <!-- <div class="_openedChat--header--row _lastMessageDate">
          <div>
            {{
              $tc("message_count", chat.$files_count, {
                count: chat.$files_count,
              })
            }}
          </div>
        </div> -->
        <div class="_openedChat--header--row">
          <div>
            <div class="u-label">{{ $t("linked_project") }}</div>
          </div>
          <div>
            <div class="" v-if="chat.linked_project_path">
              <button
                type="button"
                class="u-button u-button_white u-button_small"
                @click="openLinkedProject"
              >
                <b-icon icon="arrow-right-short" />
                {{ $t("open") }}
              </button>
            </div>
            <div class="" v-else>
              <div class="u-instructions">{{ $t("no_linked_project") }}</div>
            </div>
          </div>
          <div>
            <EditBtn
              :label_position="'left'"
              :btn_type="chat.linked_project_path === 0 ? 'add' : 'edit'"
              :is_unfolded="chat.linked_project_path === 0"
              @click="show_project_link_modal = true"
            />

            <ProjectLinkModal
              v-if="show_project_link_modal"
              :path="chat.$path"
              :current_linked_project_path="chat.linked_project_path"
              @close="show_project_link_modal = false"
            />
          </div>
          <div></div>
        </div>

        <div class="_openedChat--header--row _adminsAndContributors">
          <AdminsAndContributorsField
            :folder="chat"
            :can_edit="can_edit_chat"
            :custom_label="$t('participants')"
            :admin_label="$t('referent')"
            :admin_instructions="$t('chat_admin_instructions')"
            :contrib_instructions="$t('chat_contrib_instructions')"
          />
          <div class="_status">
            <StatusTag
              :status="chat.$status"
              :status_options="['public', 'private']"
              :path="chat.$path"
              :can_edit="can_edit_chat"
            />
          </div>
        </div>
      </div>
      <div class="_openedChat--content" ref="messages" @scroll="onScroll">
        <div
          class="u-instructions _noMessages"
          v-if="messages_grouped_by_date.length === 0"
        >
          {{ $t("no_messages_in_chat").toLowerCase() }}
        </div>
        <template v-else>
          <div
            class="_loadMoreMessages"
            v-if="
              messages.length > max_messages_to_display && !load_all_messages
            "
          >
            <button
              type="button"
              class="u-button u-button_red u-button_small"
              @click="load_all_messages = true"
            >
              {{ $t("load_older_messages") }}
            </button>
          </div>

          <template v-for="day in messages_grouped_by_date">
            <div class="_dayTitle" :key="day.date">
              {{ formatDateToHuman(day.date) }}
            </div>
            <template v-for="(message, index) in day.messages">
              <div
                v-if="
                  initial_unread_count > 0 &&
                  message._index === initial_mapped_read_index
                "
                class="_unreadMessages"
                ref="unreadMessagesNotice"
              >
                <b-icon icon="arrow-down-short" />
                {{
                  $tc("new_messages", initial_unread_count, {
                    count: initial_unread_count,
                  }).toLowerCase()
                }}
                <b-icon icon="arrow-down-short" />
              </div>
              <div
                v-if="
                  index > 0 &&
                  day.messages[index - 1].$authors?.[0] !==
                    message.$authors?.[0]
                "
                class="_changeAuthor"
              ></div>

              <Message
                :key="message.$path"
                :ref="`message-${message.$path}`"
                :message="message"
                :max_message_length="max_message_length"
                :can_edit_chat="can_edit_chat"
                :can_contribute_to_chat="can_contribute_to_chat"
              />
            </template>
          </template>
          <div class="_message--footer">
            <b-icon icon="check-lg" />
          </div>

          <div class="_scrollToEndBtn">
            <transition name="scrollEndBtn">
              <button
                v-if="pane_scroll_until_end > 100"
                type="button"
                class="u-button u-button_icon u-button_red"
                @click="scrollToLatest()"
              >
                <b-icon icon="arrow-down" />
              </button>
            </transition>
          </div>
        </template>
      </div>

      <div class="_openedChat--footer">
        <template v-if="!connected_as">
          <div class="u-instructions">
            {{ $t("you_must_login_to_contribute") }}
          </div>
        </template>
        <template v-else-if="can_contribute_to_chat">
          <TextInput
            :content.sync="new_message"
            :autofocus="true"
            class="_newMessageInput"
            ref="textInput"
            :input_type="'editor'"
            :placeholder="$t('write_a_message')"
            :custom_formats="['bold', 'italic', 'link', 'emoji']"
            :minlength="0"
            :maxlength="max_message_length"
            :intercept_enter="true"
            @toggleValidity="($event) => (allow_send = $event)"
            @onEnter="postMessage"
          >
            <template #suffix>
              <button
                type="button"
                class="u-button u-button_bleumarine _sendBtn"
                v-if="new_message.length > 0"
                :disabled="is_posting_message || !allow_send"
                @click="postMessage"
              >
                <svg
                  v-if="!is_posting_message"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                    fill="currentColor"
                  />
                </svg>
                <b-icon v-else icon="three-dots" animation="cylon" />
              </button>
            </template>
          </TextInput>
        </template>
        <template v-else>
          <div class="u-instructions">
            {{ $t("not_allowed_to_post_messages") }}
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
<script>
import Message from "./Message.vue";
import authorMessageMixin from "./mixins/authorMessageMixin";
import ProjectLinkModal from "../modals/ProjectLinkModal.vue";

export default {
  props: {
    chat_slug: {
      type: String,
      required: true,
    },
  },
  components: {
    Message,
    ProjectLinkModal,
  },
  mixins: [authorMessageMixin],
  data() {
    return {
      chat: null,
      err_loading_chat: false,
      is_loading: true,
      new_message: "",
      max_messages_to_display: 50,
      load_all_messages: false,
      show_remove_modal: false,
      show_project_link_modal: false,
      pane_scroll_until_end: 0,

      is_posting_message: false,

      max_message_length: 300,

      allow_send: false,

      initial_mapped_read_index: null,
      initial_unread_count: 0,
    };
  },
  async created() {},
  async mounted() {
    await this.loadChat();
    this.$api.join({ room: this.chat.$path });
    this.is_loading = false;

    await this.$nextTick();

    this.initial_unread_count = this.unread_since_last_visit;
    if (this.initial_unread_count === 0) {
      this.initial_mapped_read_index = null;
    } else {
      this.initial_mapped_read_index = this.mapped_read_index;
    }

    if (this.unread_since_last_visit > this.max_messages_to_display) {
      this.max_messages_to_display = this.unread_since_last_visit + 10;
      await this.$nextTick();
    }

    await setTimeout(() => {}, 200);

    if (this.initial_unread_count > 0) {
      this.scrollToUnread();
    } else {
      this.scrollToLatest("instant");
    }

    this.updateAuthorReadCount();

    this.$eventHub.$on("file.created", this.newMessagePosted);
  },
  beforeDestroy() {
    this.$api.leave({ room: this.chat.$path });
    this.$eventHub.$off("file.created", this.newMessagePosted);
  },
  watch: {
    sorted_messages: {
      handler() {
        // annoying: jumps for any event, like removing or editing a message
        this.$nextTick(() => {
          // this.scrollToEnd();
        });
      },
      deep: true,
    },
    pane_scroll_until_end: {
      handler() {
        this.updateAuthorReadCount();
      },
    },
  },
  computed: {
    last_message_read_index() {
      return this.getIndexFromChatPath(this.chat?.$path) || 0;
    },
    unread_since_last_visit() {
      if (!this.chat) return 0;
      return Math.max(this.chat.$files_count - this.last_message_read_index, 0);
    },
    messages() {
      if (!this.chat || !this.chat.$files) return [];
      return this.chat.$files.filter((file) => file.hasOwnProperty("$content"));
    },
    mapped_read_index() {
      // Map read index to the filtered messages array
      // last_message_read_index is based on chat.$files_count (all files)
      // but we need to find the corresponding index in the filtered messages array
      if (!this.chat || !this.chat.$files) return 0;

      const all_files_sorted = this.chat.$files.slice().sort((a, b) => {
        return +new Date(a.$date_uploaded) - +new Date(b.$date_uploaded);
      });

      let read_count_in_filtered = 0;
      for (
        let i = 0;
        i < this.last_message_read_index && i < all_files_sorted.length;
        i++
      ) {
        if (all_files_sorted[i].hasOwnProperty("$content")) {
          read_count_in_filtered++;
        }
      }

      return read_count_in_filtered;
    },
    sorted_messages() {
      let messages = this.messages.slice().sort((a, b) => {
        return +new Date(a.$date_uploaded) - +new Date(b.$date_uploaded);
      });
      messages = messages.map((message, index) => {
        message._index = index;
        return message;
      });
      if (!this.load_all_messages)
        messages = messages.slice(-this.max_messages_to_display);
      return messages;
    },
    messages_grouped_by_date() {
      return this.sorted_messages.reduce((acc, message) => {
        const date = new Date(message.$date_uploaded).toDateString();
        let day = acc.find((day) => day.date === date);
        if (!day) {
          day = { date, messages: [] };
          acc.push(day);
        }
        day.messages.push(message);
        // day.messages.sort((a, b) => {
        //   return +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded);
        // });
        return acc;
      }, []);
    },
    can_edit_chat() {
      return this.canLoggedinEditFolder({ folder: this.chat });
    },
    can_contribute_to_chat() {
      if (!this.chat) return false;
      return this.canLoggedinContributeToFolder({ folder: this.chat });
    },
  },
  methods: {
    onScroll(event) {
      this.pane_scroll_until_end =
        event.target.scrollHeight -
        event.target.scrollTop -
        event.target.clientHeight;
    },
    newMessagePosted({ meta }) {
      this.$nextTick(() => {
        this.scrollToLatest("smooth");
        this.updateAuthorReadCount();
      });
    },
    async updateAuthorReadCount() {
      const read_index = this.chat.$files_count;
      await this.updateAuthorLastReadMessage({
        chat_path: this.chat.$path,
        chat_read_index: read_index,
      });
    },
    async loadChat() {
      const chat = await this.$api
        .getFolder({
          path: "chats/" + this.chat_slug,
        })
        .catch((err) => {
          this.err_loading_chat = err.message || err.code;
        });
      this.chat = chat;
    },
    closeChat() {
      this.$emit("close");
    },
    onProjectSelected(projectPath) {
      // Handle project selection if needed
      // For now, the path is displayed in the modal
    },
    async postMessage() {
      if (!this.new_message) return;

      if (!this.allow_send) {
        if (this.new_message.length > this.max_message_length) {
          this.$alertify.delay(4000).error(
            this.$t("message_too_long", {
              max_length: this.max_message_length,
            })
          );
        }
        return;
      }

      this.is_posting_message = true;
      const filename = "message-" + +new Date() + ".txt";
      // not using $content, to improve performance for loading thousands of messages
      //   const { meta_filename } = await this.$api.uploadText({
      //   path: this.chat.$path,
      //   filename,
      //   content: this.new_message,
      // });
      let additional_meta = {};
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      // await new Promise((resolve) => setTimeout(resolve, 100));

      const content = this.cleanUpString(this.new_message);

      const { meta_filename } = await this.$api.uploadText({
        path: this.chat.$path,
        filename,
        additional_meta,
        content,
      });

      const path = this.chat.$path + "/" + meta_filename;
      this.is_posting_message = false;
      this.new_message = "";

      const last_message_date = new Date().toISOString();
      const last_message_count = this.messages.length;
      // Note: updateAuthorReadCount() will be called again by newMessagePosted
      // when the socket event fires, which ensures we use the updated chat.$files_count
      // But we also call it here to handle the case where the socket event is delayed
      this.$nextTick(() => {
        this.updateAuthorReadCount();
      });

      this.$nextTick(() => {
        try {
          this.$refs.textInput.$children[0].editor.focus();
        } catch (error) {}
      });
    },
    scrollToMessage(path) {
      const messages = this.$refs[`message-${path}`];
      if (messages && messages.length > 0) {
        messages[0].$el.scrollIntoView({ behavior: "smooth" });
      }
    },
    scrollToLatest(behavior = "smooth") {
      if (!this.$refs.messages) return;
      this.$refs.messages.scrollTo({
        top: this.$refs.messages.scrollHeight,
        behavior,
      });
    },
    async scrollToUnread() {
      if (!this.$refs.unreadMessagesNotice?.[0])
        return this.scrollToLatest("instant");

      // Use scrollIntoView to align the notice to the top of the scrollable container
      this.$refs.unreadMessagesNotice[0].scrollIntoView({
        behavior: "instant",
        block: "start",
      });
    },
    openLinkedProject() {
      const url = this.createURLFromPath(this.chat.linked_project_path);
      this.$router.push(url);
    },
  },
};
</script>
<style lang="scss" scoped>
._openedChat {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: var(--c-rouge);

  :deep(.u-loader) {
    background: var(--c-rouge_fonce);
  }

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  border-radius: var(--border-radius);
  border: 2px solid var(--c-rouge);

  > ._openedChat--header {
    flex: 0 0 auto;
  }

  > ._openedChat--content {
    flex: 1 1 auto;
  }

  > ._openedChat--footer {
    flex: 0 0 auto;
  }
}

._openedChat--header {
  padding: calc(var(--spacing) / 2);
  color: white;

  :deep(.u-label),
  :deep(._icon),
  :deep(.u-instructions) {
    color: white !important;
  }
}
._openedChat--header--row {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;

  &:not(:last-child) {
    border-bottom: 2px solid var(--c-rouge_fonce);
    margin-bottom: calc(var(--spacing) / 2);
    padding-bottom: calc(var(--spacing) / 2);
  }

  :deep(._editBtn) {
    --color1: transparent;
    --color2: white;
    --color-text: var(--c-noir);
  }

  > ._status {
    flex: 0 0 9ch;
  }
}
._actions {
  color: var(--c-noir);
}

._openedChat--header--title {
  overflow: hidden;
  flex: 1 1 0;
}

._lastMessageDate {
  justify-content: space-between;
}

._openedChat--content {
  position: relative;
  overflow: auto;
  background: var(--c-rouge_fonce);
}
._openedChat--footer {
  box-shadow: 0 0 0 1px hsla(230, 13%, 9%, 0.05),
    0 0.9px 1.25px hsla(230, 13%, 9%, 0.025), 0 3px 5px hsla(230, 13%, 9%, 0.05),
    0 12px 20px hsla(230, 13%, 9%, 0.09);

  max-height: 50vh;
  overflow: auto;

  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2);
  // padding-bottom: 0;
  text-align: center;
  background-color: white;
  color: var(--c-noir);
}

._closeBtn {
  // position: absolute;
  // top: calc(var(--spacing) / 2);
  // right: calc(var(--spacing) / 2);
  // z-index: 1000;
}

._dayTitle {
  position: sticky;
  top: 0;
  z-index: 1000;

  text-align: center;
  color: white;
  // font-size: 0.8rem;
  padding: calc(var(--spacing) / 2);
  font-style: italic;
  background: var(--c-rouge_fonce);
  text-transform: lowercase;
  // background: linear-gradient(to bottom, var(--c-rouge_fonce) 60%, transparent);
}

._message--footer {
  text-align: center;
  color: white;
  margin: calc(var(--spacing) / 1);
}

._adminsAndContributors {
}

._backBtn {
  // padding: calc(var(--spacing) / 2);
  // padding-left: 0;
}

._scrollToEndBtn {
  position: sticky;
  bottom: 0;
  right: 0;
  z-index: 1000;
  overflow: visible;

  > button {
    position: absolute;
    right: calc(var(--spacing) * 1);
    bottom: calc(var(--spacing) * 1);

    filter: drop-shadow(0 0px 2px rgba(0, 0, 0, 0.2));
  }
}

._loadMoreMessages {
  text-align: center;
  margin: calc(var(--spacing) / 2);
}

._noMessages,
._unreadMessages {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) / 2);

  text-align: center;
  margin: calc(var(--spacing) / 1);
  font-style: italic;
  opacity: 0.7;
  color: white;
}

._unreadMessages {
  opacity: 1;
  background: var(--c-rouge);
  border-radius: var(--border-radius);
  // color: var(--c-noir);
}

._sendBtn {
  position: relative;
  padding: calc(var(--spacing) / 2);
}
._changeAuthor {
  // height: 1px;
  // background: var(--c-rouge_fonce);
  margin-bottom: calc(var(--spacing) / 1);
}

._loader {
  position: relative;
  width: 1.5rem;
  height: 1.5rem;
}

._newMessageInput {
  ::v-deep .ql-editor {
    min-height: 2rem !important;
  }
}
</style>
<style lang="scss">
.scrollEndBtn-enter-active,
.scrollEndBtn-leave-active {
  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
}
.scrollEndBtn-enter,
.scrollEndBtn-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
