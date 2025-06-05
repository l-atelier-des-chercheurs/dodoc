<template>
  <div class="_openedChat">
    <LoaderSpinner v-if="is_loading" />
    <div v-else-if="!chat && err_loading_chat" class="_error">
      {{ $t("error:") }} {{ err_loading_chat }}
    </div>
    <div class="_openedChat--header" v-else-if="chat" key="chat">
      <div class="_openedChat--header--row">
        <h3>{{ chat.title }}</h3>
        <button
          type="button"
          class="u-button u-button_icon _closeBtn"
          @click="closeChat"
        >
          <b-icon icon="x-lg" :label="$t('close')" />
        </button>
      </div>

      <div class="_openedChat--header--row _adminsAndContributors">
        <AdminsAndContributorsField
          :folder="chat"
          :can_edit="can_contribute_to_chat"
          :custom_label="$t('participants')"
          :admin_label="$t('admin')"
          :admin_instructions="$t('chat_admin_instructions')"
          :contrib_instructions="$t('chat_contrib_instructions')"
        />
      </div>
    </div>

    <div class="_openedChat--content" ref="messages">
      <div class="_noMedia" v-if="messages.length === 0">
        {{ $t("no_message_in_chat") }}
      </div>
      <div v-else>
        <Message
          v-for="message in messages"
          :key="message.$path"
          :ref="`message-${message.$path}`"
          :message="message"
        />
        <div class="_message--footer">
          <b-icon icon="check" />
        </div>
      </div>
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
      this.scrollToEnd();
    });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.chat.$path });
  },
  watch: {},
  computed: {
    messages() {
      if (!this.chat || !this.chat.$files) return [];
      return this.chat.$files.filter((file) => file.hasOwnProperty("content"));
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
      setTimeout(() => {
        this.scrollToMessage(path);
      }, 100);
    },
    scrollToMessage(path) {
      const messages = this.$refs[`message-${path}`];
      if (messages && messages.length > 0) {
        messages[0].$el.scrollIntoView({ behavior: "smooth" });
      }
    },
    scrollToEnd() {
      this.$refs.messages.scrollTo({
        top: this.$refs.messages.scrollHeight,
        behavior: "instant",
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
  justify-content: space-between;
  align-items: center;
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

._message--footer {
  text-align: center;
}

._adminsAndContributors {
  :deep(.u-label),
  :deep(._icon) {
    color: white !important;
  }
}
</style>
