<template>
  <div class="_chat" :class="{ 'is--opened': isOpened }">
    <div class="_chat--title">
      <span v-if="unread_count > 0" class="_chat--unread" :title="$t('unread')">
        {{ unread_count }}
      </span>
      <b class="_chat--title--text" v-text="chat.title" />

      <b-icon
        v-if="chat.$status === 'private'"
        class="_chat--status"
        icon="file-lock2-fill"
      />
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
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: calc(var(--spacing) / 4);
}

._chat--title--text {
  // display: inline-block;
  flex: 1 1 0;
  overflow: hidden;
  overflow-wrap: break-word;
}

._chat--unread {
  min-width: 25px;
  min-height: 20px;

  border-radius: calc(var(--border-radius) / 1);
  font-family: "Fira Code";
  // margin: calc(var(--spacing) / 8);
  margin-right: calc(var(--spacing) / 2);

  background: var(--c-rouge_fonce);
  // background: white;
  color: white;
  // border: 2px dashed white;

  padding: calc(var(--spacing) / 4);
  font-size: var(--sl-font-size-small);
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

._chat--status {
  position: absolute;
  right: 0;
  top: 0;
  margin: calc(var(--spacing) / 2);
}
</style>
