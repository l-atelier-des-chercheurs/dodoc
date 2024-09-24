<template>
  <BaseModal2
    :title="$root.app_infos.instance_meta.name || $t('home')"
    @close="$emit('close')"
  >
    <div class="u-spacingBottom">
      <CollaborativeEditor2
        :content="
          $i18n.locale === 'fr'
            ? $root.app_infos.instance_meta.presentation_of_instance_fr
            : $root.app_infos.instance_meta.presentation_of_instance_en
        "
        :can_edit="false"
      />
    </div>

    <div class="u-spacingBottom">
      <p>
        <DLabel :str="$t('contactmail_of_instance')" />
        <a
          :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
          target="_blank"
        >
          {{ $root.app_infos.instance_meta.contactmail }}
        </a>
      </p>
    </div>

    <div class="u-spacingBottom">
      <DLabel :str="$t('ui_lang_select')" />
      <button
        type="button"
        class="u-button u-button_small"
        @click="show_lang_modal = !show_lang_modal"
      >
        {{ current_lang_code }}
      </button>
      <LangModal v-if="show_lang_modal" @close="show_lang_modal = false" />
    </div>

    <div class="_openBtn">
      <button
        type="button"
        class="u-button u-button_bleuvert"
        @click="$emit('close')"
      >
        {{ $t("open_app") }}
      </button>

      <br />

      <ToggleInput
        :content.sync="dont_show_window_again"
        :label="$t('do_not_show_window_again')"
      />
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
      dont_show_window_again:
        localStorage.getItem("dont_show_window_again") === "true",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    if (this.dont_show_window_again === true)
      localStorage.setItem("dont_show_window_again", "true");
    else localStorage.setItem("dont_show_window_again", "");
  },
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
._openBtn {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}
</style>
