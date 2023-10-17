<template>
  <div class="_layersPane">
    <DetailsPane
      ref="details"
      :header="$t('layers')"
      :icon="'card-list'"
      :has_items="layers.length > 0 ? layers.length : false"
      :is_open_initially="true"
      :can_be_toggled="false"
    >
      <ReorderedList
        :field_name="'layers_list'"
        :items="layers"
        :path="publication.$path"
        :active_item_path="opened_layer_path"
        :can_edit="can_edit"
        @openItem="openLayer"
        v-slot="slotProps"
      >
        <span
          class="_colorInd"
          :style="
            'background-color: ' +
            (slotProps.item.section_color || default_layer_color)
          "
        />
        <span v-if="slotProps.item.section_title">
          {{ slotProps.item.section_title }}
        </span>
        <span v-else v-html="`<i>${$t('untitled')}</i>`" />
        <span class="u-nut" :data-isfilled="layerHasPins(slotProps.item)">
          {{ getNumberOfPinsInLayer(slotProps.item) }}
        </span>
      </ReorderedList>

      <template v-if="can_edit">
        <template v-if="layers.length > 0">
          <hr />
        </template>
        <button
          type="button"
          class="u-button u-button_bleuvert u-button_small"
          v-if="can_edit"
          @click="createLayer"
        >
          {{ $t("create_layer") }}
        </button>
      </template>
    </DetailsPane>

    <LayerContent
      v-if="opened_layer_path"
      :layer="opened_layer"
      :default_layer_color="default_layer_color"
      :publication="publication"
      :opened_pin_path="opened_pin_path"
      :can_edit="can_edit"
      @repickLocation="repickLocation"
      @togglePin="togglePin"
      @close="closeLayer"
    />
    <div class="_repickNotice" v-if="is_repicking_location_for">
      <div class="_repickNotice--content">
        <div>
          {{ $t("click_on_map_to_repick_location_for_media") }}
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
import LayerContent from "@/components/publications/cartography/LayerContent.vue";

export default {
  props: {
    publication: Object,
    layers: Array,
    opened_layer_path: String,
    opened_pin_path: String,
    can_edit: Boolean,
  },
  components: {
    LayerContent,
  },
  provide() {
    return {
      $getMetaFilenamesAlreadyPresent: () =>
        this.meta_filenames_already_present,
    };
  },
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
          "Cliquez sur la carte pour sélectionner une nouvelle position pour le média",
        on_this_layer: "Sur ce calque",
        on_another_layer: "Autre calque",
      },
    },
  },
  created() {},
  mounted() {
    this.$eventHub.$on("publication.map.click", this.setRepickLocation);
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.map.click", this.setRepickLocation);
  },
  watch: {},
  computed: {
    opened_layer() {
      return this.layers.find((l) => l.$path === this.opened_layer_path);
    },
    new_layer_title() {
      let idx = this.layers.length + 1;
      let new_layer_title = this.$t("layer") + " " + idx;
      while (this.layers.some((l) => l.section_title === new_layer_title)) {
        idx++;
        new_layer_title = this.$t("layer") + " " + idx;
      }
      return new_layer_title;
    },
    meta_filenames_already_present() {
      const { current, other } = this.getMediasAlreadyPresentInPublication({
        publication: this.publication,
        sections: this.layers,
        opened_section_meta_filename: this.getFilename(this.opened_layer_path),
      });

      return [
        {
          label: this.$t("on_this_layer"),
          medias: current,
          color: "var(--c-orange)",
          // todo later ?
          // color: this.opened_layer.section_color || this.default_layer_color,
        },
        {
          label: this.$t("on_another_layer"),
          medias: other,
          color: "var(--c-bleuvert)",
        },
      ];
    },
  },
  methods: {
    openLayer(path) {
      this.$emit("update:opened_layer_path", path);
    },
    closeLayer() {
      this.$emit("update:opened_layer_path", undefined);
    },
    togglePin(pin_path) {
      if (pin_path === this.opened_pin_path)
        this.$emit("update:opened_pin_path", undefined);
      else this.$emit("update:opened_pin_path", pin_path);
    },
    layerHasPins(layer) {
      return this.getNumberOfPinsInLayer(layer) > 0;
    },
    getNumberOfPinsInLayer(layer) {
      return Array.isArray(layer.modules_list) ? layer.modules_list.length : 0;
    },
    async createLayer() {
      await this.createSection2({
        publication: this.publication,
        type: "layer",
        group: "layers_list",
        title: this.new_layer_title,
      });
    },
    updateOrder(items) {
      const layers_list = items.map((i) => {
        return {
          meta_filename: this.getFilename(i.$path),
        };
      });
      // if (JSON.stringify(sections_list) === JSON.stringify(this.sections_list))
      //   return "no_update_necessary";
      this.$api.updateMeta({
        path: this.publication.$path,
        new_meta: {
          layers_list,
        },
      });
    },

    isActive(path) {
      return path === this.opened_layer_path;
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

._colorInd {
  display: inline-block;
  width: 1em;
  height: 1em;
}
</style>
