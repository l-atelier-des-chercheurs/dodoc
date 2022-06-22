<template>
  <splitpanes
    watch-slots
    @resized="resized()"
    :key="JSON.stringify(panes.map((p) => p.key))"
  >
    <template v-if="panes.filter((p) => p.enabled).length === 0">
      <div><i>Aucune panneau n’est actif</i></div>
    </template>
    <template v-else v-for="pane in panes">
      <pane
        v-if="pane.key === 'WriteUp' && pane.enabled"
        :key="pane.key"
        min-size="5"
        ref="WriteUp"
      >
        WRITEUP
      </pane>

      <pane
        v-else-if="pane.key === 'MediaLibrary' && pane.enabled"
        :key="pane.key"
        min-size="5"
        ref="MediaLibrary"
      >
        <ProjectLibrary :project="project" />
      </pane>

      <pane
        v-else-if="pane.key === 'Capture' && pane.enabled"
        :key="pane.key"
        min-size="5"
        ref="Capture"
      >
        CAPTURE
      </pane>

      <pane
        v-if="pane.key === 'Planning' && pane.enabled"
        :key="pane.key"
        min-size="5"
        ref="Planning"
      >
        PLANNING
      </pane>

      <pane
        v-else-if="pane.key === 'Team' && pane.enabled"
        :key="pane.key"
        min-size="5"
        ref="Team"
      >
        TEAM
      </pane>
    </template>
  </splitpanes>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";
import ProjectLibrary from "@/components/ProjectLibrary.vue";

export default {
  props: {
    panes: Array,
    project: Object,
  },
  components: {
    Splitpanes,
    Pane,
    ProjectLibrary,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    resized() {
      console.log(`Project / methods: resized`);
      this.$eventHub.$emit(`activity_panels_resized`);
      setTimeout(() => {
        // this.updateWidthInStore();
      }, 500);
    },
  },
};
</script>
<style lang="scss" scoped></style>
