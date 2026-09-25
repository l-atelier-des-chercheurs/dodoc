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
        :custom_formats="['bold', 'italic', 'link', 'emoji']"
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
        :label="$t('license')"
        :show_label="true"
        :instructions="$t('licence_instructions')"
        :field_name="'license'"
        :input_type="'radio'"
        :content="effective_license"
        :path="project.$path"
        :can_edit="can_edit"
        :options="license_options"
        allow_custom_option="html"
        :custom_option_label="$t('custom_license')"
        :custom_option_placeholder="$t('fill_out_your_license')"
        :custom_option_formats="['bold', 'italic', 'link', 'emoji']"
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
          label: this.$t("not_specified_f"),
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
      ],
    };
  },
  created() {
    this.migrateCustomLicenseIfNeeded();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    effective_license() {
      if (
        this.project.license === "custom_license" &&
        this.project.custom_license
      ) {
        return this.project.custom_license;
      }
      return this.project.license || "";
    },
    has_items() {
      return !!(
        this.project.license ||
        this.project.authors_list ||
        this.project.$can_be_remixed
      );
    },
  },
  methods: {
    async migrateCustomLicenseIfNeeded() {
      if (
        !this.project.custom_license ||
        this.project.license !== "custom_license"
      )
        return;
      try {
        await this.$api.updateMeta({
          path: this.project.$path,
          new_meta: {
            license: this.project.custom_license,
            custom_license: "",
          },
        });
        this.project.license = this.project.custom_license;
        this.project.custom_license = "";
      } catch (e) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("couldntbesaved"));
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
