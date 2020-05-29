<template>
  <div
    class="m_chatRow"
    :class="{
      'is--open':
        $root.current_chat &&
        $root.current_chat.slugFolderName === chat.slugFolderName,
      'is--pinned': chat.pinned,
    }"
  >
    <div class="m_chatRow--firstLine">
      <div>
        <span
          v-if="$root.getUnreadMessageCount(chat) && can_see_chat"
          class="m_chatRow--unreadCounter"
          :content="$t('unread_messages')"
          v-tippy="{
            placement: 'bottom',
            delay: [600, 0],
          }"
        >
          {{ $root.getUnreadMessageCount(chat) }}
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

      <ClientsCheckingOut
        :type="'chats'"
        :slugFolderName="chat.slugFolderName"
      />
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
              v-if="$root.getAuthor(author.slugFolderName)"
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
import ClientsCheckingOut from "./subcomponents/ClientsCheckingOut.vue";

export default {
  props: {
    chat: Object,
  },
  components: {
    AccessController,
    ProtectedLock,
    ClientsCheckingOut,
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
