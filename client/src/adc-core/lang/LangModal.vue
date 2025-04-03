<template>
  <BaseModal2 :title="$t('ui_lang_select')" @close="$emit('close')">
    <div class="_langSelect" :key="$i18n.locale">
      <select v-model="current_lang">
        <option
          v-for="lang_option in lang_options"
          :key="lang_option.key"
          :value="lang_option.key"
          v-text="lang_option.text"
          :disabled="lang_option.disabled"
        />
      </select>
    </div>

    <div class="">
      <div class="u-spacingBottom" />
      <div class="u-spacingBottom" />
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
        <div class="u-spacingBottom" />

        <!-- <DLabel :str="$t('missing_translations')" />
        <SelectField2
          :value="lang_to_find_missing_str"
          :options="lang_options.filter((o) => o.key !== 'fr')"
          :can_edit="true"
          :hide_validation="true"
          @change="lang_to_find_missing_str = $event"
        />

        <div class="u-spacingBottom" /> -->

        <DetailsPane
          :header="$t('already_translated_locally')"
          :icon="'info-square'"
          :is_open_initially="false"
          class="u-spacingBottom"
        >
          <div
            class="_translated"
            v-if="Object.keys(translations_to_share).length > 0"
          >
            <textarea disabled style="white-space: pre"
              >{{ translations_to_share }}
            </textarea>
            <div
              class="u-instructions"
              v-html="$t('publish_on_forum_to_add_to_contribute_to_code')"
            />
            <!-- <button
              type="button"
              class="u-buttonLink u-buttonLink_red"
              @click="confirm_erase_translations = !confirm_erase_translations"
            >
              <b-icon icon="trash" />
              {{ $t("erase_translations") }}
            </button>
            <button
              type="button"
              v-if="confirm_erase_translations"
              class=""
              @click="translations_to_share = {}"
            >
              <b-icon icon="trash" />
              {{ $t("erase_translations") }}
            </button> -->
            <RemoveMenu
              :button_text="$t('erase_translations')"
              @remove="translations_to_share = {}"
            />
          </div>
          <div v-else>
            {{ $t("nothing_to_show") }}
          </div>
        </DetailsPane>

        <DetailsPane
          :header="$t('to_translate')"
          :icon="'info-square'"
          :is_open_initially="true"
          class="u-spacingBottom"
        >
          <div class="">
            <b>{{ missing_translations.length }}</b>
          </div>
          <div class="">
            <span class="u-switch u-switch-xs">
              <input
                class="switch"
                :id="'hide_already_translated'"
                type="checkbox"
                v-model="hide_already_translated"
              />
              <label class="u-label" :for="'hide_already_translated'">{{
                $t("hide_already_translated")
              }}</label>
            </span>
          </div>

          <div class="_allMissingTranslations">
            <div class="" v-for="t in missing_translations" :key="t.key">
              <div class="">
                <b>{{ t.key }}</b>
                &nbsp;
                <button
                  type="button"
                  class="u-buttonLink"
                  :class="{
                    'is--active': isAlreadyTranslated(t.key),
                  }"
                  @click="translateStr(t.key)"
                >
                  <template v-if="isAlreadyTranslated(t.key)">
                    {{ $t("edit_translation") }}
                  </template>
                  <template v-else>
                    {{ $t("translate") }}
                  </template>
                </button>
              </div>
              <div v-if="isAlreadyTranslated(t.key)">
                <i>{{ lang_to_find_missing_str.toUpperCase() }}</i>
                &nbsp;
                <b-icon icon="arrow-right" />
                &nbsp;
                {{ isAlreadyTranslatedValue(t.key) }}
              </div>
              <div v-for="[lang, translation] in t.translations" :key="lang">
                <i>{{ lang.toUpperCase() }}</i>
                &nbsp;
                <b-icon icon="arrow-right" />
                &nbsp;
                {{ translation }}
              </div>
            </div>

            <BaseModal2
              v-if="will_translate_str"
              :title="$t('translate')"
              @close="will_translate_str = false"
            >
              <div class="u-spacingBottom">
                <!-- {{ $t("translate") }} ({{ lang_to_find_missing_str }}) = -->
                {{ will_translate_str }}
              </div>

              <div
                v-for="[lang, translation] in will_translate_str_translations"
                :key="lang"
              >
                <i>{{ lang.toUpperCase() }}</i>
                &nbsp;
                <b-icon icon="arrow-right" />
                &nbsp;
                {{ translation }}
              </div>

              <input
                type="text"
                class="u-spacingBottom"
                v-model.trim="new_translation_text"
                required
                autofocus="autofocus"
                @keydown.enter.prevent="submitTranslation"
              />
              <button
                slot="footer"
                type="button"
                class="u-button u-button_bleuvert"
                @click="submitTranslation"
              >
                {{ $t("submit") }}
              </button>
            </BaseModal2>
          </div>
        </DetailsPane>
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
          key: "it",
          text: "Italian",
        },
        // {
        //   key: "de",
        //   text: "Deutsch",
        //   disabled: true,
        // },
        // {
        //   key: "nl",
        //   text: "Nederlands",
        //   disabled: true,
        // },
        // {
        //   key: "oc",
        //   text: "Occitan",
        //   disabled: true,
        // },
      ],

      translations: {},
      show_missing_translations: false,

      lang_to_find_missing_str: "it",
      translations_to_share: {},
      hide_already_translated: true,

      new_translations: {},
      will_translate_str: undefined,
      new_translation_text: "",

      confirm_erase_translations: false,
    };
  },
  created() {
    const t = localStorage.getItem("translations_to_share");
    if (t) {
      try {
        this.translations_to_share = JSON.parse(t);
      } catch (e) {
        /**/
      }
    }
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    show_missing_translations() {
      if (this.show_missing_translations) this.loadMissingTranslations();
    },
    translations_to_share: {
      handler() {
        localStorage.setItem(
          "translations_to_share",
          JSON.stringify(this.translations_to_share)
        );
      },
      deep: true,
    },
    current_lang() {
      this.updateLang(this.current_lang);
    },
  },
  computed: {
    missing_translations() {
      if (!this.translations) return false;
      return Object.entries(this.translations).reduce((acc, [key, val]) => {
        if (
          !Object.prototype.hasOwnProperty.call(
            val,
            this.lang_to_find_missing_str
          )
        )
          if (!this.hide_already_translated || !this.isAlreadyTranslated(key))
            acc.push({
              key,
              translations: Object.entries(val),
            });
        return acc;
      }, []);
    },
    will_translate_str_translations() {
      const t = this.missing_translations.find(
        (t) => t.key === this.will_translate_str
      );
      return t?.translations;
    },
  },
  methods: {
    async updateLang(new_lang) {
      await this.$root.changeLocale(new_lang);
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("lang_updated"));
      // this.$emit("close");
    },
    async loadMissingTranslations() {
      const translations = await this.$root.findMissingTranslations();
      this.translations = Object.assign({}, translations);
    },
    translateStr(str) {
      this.will_translate_str = str;
      this.new_translation_text = this.isAlreadyTranslated(str)
        ? this.isAlreadyTranslatedValue(str)
        : "";
    },
    isAlreadyTranslated(key) {
      return !!this.isAlreadyTranslatedValue(key);
    },
    isAlreadyTranslatedValue(key) {
      return this.translations_to_share[this.lang_to_find_missing_str]?.[key];
    },
    submitTranslation() {
      if (
        !Object.prototype.hasOwnProperty.call(
          this.translations_to_share,
          this.lang_to_find_missing_str
        )
      )
        this.$set(
          this.translations_to_share,
          this.lang_to_find_missing_str,
          {}
        );

      this.$set(
        this.translations_to_share[this.lang_to_find_missing_str],
        this.will_translate_str,
        this.new_translation_text
      );

      this.will_translate_str = undefined;
    },
  },
};
</script>
<style lang="scss" scoped>
._langSelect {
  max-width: 35ch;
}

._allMissingTranslations {
  border: 2px solid var(--c-gris);
  background: var(--c-gris_clair);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 2) auto;
  max-height: 50vh;
  overflow: auto;

  > * {
    margin-bottom: calc(var(--spacing) / 1);
  }
}

._translated {
  max-height: 40vh;
  border: 1px solid black;
  padding: calc(var(--spacing) / 4);
  // background: var(--c-gris_clair);
  border-radius: 4px;
  margin: calc(var(--spacing) / 2) 0;

  > textarea {
    margin: 0;
    padding: calc(var(--spacing) / 1);
    min-height: 25vh;
    max-height: 35vh;
    overflow: auto;
  }
}
</style>
