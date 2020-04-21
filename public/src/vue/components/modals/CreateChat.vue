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
            {{ $t("participants") }}
          </button>
        </label>
        <div v-if="show_authors">
          <AuthorsInput
            :currentAuthors="chatdata.authors"
            @authorsChanged="(newAuthors) => (chatdata.authors = newAuthors)"
          />
          <small>{{ $t("author_instructions") }}</small>
        </div>
      </div>

      <!-- Access control -->
      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_access_control }"
            @click="show_access_control = !show_access_control"
          >
            {{ $t("manage_access") }}
          </button>
        </label>

        <div v-if="show_access_control">
          <EditAccessControl
            :editing_limited_to.sync="chatdata.editing_limited_to"
            :viewing_limited_to.sync="chatdata.viewing_limited_to"
            :can_have_password="false"
            :can_have_readonly="false"
          />
        </div>
      </div>
    </template>

    <template slot="submit_button">{{ $t("create") }}</template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import AuthorsInput from "../subcomponents/AuthorsInput.vue";
import EditAccessControl from "../subcomponents/EditAccessControl.vue";

export default {
  props: {
    read_only: Boolean,
  },
  components: {
    Modal,
    AuthorsInput,
    EditAccessControl,
  },
  data() {
    return {
      show_authors: true,
      show_access_control: true,

      is_sending_content_to_server: false,

      chatdata: {
        name: "",
        authors: this.$root.current_author
          ? [{ slugFolderName: this.$root.current_author.slugFolderName }]
          : [],
        editing_limited_to: "everybody",
        viewing_limited_to: "everybody",
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
          ({ name }) => name === this.chatdata.name
        )
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.name_already_exists"));

        return false;
      }

      this.is_sending_content_to_server = true;

      this.$root
        .createFolder({ type: "chats", data: this.chatdata })
        .then((cdata) => {
          this.$emit("close");
          this.$root.openChat(cdata.slugFolderName);
        });
    },
  },
};
</script>
<style></style>
