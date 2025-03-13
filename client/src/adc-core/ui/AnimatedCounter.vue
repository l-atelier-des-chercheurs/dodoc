<template>
  <span class="_animatedCounter">
    <LoaderSpinner
      class="_animatedCounter-spinner"
      v-if="current_value < 100"
    />
    <b-icon class="_animatedCounter-icon" v-else icon="check-circle-fill" />
    {{ current_value }}&thinsp;%
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
      speed: 0.004,
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
        // if (this.current_value !== this.value)
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    },
  },
};
</script>
<style lang="scss" scoped>
._animatedCounter {
  display: inline-flex;
  gap: calc(var(--spacing) / 2);
  align-items: center;

  font-weight: 600;

  background: white;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: 5px;
  border: 1px solid var(--c-gris);
}
._animatedCounter-spinner {
  position: relative;
}
._animatedCounter-icon {
}
</style>
