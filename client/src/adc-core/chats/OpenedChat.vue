<template>
  <div class="_openedChat">
    <LoaderSpinner v-if="is_loading" />

    <div class="_openedChat--header">
      <h3>{{ chat.title }}</h3>
      <button
        type="button"
        class="u-button u-button_icon _closeBtn"
        @click="closeChat"
      >
        <b-icon icon="x-lg" :label="$t('close')" />
      </button>
    </div>

    {{ chat }}
  </div>
</template>
<script>
export default {
  props: {
    chat_slug: {
      type: String,
      required: true,
    },
  },
  components: {},
  data() {
    return {
      path: "/chats/" + this.chat_slug,
      chat: null,
      is_loading: true,
    };
  },
  created() {},
  async mounted() {
    await this.loadChat();
    this.is_loading = false;
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async loadChat() {
      const chat = await this.$api.getFolder({ path: this.path });
      this.chat = chat;
    },
    closeChat() {
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._openedChat {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  // background-color: #fff;
  background: var(--c-rouge);
  padding: var(--spacing);
}

._openedChat--header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

._closeBtn {
  // position: absolute;
  // top: calc(var(--spacing) / 2);
  // right: calc(var(--spacing) / 2);
  // z-index: 1000;
}
</style>
