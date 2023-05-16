<template>
  <div class="_dLabel">
    <div class="_labelLine" @click="show_instructions = !show_instructions">
      <label v-if="tag === 'label'" class="u-label">
        {{ str }}
      </label>
      <component v-else :is="tag">
        {{ str }}
      </component>
      <sl-icon-button
        v-if="instructions"
        :name="!show_instructions ? 'info-circle' : 'info-circle-fill'"
        :class="{
          'is--active': show_instructions,
        }"
      />
    </div>
    <div class="u-instructions" v-if="show_instructions">
      <small v-html="instructions" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    str: String,
    instructions: String,
    tag: {
      type: String,
      default: "label",
    },
  },
  components: {},
  data() {
    return {
      show_instructions: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._dLabel {
  // margin-bottom: calc(var(--spacing) / 4);
}
._labelLine {
  display: flex;
  align-items: center;
  // gap: calc(var(--spacing) / 8);

  .u-label {
    // color: currentColor;
    // margin-bottom: 0;
    // color: currentColor;
    margin-bottom: 0;
  }

  sl-icon-button {
    color: var(--label-color);
    margin: calc(-1 * var(--sl-spacing-x-small)) 0;

    &:hover,
    &:focus-visible {
      color: var(--active-color);
    }

    &::part(base) {
      padding: calc(var(--spacing) / 3);
      color: currentColor;
    }

    &.is--active {
      color: var(--c-bleuvert);
    }
  }
}
</style>
