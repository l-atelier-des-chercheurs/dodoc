<template>
  <div class="m_chatsview">
    <div class="m_actionbar">
      <div class="m_actionbar--buttonBar"></div>
      <div class="m_actionbar--text">{{ $t("channels_instructions") }}</div>
    </div>

    <div class="m_channels">
      <div class="m_channels--content">
        <h3 class="font-folder_title">{{ $t("channels_list") }}</h3>
        <div class="margin-vert-small">
          <template v-if="$root.current_author">
            <button
              type="button"
              class="barButton barButton_createChannel"
              @click="show_create_channel_modal = !show_create_channel_modal"
            >
              <span>{{ $t("create") }}</span>
            </button>

            <CreateChat
              v-if="show_create_channel_modal"
              @close="show_create_channel_modal = false"
            />
          </template>
          <template v-else>
            <div>
              <button
                type="button"
                class="button-thin bg-bleumarine margin-left-none"
                @click="$root.showAuthorsListModal = true"
              >
                {{ $t("login_to_create_channel") }}
              </button>
            </div>
          </template>
        </div>

        <div class="m_actionbar">
          <div>
            <div class="m_actionbar--text">
              {{ $t("showing") }}
              <span
                :class="{
                  'c-bleumarine':
                    Object.keys(all_chats).length !==
                    Object.keys(filtered_chats).length,
                }"
              >
                {{ Object.keys(filtered_chats).length }}
                {{ $t("channels_of") }}
                {{ Object.keys(all_chats).length }}
              </span>
            </div>
          </div>

          <div class="m_displayMyContent" v-if="$root.current_author">
            <span>{{ $t("show") }}</span>
            <select v-model="show_only_content_i_can_access">
              <option :value="true">
                {{ $t("only_channels_i_participate_in").toLowerCase() }}
              </option>
              <option :value="false">
                {{ $t("all_channels").toLowerCase() }}
              </option>
            </select>
          </div>
        </div>

        <div class="m_chats--list">
          <ChatRow
            v-for="(chat, index) in pinned_chats"
            :key="'pinned_' + index"
            :chat="chat"
          />
          <ChatRow
            v-for="(chat, index) in non_pinned_chats"
            :key="'nonpinned_' + index"
            :chat="chat"
          />
        </div>
      </div>
    </div>

    <transition name="slideright" :duration="500">
      <Chat :chat="$root.current_chat" v-if="$root.current_chat" />
    </transition>
  </div>
</template>
<script>
import CreateChat from "./components/modals/CreateChat.vue";
import ChatRow from "./components/ChatRow.vue";
import Chat from "./components/Chat.vue";

export default {
  props: {
    read_only: Boolean,
    chats: Object,
  },
  components: {
    CreateChat,
    ChatRow,
    Chat,
  },
  data() {
    return {
      show_create_channel_modal: false,
      show_only_content_i_can_access: true,
      new_channel_name: "",
    };
  },
  created() {},
  mounted() {
    this.$socketio.listFolders({ type: "chats" });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    all_chats() {
      return Object.values(this.chats);
    },
    filtered_chats() {
      let chats = this.all_chats;
      if (this.show_only_content_i_can_access && this.$root.current_author)
        return chats.filter((r) =>
          this.$root.canSeeFolder({
            type: "chats",
            slugFolderName: r.slugFolderName,
          })
        );
      return chats;
    },
    pinned_chats() {
      if (this.filtered_chats.length === 0) return [];
      let pinned_chats = this.filtered_chats.filter((c) => c.pinned === true);
      pinned_chats = this.$_.sortBy(pinned_chats, (i) => i.name.toLowerCase());

      return pinned_chats;
    },
    non_pinned_chats() {
      if (this.filtered_chats.length === 0) return [];
      let non_pinned_chats = this.filtered_chats.filter(
        (c) => !c.pinned || c.pinned === false
      );
      non_pinned_chats = this.$_.sortBy(non_pinned_chats, "date_modified");
      non_pinned_chats = non_pinned_chats.reverse();

      return non_pinned_chats;
    },
  },
  methods: {},
};
</script>
<style lang="scss"></style>
