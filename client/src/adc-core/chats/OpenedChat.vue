<template>
  <div class="_openedChat">
    <LoaderSpinner v-if="is_loading" />
    <div v-else-if="!chat && err_loading_chat" class="_error">
      {{ $t("error:") }} {{ err_loading_chat }}
    </div>
    <div class="_openedChat--header" v-else-if="chat" key="chat">
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
        {{ sorted_messages.length }} messages
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

    <div class="_openedChat--content" ref="messages">
      <div class="_noMedia" v-if="messages_grouped_by_date.length === 0">
        {{ $t("no_message_in_chat") }}
      </div>
      <template v-else>
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
    // while (this.sorted_messages.length < 100) {
    //   this.new_message = "message " + this.sorted_messages.length;
    //   await this.postMessage();
    //   await new Promise((resolve) => setTimeout(resolve, 100));
    // }
  },
  beforeDestroy() {
    this.$api.leave({ room: this.chat.$path });
  },
  watch: {
    sorted_messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToEnd();
        });
      },
      deep: true,
    },
  },
  computed: {
    messages() {
      if (!this.chat || !this.chat.$files) return [];
      return this.chat.$files.filter((file) => file.hasOwnProperty("content"));
    },
    sorted_messages() {
      return this.messages
        .slice()
        .sort((a, b) => {
          return +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded);
        })
        .reverse();
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
      additional_meta.content = this.new_message;
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      const { meta_filename } = await this.$api.uploadFile({
        path: this.chat.$path,
        filename,
        additional_meta,
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
  overflow: auto;
  background: var(--c-rouge_fonce);
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 1) 0;
}
._openedChat--footer {
  color: var(--c-noir);
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
</style>
