<template>
  <div class="_layersPane">
    <DetailsPane
      ref="details"
      :header="$t('layers')"
      :icon="'card-list'"
      :has_items="sections.length > 0 ? sections.length : false"
      :is_open_initially="true"
      :can_be_toggled="false"
    >
      <SlickList
        class="_list"
        axis="y"
        :value="sections"
        @input="$emit('updateOrder', $event)"
        :useDragHandle="true"
      >
        <SlickItem
          v-for="(section, index) of sections"
          :key="section.$path"
          :index="index"
          class="_summaryItem"
          :class="{
            'is--active': isActive(section.$path),
          }"
        >
          <span v-handle class="u-dragHandle" v-if="can_edit">
            <sl-icon name="grip-vertical" label="Déplacer" />
          </span>
          <span
            class="_colorInd"
            :style="
              'background-color: ' +
              (section.section_color || default_layer_color)
            "
          />
          <span class="_clickZone" @click="openSection(section.$path)">
            <h4 class="_title">
              <!-- {{ index + 1 }}. -->
              <span v-if="section.section_title">
                {{ section.section_title }}
              </span>
              <span v-else v-html="'<i>' + $t('untitled') + '</i>'" />
            </h4>
          </span>
        </SlickItem>
      </SlickList>
      <template v-if="can_edit">
        <template v-if="sections.length > 0">
          <hr />
        </template>
        <button
          type="button"
          class="u-button u-button_bleuvert u-button_small"
          v-if="can_edit"
          @click="$emit('createSection', new_layer_title)"
        >
          {{ $t("create_layer") }}
        </button>
      </template>
    </DetailsPane>

    <LayerContent
      v-if="opened_section"
      :layer="opened_section"
      :layer_modules_list="opened_section_modules_list"
      :default_layer_color="default_layer_color"
      :publication_path="publication_path"
      :can_edit="can_edit"
      @repickLocation="repickLocation"
      @close="$emit('closeSection')"
      @addModules="$emit('addModules', $event)"
      @insertModules="$emit('insertModules', $event)"
      @moveModuleTo="$emit('moveModuleTo', $event)"
      @removeModule="$emit('removeModule', $event)"
      @duplicatePublicationMedia="$emit('duplicatePublicationMedia', $event)"
    />
    <div class="_repickNotice" v-if="is_repicking_location_for">
      <div class="_repickNotice--content">
        <div>
          {{ $t("click_on_map_to_repick_location_for_media") }}
          {{ is_repicking_location_for_index + 1 }}
        </div>
        <button
          type="button"
          class="u-buttonLink"
          @click="is_repicking_location_for = false"
        >
          {{ $t("cancel") }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

import LayerContent from "@/components/publications/cartography/LayerContent.vue";

export default {
  props: {
    publication_path: String,
    sections: Array,
    opened_section: [Boolean, Object],
    opened_section_modules_list: Array,
    can_edit: Boolean,
  },
  components: {
    SlickItem,
    SlickList,
    LayerContent,
  },
  directives: { handle: HandleDirective },
  data() {
    return {
      is_repicking_location_for: false,
      default_layer_color: "#333",
    };
  },
  i18n: {
    messages: {
      fr: {
        click_on_map_to_repick_location_for_media:
          "Cliquez sur la carte pour sélectionner une nouvelle position pour le média numéro ",
      },
    },
  },

  created() {},
  mounted() {
    this.$eventHub.$on(`sections.open_summary`, this.openSummary);
    this.$eventHub.$on("publication.map.click", this.setRepickLocation);
  },
  beforeDestroy() {
    this.$eventHub.$off(`sections.open_summary`, this.openSummary);
    this.$eventHub.$off("publication.map.click", this.setRepickLocation);
  },
  watch: {},
  computed: {
    is_repicking_location_for_index() {
      return this.opened_section_modules_list.findIndex(
        ({ _module }) => this.is_repicking_location_for === _module.$path
      );
    },
    new_layer_title() {
      let idx = this.sections.length + 1;
      let new_layer_title = this.$t("layer") + " " + idx;
      while (this.sections.section_title === new_layer_title) {
        idx++;
        new_layer_title = this.$t("layer") + " " + idx;
      }
      return new_layer_title;
    },
  },
  methods: {
    openSummary() {
      this.$refs.details.$el.open = true;
    },
    closeSummary() {
      this.$refs.details.$el.open = false;
    },
    openSection(path) {
      // jarring jump in section
      // setTimeout(() => {
      //   this.closeSummary();
      // }, 500);
      this.$emit("openSection", path);
    },
    isActive(path) {
      return this.opened_section && path === this.opened_section.$path;
    },
    repickLocation(path) {
      this.is_repicking_location_for = path;
    },
    async setRepickLocation({ longitude, latitude }) {
      if (!this.is_repicking_location_for) return;

      await this.$api
        .updateMeta({
          path: this.is_repicking_location_for,
          new_meta: {
            location: {
              longitude,
              latitude,
            },
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
      this.is_repicking_location_for = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._layersPane {
  position: relative;
  width: 320px;
}

._list {
  color: black;
}

._repickNotice {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  backdrop-filter: blur(5px);
  background: rgba(231, 231, 231, 0.7);

  padding: calc(var(--spacing) / 2);

  display: flex;
  flex-flow: column nowrap;
}
._repickNotice--content {
  background: white;
  padding: calc(var(--spacing) / 2);
}
</style>
<style lang="scss">
// slickitem
._summaryItem {
  z-index: 10000;

  display: flex;
  flex-flow: row wrap;
  align-items: center;

  padding: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);

  ._clickZone {
    text-decoration: underline;
    text-underline-offset: 0.2em;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: var(--c-gris_clair);
    }
  }

  ._title {
    padding: calc(var(--spacing) / 8) calc(var(--spacing) / 4);
    border-radius: 2px;
  }

  &.is--active {
    ._title {
      background: var(--c-bleumarine);
      color: white;
    }
  }
  // color: black;
  // background: blue;
}

._colorInd {
  display: inline-block;
  width: 1em;
  height: 1em;
}
</style>
