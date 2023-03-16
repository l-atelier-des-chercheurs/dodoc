<template>
  <section>
    <div
      v-if="projects.length === 0"
      class="u-instructions _projectsNotice"
      :key="'noprojects'"
    >
      {{ $t("no_projects") }}
    </div>
    <transition-group
      v-else
      tag="div"
      class="_projectsList"
      name="StoryModules"
      appear
    >
      <ProjectPresentation
        v-for="project in projects"
        class="_project"
        :project="project"
        context="list"
        :key="project.$path"
      />
    </transition-group>
  </section>
</template>
<script>
import ProjectPresentation from "@/components/ProjectPresentation.vue";

export default {
  props: {
    projects: Array,
  },
  components: { ProjectPresentation },
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
<style lang="scss" scoped>
._projectsNotice {
  width: 100%;
  text-align: center;
}
._projectsList {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 1);
  align-items: stretch;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

  // margin-top: calc(var(--spacing) / 4);
  // background: white;

  // display: flex;
  // flex-flow: row wrap;
  // justify-content: flex-start;
  // gap: calc(var(--spacing) / 1);

  > * {
    // flex: 0 1 240px;
    // max-width: 240px;
    margin: 0;
  }
}

._project {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  // width: 100%;
  cursor: pointer;

  ::v-deep ._projectInfos {
    min-height: 100%;
  }
}
</style>
