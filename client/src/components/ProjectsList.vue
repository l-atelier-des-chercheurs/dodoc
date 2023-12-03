<template>
  <div class="">
    <div
      v-if="projects.length === 0"
      class="u-instructions"
      :key="'noprojects'"
    >
      {{ $t("no_projects") }}
    </div>
    <template v-else>
      <div
        class="_finished"
        v-if="
          separate_finished_from_non_finished && finished_projects.length > 0
        "
      >
        <div class="">
          <DLabel :str="$t('only_finished')" />
          <transition-group
            tag="section"
            class="_projectsList"
            :data-context="context"
            name="projectsList"
            appear
          >
            <ProjectPresentation
              v-for="project in finished_projects"
              class="_project"
              :project="project"
              :context="context"
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
          :data-context="context"
          name="projectsList"
          appear
        >
          <ProjectPresentation
            v-for="project in non_finished_projects"
            class="_project"
            :project="project"
            :context="context"
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
    context: { default: "list", type: String },
    display_original_space: Boolean,
    separate_finished_from_non_finished: { default: true, type: Boolean },
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
      if (this.separate_finished_from_non_finished)
        return this.projects.filter((p) => p.$status !== "finished");
      return this.projects;
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

  &[data-context="tiny"] {
    grid-gap: calc(var(--spacing) / 2);
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

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
  background: var(--c-pinnedBg);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1)
    calc(var(--spacing) / 1);
  margin-top: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 1);
  margin-left: calc(var(--spacing) / -1);
  margin-right: calc(var(--spacing) / -1);
}
</style>
