<template>
  <transition name="scaleInFade" :duration="150" mode="out-in">
    <svg
      v-if="is_loaded"
      class="_dodocLogo"
      :class="{ 'has--animation': can_animate }"
      enable-background="new 0 0 515 168"
      viewBox="10 0 515 168"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="var(--color1)">
        <path d="m288.3 29h37.6v71.6l-37.6 37.1z" />
        <ellipse
          cx="375.1"
          cy="101.1"
          rx="37.6"
          ry="37.6"
          transform="matrix(.4927 -.8702 .8702 .4927 102.2979 377.7576)"
        />
        <path d="m488.3 74.5c-14.7-14.7-38.5-14.7-53.2 0s-14.7 38.5 0 53.2z" />
        <path d="m52 29h37.6v71.6l-37.6 37.1z" />
        <circle cx="145.3" cy="101.1" r="37.6" />
        <path d="m435.1 74.5c-14.7 14.7-14.7 38.5 0 53.2s38.5 14.7 53.2 0z" />
      </g>
      <g fill="var(--color2)">
        <ellipse
          cx="288.3"
          cy="100.6"
          rx="37.6"
          ry="37.6"
          transform="matrix(.9665 -.2567 .2567 .9665 -16.1696 77.357)"
        />
        <path
          d="m52 63c20.8 0 37.6 16.8 37.6 37.6s-16.8 37.6-37.6 37.6-37.6-16.8-37.6-37.6 16.8-37.6 37.6-37.6z"
        />
        <circle cx="375.1" cy="100.6" r="18.7" />
        <circle cx="145.3" cy="100.6" r="18.7" />
        <circle cx="215.9" cy="101.7" r="18.7" />
        <circle cx="461.2" cy="100.6" r="18.7" />
      </g>
    </svg>
  </transition>
</template>
<script>
export default {
  props: {
    can_animate: {
      type: Boolean,
      default: true,
    },
  },
  components: {},
  data() {
    return {
      is_loaded: false,
    };
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.is_loaded = true;
    });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._dodocLogo {
  --color1: var(--c-bleuvert);
  --color2: var(--c-orange);

  path,
  ellipse,
  circle {
    transition: fill 1s 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }

  &.has--animation {
    &:hover {
      --color1: var(--c-orange);
      --color2: var(--c-bleuvert);

      path,
      ellipse,
      circle {
        transition: fill 0.15s cubic-bezier(0.19, 1, 0.22, 1);
      }
    }
  }
}
</style>
