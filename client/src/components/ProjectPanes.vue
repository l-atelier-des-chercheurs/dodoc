<template>
  <div class="_projetPanes">
    <splitpanes watch-slots :dbl-click-splitter="false" @resized="resized">
      <template v-if="projectpanes.length === 0">
        <pane><span class="_msg">Aucun panneau n’est actif</span></pane>
      </template>
      <pane
        v-for="pane in projectpanes"
        :key="pane.index"
        min-size="5"
        :size="pane.size"
        :data-size="pane.size"
      >
        <JournalPane
          v-if="pane.type === 'Journal'"
          :project="project"
          :opened_journal_entry="pane.pad"
          @update:opened_journal_entry="pane.pad = $event"
        />
        <MediaLibrary
          v-else-if="pane.type === 'MediaLibrary'"
          :key="pane.key"
          :project="project"
          :focus_height="pane.focus_height"
          @update:focus_height="pane.focus_height = $event"
          :media_focused="pane.focus"
          @update:media_focused="pane.focus = $event"
        />
        <CapturePane v-else-if="pane.type === 'Capture'" :project="project" />
        <TeamPane v-else-if="pane.type === 'TeamPane'" :project="project" />
      </pane>
    </splitpanes>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";
import JournalPane from "@/components/panes/JournalPane.vue";
import MediaLibrary from "@/components/panes/MediaLibrary.vue";
import CapturePane from "@/components/panes/CapturePane.vue";
import TeamPane from "@/components/panes/TeamPane.vue";

export default {
  props: {
    projectpanes: Array,
    project: Object,
  },
  components: {
    Splitpanes,
    Pane,
    JournalPane,
    MediaLibrary,
    CapturePane,
    TeamPane,
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
    resized(_projectpanessizes) {
      console.log(`Project / methods: resized`);
      let _projectpanes = this.projectpanes.slice();
      _projectpanes.map((p, index) => {
        p.size = Number(_projectpanessizes[index].size.toFixed(1));
        return p;
      });
      this.$emit("update:projectpanes", _projectpanes);
    },
  },
};
</script>
<style lang="scss" scoped>
._projetPanes {
  position: relative;
  width: 100%;
  height: 100%;
}
._msg {
  font-style: italic;
  padding: calc(var(--spacing) / 2);
}
</style>
