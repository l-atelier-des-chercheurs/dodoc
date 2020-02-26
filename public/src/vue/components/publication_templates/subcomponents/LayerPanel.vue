<template>
  <div class="m_layerPanel">
    <div class="m_layerPanel--topbar">
      <label>{{ $t("layers") }}</label>
      <button
        type="button"
        class="buttonLink"
        :class="{ 'is--active': show_create_layer_modal }"
        @click="show_create_layer_modal = !show_create_layer_modal"
      >{{ $t("create") }}</button>
    </div>

    <form
      v-if="show_create_layer_modal"
      class="m_layerPanel--createLayer padding-verysmall"
      @submit.prevent="createLayer"
    >
      <div class="margin-bottom-small">
        <label>{{ $t("layer_name") }}</label>
        <input type="text" required autofocus v-model="new_layer_name" />
      </div>

      <div class="margin-bottom-small">
        <label>{{ $t("layer_type") }}</label>
        <select v-model="new_layer_type">
          <option value="drawing">{{ $t("drawing") }}</option>
          <option value="medias">{{ $t("medias") }}</option>
        </select>
        <small>
          <template v-if="new_layer_type === 'drawing'">{{ $t("drawing_layer_instructions") }}</template>
          <template v-else-if="new_layer_type === 'medias'">{{ $t("medias_layer_instructions") }}</template>
        </small>
      </div>

      <input
        type="submit"
        class="button button-bg_rounded bg-bleuvert margin-top-small"
        :disabled="!new_layer_name"
      />
    </form>
    <div
      v-else
      v-for="layer in layers.slice().reverse()"
      :key="layer.id"
      class="m_layerPanel--layer"
      :class="{
        'is--active': layer.id === $root.settings.current_publication.layer_id
      }"
      @click.stop="toggleActiveLayer(layer.id)"
    >
      <button
        type="button"
        class="buttonLink _no_underline"
        @click.stop="toggleActiveLayer(layer.id)"
        :class="{
          'is--active': layer.id === $root.settings.current_publication.layer_id
        }"
      >
        <svg
          version="1.1"
          class="inline-svg"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="100.7px"
          height="101px"
          viewBox="0 0 100.7 101"
          style="enable-background:new 0 0 100.7 101;"
          xml:space="preserve"
        >
          <path
            class="st0"
            d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
              L19.1,91.5z"
          />
        </svg>
      </button>
      <div class>
        <span class="text-ellipsis">{{ layer.name }}</span>
        <br />
        <span class="label">
          <template v-if="layer.type === 'drawing'">{{ $t("drawing") }}</template>
          <template v-if="layer.type === 'medias'">
            <template v-if="!publication_medias.hasOwnProperty(layer.id)">{{ $t("media") }}</template>
            <template v-else>
              <template v-if="publication_medias[layer.id].length === 1">
                {{
                publication_medias[layer.id].length +
                " " +
                $t("media").toLowerCase()
                }}
              </template>
              <template v-else>
                {{
                publication_medias[layer.id].length +
                " " +
                $t("medias").toLowerCase()
                }}
              </template>
            </template>
          </template>
        </span>
      </div>
      <button
        v-if="layer.id === $root.settings.current_publication.layer_id"
        type="button"
        class="buttonLink _no_underline"
        @click.stop="removeLayer(layer.id)"
        :disabled="read_only"
      >
        <svg
          version="1.1"
          class="inline-svg"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="91.6px"
          height="95px"
          viewBox="0 0 91.6 95"
          style="enable-background:new 0 0 91.6 95;"
          xml:space="preserve"
        >
          <path
            class="st0"
            d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    layers: Array,
    publication_medias: Object,
    slugPubliName: String,
    publication: Object
  },
  components: {},
  data() {
    return {
      show_create_layer_modal: false,
      new_layer_name: "",
      new_layer_type: "drawing"
    };
  },
  created() {},
  mounted() {
    this.$root.settings.current_publication.layer_id = false;
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
    }
  },
  computed: {
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
      console.log(this.$root.settings.current_publication.layer_id);
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
        id: layer_id
      });

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          layers
        }
      });

      // if creating a drawing layer, we’ll need to create the media that will
      // store its content as well

      if (this.new_layer_type === "drawing") {
        this.$root.createMedia({
          slugFolderName: this.slugPubliName,
          type: "publications",
          additionalMeta: {
            layer_id,
            canvas_information: "",
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
