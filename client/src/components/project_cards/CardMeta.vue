<template>
  <ProjectCard>
    <div slot="header">
      {{ $t("informations") }}
    </div>
    <DateField :title="'date_created'" :date="project.$date_created" />
    <br />
    <DateField :title="'date_modified'" :date="project.$date_modified" />
    <br />

    <DLabel :str="$t('license')" :show_instructions.sync="show_licence_help" />
    <div class="">
      <RadioField
        :field_name="'license'"
        :content="project.license"
        :path="project.$path"
        :can_edit="can_edit"
        :options="license_options"
      />
    </div>
    <div v-if="show_licence_help" class="u-instructions">
      <small v-html="$t('licence_instructions')" />
    </div>
    <br />

    <div class="">
      <button
        type="button"
        class="u-buttonLink"
        v-if="can_edit"
        @click="show_confirm_delete = !show_confirm_delete"
      >
        {{ $t("remove") }}
      </button>
      <br />
      <br />
      <button
        class="u-button u-button_red"
        type="button"
        v-if="show_confirm_delete"
        @click="removeProject"
      >
        {{ $t("confirm_removal") }}
      </button>
    </div>
  </ProjectCard>
</template>
<script>
import ProjectCard from "@/components/ProjectCard.vue";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: { ProjectCard },
  data() {
    return {
      edit_mode: false,
      show_confirm_delete: false,

      show_licence_help: false,

      license_options: [
        {
          key: "creativecommons_by_nc_sa",
          text: "creativecommons_by_nc_sa_explanations",
        },
        {
          key: "all_rights_reserved",
          text: "all_rights_reserved_explanations",
        },
        {
          key: "copyleft",
          text: "copyleft_explanations",
        },
        {
          key: "custom_license",
          text: "custom_license_explanations",
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
    enableEditMode() {
      this.edit_mode = true;
    },
    async removeProject() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const response = await this.$api.deleteItem({
          path: this.project.$path,
        });
        this.response = response.data;
        this.fetch_status = "success";
        // this.$router.push("/projects");
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
