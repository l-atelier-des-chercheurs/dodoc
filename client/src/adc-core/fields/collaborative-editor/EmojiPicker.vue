<template>
  <BaseModal2
    :title="$t('choose_emoji') || 'Choose emoji'"
    :size="'small'"
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
      :i18n="emoji_i18n"
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
      emoji_i18n: {
        search: this.$t("emoji_search"),
        notfound: this.$t("emoji_not_found"),
        categories: {
          search: this.$t("emoji_not_found"),
          recent: this.$t("emoji_recent"),
          people: this.$t("emoji_people"),
          nature: this.$t("emoji_nature"),
          foods: this.$t("emoji_foods"),
          activity: this.$t("emoji_activity"),
          places: this.$t("emoji_places"),
          objects: this.$t("emoji_objects"),
          symbols: this.$t("emoji_symbols"),
          flags: this.$t("emoji_flags"),
          custom: this.$t("emoji_custom"),
        },
      },
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
