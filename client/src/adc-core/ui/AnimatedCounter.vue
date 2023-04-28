<template>
  <span class="_animatedCounter">
    <sl-spinner
      v-if="current_value < 100"
      style="font-size: 1rem; --indicator-color: currentColor"
    />
    <sl-icon v-else name="check-circle-fill" :label="$t('finished')" />
    {{ current_value }} %
  </span>
</template>
<script>
export default {
  props: {
    value: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      current_value: 0,
      speed: 0.002,
    };
  },

  mounted() {
    this.updateValue();
  },
  watch: {
    // value(newVal, oldVal) {
    //   if (newVal !== this.current_value) {
    //     this.updateValue();
    //   }
    // },
  },

  methods: {
    // This is our main logic block. It handles tweening from a start value to an end value.
    updateValue() {
      // Handles updating the tween on each frame.
      const animate = () => {
        this.current_value = Math.ceil(
          this.current_value * (1 - this.speed) + this.value * this.speed
        );
        debugger;
        // if (this.current_value !== this.value)
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    },
  },
};
</script>
