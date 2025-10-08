<template>
  <BaseModal2 :title="$t('about_dodoc')" @close="$emit('close')">
    <div class="_creditsModal">
      <div class="_versionChecker">
        <div class="u-spacingBottom">
          <DLabel :str="$t('version')" />
          {{ $root.app_infos.version }}
        </div>
        <LatestVersionChecker v-if="is_instance_admin" />
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
      <p>
        <small v-html="$t('about_dodoc_contributors')" />
      </p>
    </div>
  </BaseModal2>
</template>
<script>
import LangModal from "@/adc-core/lang/LangModal.vue";
import LatestVersionChecker from "@/adc-core/ui/LatestVersionChecker.vue";

export default {
  props: {},
  components: {
    LangModal,
    LatestVersionChecker,
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
  ._versionChecker {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;

    > * {
      &:first-child {
        flex: 0 0 33%;
      }

      &:last-child {
        flex: 0 0 66%;
      }
    }
  }
  ::v-deep {
    li {
      margin-left: 1.5em;
    }
  }
}
</style>
