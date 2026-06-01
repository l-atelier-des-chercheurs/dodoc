<template>
  <div class="m_mediaValidationButtons">
    <button
      type="button"
      class="u-button u-button_transparent _arrows"
      @click="selectedMoveLeft"
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
        <path fill="currentColor" d="M60.2,84.5l48.6-24.3l0,48.6L60.2,84.5z" />
      </svg>
    </button>

    <button
      type="button"
      class="u-button u-button_black"
      @mousedown.stop.prevent="validateButton(0)"
      @touchstart.stop.prevent="validateButton(0)"
      :class="{ 'is--active': selected_button === 0 }"
      @mouseover="selected_button = 0"
    >
      <template v-if="cancelButtonIsBackButton">
        <span class>‹ {{ $t("back") }}</span>
      </template>
      <template v-else>
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 168 168"
          style="enable-background: new 0 0 168 168"
          xml:space="preserve"
        >
          <polygon
            fill="currentColor"
            points="42.6,57.2 57.5,42.4 84.1,69 110.8,42.4 125.6,57.2 99,83.9 125.6,110.5 110.8,125.4 
        84.1,98.7 57.5,125.4 42.6,110.5 69.3,83.9"
          />
        </svg>
        {{ $t("cancel") }}
      </template>
    </button>

    <div class="_valStarBtns">
      <button
        type="button"
        @click="validateButton(1)"
        class="u-button u-button_red _checkBtn"
        :class="{ 'is--active': selected_button === 1 }"
        :title="$t('save')"
        @mouseover="selected_button = 1"
      >
        <svg
          version="1.1"
          class
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 168 168"
          style="enable-background: new 0 0 168 168"
          xml:space="preserve"
        >
          <rect
            x="51.4"
            y="73.1"
            transform="matrix(0.7071 -0.7071 0.7071 0.7071 -53.857 72.9892)"
            width="19.5"
            height="56.8"
            fill="currentColor"
          />
          <rect
            x="53.2"
            y="77.3"
            transform="matrix(0.7071 -0.7071 0.7071 0.7071 -31.6875 97.6563)"
            width="97.6"
            height="19.5"
            fill="currentColor"
          />
        </svg>
        <span>{{ $t("save") }}</span>

        <!-- <span class="u-icon" v-html="dodoc_icon_collect" /> -->
      </button>

      <button
        type="button"
        v-if="can_add_to_fav"
        @click="validateButton(2)"
        class="u-button u-button_red _favBtn"
        :class="{ 'is--active': selected_button === 2 }"
        :title="$t('add_to_fav')"
        @mouseover="selected_button = 2"
      >
        <b-icon :icon="selected_button === 2 ? 'star-fill' : 'star'" />
      </button>
    </div>

    <button
      type="button"
      class="u-button u-button_transparent u-colorOrange _arrows"
      @click="selectedMoveRight"
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
        <path fill="currentColor" d="M108.8,84.5l-48.6,24.3V60.2L108.8,84.5z" />
      </svg>
    </button>

    <div class="m_mediaValidationButtons--overlay" v-if="media_is_being_sent">
      <transition name="fade_fast" :duration="150">
        <LoaderSpinner />
      </transition>
      <span
        class="m_mediaValidationButtons--overlay--percent"
        v-text="media_being_sent_percent + '%'"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    media_is_being_sent: Boolean,
    media_being_sent_percent: Number,
    can_add_to_fav: Boolean,
    cancelButtonIsBackButton: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      selected_button: 1,
    };
  },

  created() {},
  mounted() {
    document.addEventListener("keyup", this.captureKeyListener);
  },
  beforeDestroy() {
    document.removeEventListener("keyup", this.captureKeyListener);
  },

  watch: {},
  computed: {},
  methods: {
    captureKeyListener(evt) {
      console.log("METHODS • MediaValidationButtons: captureKeyListener");

      switch (evt.key) {
        case "w":
        case "z":
        case "ArrowLeft":
          this.selectedMoveLeft();
          break;
        case "s":
        case "ArrowRight":
          this.selectedMoveRight();
          break;
        case "a":
        case "q":
        case " ":
          this.validateButton(this.selected_button);
          break;
      }

      evt.preventDefault();
      return false;
    },
    selectedMoveLeft() {
      console.log(
        "METHODS • MediaValidationButtons: captureKeyListener / goleft"
      );
      this.selected_button += this.selected_button > 0 ? -1 : 0;
    },
    selectedMoveRight() {
      console.log(
        "METHODS • MediaValidationButtons: captureKeyListener / goright"
      );
      this.selected_button += this.selected_button < 2 ? +1 : 0;
    },
    validateButton(idx) {
      if (idx === 0) {
        this.$emit("cancel");
      } else if (idx === 1) {
        this.$emit("save");
      } else if (idx === 2) {
        this.$emit("save_and_fav");
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.m_mediaValidationButtons {
  position: relative;
  z-index: 105;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  justify-content: space-around;
  align-items: center;
  padding: calc(var(--spacing) / 2);
  flex: 0 0 auto;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.06em;

  font-size: var(--font-verysmall);
  height: auto;

  background-color: var(--c-noir);

  > * {
    flex: 0 1 200px;
    display: flex;
    align-items: center;
  }

  .m_mediaValidationButtons--overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(53, 53, 53, 1);
    --loader-bg-color: transparent;
    --loader-border-color: var(--c-rouge);

    ::v-deep .u-loader {
      background-color: transparent;
    }

    .m_mediaValidationButtons--overlay--percent {
      position: absolute;
      margin-left: 8em;
      z-index: 55000;
      color: white;
      padding: 2px;
      border-radius: 4px;
    }
  }

  button {
    svg {
      width: 2rem;
      height: 2rem;
    }
  }
}

._arrows {
  display: none;
}

._valStarBtns {
  display: flex;
  align-items: stretch;
}

._favBtn {
  margin-left: -5px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

._checkBtn {
  rect {
    fill: transparent;
    stroke: white;
    stroke-width: 6px;
    fill: var(--c-rouge);
  }

  &.is--active {
    rect {
      fill: white;
    }
  }
}

._locationBtn {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin: calc(var(--spacing) / 1);
}
</style>
