<template>
  <div class="_langSelector">
    <button
      v-for="lang_option in lang_options"
      type="button"
      class="u-button u-button_small"
      :class="{
        'is--active': lang_option.key === $i18n.locale,
      }"
      :key="lang_option.key"
      :lang="lang_option.key"
      :disabled="lang_option.disabled"
      @click="updateLang(lang_option.key)"
      v-text="lang_option.text"
    />
  </div>
</template>
<script>
// each language is written in its own language, so people can find theirs
export const lang_options = [
  {
    key: "fr",
    text: "Français",
  },
  {
    key: "en",
    text: "English",
  },
  {
    key: "it",
    text: "Italiano",
  },
  // {
  //   key: "fon",
  //   text: "Fon (in progress)",
  // },
];

export default {
  props: {},
  components: {},
  data() {
    return {
      lang_options,
    };
  },
  methods: {
    async updateLang(new_lang) {
      if (new_lang === this.$i18n.locale) return;
      await this.$root.changeLocale(new_lang);
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("lang_updated"));
      this.$emit("change", new_lang);
    },
  },
};
</script>
<style lang="scss" scoped>
._langSelector {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}
</style>
