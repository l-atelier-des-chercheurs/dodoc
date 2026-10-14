// shared by all components using this mixin: while the chat-read-index file
// is being created (and until it shows up in connected_as.$files), other calls
// must update that file instead of creating a second one
let pending_creation = null;

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
      // we use a file with chat_read_indexes so that only the user gets
      // real time updates on the read index, and if the author is private, nobody will be able to see this information
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
          const author_path = this.connected_as.$path;

          if (pending_creation?.author_path === author_path) {
            pending_creation.chat_read_indexes[chat_path] = chat_read_index;
            const path_to_meta = await pending_creation.promise;
            await this.$api.updateMeta({
              path: path_to_meta,
              new_meta: {
                chat_read_indexes: pending_creation.chat_read_indexes,
              },
            });
            return;
          }

          const chat_read_indexes = { [chat_path]: chat_read_index };
          pending_creation = {
            author_path,
            chat_read_indexes,
            promise: this.$api
              .uploadFile({
                path: author_path,
                additional_meta: {
                  chat_read_indexes: { ...chat_read_indexes },
                  requested_slug: "chat-read-index",
                },
              })
              .then(({ meta_filename }) => author_path + "/" + meta_filename),
          };
          await pending_creation.promise.catch((err) => {
            pending_creation = null;
            throw err;
          });
        } else {
          // the index can also go down when messages are removed: otherwise
          // the next messages would stay hidden until the count catches up
          const index = this.getIndexFromChatPath(chat_path);
          if (index !== chat_read_index)
            await this.updateIndex(chat_path, chat_read_index);
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

      // update locally right away, so badges don't briefly count
      // a message that was just read while the request is pending
      this.$set(
        this.author_chat_read_index_media,
        "chat_read_indexes",
        chat_read_indexes
      );

      await this.$api.updateMeta({
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
