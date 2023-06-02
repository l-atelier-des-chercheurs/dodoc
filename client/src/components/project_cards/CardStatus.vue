<template>
  <DetailsPane :header="$t('visibility')" :icon="'globe'">
    <div>
      {{ $t("visibility_text") }}
    </div>

    <br />

    <div class="">
      <DLabel :str="$t('status')" />
      <SelectField
        :field_name="'$status'"
        :content="project.$status"
        :path="project.$path"
        :can_edit="can_edit"
        :options="status_options"
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
      status_options: [
        {
          key: "draft",
          text: this.$t("draft"),
          instruction: this.$t("draft_status_explanations"),
        },
        {
          key: "finished",
          text: this.$t("finished"),
          instruction: this.$t("finished_status_explanations"),
        },
        {
          key: "private",
          text: this.$t("private"),
          instruction: this.$t("private_status_explanations_projects"),
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
