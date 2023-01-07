<template>
  <section>
    <transition-group
      tag="div"
      class="_projectsList"
      name="StoryModules"
      appear
      :duration="700"
    >
      <div
        v-if="projects.length === 0"
        class="u-instructions"
        :key="'noprojects'"
      >
        {{ $t("no_projects") }}
      </div>
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
._projectsList {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 1);
  align-items: center;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));

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
