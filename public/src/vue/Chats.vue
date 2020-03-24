<template>
  <div class="m_chatsview">
    <div class="m_actionbar">
      <div class="m_actionbar--buttonBar"></div>
      <div class="m_actionbar--text">{{ $t('channels_instructions') }}</div>
    </div>

    <div class="m_channels">
      <h3 class="font-folder_title">Liste des discussions</h3>
      <div class="margin-vert-small">
        <button
          type="button"
          class="barButton barButton_createChannel"
          @click="show_create_channel_modal = !show_create_channel_modal"
        >
          <span>{{ $t("create") }}</span>
        </button>
      </div>

      <div>
        <form
          v-if="show_create_channel_modal"
          @submit.prevent="createChannel()"
          class="input-group"
        >
          <input type="text" v-model.trim="new_channel_name" required autofocus />
          <button
            type="submit"
            :disabled="new_channel_name === ''"
            v-html="$t('create')"
            class="bg-bleuvert"
          />
        </form>
      </div>
      <div class="m_chats--list">
        <div
          v-for="(chat, index) in chats"
          :key="index"
          class="m_chats--list--item"
          :class="{
            'is--open': $root.settings.current_chat.slug === chat.slugFolderName
          }"
          @click="openChat(chat.slugFolderName)"
        >
          <span class="m_chats--list--item--name">{{ chat.name }}</span>
          <button
            type="button"
            class="buttonLink bg-rouge"
            @click.stop="openChat(chat.slugFolderName)"
          >{{ $t("open") }}</button>
        </div>
      </div>
    </div>

    <transition name="slideright" :duration="500">
      <Chat :chat="current_chat" v-if="current_chat" />
    </transition>
  </div>
</template>
<script>
import Chat from "./components/Chat.vue";

export default {
  props: {
    read_only: Boolean,
    chats: Object
  },
  components: {
    Chat
  },
  data() {
    return {
      show_create_channel_modal: false,
      new_channel_name: ""
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    current_chat() {
      if (!this.$root.settings.current_chat.slug) return false;

      return Object.values(this.$root.store.chats).find(
        c => c.slugFolderName === this.$root.settings.current_chat.slug
      );
    }
  },
  methods: {
    createChannel() {
      if (
        Object.values(this.$root.store.chats).find(
          ({ name }) => name === this.new_channel_name
        )
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.channel_name_exists"));

        return false;
      }
      const data = {
        name: this.new_channel_name
      };

      this.show_create_channel_modal = false;
      this.new_channel_name = "";

      this.$root.createFolder({ type: "chats", data });
    },
    openChat(slug) {
      this.$root.settings.current_chat.slug = slug;
    }
  }
};
</script>
<style lang="scss"></style>
