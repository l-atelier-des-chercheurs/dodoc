<template>
  <div>
    <div
      v-if="projects.length === 0"
      class="u-instructions"
      :key="'noprojects'"
    >
      {{ $t("no_projects") }}
    </div>
    <template v-else>
      <div class="_finished" v-if="finished_projects.length > 0">
        <div class="">
          <DLabel :str="$t('only_finished')" />
          <transition-group
            tag="section"
            class="_projectsList"
            name="projectsList"
            appear
          >
            <ProjectPresentation
              v-for="project in finished_projects"
              class="_project"
              :project="project"
              context="list"
              :display_original_space="display_original_space"
              :key="project.$path"
            />
          </transition-group>
        </div>
      </div>
      <div class="">
        <transition-group
          tag="section"
          class="_projectsList"
          name="projectsList"
          appear
        >
          <ProjectPresentation
            v-for="project in non_finished_projects"
            class="_project"
            :project="project"
            context="list"
            :display_original_space="display_original_space"
            :key="project.$path"
          />
        </transition-group>
      </div>
    </template>
  </div>
</template>
<script>
import ProjectPresentation from "@/components/ProjectPresentation.vue";

export default {
  props: {
    projects: Array,
    display_original_space: Boolean,
  },
  components: { ProjectPresentation },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    non_finished_projects() {
      return this.projects.filter((p) => p.$status !== "finished");
    },
    finished_projects() {
      return this.projects.filter((p) => p.$status === "finished");
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
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

._finished {
  background: hsl(173, 47%, 80%);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1)
    calc(var(--spacing) / 1);
  margin-top: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 1);
  margin-left: calc(var(--spacing) / -1);
  margin-right: calc(var(--spacing) / -1);
}
</style>
