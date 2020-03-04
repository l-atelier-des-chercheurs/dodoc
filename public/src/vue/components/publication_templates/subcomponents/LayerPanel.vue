<template>
  <div class="m_layerPanel">
    <div class="m_layerPanel--layerList">
      <div class="m_layerPanel--layerList--topbar">
        <label v-if="!show_create_layer_modal">
          <button
            type="button"
            class="button-nostyle text-uc button-triangle padding-verysmall"
            :class="{ 'is--active': show_layers }"
            @click="show_layers = !show_layers"
          >
            {{ $t("layers") }}
            <template v-if="layers.length > 0">– {{ layers.length }}</template>
          </button>
        </label>
        <button
          type="button"
          class="buttonLink"
          @click="show_create_layer_modal = false"
          v-else
        >{{ $t("cancel") }}</button>

        <button
          type="button"
          class="buttonLink"
          :class="{ 'is--active': show_create_layer_modal }"
          @click="show_create_layer_modal = !show_create_layer_modal"
        >{{ $t("create") }}</button>
      </div>

      <form
        v-if="show_create_layer_modal"
        class="m_layerPanel--layerList--createLayer padding-verysmall"
        @submit.prevent="createLayer"
      >
        <div class="margin-bottom-small">
          <label>{{ $t("layer_name") }}</label>
          <input type="text" required autofocus ref="newLayerInputName" v-model="new_layer_name" />
        </div>

        <div class="margin-bottom-small">
          <label>{{ $t("layer_type") }}</label>
          <select v-model="new_layer_type">
            <option value="drawing">{{ $t("drawing") }}</option>
            <option value="medias">{{ $t("medias") }}</option>
          </select>
          <small>
            <template v-if="new_layer_type === 'drawing'">
              {{
              $t("drawing_layer_instructions")
              }}
            </template>
            <template v-else-if="new_layer_type === 'medias'">
              {{
              $t("medias_layer_instructions")
              }}
            </template>
          </small>
        </div>

        <input
          type="submit"
          class="button button-bg_rounded bg-bleuvert margin-top-small"
          :disabled="!new_layer_name"
        />
      </form>

      <SlickList
        v-else-if="show_layers"
        v-model="sorted_layers"
        lockAxis="y"
        axis="y"
        :useDragHandle="true"
      >
        <SlickItem
          v-for="(layer, index) in sorted_layers"
          :key="layer.id"
          :index="index"
          style="z-index: 1;"
        >
          <div
            @click="toggleActiveLayer(layer.id)"
            class="m_layerPanel--layerList--layer"
            :class="{
            'is--active':
              layer.id === $root.settings.current_publication.layer_id
          }"
          >
            <div class="_vignette" :class="['_vignette_' + layer.type]">
              <input
                v-if="layer.type === 'drawing'"
                type="color"
                @click.stop="
                $root.settings.current_publication.layer_id = layer.id
              "
                :value="layer.color"
                @change="updateLayerColor({ $event, id: layer.id })"
              />
            </div>
            <div class>
              <span class="text-ellipsis">{{ layer.name }}</span>
              <br />
              <span class="label">
                <template v-if="layer.type === 'drawing'">
                  {{
                  $t("drawing")
                  }}
                </template>
                <template v-if="layer.type === 'medias'">
                  <template v-if="!mediasFromLayer(layer.id)">
                    {{
                    $t("media")
                    }}
                  </template>
                  <template v-else>
                    <template v-if="mediasFromLayer(layer.id).length === 1">
                      {{
                      mediasFromLayer(layer.id).length +
                      " " +
                      $t("media").toLowerCase()
                      }}
                    </template>
                    <template v-else>
                      {{
                      mediasFromLayer(layer.id).length +
                      " " +
                      $t("medias").toLowerCase()
                      }}
                    </template>
                  </template>
                </template>
              </span>
            </div>
            <div v-handle class="_handle" />
          </div>
        </SlickItem>
      </SlickList>
    </div>

    <LayerOptions
      v-if="current_layer"
      :current_layer="current_layer"
      :drawing_options="drawing_options"
      @updateDrawingOptions="v => $emit('updateDrawingOptions', v)"
      @removeLayer="id => removeLayer(id)"
    />
  </div>
</template>
<script>
import LayerOptions from "./LayerOptions.vue";
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    layers: Array,
    medias: Object,
    slugPubliName: String,
    publication: Object,
    drawing_options: Object
  },
  components: {
    LayerOptions,
    SlickItem,
    SlickList
  },
  directives: { handle: HandleDirective },
  data() {
    return {
      show_create_layer_modal: false,
      new_layer_name: "",
      new_layer_type: "drawing",
      show_layers: true
    };
  },
  created() {},
  mounted() {
    this.$root.settings.current_publication.layer_id = false;
    if (this.sorted_layers.length > 0)
      this.toggleActiveLayer(this.sorted_layers[0].id);
  },
  beforeDestroy() {
    this.$root.settings.current_publication.layer_id = false;
    this.$root.settings.current_publication.accepted_media_type = [];
  },
  watch: {
    "$root.settings.current_publication.layer_id": function() {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `WATCH • LayerPanel: $root.settings.current_publication.layer_id`
        );

      if (this.current_layer && this.current_layer.type === "medias") {
        this.$root.settings.current_publication.accepted_media_type = [
          "image",
          "video",
          "audio",
          "text",
          "document",
          "other"
        ];
      } else {
        this.$root.settings.current_publication.accepted_media_type = [];
      }
    },
    show_create_layer_modal: function() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`WATCH • LayerPanel: show_create_layer_modal`);

      if (this.show_create_layer_modal) {
        this.$nextTick(() => {
          this.$refs.newLayerInputName.focus();
        });
      }
    }
  },
  computed: {
    sorted_layers: {
      get() {
        return this.layers.slice().reverse();
      },
      set(new_layers) {
        const layers = new_layers.reverse();
        this.layers = layers;
        this.$root.editFolder({
          type: "publications",
          slugFolderName: this.slugPubliName,
          data: {
            layers
          }
        });
      }
    },
    current_layer() {
      if (
        !this.$root.settings.current_publication.layer_id ||
        !Array.isArray(this.publication.layers)
      )
        return false;
      return this.publication.layers.find(
        l => l.id === this.$root.settings.current_publication.layer_id
      );
    }
  },
  methods: {
    toggleActiveLayer(id) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • LayerPanel: toggleActiveLayer with id = ${id}`);
      if (id === this.$root.settings.current_publication.layer_id)
        this.$root.settings.current_publication.layer_id = false;
      else this.$root.settings.current_publication.layer_id = id;
    },
    mediasFromLayer(id) {
      if (typeof this.medias !== "object") return [];
      return Object.values(this.medias).filter(m => m.layer_id === id);
    },
    updateLayerColor({ $event, id }) {
      const new_color = $event.target.value;
      const layers = this.publication.layers.map(l => {
        if (l.id === id) l.color = new_color;
        return l;
      });
      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          layers
        }
      });
    },
    createLayer() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • LayerPanel: createLayer`);

      let layers = [];
      if (
        this.publication.hasOwnProperty("layers") &&
        this.publication.layers.length > 0
      ) {
        layers = this.publication.layers.slice();
      }

      const index = this.publication.layers.length + 1;
      const layer_id = this.generateID();

      layers.splice(index, 0, {
        type: this.new_layer_type,
        name: this.new_layer_name,
        id: layer_id,
        color: "#000000"
      });

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          layers
        }
      });

      this.$eventHub.$once("socketio.publications.folder_listed", () =>
        this.toggleActiveLayer(layer_id)
      );

      // if creating a drawing layer, we’ll need to create the media that will
      // store its content as well

      if (this.new_layer_type === "drawing") {
        this.$root.createMedia({
          slugFolderName: this.slugPubliName,
          type: "publications",
          additionalMeta: {
            layer_id,
            canvas_information: ""
          }
        });
      }

      this.new_layer_type = "medias";
      this.new_layer_name = "";
      this.show_create_layer_modal = false;
    },
    generateID() {
      return (
        +new Date() +
        "_" +
        (Math.random().toString(36) + "00000000000000000").slice(2, 3)
      );
    },
    removeLayer(id) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • LayerPanel: removeLayer`);

      if (
        !this.publication.hasOwnProperty("layers") ||
        this.publication.layers.length === 0
      ) {
        return;
      }

      let layers = this.publication.layers.filter(l => l.id !== id);

      if (id === this.$root.settings.current_publication.layer_id)
        this.$root.settings.current_publication.layer_id = false;

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          layers
        }
      });
    }
  }
};
</script>
<style lang="scss"></style>
