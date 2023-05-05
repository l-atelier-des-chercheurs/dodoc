<template>
  <ProjectCard :header="$t('informations')" :icon="'info-square'">
    <div class="" v-if="$root.app_infos.is_electron && is_instance_admin">
      <button
        type="button"
        class="u-button u-button_bleumarine u-button_small"
        @click="openInFinder"
      >
        {{ project.$path }}
      </button>
    </div>

    <br />

    <DateField :title="$t('date_created')" :date="project.$date_created" />
    <br />
    <DateField :title="$t('date_modified')" :date="project.$date_modified" />
    <br />

    <div v-if="can_edit">
      <DuplicateFolder :path="project.$path" :source_title="project.title" />
    </div>
    <div v-if="can_edit">
      <RemoveMenu :remove_text="$t('remove_project')" @remove="removeProject" />
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
  components: { ProjectCard, DuplicateFolder },
  data() {
    return {
      edit_mode: false,
    };
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
