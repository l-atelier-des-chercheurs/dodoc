<template>
  <div class="_labelLine">
    <label :for="for_attr" class="u-label">{{ str }}</label>
    <span v-if="show_instructions !== undefined">
      <!-- <sl-button size="small" circle @click="$emit('toggleHelp')">
        <sl-icon name="info-circle" :label="$t('edit')" />
      </sl-button> -->
      <sl-icon-button
        name="info-circle-fill"
        :class="{
          'is--active': show_instructions,
        }"
        @click="$emit('update:show_instructions', !show_instructions)"
      />
    </span>
  </div>
</template>
<script>
export default {
  props: {
    for_attr: String,
    str: String,
    show_instructions: {
      type: Boolean,
      default: undefined,
    },
  },
  components: {},
  data() {
    return {};
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
    margin-bottom: 0;
    // color: currentColor;
  }

  sl-icon-button {
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
