export default {
  data() {
    return {};
  },
  computed: {
    author_chat_read_index_media() {
      if (!this.connected_as?.$files) return null;
      const chat_read_index = this.connected_as.$files.find((f) =>
        f.$path.includes("chat-read-index")
      );
      return chat_read_index;
    },
    author_chat_read_index() {
      return this.author_chat_read_index_media?.chat_read_indexes || {};
    },
  },
  methods: {
    async updateAuthorLastReadMessage({ chat_path, chat_read_index }) {
      if (!this.connected_as?.$path) return;

      try {
        if (!this.author_chat_read_index_media) {
          const additional_meta = {
            chat_read_indexes: {
              [chat_path]: chat_read_index,
            },
            requested_slug: "chat-read-index",
          };
          const { meta_filename } = await this.$api.uploadFile({
            path: this.connected_as.$path,
            additional_meta,
          });
        } else {
          const index = this.getIndexFromChatPath(chat_path);

          if (!index || index < chat_read_index) {
            await this.updateIndex(chat_path, chat_read_index);
          }
        }
      } catch (err) {
        console.error("Failed to update chat read index:", err);
      }
    },

    getIndexFromChatPath(chat_path) {
      return this.author_chat_read_index?.[chat_path] || 0;
    },

    async updateIndex(chat_path, chat_read_index) {
      if (!this.author_chat_read_index_media) return;

      const chat_read_indexes = JSON.parse(
        JSON.stringify(this.author_chat_read_index)
      );
      chat_read_indexes[chat_path] = chat_read_index;

      const { meta_filename } = await this.$api.updateMeta({
        path: this.author_chat_read_index_media.$path,
        new_meta: {
          chat_read_indexes,
        },
      });
    },

    // async getAuthorLastReadMessage() {
    //   if (!this.connected_as?.$path || !this.authorReadIndex) return null;

    //   try {
    //     const readIndex = await this.$api.getMeta({
    //       path: `${this.connected_as.$path}/${this.authorReadIndex}`,
    //     });
    //     return readIndex;
    //   } catch (err) {
    //     console.error("Failed to get chat read index:", err);
    //     return null;
    //   }
    // },
  },
};
