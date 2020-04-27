<template>
  <div
    class="m_chatRow"
    :class="{
      'is--open': $root.settings.current_chat.slug === chat.slugFolderName,
      'is--pinned': chat.pinned,
    }"
  >
    <div class="m_chatRow--firstLine">
      <div>
        <span
          v-if="unread_messages_count && can_see_chat"
          class="m_chatRow--unreadCounter"
          :content="$t('unread_messages')"
          v-tippy="{
            placement: 'bottom',
            delay: [600, 0],
          }"
        >
          {{ unread_messages_count }}
        </span>
        <span class="m_chatRow--name"
          >{{ chat.name }}
          <ProtectedLock
            :editing_limited_to="chat.editing_limited_to"
            :is_protected="!can_see_chat"
          />
        </span>
      </div>
      <small class="c-blanc text-lc">
        {{ $t("last_message") }} —
        {{ $root.formatDateToCalendar(chat.date_modified) }}
      </small>

      <button
        type="button"
        class="buttonLink bg-rouge"
        @click="openChat()"
        :class="{ 'is--disabled': !can_see_chat }"
      >
        {{ $t("open") }}
      </button>
    </div>

    <div class="m_chatRow--secondLine">
      <label class="m_chatRow--secondLine--toggleAccessControl">
        <button
          type="button"
          class="button-nostyle text-uc button-triangle c-blanc"
          :class="{ 'is--active': show_access_control }"
          @click="show_access_control = !show_access_control"
        >
          {{ $t("manage_access") }}
        </button>
      </label>

      <div v-if="show_access_control">
        <div class="m_metaField" v-if="!!chat.authors">
          <div>{{ $t("author") }}</div>
          <div class="m_authorField">
            <span
              v-for="author in chat.authors"
              v-if="author.slugFolderName"
              :key="author.slugFolderName"
              class="is--active"
              :class="{
                'is--loggedInAuthor':
                  $root.current_author &&
                  $root.current_author.slugFolderName === author.slugFolderName,
              }"
            >
              <template v-if="$root.getAuthor(author.slugFolderName)">
                {{ $root.getAuthor(author.slugFolderName).name }}
              </template>
              <template v-else>
                {{ author.slugFolderName }}
              </template>
            </span>
          </div>
        </div>

        <AccessController
          :folder="chat"
          :context="'full'"
          :type="'chats'"
          @openFolder="openChat()"
          @closeFolder="closeChat"
        />
      </div>
    </div>
  </div>
</template>
<script>
import AccessController from "./subcomponents/AccessController.vue";
import ProtectedLock from "./subcomponents/ProtectedLock.vue";

export default {
  props: {
    chat: Object,
  },
  components: {
    AccessController,
    ProtectedLock,
  },
  data() {
    return {
      show_access_control: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    can_see_chat() {
      return this.$root.canSeeFolder({
        type: "chats",
        slugFolderName: this.chat.slugFolderName,
      });
    },
    unread_messages_count() {
      if (
        typeof this.chat.medias !== "object" ||
        Object.keys(this.chat.medias).length === 0 ||
        !this.$root.current_author
      )
        return false;

      const total_number_of_messages_in_chat = Object.keys(this.chat.medias)
        .length;

      // find media with meta
      const last_messages_read_in_channels = this.$root.current_author
        .last_messages_read_in_channels;

      if (last_messages_read_in_channels) {
        const existing_info = last_messages_read_in_channels.find(
          (c) => c.channel === this.chat.slugFolderName
        );
        if (existing_info) {
          const last_message_metaFileName = existing_info.metaFileName;
          const index_of_past_message_read = Object.values(
            this.chat.medias
          ).findIndex((m) => m.metaFileName === existing_info.msg);
          return (
            total_number_of_messages_in_chat - index_of_past_message_read - 1
          );
        }
      }

      return total_number_of_messages_in_chat;
    },
  },
  methods: {
    openChat() {
      if (!this.can_see_chat) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.cant_open_chat"));
        this.show_access_control = true;
        return;
      }

      this.$root.openChat(this.chat.slugFolderName);
    },
    closeChat() {
      this.$root.closeChat();
    },
  },
};
</script>
<style lang="scss" scoped></style>
