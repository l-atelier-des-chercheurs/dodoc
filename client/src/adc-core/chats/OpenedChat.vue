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

        <div class="_openedChat--header--row">
          {{ messages.length }} messages
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
        <div class="_noMedia" v-if="messages_grouped_by_date.length === 0">
          {{ $t("no_messages_in_chat") }}
        </div>
        <template v-else>
          <button
            type="button"
            class="u-button u-button_red"
            v-if="
              messages.length > max_messages_to_display && !load_all_messages
            "
            @click="load_all_messages = true"
          >
            {{ $t("load_all_messages") }}
          </button>

          <template v-for="day in messages_grouped_by_date">
            <div class="_dayTitle" :key="day.date">
              {{ formatDateToHuman(day.date) }}
            </div>
            <Message
              v-for="message in day.messages"
              :key="message.$path"
              :ref="`message-${message.$path}`"
              :message="message"
              :can_edit="can_edit_chat"
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
                @click="scrollToEnd()"
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
            :placeholder="$t('write_a_message')"
            :minlength="0"
            :maxlength="300"
            @toggleValidity="($event) => (allow_save = $event)"
            @onEnter="postMessage"
          >
            <template #suffix>
              <button
                type="button"
                class="u-button u-button_icon u-suffix"
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
  data() {
    return {
      chat: null,
      err_loading_chat: false,
      is_loading: true,
      new_message: "",
      max_messages_to_display: 100,
      load_all_messages: false,
      is_scrolled_to_end: false,

      pane_scroll_until_end: 0,
    };
  },
  created() {},
  async mounted() {
    await this.loadChat();
    this.is_loading = false;
    this.$api.join({ room: this.chat.$path });

    this.$nextTick(() => {
      this.scrollToEnd("instant");
    });

    // post messages until 1000
    // let i = 0;
    // while (i < 850) {
    //   this.new_message = "message " + i++;
    //   this.postMessage();
    //   await new Promise((resolve) => setTimeout(resolve, 10));
    // }

    this.$eventHub.$on("file.created", this.checkForNewMessages);
  },
  beforeDestroy() {
    this.$api.leave({ room: this.chat.$path });
    this.$eventHub.$off("file.created", this.checkForNewMessages);
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
    checkForNewMessages({ meta }) {
      if (meta.$path.startsWith(this.chat.$path)) {
        this.$nextTick(() => {
          this.scrollToMessage(meta.$path);
        });
      }
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
    scrollToEnd(behavior = "smooth") {
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

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: var(--border-radius);
  overflow: hidden;
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

  :deep(._editBtn) {
    --color2: white;
    --color-text: var(--c-noir);
  }
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
  bottom: calc(var(--spacing) * 1);
  right: calc(var(--spacing) * 1);
  z-index: 1000;
  overflow: visible;

  > button {
    position: absolute;
    right: 0;
    bottom: 0;
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
