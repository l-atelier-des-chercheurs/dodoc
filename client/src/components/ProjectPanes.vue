<template>
  <div
    class="_projetPanes"
    :class="{
      'has--multiplePanes': can_edit_project,
      'is--editable': can_edit_project,
    }"
    @click="scrollToPanes"
  >
    <splitpanes watch-slots :dbl-click-splitter="false" @resized="resized">
      <template v-if="projectpanes.length === 0">
        <pane>
          <div class="_msg">
            <div class="u-sameRow u-instructions">
              <b-icon icon="arrow-up-short" />
              {{ $t("choose_a_pane") }}
              <b-icon icon="arrow-up-short" />
            </div>
            <br />
            <br />
            <br />

            <!-- <div class="_devNotes">
              <div class="u-wips" />
              <small>
                todo : afficher un petit menu qui contient un encart pour
                chaque panneau avec les derniers éléments créés ou modifiés, et
                un lien pour les ouvrir
              </small>
            </div>-->
          </div>
        </pane>
      </template>
      <pane
        v-for="pane in projectpanes"
        class="_pane"
        :key="pane.type"
        min-size="5"
        :size="pane.size"
        :data-size="pane.size"
        :style="`--color-type: var(--color-${pane.type});`"
      >
        <InstructionsWindow
          v-if="can_edit_project && false"
          :key="pane.type"
          :type="pane.type"
          :path="project.$path"
          @close="scrollToPanes"
        />
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
        <MakePane
          v-if="pane.type === 'make'"
          :project="project"
          :opened_make_slug="pane.make"
          :can_edit="can_edit_project"
          @update:opened_make_slug="setItem(pane, 'make', $event)"
        />
        <PublierPane
          v-if="pane.type === 'publish'"
          :project="project"
          :pane_infos="pane"
          :can_edit="can_edit_project"
          @updatePane="($event) => setItem(pane, $event.key, $event.value)"
        />
      </pane>
    </splitpanes>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";
import CapturePane from "@/components/panes/CapturePane.vue";
import MediaLibrary from "@/components/panes/MediaLibrary.vue";
import MakePane from "@/components/panes/MakePane.vue";
import PublierPane from "@/components/panes/PublierPane.vue";
import InstructionsWindow from "@/components/project/InstructionsWindow.vue";

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
    MakePane,
    CapturePane,
    InstructionsWindow,
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
    scrollToPanes() {
      if (this.$route.name === "Projet" && this.can_edit_project)
        // convenient in double scroll mode
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

  &:not(.is--editable) ::v-deep ._pane > * {
    min-height: 100vh;
  }

  &.is--editable ::v-deep ._pane > * {
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
  max-width: 70ch;
  margin: 0 auto;

  padding: calc(var(--spacing) * 2);
  margin-bottom: 20vh;

  ::v-deep ._labelLine {
    justify-content: center;
  }
}
._devNotes {
  // opacity: 0.4;
}
</style>
