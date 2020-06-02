<template>
  <div class="m_chat" @click.self="$root.closeChat()">
    <div class="m_chat--content">
      <div
        class="m_chat--content--topbar"
        :class="{ 'has--content_hidden_behind': !is_scrolled_to_top }"
      >
        <div class="m_chat--content--topbar--firstLine">
          <button
            type="button"
            class="m_chat--content--topbar--backbutton"
            @click="$root.closeChat()"
            :content="$t('close')"
            v-tippy="{
              placement: 'bottom',
              delay: [600, 0],
            }"
          >
            ‹
          </button>

          <span class="m_chat--content--topbar--name"
            >{{ chat.name }}
            <ProtectedLock
              :editing_limited_to="chat.editing_limited_to"
              :is_protected="false"
            />
          </span>

          <div class="m_chat--content--topbar--options">
            <button
              type="button"
              class="buttonLink"
              :class="{ 'is--active': show_chat_options }"
              @click="show_chat_options = !show_chat_options"
            >
              <svg
                version="1.1"
                class="inline-svg"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width="77.6px"
                height="85.4px"
                viewBox="0 0 77.6 85.4"
                style="enable-background: new 0 0 77.6 85.4;"
                xml:space="preserve"
              >
                <defs />
                <g>
                  <path
                    d="M73.9,39h-7.6c-1.6-5.6-6.7-9.7-12.7-9.7S42.5,33.5,40.8,39H3.7c-2,0-3.7,1.6-3.7,3.7c0,2,1.6,3.7,3.7,3.7h37.1
		c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h7.6c2,0,3.7-1.6,3.7-3.7C77.6,40.7,76,39,73.9,39z M53.6,48.7c-3.2,0-6-2.6-6-6
		s2.6-6,6-6s6,2.6,6,6S56.8,48.7,53.6,48.7z"
                  />
                  <path
                    d="M3.7,17.1h7.9c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h36.9c2,0,3.7-1.6,3.7-3.7S76,9.7,73.9,9.7H37
		C35.4,4.1,30.3,0,24.3,0S13.2,4.1,11.6,9.7H3.7c-2,0-3.7,1.6-3.7,3.7S1.6,17.1,3.7,17.1z M24.3,7.4c3.2,0,6,2.6,6,6s-2.6,6-6,6
		s-6-2.8-6-6S21.1,7.4,24.3,7.4z"
                  />
                  <path
                    d="M73.9,68.3H37c-1.6-5.6-6.7-9.7-12.7-9.7s-11.1,4.1-12.7,9.7H3.7c-2,0-3.7,1.6-3.7,3.7s1.6,3.7,3.7,3.7h7.9
		c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h36.9c2,0,3.7-1.6,3.7-3.7S76,68.3,73.9,68.3z M24.3,78c-3.2,0-6-2.6-6-6s2.6-6,6-6
		s6,2.6,6,6S27.5,78,24.3,78z"
                  />
                </g>
              </svg>

              {{ $t("advanced_options") }}
            </button>
          </div>
        </div>
        <ClientsCheckingOut
          :type="'chats'"
          :slugFolderName="chat.slugFolderName"
        />

        <div
          class="m_chat--content--topbar--optionbar"
          v-if="show_chat_options"
        >
          <div>
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
                      $root.current_author.slugFolderName ===
                        author.slugFolderName,
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
              @closeFolder="$root.closeChat()"
            />
          </div>

          <button
            type="button"
            class="buttonLink"
            @click="show_edit_chat = true"
          >
            {{ $t("edit") }}
          </button>
          <button type="button" class="buttonLink" @click="removeChat()">
            {{ $t("remove") }}
          </button>
        </div>
      </div>

      <EditChat
        v-if="show_edit_chat"
        :chat="chat"
        @close="show_edit_chat = false"
      />

      <div class="m_chat--content--discussion" ref="chat_content">
        <small class="_no_message_message" v-if="sorted_messages.length === 0">
          {{ $t("no_message_yet") }}
        </small>
        <button
          type="button"
          class="_button_showOlderMessages"
          v-if="first_message_index_to_show"
          @click="
            first_message_index_to_show = 0;
            is_scrolled_to_bottom = false;
          "
        >
          <span>{{ $t("show_older_messages") }}</span>
        </button>

        <div v-for="item in grouped_messages" :key="item[0]">
          <h3 class="label c-noir margin-small text-centered">
            {{ $root.formatDateToHuman(item[0]) }}
          </h3>
          <template v-for="(message, index) in item[1]">
            <div
              :key="message.metaFileName"
              class="m_message"
              :class="{
                'is--currentauthor': isCurrentAuthor(message),
                'is--lastReadMessage':
                  message.metaFileName === last_read_message_on_opening,
              }"
            >
              <div class="m_message--meta" v-if="message.authors">
                <div
                  class="m_message--meta--author"
                  v-if="getMessageAuthor(message)"
                >
                  <span>
                    <img
                      class="_pp"
                      v-if="urlToPortrait(getMessageAuthor(message))"
                      :src="urlToPortrait(getMessageAuthor(message))"
                    />
                    <span v-else class="_no_pp"> </span>
                    {{ getMessageAuthor(message).name }}</span
                  >
                </div>
                <div class="m_message--meta--date">
                  <span>{{
                    $moment(message.date_created).format("HH:mm")
                  }}</span>
                  <button
                    type="button"
                    v-if="
                      isCurrentAuthor(message) || $root.current_author_is_admin
                    "
                    class="button-nostyle padding-top-verysmall"
                    @click="removeMessage(message)"
                  >
                    <svg
                      version="1.1"
                      class="inline-svg"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      x="0px"
                      y="0px"
                      width="91.6px"
                      height="95px"
                      viewBox="0 0 91.6 95"
                      style="enable-background: new 0 0 91.6 95;"
                      xml:space="preserve"
                    >
                      <path
                        class="st0"
                        d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="m_message--text">{{ message.text }}</div>
            </div>
            <div
              v-if="
                message.metaFileName === last_read_message_on_opening &&
                index < item[1].length - 0
              "
              class="m_sinceLastVisit"
              ref="sinceLastVisit"
              :key="'unread-notif_' + message.metaFileName"
            >
              <span>{{ $t("last_read_message") }}</span>
            </div>
          </template>
        </div>
      </div>

      <transition name="fade_fast" :duration="400">
        <div
          class="m_chat--content--scrollToBottom"
          v-if="!is_scrolled_to_bottom"
        >
          <button type="button" @click="scrollToBottom()">
            <img src="/images/i_arrow_right.svg" draggable="false" />
          </button>
        </div>
      </transition>

      <div
        class="m_chat--content--post"
        :class="{ 'has--hidden_content_above': !is_scrolled_to_bottom }"
      >
        <template v-if="$root.current_author">
          <label>{{ $t("post_a_message") }}</label>
          <form @submit.prevent="postNewMessage()" class="input-group">
            <input type="text" v-model.trim="new_message" required autofocus />
            <button
              type="submit"
              :disabled="!new_message"
              v-html="$t('send')"
              class="bg-rouge"
            />
          </form>
        </template>
        <template v-else>
          <div>
            <button
              type="button"
              class="button-thin bg-bleumarine"
              @click="$root.showAuthorsListModal = true"
            >
              {{ $t("login_to_post") }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import ProtectedLock from "./subcomponents/ProtectedLock.vue";
import AccessController from "./subcomponents/AccessController.vue";
import EditChat from "./modals/EditChat.vue";
import ClientsCheckingOut from "./subcomponents/ClientsCheckingOut.vue";

export default {
  props: {
    chat: Object,
  },
  components: {
    ProtectedLock,
    AccessController,
    EditChat,
    ClientsCheckingOut,
  },
  data() {
    return {
      new_message: "",
      is_scrolled_to_bottom: false,
      is_scrolled_to_top: false,
      last_read_message_on_opening: false,

      show_chat_options: false,
      show_edit_chat: false,

      first_message_index_to_show: false,
    };
  },
  created() {
    this.$socketio.listMedias({
      type: "chats",
      slugFolderName: this.chat.slugFolderName,
    });
  },
  mounted() {
    this.$eventHub.$once("socketio.chats.listMedias", () => {
      const last_messages_read_in_channels = this.$root.current_author
        .last_messages_read_in_channels;

      if (
        last_messages_read_in_channels &&
        last_messages_read_in_channels.some(
          (c) => c.channel === this.chat.slugFolderName
        )
      ) {
        const last_message_read_for_this_channel = last_messages_read_in_channels.find(
          (c) => c.channel === this.chat.slugFolderName
        );

        // check if some unread messages
        this.last_read_message_on_opening =
          last_message_read_for_this_channel.msg;

        this.setFirstMessageIndexToShow(last_message_read_for_this_channel.msg);

        this.$nextTick(() => {
          if (
            last_message_read_for_this_channel.msg !==
            this.sorted_messages[this.sorted_messages.length - 1].metaFileName
          ) {
            if (this.$refs.sinceLastVisit) {
              this.scrollToMessage(this.$refs.sinceLastVisit[0]);
              this.$refs.chat_content.style.scrollBehavior = "smooth";
            }
          } else {
            this.scrollToBottom();
            this.$refs.chat_content.style.scrollBehavior = "smooth";
          }
        });
        // });
      }
    });

    setInterval(() => {
      if (!this.$refs.chat_content) return;

      if (
        this.$refs.chat_content.scrollTop === 0 &&
        this.$refs.chat_content.offsetHeight >
          this.$refs.chat_content.scrollHeight
      ) {
        this.is_scrolled_to_top = true;
        this.is_scrolled_to_bottom = false;
        return;
      } else {
        this.is_scrolled_to_top = false;
      }

      if (
        this.$refs.chat_content.scrollTop +
          this.$refs.chat_content.offsetHeight +
          30 >=
        this.$refs.chat_content.scrollHeight
      ) {
        this.is_scrolled_to_bottom = true;
        this.setReadMessageToLast();
      } else this.is_scrolled_to_bottom = false;
    }, 1000);
  },
  beforeDestroy() {},
  watch: {
    grouped_messages() {
      if (this.is_scrolled_to_bottom) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
  },
  computed: {
    sorted_messages: function () {
      if (typeof this.chat.medias !== "object") return [];
      let _sorted_messages = this.$_.sortBy(this.chat.medias, "date_created");

      if (this.first_message_index_to_show)
        return _sorted_messages.slice(this.first_message_index_to_show);

      return _sorted_messages;
    },
    grouped_messages: function () {
      let message_group = this.$_.groupBy(this.sorted_messages, (message) => {
        let _date;

        if (
          message.hasOwnProperty("date_created") &&
          !!message["date_created"]
        ) {
          _date = message["date_created"];
        } else {
          return this.$t("invalid_date");
        }

        var dateMoment = this.$moment(_date);
        return dateMoment.format("YYYY-MM-DD");
      });
      message_group = this.$_.pairs(message_group);
      message_group = this.$_.sortBy(message_group);
      // message_group = message_group.reverse();
      return message_group;
    },
  },
  methods: {
    scrollToBottom() {
      if (this.$root.state.dev_mode === "debug")
        console.log("METHODS • Chat: scrollToBottom");
      this.$refs.chat_content.scrollTop = this.$refs.chat_content.scrollHeight;
    },
    scrollToMessage($el) {
      if (this.$root.state.dev_mode === "debug")
        console.log("METHODS • Chat: scrollToMessage");
      this.$refs.chat_content.scrollTop = $el.offsetTop - 100;
    },
    setFirstMessageIndexToShow(last_message_read) {
      if (!this.last_read_message_on_opening || !last_message_read)
        return false;
      if (this.sorted_messages < 10) this.first_message_index_to_show = 0;

      const last_message_read_index = this.sorted_messages.findIndex(
        (m) => m.metaFileName === this.last_read_message_on_opening
      );

      this.first_message_index_to_show = Math.max(
        0,
        last_message_read_index - 10
      );
    },

    setReadMessageToLast() {
      // if logged in, set author last_messages_read_in_channels to metaFileName of chat
      if (this.$root.current_author && this.sorted_messages.length > 0) {
        const last_message_channel = {
          channel: this.chat.slugFolderName,
          msg: this.sorted_messages[this.sorted_messages.length - 1]
            .metaFileName,
          index: this.chat.number_of_medias,
        };

        let last_messages_read_in_channels = Array.isArray(
          this.$root.current_author.last_messages_read_in_channels
        )
          ? JSON.parse(
              JSON.stringify(
                this.$root.current_author.last_messages_read_in_channels
              )
            )
          : [];

        const channel_info_in_author = last_messages_read_in_channels.find(
          (c) => c.channel === last_message_channel.channel
        );
        if (
          channel_info_in_author &&
          channel_info_in_author.msg === last_message_channel.msg &&
          Number(channel_info_in_author.index) ===
            Number(last_message_channel.index)
        ) {
          // already up to date, do nothing
          return;
        }

        // remove existing prop
        last_messages_read_in_channels = last_messages_read_in_channels.filter(
          (c) => c.channel !== last_message_channel.channel
        );

        last_messages_read_in_channels.push(last_message_channel);

        this.$root.editFolder({
          type: "authors",
          slugFolderName: this.$root.current_author.slugFolderName,
          data: {
            last_messages_read_in_channels,
          },
        });
      }
    },
    isCurrentAuthor(message) {
      return (
        Array.isArray(message.authors) &&
        this.$root.current_author &&
        (message.authors[0].name === this.$root.current_author.name ||
          message.authors[0].slugFolderName ===
            this.$root.current_author.slugFolderName)
      );
    },
    getMessageAuthor(message) {
      if (message.authors && message.authors.length > 0) {
        const first_author = message.authors[0];
        if (
          first_author.hasOwnProperty("slugFolderName") &&
          this.$root.getAuthor(first_author.slugFolderName)
        )
          return this.$root.getAuthor(first_author.slugFolderName);
        else if (first_author.hasOwnProperty("name")) return first_author;
      }
      return false;
    },
    urlToPortrait(author) {
      if (!author || !author.preview) return false;
      let pathToSmallestThumb = author.preview.find((m) => m.size === 50);
      if (pathToSmallestThumb && pathToSmallestThumb.path) {
        pathToSmallestThumb = pathToSmallestThumb.path;
        return pathToSmallestThumb;
      }
      return false;
    },
    removeMessage(message) {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • Chat: removeMedia");
      }

      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sure_to_remove_message"),
          () => {
            this.$root.removeMedia({
              type: "chats",
              slugFolderName: this.chat.slugFolderName,
              slugMediaName: message.metaFileName,
            });
          },
          () => {}
        );
    },
    postNewMessage() {
      if (!this.$root.current_author) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.need_to_be_author_to_post"));
        return false;
      }

      this.$root
        .createMedia({
          type: "chats",
          slugFolderName: this.chat.slugFolderName,
          additionalMeta: {
            text: this.new_message,
            authors: [
              { slugFolderName: this.$root.current_author.slugFolderName },
            ],
          },
        })
        .then((mdata) => {
          this.$nextTick(() => {
            this.setReadMessageToLast();
          });
        });

      this.new_message = "";
    },
    removeChat() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sure_to_remove_chat"),
          () => {
            this.$root.removeFolder({
              type: "chats",
              slugFolderName: this.chat.slugFolderName,
            });
            this.$root.closeChat();
          },
          () => {}
        );
    },
  },
};
</script>
<style lang="scss"></style>
