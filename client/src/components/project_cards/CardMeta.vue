<template>
  <ProjectCard :header="$t('informations')" :icon="'info-square'">
    <DateField :title="$t('date_created')" :date="project.$date_created" />
    <br />
    <DateField :title="$t('date_modified')" :date="project.$date_modified" />
    <br />

    <div class="">
      <RemoveMenu
        v-if="can_edit"
        :remove_text="$t('remove_project')"
        @remove="removeProject"
      />
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
