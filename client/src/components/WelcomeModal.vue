<template>
  <BaseModal2
    :title="$root.app_infos.instance_meta.name || $t('home')"
    @close="$emit('close')"
  >
    <MarkdownField :text="presentation" />
    <br />
    <p>
      <DLabel :str="$t('contactmail_of_instance')" />
      <a
        :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
        target="_blank"
      >
        {{ $root.app_infos.instance_meta.contactmail }}
      </a>
    </p>

    <br />

    <button
      type="button"
      class="u-button"
      @click="show_lang_modal = !show_lang_modal"
    >
      {{ current_lang_code }}
    </button>
    <LangModal v-if="show_lang_modal" @close="show_lang_modal = false" />
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
    return { show_lang_modal: false };
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
    presentation() {
      return this.$root.app_infos.instance_meta.presentation;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
