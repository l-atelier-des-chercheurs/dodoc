<template>
  <div class="m_layerOptions">
    <div class="m_layerOptions--layerName">{{ current_layer.name }}</div>

    <button
      type="button"
      class="buttonLink _no_underline"
      @click.stop="removeLayer"
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
        style="enable-background: new 0 0 91.6 95;"
        xml:space="preserve"
      >
        <path
          d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
        />
      </svg>
      {{ $t("remove_layer") }}
    </button>

    <div v-if="current_layer.type === 'drawing'">
      <div v-for="mode in ['select', 'drawing']" :key="mode">
        <input
          type="radio"
          :id="mode"
          :name="mode"
          :value="mode"
          v-model="drawing_options.mode"
        />
        <label :for="mode">
          <span>{{ mode }}</span>
        </label>
      </div>
      <button
        type="button"
        class="buttonLink _no_underline"
        @click.stop="$eventHub.$emit('remove_selection')"
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
          style="enable-background: new 0 0 91.6 95;"
          xml:space="preserve"
        >
          <path
            d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
          />
        </svg>
        {{ $t("remove_selection") }}
      </button>
    </div>
    <div v-else-if="current_layer.type === 'medias'">
      <button
        class="buttonLink"
        @mousedown.stop.prevent="createPubliText"
        @touchstart.stop.prevent="createPubliText"
      >
        {{ $t("create_text") }}
      </button>
      <!-- <label>
        <input type="color" v-model="drawing_options.color" />
        Couleur
      </label>
      <br />
      <label>
        <input type="color" v-model="drawing_options.background_color" />
        Couleur du fond
      </label>-->
    </div>
  </div>
</template>
<script>
export default {
  props: {
    current_layer: Object,
    drawing_options: Object,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    drawing_options: {
      handler() {
        this.$emit("updateDrawingOptions", this.drawing_options);
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    removeLayer() {
      this.$emit("removeLayer", this.current_layer.id);
    },
    createPubliText() {
      // ajouter du text dans la publi
      // qui ne possède pas de lien
      this.$eventHub.$emit("publication.addMedia", {
        type: "text",
      });

      this.$eventHub.$once("publication.media_created", ({ mdata }) => {
        this.$eventHub.$emit(
          "publication.set_media_to_edit_mode",
          mdata.metaFileName
        );
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.m_layerOptions {
  padding: calc(var(--spacing) / 4);
}

.m_layerOptions--layerName {
}
</style>
