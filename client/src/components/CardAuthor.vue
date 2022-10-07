<template>
  <ProjectCard>
    <label for="" class="u-label">{{ $t("contributors") }}</label>
    <div class="_listOfAuthors">
      <div v-for="contrib in fake_contrib" :key="contrib.name">
        <sl-avatar :image="contrib.image" />
        {{ contrib.name }}
      </div>
      <sl-button
        v-if="!edit_mode && can_edit_project"
        variant="primary"
        class="editBtn"
        size="small"
        circle
        @click="edit_mode = true"
      >
        <sl-icon name="pencil-fill" :label="$t('edit')" />
      </sl-button>
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
    return {
      edit_mode: false,
      fake_contrib: [
        {
          name: "Louis",
          image:
            "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
        },
        {
          name: "Pauline",
          image:
            "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80",
        },
        {
          name: "Sarah",
          image:
            "https://images.unsplash.com/photo-1490150028299-bf57d78394e0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80&crop=right",
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
<style lang="scss" scoped>
._listOfAuthors {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 2) 0;
}
</style>
