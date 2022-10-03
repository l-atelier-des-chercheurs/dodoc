<template>
  <ProjectCard>
    <div slot="header">
      Auteur.rice
      <sl-icon-button name="person-fill" label="Avatar"></sl-icon-button>
    </div>
    <div class="avatar-group">
      Par
      <sl-avatar
        image="https://images.unsplash.com/photo-1490150028299-bf57d78394e0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80&crop=right"
        label="Avatar 1 of 4"
      ></sl-avatar>

      <sl-avatar
        image="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80"
        label="Avatar 2 of 4"
      ></sl-avatar>
    </div>
  </ProjectCard>
</template>
<script>
import ProjectCard from "@/components/ProjectCard.vue";

export default {
  props: {},
  components: { ProjectCard },
  data() {
    return {};
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
