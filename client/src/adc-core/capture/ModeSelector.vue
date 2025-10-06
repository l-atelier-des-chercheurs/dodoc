<template>
  <div class="_modeSelector">
    <div class="_arrows" v-if="available_modes.length > 1">
      <button
        type="button"
        class="u-button u-button_transparent"
        @click.stop.prevent="previousMode"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="169px"
          height="169px"
          viewBox="0 0 169 169"
          style="enable-background: new 0 0 169 169"
          xml:space="preserve"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            stroke-width="10"
            stroke-linejoin="round"
            d="M60.2,84.5l48.6-24.3l0,48.6L60.2,84.5z"
          />
        </svg>
      </button>
    </div>

    <div v-for="mode in available_modes" :key="mode">
      <input
        type="radio"
        :id="id + '_' + mode"
        :value="mode"
        :checked="selected_mode === mode"
        @click="$emit('changeMode', mode)"
      />
      <label :for="id + '_' + mode">
        <div class="_picto" :content="$t(mode)">
          <!-- v-tippy="
                  mode !== selected_mode
                    ? {
                        placement: 'bottom',
                        delay: [600, 0],
                      }
                    : ''
                " -->
          <img :src="available_mode_picto[mode]" />
        </div>
        <span v-if="selected_mode === mode">{{ $t(mode) }}</span>
      </label>
    </div>

    <div class="_arrows" v-if="available_modes.length > 1">
      <button
        type="button"
        class="u-button u-button_transparent"
        @click.stop.prevent="nextMode"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="169px"
          height="169px"
          viewBox="0 0 169 169"
          style="enable-background: new 0 0 169 169"
          xml:space="preserve"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            stroke-width="10"
            stroke-linejoin="round"
            d="M108.8,84.5l-48.6,24.3V60.2L108.8,84.5z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    available_modes: Array,
    selected_mode: String,
    disable_change_mode: Boolean,
  },
  components: {},
  data() {
    return {
      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5),

      available_mode_picto: {
        photo: this.$root.publicPath + "images/i_icone-dodoc_image.svg",
        video: this.$root.publicPath + "images/i_icone-dodoc_video.svg",
        stopmotion: this.$root.publicPath + "images/i_icone-dodoc_anim.svg",
        audio: this.$root.publicPath + "images/i_icone-dodoc_audio.svg",
        vecto: this.$root.publicPath + "images/i_icone-dodoc_vecto.svg",
        lines: this.$root.publicPath + "images/i_icone-dodoc_lines.svg",
      },
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("capture.navigate.previous", this.previousMode);
    this.$eventHub.$on("capture.navigate.next", this.nextMode);
  },
  beforeDestroy() {
    this.$eventHub.$off("capture.navigate.previous", this.previousMode);
    this.$eventHub.$off("capture.navigate.next", this.nextMode);
  },
  watch: {},
  computed: {},
  methods: {
    previousMode() {
      if (this.disable_change_mode) return;

      let current_mode_index = this.available_modes.indexOf(this.selected_mode);

      if (current_mode_index > 0) {
        this.$emit("changeMode", this.available_modes[current_mode_index - 1]);
      } else {
        this.$emit(
          "changeMode",
          this.available_modes[this.available_modes.length - 1]
        );
      }
    },
    nextMode() {
      if (this.disable_change_mode) return;

      let current_mode_index = this.available_modes.indexOf(this.selected_mode);
      if (current_mode_index < this.available_modes.length - 1) {
        this.$emit("changeMode", this.available_modes[current_mode_index + 1]);
      } else {
        this.$emit("changeMode", this.available_modes[0]);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._modeSelector {
  position: absolute;
  z-index: 1;
  display: flex;
  left: 0;
  right: 0;
  // width: 100%;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  padding: calc(var(--spacing) / 1);
  gap: calc(var(--spacing) / 2);
  user-select: none;
  pointer-events: none;

  font-family: "Fira Code";
  color: var(--c-orange);

  input[disabled] + label {
    filter: grayscale(100%);
    // opacity: 0.3;
    cursor: not-allowed;
  }

  > * {
    flex: 0 0 auto;
    display: flex;
    flex-flow: row wrap;
    font-family: inherit;
    pointer-events: auto;
    // background-color: white;
  }
  > ._arrows {
    padding: 0;

    button {
      padding: 0;
      min-height: 0;
    }

    svg {
      width: 36px;
      height: 36px;
      padding: 4px;
      // padding: calc(var(--spacing) / 4) calc(var(--spacing) / 4);
    }

    &:hover,
    &:focus {
      // background-color: var(--c-gris-fonce);
    }
  }

  input {
    width: 0px;
    height: 0px;
    display: none;

    &:not(:checked) + label:not(:hover) {
      // opacity: 0.3;
      // background: transparent;
    }
  }

  input:checked + label {
    background-color: var(--c-orange);
    span {
      // color: white;
    }
  }

  input[disabled] + label {
    filter: grayscale(100%);
    opacity: 0.3;
    cursor: not-allowed;
  }

  label {
    font-size: inherit;
    font-family: inherit;
    display: inline-block;
    text-decoration: none;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 0.06em;
    flex-shrink: 0;
    margin: 0;
    cursor: pointer;
    // min-height: 2.43rem;
    border-radius: 6px;
    transition: color 0.25s ease-out, opacity 0.5s;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    letter-spacing: 0;
    // padding: 0 0.405rem;
    // margin: calc(var(--spacing) / 4) calc(var(--spacing) / 4);
    margin: 0;
    text-align: center;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }

  ._picto {
    border-radius: 50%;
    overflow: hidden;
    display: block;
    width: 36px;
    height: 36px;

    // margin: calc(var(--spacing) / 8);

    padding: 4px;
    color: #fff;

    margin-right: 0;
  }

  span {
    display: block;
    font-weight: 400;
    text-transform: lowercase;
    margin: 0.405rem;
    font-size: 0.8rem;
    font-family: Fira Mono;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 0.05em;
    color: var(--c-noir);
    font-weight: 600;
  }
}
</style>
