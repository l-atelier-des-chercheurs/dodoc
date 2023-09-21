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
          >
          </span>
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
          class="u-buttonLink"
          @click="$emit('createSection')"
        >
          {{ $t("create_layer") }}
        </button>
      </template>
    </DetailsPane>
    <div class="_openedLayer" v-if="opened_section">
      <div class="_closeLayerBtn">
        <sl-button
          variant="default"
          size="medium"
          circle
          @click="$emit('closeSection')"
        >
          <sl-icon name="x-lg" :label="$t('close')"></sl-icon>
        </sl-button>
      </div>

      <div class="_openedLayer--content">
        <div class="_title">
          <TitleField
            :field_name="'section_title'"
            :label="can_edit ? $t('layer_title') : ''"
            :content="opened_section.section_title"
            :path="opened_section.$path"
            :maxlength="120"
            :tag="'h3'"
            :can_edit="can_edit"
          />
          <!-- ({{ opened_section_modules_list.length }}) -->
        </div>

        <div class="_color">
          <ColorInput
            class="u-spacingBottom"
            :label="$t('pins_color')"
            :can_toggle="false"
            :default_value="default_layer_color"
            :value="opened_section.section_color"
            @save="updateOpenedLayer({ field: 'section_color', value: $event })"
          />
        </div>

        <MapModule
          v-for="(
            { meta_filename, _module }, index
          ) in opened_section_modules_list"
          :key="meta_filename"
          :index="index"
          :mapmodule="_module"
          @repickLocation="repickLocation(_module.$path)"
          @remove="$emit('removeModule', meta_filename)"
        />
        <!-- <PublicationModule
            class="_mediaPublication"
            :key="meta_filename"
            :publimodule="_module"
            :module_position="
              opened_section_modules_list.length === 1
                ? 'alone'
                : index === 0
                ? 'first'
                : index === opened_section_modules_list.length - 1
                ? 'last'
                : 'inbetween'
            "
            :can_edit="can_edit"
            @moveUp="$emit('moveModuleTo', { meta_filename, dir: -1 })"
            @moveDown="$emit('moveModuleTo', { meta_filename, dir: +1 })"
            @duplicate="
              $emit('duplicatePublicationMedia', {
                source_meta_filename: meta_filename,
                copy_meta_filename: $event,
              })
            "
            @remove="$emit('removeModule', meta_filename)"
          /> -->

        <hr />

        <ModuleCreator
          :publication_path="publication_path"
          :is_collapsed="false"
          :context="'cartography'"
          :types_available="['medias']"
          @addModule="$emit('addModule', $event)"
        />
      </div>
    </div>
    <div class="_repickNotice" v-if="is_repicking_location_for">
      {{ $t("click_on_map_to_repick_location_for_media") }}
      {{ is_repicking_location_for_index }}

      <button
        type="button"
        class="u-buttonLink"
        @click="is_repicking_location_for = false"
      >
        {{ $t("cancel") }}
      </button>
    </div>
  </div>
</template>
<script>
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import MapModule from "@/components/publications/cartography/MapModule.vue";
// import PublicationModule from "@/components/publications/modules/PublicationModule.vue";

export default {
  props: {
    publication_path: String,
    sections: Array,
    opened_section: [Boolean, Object],
    opened_section_modules_list: Array,
    default_layer_color: String,
    can_edit: Boolean,
  },
  components: {
    SlickItem,
    SlickList,
    ModuleCreator,
    MapModule,
    // PublicationModule,
  },
  directives: { handle: HandleDirective },
  data() {
    return {
      is_repicking_location_for: false,
    };
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
    async setRepickLocation([longitude, latitude]) {
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
    async updateOpenedLayer({ field, value }) {
      await this.$api.updateMeta({
        path: this.opened_section.$path,
        new_meta: {
          [field]: value,
        },
      });
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

._openedLayer {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;

  backdrop-filter: blur(5px);
  background: rgba(231, 231, 231, 0.7);

  padding: calc(var(--spacing) * 1);
}

._openedLayer--content {
  padding: calc(var(--spacing) * 1);
  height: 100%;
  overflow: auto;
  background: white;

  ._title {
    margin-bottom: calc(var(--spacing) * 1);
  }
}
._closeLayerBtn {
  position: absolute;
  top: 0;
  right: 0;
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

  padding: calc(var(--spacing) * 1);
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

  ._colorInd {
    width: 1em;
    height: 1em;
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
</style>
