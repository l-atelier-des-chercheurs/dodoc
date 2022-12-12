<template>
  <div class="_projetPanes">
    <splitpanes watch-slots :dbl-click-splitter="false" @resized="resized">
      <template v-if="projectpanes.length === 0">
        <pane>
          <span class="_msg u-instructions">
            Choisissez un panneau ci-dessus pour démarrer !
          </span>
        </pane>
      </template>
      <pane
        v-for="pane in projectpanes"
        class="_pane"
        :key="pane.index"
        min-size="5"
        :size="pane.size"
        :data-size="pane.size"
        :style="`--color-type: var(--color-${pane.type});`"
      >
        <transition name="fade_fast">
          <div
            class="_floatingMsg"
            :key="`instructions.pane_${pane.type}`"
            v-if="show_instructions && can_edit_project"
            @click.self="show_instructions = false"
          >
            <div>
              <span v-html="$t(`instructions.pane.${pane.type}`)"></span>
              <sl-icon-button
                name="x-circle-fill"
                label="Fermer"
                @click.stop="show_instructions = false"
              />
            </div>
          </div>
        </transition>
        <CapturePane v-if="pane.type === 'Capturer'" :project="project" />
        <MediaLibrary
          v-else-if="pane.type === 'Collecter'"
          :key="pane.key"
          :project="project"
          :media_focused="pane.focus"
          @update:media_focused="pane.focus = $event"
        />
        <RemixPane v-if="pane.type === 'Remixer'" :project="project" />
        <PublierPane
          v-if="pane.type === 'Publier'"
          :project="project"
          :publication_opened="pane.pad"
          :can_edit="can_edit_project"
          @update:publication_opened="pane.pad = $event"
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
import PublierPane from "@/components/panes/PublierPane.vue";

export default {
  props: {
    projectpanes: Array,
    project: Object,
    can_edit_project: Boolean,
  },
  components: {
    Splitpanes,
    Pane,
    PublierPane,
    MediaLibrary,
    RemixPane,
    CapturePane,
  },
  data() {
    return {
      show_instructions: true,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    panes_enabled(val, oldVal) {
      if (JSON.stringify(val) !== JSON.stringify(oldVal))
        this.show_instructions = true;
    },
  },
  computed: {
    panes_enabled() {
      return this.projectpanes.map((pp) => pp.type);
    },
  },
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
  background: #eee;

  padding: calc(var(--spacing) * 1);
}

._floatingMsg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);

  z-index: 10;
  text-align: center;
  padding: calc(var(--spacing) * 2);

  cursor: pointer;

  > div {
    position: relative;
    background: var(--color-type);
    background: white;
    max-width: 54ch;
    padding: calc(var(--spacing) / 2);
    margin: 0 auto;
    border: 2px solid var(--c-gris);
    border-radius: 4px;
    pointer-events: auto;

    cursor: default;
  }

  sl-icon-button {
    position: absolute;
    top: -1em;
    right: -1em;
    color: currentColor;

    &::part(base) {
      color: currentColor;
    }
  }
}
</style>
