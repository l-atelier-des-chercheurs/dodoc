<template>
  <div class="m_planning">
    <div class="m_planning--container">
      <SlickList
        v-model="sorted_planning_medias"
        axis="y"
        :useDragHandle="true"
      >
        <!-- @sort-end="sortEnded" -->
        <SlickItem
          v-for="(item, index) in sorted_planning_medias"
          :index="index"
          :key="item.metaFileName"
        >
          <div class="m_planning--slickItem">
            <div
              v-handle
              class="m_planning--slickItem--handle handle"
              v-if="!enable_export_mode"
            />
            <div v-else class="m_planning--slickItem--handle">
              <input
                type="checkbox"
                @change="toggleSelectionInExport(item.metaFileName)"
              />
            </div>
            <PlanningItem
              class="m_planning--slickItem--item"
              :key="item.metaFileName"
              :media="item"
              :class="{
                'is--active':
                  item.metaFileName ===
                  $root.settings.current_planning_media_metaFileName,
                'has--timer': planning_item_with_timer === item.metaFileName,
              }"
              :slugFolderName="slugFolderName"
              @toggleOpen="toggleOpenItem"
              @removePlanningMedia="removePlanningMedia"
            />
          </div>
        </SlickItem>
      </SlickList>

      <div
        @click.self="$root.settings.current_planning_media_metaFileName = false"
      >
        <form
          @submit.prevent="createPlanningMedia"
          :key="'create'"
          class="m_planning--container--create"
        >
          <div v-if="!show_planning_section">
            <td colspan="4">
              <button
                type="button"
                class="_create_button"
                @click="show_planning_section = !show_planning_section"
              >
                {{ $t("create") }}
              </button>
            </td>
          </div>

          <div v-else>
            <td colspan="2">
              <input type="text" class ref="nameInput" />
            </td>
            <td colspan="2">
              <button
                type="submit"
                class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
              >
                {{ $t("create") }}
              </button>
            </td>
          </div>
        </form>

        <button
          type="button"
          @click="enable_export_mode = !enable_export_mode"
          :class="{
            'is--active': enable_export_mode,
          }"
          v-html="!enable_export_mode ? $t('export_as_html') : $t('cancel')"
        />

        <div v-if="enable_export_mode" class="margin-sides-medium">
          <small v-if="export_pads_selection.length == 0">
            Selectionnez des entrées du journal en cochant les cases dans la
            colonne de gauche.
          </small>
          <template v-else>
            <small
              >{{ export_pads_selection.length }} entrées sélectionnées.</small
            >
            <a
              class="button js--openInBrowser"
              :href="export_pads_URL"
              target="_blank"
            >
              Ouvrir la sélection dans un nouvel onglet
            </a>
          </template>
        </div>

        <div class="m_planningPanes">
          <div
            v-for="media in sorted_planning_medias"
            :key="media.metaFileName + '_pane'"
            @click.self="
              $root.settings.current_planning_media_metaFileName = false
            "
            class="m_planningPanes--pane"
            :class="{
              'is--open':
                $root.settings.current_planning_media_metaFileName ===
                media.metaFileName,
            }"
          >
            <transition name="slideup">
              <div
                class="m_planningPanes--pane--content"
                v-if="
                  $root.settings.current_planning_media_metaFileName ===
                  media.metaFileName
                "
              >
                <PlanningItem
                  :key="media.metaFileName"
                  :media="media"
                  :slugFolderName="slugFolderName"
                  :mode="'expanded'"
                  @removePlanningMedia="removePlanningMedia"
                />
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import PlanningItem from "./subcomponents/PlanningItem.vue";
import { Splitpanes, Pane } from "splitpanes";

import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    slugFolderName: String,
    project: Object,
    planning_medias: Array,
  },
  components: {
    PlanningItem,
    SlickItem,
    SlickList,
    Splitpanes,
    Pane,
  },
  directives: { handle: HandleDirective },
  data() {
    return {
      show_planning_section: false,

      planning_slugs_in_order: [],

      enable_export_mode: false,
      export_pads_selection: [],
    };
  },

  created() {},
  mounted() {
    this.planning_slugs_in_order = Array.isArray(
      this.project.planning_slugs_in_order
    )
      ? this.project.planning_slugs_in_order
      : [];
  },
  beforeDestroy() {},

  watch: {
    "project.planning_slugs_in_order": function () {
      if (this.$root.dev_mode === true) {
        console.log(`WATCH • Publication: publication.medias_slugs`);
      }
      this.planning_slugs_in_order = Array.isArray(
        this.project.planning_slugs_in_order
      )
        ? this.project.planning_slugs_in_order
        : [];
    },
    enable_export_mode() {
      if (!this.enable_export_mode) {
        this.export_pads_selection = [];
      }
    },
  },

  computed: {
    export_pads_URL() {
      return (
        `projects/${this.slugFolderName}/full_planning?pads=` +
        encodeURI(this.export_pads_selection.join(",").replace(/\./g, "*"))
      );
    },
    sorted_planning_medias: {
      get() {
        // check if in this.planning_slugs_in_order
        let _list = this.planning_slugs_in_order.reduce(
          (acc, { metaFileName }) => {
            const _planning_media = this.planning_medias.find(
              (pm) => pm.metaFileName === metaFileName
            );
            if (_planning_media && this.$root.filterMedia(_planning_media)) {
              acc.push(_planning_media);
            }
            return acc;
          },
          []
        );

        // if missing in this.planning_slugs_in_order, add to the end
        this.planning_medias.map((p) => {
          if (
            !_list.find((_p) => p.metaFileName === _p.metaFileName) &&
            this.$root.filterMedia(p)
          ) {
            _list.push(p);
          }
        });
        // _list

        return _list;
      },
      set(v) {
        const planning_slugs_in_order = v.map((m) => ({
          metaFileName: m.metaFileName,
        }));

        this.planning_slugs_in_order = planning_slugs_in_order;

        this.$root.editFolder({
          type: "projects",
          slugFolderName: this.slugFolderName,
          data: {
            planning_slugs_in_order,
          },
        });
      },
      // return this.planning_medias.sort((a, b) =>
      //   a.hasOwnProperty("planning_info_start") && a.planning_info_start
      //     ? a.planning_info_start.localeCompare(b.planning_info_start)
      //     : false
    },
    planning_item_with_timer() {
      if (
        !Array.isArray(this.project.countdown_options) ||
        this.project.countdown_options.length === 0
      )
        return false;

      return this.project.countdown_options[0].attached_to;
    },
  },
  methods: {
    textChange(delta, oldDelta, source) {
      // if source === 'user'
    },
    toggleSelectionInExport(metaFileName) {
      if (this.export_pads_selection.includes(metaFileName)) {
        this.export_pads_selection = this.export_pads_selection.filter(
          (m) => m !== metaFileName
        );
      } else {
        this.export_pads_selection.push(metaFileName);
      }
    },
    toggleOpenItem(item_meta) {
      if (window.state.dev_mode === true) {
        console.log("METHODS • Planning: toggleOpenItem");
      }

      this.$root.settings.current_planning_media_metaFileName = item_meta;
      return;
    },
    createPlanningMedia() {
      if (window.state.dev_mode === true) {
        console.log("METHODS • Planning: createPlanningMedia");
      }

      let name = this.$refs.nameInput.value;
      if (!name) {
        name = this.$t("untitled_document");
      }

      if (this.planning_medias.filter((w) => w.name === name).length > 0) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.document_name_exists"));
        return false;
      }

      this.show_planning_section = false;

      this.$eventHub.$on("socketio.media_created_or_updated", (d) => {
        this.$eventHub.$off("socketio.media_created_or_updated");

        let planning_slugs_in_order = JSON.parse(
          JSON.stringify(this.planning_slugs_in_order)
        );

        planning_slugs_in_order.push({
          metaFileName: d.metaFileName,
        });

        this.$root.editFolder({
          type: "projects",
          slugFolderName: this.slugFolderName,
          data: {
            planning_slugs_in_order,
          },
        });
      });

      this.$root.createMedia({
        type: "projects",
        slugFolderName: this.slugFolderName,
        additionalMeta: {
          name,
          type: "planning",
        },
      });
    },
    removePlanningMedia(metaFileName) {
      if (this.$root.dev_mode === true) {
        console.log(
          `METHODS • Publication: removeMedia / metaFileName = ${metaFileName}`
        );
      }
      this.$root.settings.current_planning_media_metaFileName = false;

      this.$root.removeMedia({
        type: "projects",
        slugFolderName: this.slugFolderName,
        slugMediaName: metaFileName,
      });

      let planning_slugs_in_order = JSON.parse(
        JSON.stringify(this.planning_slugs_in_order)
      );

      planning_slugs_in_order = planning_slugs_in_order.filter(
        (m) => m.metaFileName !== metaFileName
      );

      this.$root.editFolder({
        type: "projects",
        slugFolderName: this.slugFolderName,
        data: {
          planning_slugs_in_order,
        },
      });
    },
    sortEnded({ event, newIndex, oldIndex, collection }) {
      if (newIndex !== oldIndex) {
      }
    },
  },
};
</script>
<style lang="scss">
.m_planning {
  position: relative;
  height: 100%;
  background-color: var(--color-Planning);

  // height: 100%;
  // overflow-y: auto;
}
.m_planning--container {
  height: 100%;
  // display: flex;
  // flex-flow: column nowrap;
  overflow-y: auto;

  margin: 0 auto;
}

.m_planning--container--create {
  padding: calc(var(--spacing) / 1);
  background-color: #fff;
  border: 1px solid black;
  margin: -1px;
}

.m_planningPanes--pane {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  // z-index: -1;
  overflow: hidden;
  pointer-events: none;

  // box-shadow: 0 0 12px #888;
  // box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  // transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--open {
    // z-index: 6;
    // pointer-events: auto;
    // background-color: rgba(255, 255, 255, 0.45);
  }
}
.m_planningPanes--pane--content {
  background-color: white;
  height: 100%;
  pointer-events: auto;
  // width: 100%;
  // overflow: auto;
  border-left: 1px solid black;
  margin-left: -1px;
  // transition: all 1s cubic-bezier(0.19, 1, 0.22, 1) !important;

  > * {
    height: 100%;
  }
}

.m_planning--slickItem {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-content: stretch;
  margin-top: -1px;
  margin-left: -1px;
  margin-right: -1px;
  border: 1px solid black;

  .m_planningItem {
    padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
  }
}

.m_planning--slickItem--handle {
  display: block;
  flex: 0 0 40px;
  // width: 28px;
  margin: 0;
  border-radius: 0;
  margin-right: -1px;

  border: none;
  border-right: 1px solid black;
  padding: var(--spacing);

  background-color: #fff;

  cursor: row-resize;

  display: flex;
  align-items: center;
  justify-content: center;

  &:before {
    transform: rotate(0deg);
  }
}

.m_planning--slickItem--item {
  flex: 1 1 auto;

  &.has--timer {
    color: #ff3e51;
  }
}
</style>
