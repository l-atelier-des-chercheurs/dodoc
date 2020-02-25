<template>
  <div class="m_layerPanel">
    <div class="m_layerPanel--topbar">
      <label>{{ $t("layers") }}</label>
      <button type="button" class="buttonLink" @click="createLayer">
        {{ $t("create") }}
      </button>
    </div>
    <div
      v-for="layer in layers.slice().reverse()"
      :key="layer.id"
      class="m_layerPanel--layer"
      @click="toggleActiveLayer(layer.id)"
      :class="{
        'is--active': layer.id === $root.settings.current_publication.layer_id
      }"
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
      <div class="">
        <span class="text-ellipsis">{{ layer.id }}</span
        ><br />
        <span v-if="publication_medias.hasOwnProperty(layer.id)" class="label">
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
    return {};
  },
  created() {},
  mounted() {
    this.$root.settings.current_publication.layer_id = false;
  },
  beforeDestroy() {
    this.$root.settings.current_publication.layer_id = false;
  },
  watch: {},
  computed: {},
  methods: {
    toggleActiveLayer(id) {
      if (id === this.$root.settings.current_publication.layer_id)
        this.$root.settings.current_publication.layer_id = false;
      else this.$root.settings.current_publication.layer_id = id;
    },
    createLayer() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • DrawingPad: createLayer`);

      let layers = [];
      if (
        this.publication.hasOwnProperty("layers") &&
        this.publication.layers.length > 0
      ) {
        layers = this.publication.layers.slice();
      }

      const index = this.publication.layers.length + 1;

      layers.splice(index, 0, {
        id: this.generateID()
      });

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          layers
        }
      });
    },
    generateID() {
      return (
        +new Date() +
        "_" +
        (Math.random().toString(36) + "00000000000000000").slice(2, 3)
      );
    },
    removeLayer(id) {
      console.log("removeLayer");
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
