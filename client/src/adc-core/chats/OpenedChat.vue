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
            :label="$t('title')"
            :show_label="false"
            :content="chat.title"
            :path="chat.$path"
            :tag="'h3'"
            :required="true"
            :can_edit="can_edit_chat"
          />
        </div>

        <div class="_openedChat--header--row _lastMessageDate">
          <div>
            {{
              $tc("message_count", chat.$files_count, {
                count: chat.$files_count,
              })
            }}
          </div>
        </div>

        <div class="_openedChat--header--row _adminsAndContributors">
          <AdminsAndContributorsField
            :folder="chat"
            :can_edit="can_edit_chat"
            :custom_label="$t('participants')"
            :admin_label="$t('admin')"
            :admin_instructions="$t('chat_admin_instructions')"
            :contrib_instructions="$t('chat_contrib_instructions')"
          />
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
            <Message
              v-for="message in day.messages"
              :key="message.$path"
              :ref="`message-${message.$path}`"
              :message="message"
              :can_edit_chat="can_edit_chat"
              :can_contribute_to_chat="can_contribute_to_chat"
            />
          </template>
          <div class="_message--footer">
            <b-icon icon="check" />
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
        <template v-if="can_contribute_to_chat">
          <TextInput
            :content.sync="new_message"
            :autofocus="true"
            :input_type="'editor'"
            :placeholder="$t('write_a_message')"
            :minlength="0"
            :maxlength="300"
            @toggleValidity="($event) => (allow_save = $event)"
            @onEnter="postMessage"
          >
            <template #suffix>
              <button
                type="button"
                class="u-button u-button_bleuvert"
                v-if="new_message.length > 0"
                @click="postMessage"
              >
                <b-icon icon="arrow-up-right-square-fill" />
              </button>
            </template>
          </TextInput>
        </template>
        <div v-else class="u-instructions">
          {{ $t("not_allowed_to_post_messages") }}
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import Message from "./Message.vue";
import authorMessageMixin from "./mixins/authorMessageMixin";

export default {
  props: {
    chat_slug: {
      type: String,
      required: true,
    },
  },
  components: {
    Message,
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
      is_scrolled_to_end: false,

      pane_scroll_until_end: 0,
    };
  },
  created() {},
  async mounted() {
    await this.loadChat();
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.is_loading = false;
    this.$api.join({ room: this.chat.$path });

    setTimeout(() => {
      this.scrollToLatest("instant");
    }, 100);

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
  },
  computed: {
    messages() {
      if (!this.chat || !this.chat.$files) return [];
      return this.chat.$files.filter((file) => file.hasOwnProperty("$content"));
    },
    sorted_messages() {
      let messages = this.messages.slice().sort((a, b) => {
        return +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded);
      });
      if (!this.load_all_messages)
        messages = messages.slice(0, this.max_messages_to_display);
      messages.reverse();
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
      });
    },
    // checkForNewMessages({ meta }) {
    //   if (meta.$path.startsWith(this.chat.$path)) {
    //     this.$nextTick(() => {
    //       this.scrollToMessage(meta.$path);
    //       this.updateAuthorReadCount();
    //     });
    //   }
    // },
    updateAuthorReadCount() {
      this.updateAuthorLastReadMessage({
        chat_path: this.chat.$path,
        chat_read_index: this.messages.length,
      });
    },
    async loadChat() {
      const chat = await this.$api
        .getFolder({
          path: "/chats/" + this.chat_slug,
        })
        .catch((err) => {
          this.err_loading_chat = err.message || err.code;
        });
      this.chat = chat;
    },
    closeChat() {
      this.$emit("close");
    },
    async postMessage() {
      if (!this.new_message) return;
      const filename = "message-" + +new Date() + ".txt";
      // not using content, to improve performance loading thousands of messages
      //   const { meta_filename } = await this.$api.uploadText({
      //   path: this.chat.$path,
      //   filename,
      //   content: this.new_message,
      // });
      let additional_meta = {};
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      const { meta_filename } = await this.$api.uploadText({
        path: this.chat.$path,
        filename,
        additional_meta,
        content: this.new_message,
      });

      const path = this.chat.$path + "/" + meta_filename;
      this.new_message = "";

      const last_message_date = new Date().toISOString();
      const last_message_count = this.messages.length;

      // await this.$api.updateMeta({
      //   path: this.chat.$path,
      //   new_meta: { last_message_date, last_message_count },
      // });

      // setTimeout(() => {
      //   this.scrollToMessage(path);
      // }, 100);
    },
    scrollToMessage(path) {
      const messages = this.$refs[`message-${path}`];
      if (messages && messages.length > 0) {
        messages[0].$el.scrollIntoView({ behavior: "smooth" });
      }
    },
    scrollToLatest(behavior = "smooth") {
      this.updateAuthorReadCount();
      if (!this.$refs.messages) return;
      this.$refs.messages.scrollTo({
        top: this.$refs.messages.scrollHeight,
        behavior,
      });
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
  color: white;

  :deep(.u-loader) {
    background: var(--c-rouge_fonce);
  }

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  border-radius: var(--border-radius);
  border: 2px solid var(--c-rouge_fonce);

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
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2)
    calc(var(--spacing) / 2) calc(var(--spacing) / 1);
}
._openedChat--header--row {
  display: flex;
  align-items: center;

  margin-bottom: calc(var(--spacing) / 2);

  :deep(._editBtn) {
    --color2: white;
    --color-text: var(--c-noir);
  }
}
._lastMessageDate {
  justify-content: space-between;
}

._openedChat--content {
  position: relative;
  overflow: auto;
  background: var(--c-rouge_fonce);
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 1) 0;
}
._openedChat--footer {
  color: var(--c-noir);
  box-shadow: 0 0 0 1px hsla(230, 13%, 9%, 0.05),
    0 0.9px 1.25px hsla(230, 13%, 9%, 0.025), 0 3px 5px hsla(230, 13%, 9%, 0.05),
    0 12px 20px hsla(230, 13%, 9%, 0.09);

  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
  background: white;
}

._closeBtn {
  // position: absolute;
  // top: calc(var(--spacing) / 2);
  // right: calc(var(--spacing) / 2);
  // z-index: 1000;
}

._dayTitle {
  text-align: center;
  // font-size: 0.8rem;
  margin: calc(var(--spacing) / 1);
  font-style: italic;
  opacity: 0.7;

  &:first-child {
    margin-top: 0;
  }
}

._message--footer {
  text-align: center;
  margin: calc(var(--spacing) / 1);
}

._adminsAndContributors {
  :deep(.u-label),
  :deep(._icon),
  :deep(.u-instructions) {
    color: white !important;
  }
}

._backBtn {
  padding: calc(var(--spacing) / 2);
  padding-left: 0;
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
  // margin: calc(var(--spacing) / 1);
}

._noMessages {
  text-align: center;
  margin: calc(var(--spacing) / 1);
  font-style: italic;
  opacity: 0.7;
  color: white;
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
