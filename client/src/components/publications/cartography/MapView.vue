<template>
  <div class="_mapView">
    <LayersPane
      v-if="can_edit || sections.length > 1"
      :publication_path="publication.$path"
      :sections="sections"
      :opened_section="opened_section"
      :opened_section_modules_list="opened_section_modules_list"
      :default_layer_color="default_layer_color"
      :can_edit="can_edit"
      @createSection="$emit('createSection', $event)"
      @openSection="$emit('openSection', $event)"
      @closeSection="$emit('closeSection')"
      @updateOrder="$emit('updateOrder', $event)"
      @addModule="$emit('addModule', $event)"
      @insertModule="$emit('insertModule', $event)"
      @moveModuleTo="$emit('moveModuleTo', $event)"
      @removeModule="$emit('removeModule', $event)"
      @duplicatePublicationMedia="$emit('duplicatePublicationMedia', $event)"
    />
    <DisplayOnMap
      class="_mapContainer"
      :start_coords="start_coords"
      :start_zoom="start_zoom"
      :pins="pins"
      :lines="lines"
      :link_pins="opened_section_link_pins"
      :is_small="false"
    />

    <div class="_textContainer" v-if="false">
      <div class="_views">
        <DLabel :str="$t('views_list')" />

        <button
          type="button"
          class="_viewPreview"
          v-for="(view, index) in views_list"
          :key="index"
          @click="openView(index)"
        >
          <sl-badge pill>{{ index + 1 }}</sl-badge>
          <strong>
            {{ view.title }}
          </strong>
        </button>
      </div>

      <transition name="slideup" :duration="150" mode="out-in">
        <div class="_openedView" v-if="opened_view_id !== false">
          <h2>
            {{ opened_view.title }}
          </h2>

          <sl-button
            variant="default"
            size="medium"
            circle
            class="_closeBtn"
            @click="closeView"
          >
            <sl-icon name="x" :label="$t('close')"></sl-icon>
          </sl-button>
          <hr />

          <CollaborativeEditor2
            ref="textBloc"
            :path="''"
            :content="opened_view.text"
            :can_edit="false"
          />
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import LayersPane from "@/components/publications/cartography/LayersPane.vue";

export default {
  props: {
    publication: Object,
    sections: Array,
    opened_section: [Boolean, Object],
    opened_section_modules_list: Array,
    can_edit: Boolean,
  },
  components: {
    LayersPane,
    DisplayOnMap: () => import("@/adc-core/fields/DisplayOnMap.vue"),
  },
  data() {
    return {
      views_list: [
        {
          title: "Présentation du territoire",
          text: `<p>Pellentesque vehicula consequat mi nec efficitur. Etiam nunc massa, congue ut justo ac, cursus fringilla nisi. Aliquam erat volutpat. Integer
          vulputate hendrerit sodales. Duis varius, purus sit amet varius dapibus, velit est pellentesque lectus, quis auctor orci urna sed sapien. Curabitur
          at risus quis magna lacinia ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce fringilla nulla sit amet tempus maximus.
          </p><p>Etiam bibendum nec metus nec pulvinar. Duis tristique, erat eu ornare tincidunt, ante elit blandit dui, sit amet volutpat massa felis mattis lectus. Vestibulum commodo felis libero, eu convallis mi faucibus vestibulum. Pellentesque condimentum ullamcorper interdum. Duis vel varius diam. Nulla aliquam ipsum nisi, sed vestibulum neque porttitor sit amet. Nullam quis consectetur tellus. Pellentesque mattis eget velit ut elementum. Maecenas tincidunt sollicitudin feugiat. Nam eleifend nisl ut erat blandit, quis bibendum ex gravida. Mauris nec feugiat lacus. Vestibulum gravida dapibus condimentum. Sed eu maximus urna, id rutrum ipsum. Nam vitae velit sem.</p>'`,
          map_center: [5.39057449011251, 43.310173305629576],
          map_zoom: 12,
        },
        {
          title: "Les point de vue des habitants",
          text: `<p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce fringilla nulla sit amet tempus maximus.
        </p>'`,
          map_center: [5.38134192070759, 43.27892369030499],
          map_zoom: 16,
        },
        {
          title: "Le tissu associatif",
          text: `<p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce fringilla nulla sit amet tempus maximus.
        </p>'`,
          map_center: [5.331893135466207, 43.359606738182094],
          map_zoom: 14,
        },
      ],

      default_layer_color: "#333",
      opened_view_id: false,
    };
  },
  i18n: {
    messages: {
      fr: {
        views_list: "Liste des vues",
      },
    },
  },

  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    start_coords() {
      return this.publication.map_initial_location || false;
    },
    start_zoom() {
      return this.publication.map_initial_zoom || 10;
    },
    opened_view() {
      if (this.opened_view_id === false) return false;
      return this.views_list[this.opened_view_id];
    },
    opened_section_link_pins() {
      return this.opened_section?.link_pins === true;
    },
    pins() {
      return this.sections.reduce((acc, s) => {
        if (!Array.isArray(s.modules_list)) return acc;
        s.modules_list.map((meta_filename, index) => {
          const _module = this.findModuleFromMetaFilename({
            files: this.publication.$files,
            meta_filename,
          });
          if (
            _module &&
            _module.location?.longitude &&
            _module.location?.latitude
          ) {
            acc.push({
              longitude: _module.location.longitude,
              latitude: _module.location.latitude,
              index: index,
              label: this.$t("media") + " " + (index + 1),
              color: s.section_color || `#333`,
              path: _module.$path,
              belongs_to_layer: s.$path,
              link_pins: s.link_pins || false,
            });
          }
        });
        return acc;
      }, []);
    },
    lines() {
      if (this.pins.length === 0) return false;
      return this.pins.reduce((acc, pin) => {
        if (pin.link_pins) {
          const layer = pin.belongs_to_layer;
          if (!Object.prototype.hasOwnProperty.call(acc, layer))
            acc[layer] = {
              color: pin.color,
              coordinates: [],
            };
          acc[layer].coordinates.push([pin.longitude, pin.latitude]);
        }
        return acc;
      }, {});
    },
  },
  methods: {
    openView(index) {
      this.opened_view_id = index;
      this.$eventHub.$emit("publication.map.navigateTo", {
        center: this.opened_view.map_center,
        zoom: this.opened_view.map_zoom,
      });
    },
    closeView() {
      this.opened_view_id = false;
      this.$eventHub.$emit("publication.map.navigateTo", {
        zoom: this.start_zoom,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._mapView {
  width: 100%;
  height: 80vh;
  background: var(--c-gris);
  border-radius: 4px;
  overflow: hidden;

  display: flex;
  flex-flow: row wrap;
}
._mapContainer {
  height: 100%;
}
._textContainer {
  position: relative;

  height: 100%;
  flex: 1 1 200px;
  max-width: 320px;
  padding: calc(var(--spacing) / 2);
  background: var(--panel-color);
  border: var(--panel-borders);
  box-shadow: var(--panel-shadows);
  text-align: left;
}

._views {
}

._viewPreview {
  background: var(--c-gris_clair);
  padding: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 2);

  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  &:hover {
    background: var(--c-gris_fonce);
  }
}
._openedView {
  position: absolute;
  top: calc(var(--spacing) / 4);
  left: calc(var(--spacing) / 4);
  width: calc(100% - calc(var(--spacing) / 2));
  height: 100%;
  overflow: auto;
  background: white;
  padding: calc(var(--spacing) / 2);
}

._closeBtn {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
