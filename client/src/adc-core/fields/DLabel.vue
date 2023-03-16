<template>
  <div class="">
    <div class="_labelLine">
      <label class="u-label">{{ str }}</label>
      <span v-if="instructions">
        <!-- <sl-button size="small" circle @click="$emit('toggleHelp')">
        <sl-icon name="info-circle" :label="$t('edit')" />
        </sl-button> -->
        <sl-icon-button
          :name="!show_instructions ? 'info-circle' : 'info-circle-fill'"
          :class="{
            'is--active': show_instructions,
          }"
          @click="show_instructions = !show_instructions"
        />
      </span>
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
._labelLine {
  display: flex;
  align-items: center;
  // gap: calc(var(--spacing) / 8);

  .u-label {
    // color: currentColor;
    // margin-bottom: 0;
    // color: currentColor;
  }

  sl-icon-button {
    color: var(--label-color);
    margin: calc(-1 * var(--sl-spacing-x-small)) 0;

    &::part(base) {
      // padding: calc(var(--spacing) / 4);
      color: currentColor;
    }

    &.is--active {
      color: var(--c-bleuvert);
    }
  }
}
</style>
