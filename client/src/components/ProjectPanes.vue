<template>
  <div
    class="_projetPanes"
    :class="{
      'has--multiplePanes': can_edit_project,
    }"
    @click="scrollToPanes"
  >
    <splitpanes watch-slots :dbl-click-splitter="false" @resized="resized">
      <template v-if="projectpanes.length === 0">
        <pane>
          <div class="_msg">
            <span class="u-instructions">
              {{ $t("choose_a_pane") }}
            </span>
            <br />
            <br />
            <br />
            <br />
            <div class="_devNotes">
              <div class="u-wips" />
              <small>
                à venir : afficher un petit menu qui contient un encart pour
                chaque panneau avec les derniers éléments créés ou modifiés, et
                un lien pour les ouvrir
              </small>
            </div>
          </div>
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
        <transition name="fade">
          <div
            class="_floatingMsg"
            :key="`instructions.pane_${pane.type}`"
            v-if="show_instructions && can_edit_project"
            @click.self="closeInstructions"
          >
            <div>
              <span v-html="$t(`instructions.pane.${pane.type}`)"></span>
              <sl-icon-button
                name="x-circle-fill"
                label="Fermer"
                @click.stop="closeInstructions"
              />
            </div>
          </div>
        </transition>
        <CapturePane
          v-if="pane.type === 'capture'"
          :project="project"
          :selected_mode="pane.mode"
          @update:selected_mode="setItem(pane, 'mode', $event)"
          :stopmotion_slug="pane.stopmotion"
          @update:stopmotion_slug="setItem(pane, 'stopmotion', $event)"
        />
        <MediaLibrary
          v-else-if="pane.type === 'collect'"
          :key="pane.key"
          :project="project"
          :media_focused="pane.focus"
          @update:media_focused="setItem(pane, 'focus', $event)"
        />
        <RemixPane
          v-if="pane.type === 'remix'"
          :project="project"
          :opened_remix_slug="pane.remix"
          :can_edit="can_edit_project"
          @update:opened_remix_slug="setItem(pane, 'remix', $event)"
        />
        <PublierPane
          v-if="pane.type === 'publish'"
          :project="project"
          :publication_opened="pane.folder"
          :page_opened_id="pane.page_id"
          :can_edit="can_edit_project"
          @update:publication_opened="setItem(pane, 'folder', $event)"
          @update:page_opened_id="setItem(pane, 'page_id', $event)"
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
    scrollToPanes() {
      this.$el.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    },
    setItem(pane, prop, $event) {
      if (
        (Object.prototype.hasOwnProperty.call(pane, prop) &&
          pane[prop] === $event) ||
        !$event
      )
        this.$delete(pane, prop);
      else this.$set(pane, prop, $event);
    },
    closeInstructions() {
      this.show_instructions = false;
      this.scrollToPanes();
    },
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
  // width: 100%;
  // height: 100%;

  ::v-deep ._pane > * {
    min-height: calc(100vh - 44px);
  }

  &.has--multiplePanes ::v-deep ._pane {
    height: calc(100vh - 44px);
    overflow: auto;
  }
}
._msg {
  // height: 100%;
  // display: flex;
  // place-content: center;

  text-align: center;
  max-width: 50ch;
  margin: 0 auto;

  padding: calc(var(--spacing) * 2);
}
._devNotes {
  // opacity: 0.4;
}

._floatingMsg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);

  z-index: 1000;
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
