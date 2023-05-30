<template>
  <ProjectCard :header="$t('informations')" :icon="'info-square'" open>
    <div class="u-spacingBottom">
      <AdminsAndContributorsField
        :folder="project"
        :can_edit="can_edit"
        :admin_label="$t('referent')"
        :admin_instructions="$t('project_admin_instructions')"
        :contrib_instructions="$t('project_contrib_instructions')"
      />
    </div>

    <EventField
      class="u-spacingBottom"
      v-if="$root.app_infos.instance_meta.enable_events"
      :project="project"
      :can_edit="can_edit"
    />

    <div class="u-spacingBottom">
      <DateDisplay :title="$t('date_created')" :date="project.$date_created" />
      <DateDisplay
        :title="$t('date_modified')"
        :date="project.$date_modified"
      />
    </div>

    <div class="u-mediaOptions" v-if="can_edit">
      <DuplicateProject :path="project.$path" :source_title="project.title" />
      <RemoveMenu :remove_text="$t('remove_project')" @remove="removeProject" />
    </div>

    <div class="" v-if="$root.app_infos.is_electron && is_instance_admin">
      <div class="u-spacingBottom" />
      <DLabel :str="$t('open_in_finder')" />
      <button
        type="button"
        class="u-button u-button_bleumarine u-button_small"
        @click="openInFinder(project.$path)"
        v-html="project_path_wrappable"
      />
    </div>
  </ProjectCard>
</template>
<script>
import ProjectCard from "@/components/ProjectCard.vue";
import DuplicateProject from "@/components/project/DuplicateProject.vue";
import EventField from "@/components/project/EventField.vue";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {
    ProjectCard,
    EventField,
    DuplicateProject,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    project_path_wrappable() {
      return this.project.$path.replaceAll("/", "/<wbr>");
    },
  },
  methods: {
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
    openInFinder(path) {
      window.electronAPI.send("toMain", {
        type: "open_path",
        path,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
