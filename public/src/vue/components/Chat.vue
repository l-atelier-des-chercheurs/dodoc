<template>
  <div class="m_chat" @click.self="$root.settings.current_chat.slug = false">
    <div class="m_chat--content">
      <div
        class="m_chat--content--name"
        :class="{ 'has--content_hidden_behind': !is_scrolled_to_top }"
      >
        {{ chat.name }}
        <button
          type="button"
          class="buttonLink bg-rouge"
          @click="$root.settings.current_chat.slug = false"
        >
          {{ $t("back") }}
        </button>
      </div>

      <div class="m_chat--content--discussion" ref="chat_content">
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
                  <span>{{ getMessageAuthor(message) }}</span>
                </div>
                <div class="m_message--meta--date">
                  <span>{{
                    $moment(message.date_created).format("HH:mm")
                  }}</span>
                  <button
                    type="button"
                    v-if="isCurrentAuthor(message)"
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
                index < item[1].length - 1
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
export default {
  props: {
    chat: Object,
  },
  components: {},
  data() {
    return {
      new_message: "",
      is_scrolled_to_bottom: false,
      is_scrolled_to_top: false,
      last_read_message_on_opening: false,
    };
  },
  created() {
    this.$socketio.listMedias({
      type: "chats",
      slugFolderName: this.chat.slugFolderName,
    });

    // this.$eventHub.$on("socketio.reconnect", this.reloadChat);
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
        this.$nextTick(() => {
          if (
            last_message_read_for_this_channel.msg !==
            this.sorted_messages[this.sorted_messages.length - 1].metaFileName
          ) {
            this.last_read_message_on_opening =
              last_message_read_for_this_channel.msg;

            this.$nextTick(() => {
              if (this.$refs.sinceLastVisit) {
                this.scrollToMessage(this.$refs.sinceLastVisit[0]);
                this.$refs.chat_content.style.scrollBehavior = "smooth";
              }
            });
          } else {
            this.scrollToBottom();
            this.$refs.chat_content.style.scrollBehavior = "smooth";
          }
        });
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
  beforeDestroy() {
    this.$eventHub.$off("socketio.reconnect", this.loadChat);
  },
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
      return this.$_.sortBy(this.chat.medias, "date_created");
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
    setReadMessageToLast() {
      // if logged in, set author last_messages_read_in_channels to metaFileName of chat
      if (this.$root.current_author && this.sorted_messages.length > 0) {
        const last_message_channel = {
          channel: this.chat.slugFolderName,
          msg: this.sorted_messages[this.sorted_messages.length - 1]
            .metaFileName,
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
          channel_info_in_author.msg === last_message_channel.msg
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
        (message.authors[0].name === this.$root.current_author.name ||
          message.authors[0].slugFolderName ===
            this.$root.current_author.slugFolderName)
      );
    },
    getMessageAuthor(message) {
      if (message.authors && message.authors.length > 0) {
        const first_author = message.authors[0];
        if (first_author.hasOwnProperty("slugFolderName"))
          return this.$root.getAuthor(first_author.slugFolderName).name;
        else return first_author.name;
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

      this.$root.createMedia({
        type: "chats",
        slugFolderName: this.chat.slugFolderName,
        additionalMeta: {
          text: this.new_message,
          authors: [
            { slugFolderName: this.$root.current_author.slugFolderName },
          ],
        },
      });

      this.new_message = "";
    },
  },
};
</script>
<style lang="scss"></style>
