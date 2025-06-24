<template>
  <BaseModal2
    :title="$t('choose_emoji') || 'Choose emoji'"
    @close="$emit('close')"
  >
    <Picker
      :data="emojiIndex"
      set="twitter"
      :native="false"
      :emoji-size="24"
      :per-line="8"
      :show-preview="true"
      :show-search="true"
      @select="onEmojiSelect"
    />
  </BaseModal2>
</template>

<script>
// Import emoji data and components only when this component is loaded
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast";

// Create emoji index
const emojiIndex = new EmojiIndex(data);

export default {
  name: "EmojiPicker",
  components: {
    Picker,
  },
  data() {
    return {
      emojiIndex,
    };
  },
  methods: {
    onEmojiSelect(emoji) {
      this.$emit("select", emoji);
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss">
// Global styles for emoji picker
.emoji-mart {
  border: none;

  .emoji-mart-bar {
    border-color: var(--c-gris);
  }

  .emoji-mart-search input {
    border-color: var(--c-gris);
    border-radius: var(--input-border-radius);

    &:focus {
      border-color: var(--active-color);
      outline: none;
    }
  }

  .emoji-mart-category-label span {
    background: var(--c-gris_clair);
    color: var(--c-noir);
    border-radius: var(--input-border-radius);
  }
}
</style>
