<template>
  <ProjectCard>
    <div slot="header">
      {{ $t("informations") }}
    </div>
    <DateField :title="'date_created'" :date="project.$date_created" />
    <br />
    <DateField :title="'date_modified'" :date="project.$date_modified" />
    <br />
    <button
      type="button"
      class="u-button u-button_red"
      v-if="can_edit"
      @click="show_confirm_delete = !show_confirm_delete"
    >
      {{ $t("remove") }}
    </button>
    <br />
    <br />
    <button
      class="u-buttonLink"
      type="button"
      v-if="show_confirm_delete"
      @click="removeProject"
    >
      {{ $t("confirm_removal") }}
    </button>
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
