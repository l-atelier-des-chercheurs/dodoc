<template>
  <BaseModal2 :title="$t('ui_lang_select')" @close="$emit('close')">
    <div class="">
      <SelectField
        :field_name="'status'"
        :content="current_lang"
        :can_edit="true"
        :options="lang_options"
        @update="updateLang"
      />
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      current_lang: "fr",
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
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    updateLang(new_lang) {
      this.$i18n.locale = new_lang;
    },
  },
};
</script>
<style lang="scss" scoped></style>
