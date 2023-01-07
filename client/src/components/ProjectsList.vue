<template>
  <section>
    <div class="_sectionLabel" :key="'label'">
      <h3>
        {{ label }}&nbsp;
        <small>({{ projects.length }})</small>
      </h3>
    </div>
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
    label: String,
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

._sectionLabel {
  width: 100%;
  height: 100%;
  box-shadow: none;
  text-align: center;

  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  // background: rgba(255, 255, 255, 0.1);
  padding: calc(var(--spacing) * 2);

  background: var(--c-bodybg);

  font-size: var(--sl-font-size-xx-large);

  ::v-deep h3 {
    font-size: inherit;
  }
}
</style>
