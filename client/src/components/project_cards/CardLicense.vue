<template>
  <DetailsPane
    v-if="can_edit || has_items"
    :header="$t('authors_and_license')"
    :icon="'people'"
    :has_items="has_items"
  >
    <div class="u-spacingBottom" v-if="can_edit || project.authors_list">
      <TitleField
        :label="$t('authors')"
        :field_name="'authors_list'"
        :content="project.authors_list"
        :path="project.$path"
        :input_type="'editor'"
        :custom_formats="['bold', 'italic', 'link']"
        :can_edit="can_edit"
      />
    </div>

    <div class="">
      <EventField
        class="u-spacingBottom"
        v-if="$root.app_infos.instance_meta.enable_events"
        :project="project"
        :can_edit="can_edit"
      />

      <RemixField
        class="u-spacingBottom"
        :project="project"
        :can_edit="can_edit"
      />

      <!-- pour plus tard, voir https://github.com/l-atelier-des-chercheurs/dodoc/issues/513 -->
      <RadioCheckboxField
        v-if="can_edit || (!can_edit && project.license !== 'custom_license')"
        :label="$t('license')"
        :show_label="false"
        :instructions="$t('licence_instructions')"
        :field_name="'license'"
        :input_type="'radio'"
        :content="project.license"
        :path="project.$path"
        :can_edit="can_edit"
        :options="license_options"
      />
      <DLabel v-else :str="$t('license')" />
      <TitleField
        v-if="project.license === 'custom_license'"
        ref="custom_license_field"
        :label="$t('custom_license')"
        :show_label="can_edit"
        :field_name="'custom_license'"
        :content="project.custom_license || $t('fill_out_your_license')"
        :path="project.$path"
        :input_type="'editor'"
        :custom_formats="['bold', 'italic', 'link']"
        :can_edit="can_edit"
      />
    </div>
  </DetailsPane>
</template>
<script>
import EventField from "@/components/project/EventField.vue";
import RemixField from "@/components/project/RemixField.vue";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {
    EventField,
    RemixField,
  },
  data() {
    return {
      license_options: [
        {
          key: "",
          label: this.$t("not_specified"),
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
  watch: {
    "project.license": function (newVal) {
      if (newVal === "custom_license") {
        this.$nextTick(() => {
          this.$refs.custom_license_field.enableEditMode();
        });
      }
    },
  },
  computed: {
    has_items() {
      return !!(this.project.license || this.project.authors_list);
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
