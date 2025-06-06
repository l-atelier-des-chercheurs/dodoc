<template>
  <div class="_chat" :class="{ 'is--opened': isOpened }">
    <div class="_chat--title">
      <b-icon v-if="chat.$status === 'private'" icon="file-lock2-fill" />
      <div v-if="unread_count > 0" class="_chat--unread" :title="$t('unread')">
        {{ unread_count }}
      </div>
      <b v-text="chat.title" />
    </div>
    <div class="_chat--infos">
      <div>
        <span>
          {{
            $tc("message_count", messages_count, {
              count: messages_count,
            })
          }}
        </span>
        <!-- <b v-if="unread_count > 0"> {{ $t("unread") }} = {{ unread_count }} </b> -->
      </div>
      <div class="">
        {{ $t("last_message_date") }}
        {{ formatDateTimeToHuman(chat.$date_modified) }}
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
        @click="$emit('toggle', chat.$path)"
      ></button>
    </div>
  </div>
</template>

<script>
import authorMessageMixin from "./mixins/authorMessageMixin";

export default {
  name: "ChatPreview",
  mixins: [authorMessageMixin],
  props: {
    chat: {
      type: Object,
      required: true,
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    messages_count() {
      return this.chat.$files_count;
    },
    unread_count() {
      return Math.max(
        this.messages_count - this.local_author_chat_read_index,
        0
      );
    },
    local_author_chat_read_index() {
      return this.getIndexFromChatPath(this.chat.$path) || 0;
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
._chat {
  position: relative;
  background: var(--c-rouge);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 4);

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

._chat--title {
  overflow-wrap: break-word;
  margin-bottom: calc(var(--spacing) / 4);
}

._chat--unread {
  // position: absolute;
  // top: 0;
  // right: 0;

  min-width: 30px;
  min-height: 30px;

  border-radius: calc(var(--border-radius) / 1);
  font-family: "Fira Code";
  // margin: calc(var(--spacing) / 8);
  margin-right: calc(var(--spacing) / 4);

  background: var(--c-rouge_fonce);
  // background: white;
  color: white;
  // border: 2px dashed white;

  padding: calc(var(--spacing) / 4);
  font-size: var(--sl-font-size-medium);
  font-weight: 500;

  display: inline-flex;
  align-items: center;
  justify-content: center;
}

._chat--participants {
  margin-top: calc(var(--spacing) / 4);
}

._chat--infos {
  font-size: var(--sl-font-size-x-small);
}

._chat--actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
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
</style>
