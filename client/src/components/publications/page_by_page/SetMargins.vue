<template>
  <div>
    <fieldset :disabled="is_saving">
      <legend>{{ $t("margins") }}</legend>
      <div class="u-instructions">
        <small>{{ $t("margins_instructions") }}</small>
      </div>

      <div class="_choices">
        <button
          v-for="preset in presets"
          :key="preset"
          type="button"
          class="u-button u-button_small"
          :class="{ 'is--active': current_preset === preset }"
          @click="setAllMargins(preset)"
        >
          {{ preset }} {{ unit }}
        </button>
      </div>

      <div class="u-sameRow _inputs">
        <div v-for="side in ['top', 'bottom']" :key="side">
          <DLabel :str="$t(side)" />
          <div class="u-inputGroup">
            <input
              type="number"
              min="0"
              v-model.number="margins[side]"
              @change="saveMargin(side)"
            />
            <span class="u-suffix" v-text="unit" />
          </div>
        </div>
      </div>
      <div class="u-sameRow _inputs">
        <div v-for="side in ['left', 'right']" :key="side">
          <DLabel :str="side_labels[side]" />
          <div class="u-inputGroup">
            <input
              type="number"
              min="0"
              v-model.number="margins[side]"
              @change="saveMargin(side)"
            />
            <span class="u-suffix" v-text="unit" />
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>
<script>
const SIDES = ["top", "bottom", "left", "right"];

export default {
  props: {
    publication: Object,
    is_spread: Boolean,
  },
  components: {},
  data() {
    return {
      is_saving: false,
      margins: {},
    };
  },
  created() {
    this.initValues();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    saved_margins: {
      handler() {
        this.initValues();
      },
      deep: true,
    },
  },
  computed: {
    unit() {
      if (this.publication.layout_mode === "screen") return "px";
      else return "mm";
    },
    presets() {
      if (this.publication.layout_mode === "screen") return [0, 20, 40, 60];
      return [0, 10, 15, 20];
    },
    saved_margins() {
      return SIDES.reduce((acc, side) => {
        acc[side] = this.publication["page_margin_" + side] || 0;
        return acc;
      }, {});
    },
    current_preset() {
      const values = Object.values(this.saved_margins);
      return values.every((v) => v === values[0]) ? values[0] : false;
    },
    side_labels() {
      return {
        left: this.is_spread ? this.$t("margins_inside") : this.$t("left"),
        right: this.is_spread ? this.$t("margins_outside") : this.$t("right"),
      };
    },
  },
  methods: {
    initValues() {
      this.margins = { ...this.saved_margins };
    },
    setAllMargins(value) {
      this.updateMeta(
        SIDES.reduce((acc, side) => {
          acc["page_margin_" + side] = value;
          return acc;
        }, {})
      );
    },
    saveMargin(side) {
      const value = this.margins[side];
      if (typeof value !== "number" || value < 0) return this.initValues();
      this.updateMeta({ ["page_margin_" + side]: value });
    },
    async updateMeta(new_meta) {
      this.is_saving = true;
      try {
        await this.$api.updateMeta({
          path: this.publication.$path,
          new_meta,
        });
      } catch (e) {
        this.initValues();
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("couldntbesaved"));
        this.$alertify.closeLogOnClick(true).error(e.response?.data);
      }
      this.is_saving = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._choices {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
  margin: calc(var(--spacing) / 2) 0;
}
._inputs {
  justify-content: flex-start;
  margin-top: calc(var(--spacing) / 2);
}
</style>
