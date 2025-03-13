<template>
  <BaseModal2 :title="$t('about_dodoc')" @close="$emit('close')">
    <div class="_creditsModal">
      <div class="u-spacingBottom">
        <DLabel :str="$t('version')" />
        {{ $root.app_infos.version }}
      </div>

      <div class="u-spacingBottom">
        <DLabel :str="$t('ui_lang_select')" />

        {{ $t("current_lang_name") }}
        <button
          type="button"
          class="u-button u-button_bleumarine u-button_small"
          :title="$t('ui_lang_select')"
          @click="show_lang_modal = !show_lang_modal"
        >
          {{ $t("change") }}
        </button>
      </div>
      <LangModal v-if="show_lang_modal" @close="show_lang_modal = false" />

      <p v-html="$t('about_dodoc_txt')" />
      <br />
      <p v-html="$t('about_dodoc_links')" />
      <br />
      <p v-html="$t('about_dodoc_contributors')" />
    </div>
  </BaseModal2>
</template>
<script>
import LangModal from "@/adc-core/lang/LangModal.vue";

export default {
  props: {},
  components: {
    LangModal,
  },
  data() {
    return {
      show_lang_modal: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    current_lang_code() {
      this.$i18n.availableLocales;
      return this.$i18n.locale;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._creditsModal {
  ::v-deep {
    li {
      margin-left: 1.5em;
    }
  }
}
</style>
