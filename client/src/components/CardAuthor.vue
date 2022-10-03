<template>
  <ProjectCard>
    <div slot="header">
      <label for="" class="u-label">{{ $t("contributors") }}</label>
      <sl-button
        v-if="!edit_mode && can_edit_project"
        variant="neutral"
        class="_inlineBtns"
        size="small"
        circle
        @click="edit_mode = true"
      >
        <sl-icon name="pencil-fill" :label="$t('edit')" />
      </sl-button>
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
  props: {
    project: Object,
    can_edit_project: Boolean,
  },
  components: { ProjectCard },
  data() {
    return { edit_mode: false };
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
