<template>
  <DetailsPane
    :header="$t('authors_and_license')"
    :icon="'people'"
    :has_items="!!project.license"
    :is_open_initially="true"
    :can_be_toggled="false"
  >
    <div class="u-spacingBottom">
      <CollaborativeEditor2
        :label="$t('authors')"
        :field_to_edit="'authors_list'"
        :content="project.authors_list"
        :path="project.$path"
        :custom_formats="['bold', 'italic', 'link']"
        :is_collaborative="false"
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
        :instructions="$t('licence_instructions')"
        :field_name="'license'"
        :input_type="'radio'"
        :content="project.license"
        :path="project.$path"
        :can_edit="can_edit"
        :options="license_options"
      />
      <CollaborativeEditor2
        v-if="project.license === 'custom_license'"
        :label="can_edit ? $t('custom_license') : undefined"
        :field_to_edit="'custom_license'"
        :content="project.custom_license || $t('fill_out_your_license')"
        :path="project.$path"
        :custom_formats="['bold', 'italic', 'link']"
        :is_collaborative="false"
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
