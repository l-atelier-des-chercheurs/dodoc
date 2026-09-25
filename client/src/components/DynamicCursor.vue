<template>
  <transition name="toggleCursor">
    <div
      id="cursor"
      class="_cursor"
      :style="{ left: left, top: top }"
      v-if="show_cursor && !is_in_active_state"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1"
        x="0px"
        y="0px"
        viewBox="0 0 77.606 108.79374999999999"
        enable-background="new 0 0 77.606 87.035"
        xml:space="preserve"
      >
        <!-- <polygon points="49.211,80.542 49.211,80.542 49.211,80.542  " /> -->
        <path
          d="M52.213,87.035l-3.002-6.492l14.787-6.828C35.431,66.492,19.22,52.515,10.437,38.567C1.11,23.804,0.007,9.387,0,3.198   C0,1.249,0.112,0.106,0.123,0L7.24,0.724v0.002c0,0-0.002,0.009-0.01,0.105C7.207,1.12,7.153,1.945,7.153,3.198   c-0.006,5.347,1,18.401,9.328,31.544c7.895,12.421,22.246,25.197,49.435,32.07l-6.592-14.583l6.52-2.947l11.762,26.025   L52.213,87.035z"
        />
      </svg>
    </div>
  </transition>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      element_under_cursor: null,
      left: "0px",
      top: "0px",
      show_cursor: false,
      rotate_cursor: false,
      is_in_active_state: false,
    };
  },
  created() {
    document.addEventListener("mousemove", this.moveCursor);
  },
  mounted() {},
  beforeDestroy() {
    document.removeEventListener("mousemove", this.moveCursor);
  },
  watch: {
    $route(to, from) {
      this.show_cursor = false;
      this.is_in_active_state = true;
      setTimeout(() => {
        this.is_in_active_state = false;
      }, 200);
    },
    show_cursor(new_value) {
      this.$nextTick(() => {
        this.rotate_cursor = new_value;
      });
    },
  },
  computed: {},
  methods: {
    moveCursor(e) {
      this.left = e.clientX + "px";
      this.top = e.clientY + "px";
      const element_under_cursor = document.elementFromPoint(
        e.clientX,
        e.clientY
      );
      this.show_cursor =
        element_under_cursor &&
        element_under_cursor.classList.contains("js--showCursor");
    },
  },
};
</script>
<style lang="scss" scoped>
._cursor {
  position: fixed;
  z-index: 100000;
  width: 40px;
  height: 40px;
  pointer-events: none;
  transform-origin: top left;

  transition: transform 1s cubic-bezier(0.19, 1, 0.22, 1),
    opacity 0.3s cubic-bezier(0.19, 1, 0.22, 1);

  svg {
    position: absolute;
    transform: translate(-50%, -50%) rotate(-55deg);
    background: var(--active-color);
    // border: 2px solid black;
    box-shadow: 0 0 0 1px hsla(230, 13%, 9%, 0.05),
      0 0.3px 0.4px hsla(230, 13%, 9%, 0.02),
      0 0.9px 1.5px hsla(230, 13%, 9%, 0.025),
      0 3.5px 6px hsla(230, 13%, 9%, 0.09);

    border-radius: 50%;
    width: 100%;
    height: 100%;
    transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
}

.toggleCursor {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transform: scale(1);
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    transform: scale(0.3) rotate(95deg);
  }
}
</style>
<style lang="scss">
// .js--showCursor {
//   cursor: none;
// }
</style>
