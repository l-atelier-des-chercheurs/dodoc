<template>
  <div class="m_chat" @click.self="$root.settings.current_chat.slug = false">
    <div class="m_chat--content">
      <div class="m_chat--content--name">
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
          <h3 class="label c-noir margin-small">
            {{ $root.formatDateToHuman(item[0]) }}
          </h3>
          <div
            v-for="message in item[1]"
            :key="message.metaFileName"
            class="m_message"
            :class="{
              'is--currentauthor':
                Array.isArray(message.authors) &&
                message.authors[0].name === $root.settings.current_author.name
            }"
          >
            <div class="m_message--meta" v-if="message.authors">
              <div class="m_message--meta--author">
                <span>{{ message.authors[0].name }}</span>
              </div>
              <div class="m_message--meta--date">
                {{ $moment(message.date_created).format("HH:mm") }}
              </div>
            </div>

            <div class="m_message--text">{{ message.text }}</div>
          </div>
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

      <div class="m_chat--content--post">
        <template v-if="$root.settings.current_author.hasOwnProperty('name')">
          <label>Envoyer un message</label>
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
              Identifiez-vous pour poster
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
    chat: Object
  },
  components: {},
  data() {
    return {
      new_message: "",
      is_scrolled_to_bottom: true
    };
  },
  created() {
    this.$socketio.listFolder({
      type: "chats",
      slugFolderName: this.chat.slugFolderName
    });
    this.$socketio.listMedias({
      type: "chats",
      slugFolderName: this.chat.slugFolderName
    });
    this.$eventHub.$once("socketio.chats.listMedias", () => {
      this.$nextTick(() => {
        this.scrollToBottom();
        this.$refs.chat_content.style.scrollBehavior = "smooth";
      });
    });
  },
  mounted() {
    setInterval(() => {
      if (
        this.$refs.chat_content &&
        this.$refs.chat_content.scrollTop +
          this.$refs.chat_content.offsetHeight +
          30 >=
          this.$refs.chat_content.scrollHeight
      )
        this.is_scrolled_to_bottom = true;
      else this.is_scrolled_to_bottom = false;
    }, 500);

    setTimeout(() => {}, 500);
  },
  beforeDestroy() {},
  watch: {
    grouped_messages() {
      if (this.is_scrolled_to_bottom) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    }
  },
  computed: {
    sorted_messages: function() {
      if (typeof this.chat.medias !== "object") return [];
      return this.$_.sortBy(this.chat.medias, "date_created");
    },
    grouped_messages: function() {
      let message_group = this.$_.groupBy(this.sorted_messages, message => {
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
    }
  },
  methods: {
    scrollToBottom() {
      this.$refs.chat_content.scrollTop = this.$refs.chat_content.scrollHeight;
      // this.is_scrolled_to_bottom = true;
    },
    postNewMessage() {
      if (!this.$root.settings.current_author.hasOwnProperty("name")) {
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
          authors: [{ name: this.$root.settings.current_author.name }]
        }
      });

      this.new_message = "";
    }
  }
};
</script>
<style lang="scss"></style>
