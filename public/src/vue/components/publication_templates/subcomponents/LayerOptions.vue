<template>
  <div class="m_layerOptions">
    <div class="m_layerOptions--topbar">
      <div class="m_layerOptions--topbar--layerName">
        {{ current_layer.name }}
      </div>

      <button
        type="button"
        class="buttonLink _no_underline"
        @click.stop="removeLayer"
        :content="$t('remove_layer')"
        v-tippy="{
          placement: 'top',
          delay: [600, 0],
        }"
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
      </button>
    </div>

    <div class="m_layerOptions--content">
      <div v-if="current_layer.type === 'drawing'">
        <div v-for="mode in ['drawing', 'select']" :key="mode">
          <input
            type="radio"
            :id="mode"
            :name="mode"
            :value="mode"
            v-model="drawing_options.mode"
          />
          <label :for="mode">
            <span>{{ $t(mode) }}</span>
          </label>
        </div>
        <div v-if="drawing_options.mode === 'select'">
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

        <div v-if="drawing_options.mode === 'drawing'">
          <label>
            <input type="color" v-model="drawing_options.color" />
            Couleur
          </label>
        </div>
      </div>
      <div v-else-if="current_layer.type === 'medias'">
        <PublicationButtons
          :page_medias="[]"
          :slugPubliName=""
          @addMedia="createPubliMedia"
        />
      </div>
    </div>
  </div>
</template>
<script>
import PublicationButtons from "./PublicationButtons.vue";

export default {
  props: {
    current_layer: Object,
  },
  components: {
    PublicationButtons,
  },
  data() {
    return {
      drawing_options: {
        color: this.current_layer.hasOwnProperty("color")
          ? this.current_layer.color
          : "#000000",
        mode: this.current_layer.hasOwnProperty("mode")
          ? this.current_layer.mode
          : "drawing",
      },
    };
  },
  created() {
    this.$eventHub.$emit("updateDrawingOptions", this.drawing_options);
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    drawing_options: {
      handler() {
        if (this.$root.state.dev_mode === "debug")
          console.log(`WATCH • DrawingLayer: drawing_options`);

        this.$emit("updateDrawingOptions", this.drawing_options);
        this.$eventHub.$emit("updateDrawingOptions", this.drawing_options);
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    removeLayer() {
      this.$emit("removeLayer");
    },
    createPubliMedia(values) {
      // ajouter du text dans la publi
      // qui ne possède pas de lien
      this.$eventHub.$emit("publication.addMedia", {
        values,
      });

      this.$eventHub.$once("publication.media_created", ({ mdata }) => {
        if (values.type === "text") {
          this.$eventHub.$emit(
            "publication.set_media_to_edit_mode",
            mdata.metaFileName
          );
        }
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
