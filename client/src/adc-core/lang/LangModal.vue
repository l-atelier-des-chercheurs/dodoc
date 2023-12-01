<template>
  <BaseModal2 :title="$t('ui_lang_select')" @close="$emit('close')">
    <div class="" :key="$i18n.locale">
      <SelectField
        :field_name="'status'"
        :content="current_lang"
        :can_edit="true"
        :options="lang_options"
        @update="updateLang"
      />
    </div>

    <div class="" v-if="is_instance_admin">
      <div class="u-spacingBottom" />
      <button
        type="button"
        class="u-buttonLink"
        @click="show_missing_translations = !show_missing_translations"
        :class="{
          'is--active': show_missing_translations,
        }"
      >
        <b-icon icon="flag-fill" />
        {{ $t("show_missing_translations") }}
      </button>
      <div class="_missingTranslations" v-if="show_missing_translations">
        <hr />
        <DLabel :str="$t('missing_translations')" />
        <SelectField2
          :value="lang_to_find_missing_str"
          :options="lang_options.filter((o) => o.key !== 'fr')"
          :can_edit="true"
          :hide_validation="true"
          @change="lang_to_find_missing_str = $event"
        />
        <div class="">
          {{ $t("to_translate:") }} {{ missing_translations.length }}
        </div>
        <div class="_allMissingTranslations">
          <div class="" v-for="t in missing_translations" :key="t.key">
            <div class="">
              <b>{{ t.key }}</b>
            </div>
            <div v-for="[lang, translation] in t.translations" :key="lang">
              <i>{{ lang.toUpperCase() }}</i>
              &nbsp;
              <b-icon icon="arrow-right" />
              &nbsp;
              {{ translation }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      current_lang: this.$i18n.locale,
      lang_options: [
        {
          key: "fr",
          text: "Français",
        },
        {
          key: "en",
          text: "English",
        },
        {
          key: "de",
          text: "Deutsch",
        },
        {
          key: "nl",
          text: "Nederlands",
        },
        {
          key: "oc",
          text: "Occitan",
        },
      ],

      translations: {},
      show_missing_translations: false,

      lang_to_find_missing_str: "en",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    show_missing_translations() {
      if (this.show_missing_translations) this.loadMissingTranslations();
    },
  },
  computed: {
    missing_translations() {
      if (!this.translations) return false;
      return Object.entries(this.translations).reduce((acc, [str, val]) => {
        debugger;
        if (
          !Object.prototype.hasOwnProperty.call(
            val,
            this.lang_to_find_missing_str
          )
        )
          acc.push({
            key: str,
            translations: Object.entries(val),
          });
        return acc;
      }, []);
    },
  },
  methods: {
    async updateLang(new_lang) {
      await this.$root.changeLocale(new_lang);
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("lang_updated"));
      this.$emit("close");
    },
    async loadMissingTranslations() {
      const translations = await this.$root.findMissingTranslations();
      this.translations = Object.assign({}, translations);
    },
  },
};
</script>
<style lang="scss" scoped>
._allMissingTranslations {
  border: 2px solid var(--c-gris);
  background: var(--c-gris_clair);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 2);

  > * {
    margin-bottom: calc(var(--spacing) / 1);
  }
}
</style>
