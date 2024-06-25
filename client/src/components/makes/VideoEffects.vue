<template>
  <div class="_videoEffects">
    <div class="_sidebyside">
      {{ make.effect_type }}
      <div class="_leftBtns">
        <select :value="make.effect_type" @change="setEffectType">
          <option
            :value="effect.key"
            v-for="effect in available_effects"
            :key="effect.key"
          >
            {{ effect.type }}
          </option>
        </select>

        <button
          type="button"
          class="u-button u-button_bleumarine"
          @click="show_save_export_modal = true"
        >
          <b-icon icon="check" />
          {{ $t("submit") }}
        </button>
      </div>
      <div class="_cropWindow">
        <MediaContent
          :file="base_media"
          :resolution="1600"
          :show_fs_button="true"
          :context="'full'"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    make: Object,
    project_path: String,
    base_media: Object,
  },
  components: {},
  data() {
    return {
      available_effects: [
        { key: "watermark", type: "Watermark" },
        { key: "black_and_white", type: "Black and white" },
        { key: "colored_filter", type: "Colored filter" },
        { key: "slow_down", type: "Slow down" },
        { key: "speed_up", type: "Speed up" },
        { key: "reverse", type: "Reverse" },
        { key: "rotate", type: "Rotate" },
        { key: "mirror", type: "Mirror" },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    setEffectType(event) {
      this.updatePubliMeta({
        effect_type: event.target.value,
      });
    },
    async updatePubliMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.make.$path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._videoEffects {
  margin: 0;
  background: white;
  padding: calc(var(--spacing) / 1);
  border-radius: 6px;

  height: auto;
}

._sidebyside {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  gap: calc(var(--spacing) * 1);

  ._leftBtns {
    flex: 0 1 250px;
  }
  ._cropWindow {
    flex: 1 1 250px;
  }
}
</style>
