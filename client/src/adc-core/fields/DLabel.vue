<template>
  <div class="_dLabel">
    <div class="_labelLine" @click="show_instructions = !show_instructions">
      <component :is="tag" :class="tag === 'label' ? 'u-label' : ''">
        {{ str }}
      </component>
      &nbsp;
      <button
        type="button"
        class="u-button u-button_icon"
        :style="icon_styles"
        v-if="instructions"
      >
        <b-icon
          :icon="!show_instructions ? 'info-circle' : 'info-circle-fill'"
          :class="{
            'is--active': show_instructions,
          }"
        />
      </button>
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
  computed: {
    icon_styles() {
      if (this.tag === "label") return "  color: var(--label-color)";
      return "";
    },
  },
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
}
</style>
