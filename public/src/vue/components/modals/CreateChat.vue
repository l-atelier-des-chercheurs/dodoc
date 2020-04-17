<template>
  <Modal
    @close="$emit('close')"
    @submit="newChat"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
    :is_loading="is_sending_content_to_server"
  >
    <template slot="header">
      <span class>{{ $t("create_a_chat") }}</span>
    </template>

    <template slot="sidebar">
      <!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t("chat_name") }}</label>
        <input type="text" v-model.trim="chatdata.name" required autofocus />
      </div>

      <!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_authors }"
            @click="show_authors = !show_authors"
          >
            {{ $t("author") }}
          </button>
        </label>

        <template v-if="show_authors">
          <AuthorsInput
            :currentAuthors="chatdata.authors"
            @authorsChanged="(newAuthors) => (chatdata.authors = newAuthors)"
          />
          <small>{{ $t("author_instructions") }}</small>
        </template>
      </div>
    </template>

    <template slot="submit_button">{{ $t("create") }}</template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import AuthorsInput from "../subcomponents/AuthorsInput.vue";

export default {
  props: {
    read_only: Boolean,
  },
  components: {
    Modal,
    AuthorsInput,
  },
  data() {
    return {
      show_authors: this.$root.current_author,

      is_sending_content_to_server: false,

      chatdata: {
        name: "",
        authors: this.$root.current_author
          ? [{ slugFolderName: this.$root.current_author.slugFolderName }]
          : [],
      },
      askBeforeClosingModal: false,
    };
  },
  watch: {
    "chatdata.name": function () {
      if (this.chatdata.name.length > 0) {
        this.askBeforeClosingModal = true;
      } else {
        this.askBeforeClosingModal = false;
      }
    },
    preview: function () {
      if (!!this.preview) {
        this.askBeforeClosingModal = true;
      } else {
        this.askBeforeClosingModal = false;
      }
    },
  },
  computed: {},
  methods: {
    newChat: function (event) {
      console.log("newChat");

      if (
        Object.values(this.$root.store.chats).some(
          ({ name }) => name === this.new_channel_name
        )
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.name_already_exists"));

        return false;
      }

      this.$root.createFolder({ type: "chats", data: this.chatdata });
      this.$emit("close");
    },
  },
};
</script>
<style></style>
