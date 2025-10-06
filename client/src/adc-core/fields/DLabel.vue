<template>
  <div class="_dLabel">
    <div class="_labelLine" @click.stop="toggleInstructions">
      <component
        :is="tag"
        :class="tag === 'label' ? 'u-label' : ''"
        :for="for_input"
      >
        {{ str }}
      </component>
      <template v-if="instructions || hasToggleInstructionsListener">
        &nbsp;
        <button
          type="button"
          class="u-button u-button_icon _icon"
          :style="icon_styles"
        >
          <b-icon
            :icon="!show_instructions ? 'info-circle' : 'info-circle-fill'"
            :class="{
              'is--active': show_instructions,
            }"
          />
        </button>
      </template>
    </div>
    <div class="u-instructions _instr" v-if="show_instructions && instructions">
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
    for_input: String,
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
  computed: {
    icon_styles() {
      if (this.tag === "label") return "  color: var(--label-color)";
      return "";
    },
    hasToggleInstructionsListener() {
      return this.$listeners && "toggleInstructions" in this.$listeners;
    },
  },
  methods: {
    toggleInstructions() {
      if (this.hasToggleInstructionsListener) {
        this.$emit("toggleInstructions", this.show_instructions);
      } else {
        this.show_instructions = !this.show_instructions;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._dLabel {
  // margin-bottom: calc(var(--spacing) / 4);
}
._labelLine {
  display: flex;
  align-items: center;
  font-size: var(--sl-font-size-small);

  .u-label {
    // color: currentColor;
    // margin-bottom: 0;
    // color: currentColor;
    margin-bottom: 0;
  }
}

._icon {
  font-size: var(--sl-font-size-x-small);
  padding: 0;
  margin-left: calc(var(--spacing) / 4);
}
._instr {
  // margin-bottom: calc(var(--spacing) / 2);
}
</style>
