<template>
  <DetailsPane
    :header="$t('authors_and_license')"
    :icon="'people'"
    :has_items="!!project.license"
  >
    <div class="u-spacingBottom">
      <TitleField
        :label="$t('authors')"
        :field_name="'authors_list'"
        :content="project.authors_list"
        :input_type="'markdown'"
        :path="project.$path"
        :can_edit="can_edit"
      />
    </div>

    <div class="">
      <DLabel
        :str="$t('license')"
        :instructions="can_edit ? $t('licence_instructions') : ''"
      />
      <!-- pour plus tard, voir https://github.com/l-atelier-des-chercheurs/dodoc/issues/513 -->
      <RadioCheckboxField
        v-if="can_edit || (!can_edit && project.license !== 'custom_license')"
        :field_name="'license'"
        :input_type="'radio'"
        :content="project.license"
        :path="project.$path"
        :can_edit="can_edit"
        :options="license_options"
      />

      <TitleField
        v-if="project.license === 'custom_license'"
        :label="can_edit ? $t('custom_license') : undefined"
        :field_name="'custom_license'"
        :content="project.custom_license || $t('fill_out_your_license')"
        :input_type="'markdown'"
        :path="project.$path"
        :can_edit="can_edit"
      />
    </div>
  </DetailsPane>
</template>
<script>
export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      license_options: [
        {
          key: "",
          label: this.$t("none_f"),
        },
        {
          key: "creativecommons_by_sa",
          label: this.$t("creativecommons_by_sa"),
          instructions: this.$t("creativecommons_by_sa_explanations"),
        },
        {
          key: "all_rights_reserved",
          label: this.$t("all_rights_reserved"),
        },
        {
          key: "copyleft",
          label: this.$t("copyleft"),
          instructions: this.$t("copyleft_explanations"),
        },
        {
          key: "custom_license",
          label: this.$t("custom_license"),
        },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
