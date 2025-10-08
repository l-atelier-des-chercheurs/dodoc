<template>
  <div class="_toggledSection">
    <ToggleInput
      v-if="can_toggle"
      :content="show_toggle"
      :label="label"
      :disabled="disabled"
      @update:content="$emit('update:show_toggle', $event)"
    />
    <DLabel v-else-if="label" :str="label" />
    <!-- <label :for="id" class="u-label _inputLabel">
      <input
        v-if="can_toggle"
        ref="field"
        :id="id"
        :name="label"
        class="_inputCb"
        type="checkbox"
        :disabled="disabled"
        :checked="show_toggle"
        @change="$emit('update:show_toggle', $event.target.checked)"
      />
      <label :for="id" class="u-label">{{ label }}</label>
    </div> -->

    <div
      class="_toggled"
      :class="{
        'can--toggle': can_toggle,
      }"
      v-if="show_toggle"
    >
      <slot />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    label: String,
    can_toggle: {
      type: Boolean,
      default: true,
    },
    show_toggle: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      id: `id_${(Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 2
      )}`,
    };
  },
  created() {
    if (!this.can_toggle) this.$emit("update:show_toggle", true);
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._toggledSection {
  &:hover {
    ._toggled {
      border-color: var(--c-gris_fonce);
    }
  }
}
._inputLabel {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
._maxlength {
  flex: 0 0 auto;
  padding: calc(var(--spacing) / 4) 0;
}
.u-label {
  margin-bottom: 0;
}
._inputCb {
  margin: calc(var(--spacing) / 4);
}

._toggled {
  // margin-top: calc(var(--spacing) / 2 * -1);
  margin-top: 0px;
  padding-top: 0px;

  &.can--toggle {
    border-left: 3px dotted var(--c-gris);
    padding-left: calc(var(--spacing) / 2);
    margin-left: calc(var(--spacing) / 2);
    padding-left: calc(var(--spacing) / 2);
    padding-top: calc(var(--spacing) / 4);
  }
}
</style>
