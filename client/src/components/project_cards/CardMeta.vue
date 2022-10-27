<template>
  <ProjectCard>
    <div slot="header">
      {{ $t("informations") }}
    </div>
    <DateField
      :title="'date_created'"
      :date="project.date_created"
      :show_detail_initially="true"
    />
    <br />
    <DateField
      :title="'date_modified'"
      :date="project.date_modified"
      :show_detail_initially="true"
    />
    <br />
    Supprimer ce projet
    <button type="button" @click="removeProject">
      Confirmer la suppression
    </button>
  </ProjectCard>
</template>
<script>
import ProjectCard from "@/components/ProjectCard.vue";

export default {
  props: {
    project: Object,
    can_edit_project: Boolean,
  },
  components: { ProjectCard },
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
    enableEditMode() {
      this.edit_mode = true;
    },
    async removeProject() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const response = await this.$api.deleteFolder({
          folder_type: "projects",
          folder_slug: this.project.slug,
        });
        this.response = response.data;
        this.fetch_status = "success";
        this.$router.push("/projects");
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
