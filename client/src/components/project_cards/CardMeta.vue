<template>
  <ProjectCard :header="$t('informations')" :icon="'info-square'" open>
    <AdminsAndContributorsField
      :show_section="['admins', 'contributors']"
      :folder="project"
      :can_edit="can_edit"
      :admin_label="$t('referent')"
      :admin_instructions="$t('project_admin_instructions')"
      :contrib_instructions="$t('project_contrib_instructions')"
    />

    <div class="u-spacingBottom" />

    <div class="u-spacingBottom">
      <DateField :title="$t('date_created')" :date="project.$date_created" />
      <DateField :title="$t('date_modified')" :date="project.$date_modified" />
    </div>

    <div class="u-mediaOptions" v-if="can_edit">
      <DuplicateFolder :path="project.$path" :source_title="project.title" />
      <RemoveMenu :remove_text="$t('remove_project')" @remove="removeProject" />
    </div>

    <div
      class="u-spacingBottom"
      v-if="$root.app_infos.is_electron && is_instance_admin"
    >
      <DLabel :str="$t('open_in_finder')" />
      <button
        type="button"
        class="u-button u-button_bleumarine u-button_small"
        @click="openInFinder"
      >
        {{ project.$path }}
      </button>
    </div>
  </ProjectCard>
</template>
<script>
import ProjectCard from "@/components/ProjectCard.vue";
import DuplicateFolder from "@/components/project/DuplicateFolder.vue";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {
    ProjectCard,
    DuplicateFolder,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    openInFinder() {
      window.electronAPI.send("toMain", {
        type: "open_path",
        path: this.project.$path,
      });
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
