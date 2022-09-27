<template>
  <div class="_projetPanes">
    <splitpanes watch-slots :dbl-click-splitter="false" @resized="resized">
      <template v-if="projectpanes.length === 0">
        <pane>
          <span class="_msg">Choisissez un panneau ci-dessus !</span>
        </pane>
      </template>
      <pane
        v-for="pane in projectpanes"
        class="_pane"
        :key="pane.index"
        min-size="5"
        :size="pane.size"
        :data-size="pane.size"
      >
        <CapturePane v-if="pane.type === 'Capturer'" :project="project" />
        <MediaLibrary
          v-else-if="pane.type === 'Collecter'"
          :key="pane.key"
          :project="project"
          :focus_height="pane.focus_height"
          @update:focus_height="pane.focus_height = $event"
          :media_focused="pane.focus"
          @update:media_focused="pane.focus = $event"
        />
        <RemixPane v-if="pane.type === 'Remixer'" :project="project" />
        <JournalPane
          v-if="pane.type === 'Documenter'"
          :project="project"
          :opened_journal_entry="pane.pad"
          @update:opened_journal_entry="pane.pad = $event"
        />
      </pane>
    </splitpanes>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";
import CapturePane from "@/components/panes/CapturePane.vue";
import MediaLibrary from "@/components/panes/MediaLibrary.vue";
import RemixPane from "@/components/panes/RemixPane.vue";
import JournalPane from "@/components/panes/JournalPane.vue";

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
    RemixPane,
    CapturePane,
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
._pane {
}
._msg {
  height: 100%;
  display: flex;
  place-content: center;
  font-style: italic;
  padding: calc(var(--spacing) * 2);
  background: #eee;
}
</style>
