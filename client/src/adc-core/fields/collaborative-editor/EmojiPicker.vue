<template>
  <BaseModal2
    :title="$t('choose_emoji') || 'Choose emoji'"
    :size="'small'"
    @close="$emit('close')"
  >
    <Picker
      :data="emojiIndex"
      set="apple"
      :emoji-size="24"
      :per-line="8"
      :show-preview="true"
      :show-search="true"
      :i18n="emoji_i18n"
      :title="''"
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
  i18n: {
    messages: {
      en: {
        emoji_search: "Search emoji",
        emoji_not_found: "No emoji found",
        emoji_recent: "Recent",
        emoji_people: "People",
        emoji_nature: "Animals and nature",
        emoji_foods: "Foods and drinks",
        emoji_activity: "Activities",
        emoji_places: "Places and monuments",
        emoji_objects: "Objects",
        emoji_symbols: "Symbols and signs",
        emoji_flags: "Flags",
        emoji_custom: "Custom",
      },
      fr: {
        emoji_search: "Rechercher un emoji",
        emoji_not_found: "Aucun emoji trouvé",
        emoji_recent: "Récents",
        emoji_people: "Personnes",
        emoji_nature: "Animaux et nature",
        emoji_foods: "Aliments et boissons",
        emoji_activity: "Activités",
        emoji_places: "Lieux et monuments",
        emoji_objects: "Objets",
        emoji_symbols: "Symboles et signes",
        emoji_flags: "Drapeaux",
        emoji_custom: "Personnalisé",
      },
    },
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
    backgroundImageFn(set, sheetSize) {
      return ``;
      // return `${this.$root.publicPath}images/apple-12.0-sheets-256-64.png`;
    },
  },
};
</script>

<style lang="scss">
// Global styles for emoji picker
.emoji-mart {
  border: none;
  height: max(420px, 60vh);
  width: 100% !important;

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
