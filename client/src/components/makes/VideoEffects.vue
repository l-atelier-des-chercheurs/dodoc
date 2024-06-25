<template>
  <div class="_videoEffects">
    <div class="_sidebyside">
      <div class="_leftBtns">
        <select :value="make.effect_type" @change="setEffectType">
          <option
            :value="effect.key"
            v-for="effect in available_effects"
            :key="effect.key"
          >
            {{ effect.label }}
          </option>
        </select>

        <div class="u-spacingBottom" />

        <div
          v-if="make.effect_type === 'colored_filter'"
          class="u-spacingBottom"
        >
          <ColorInput
            :can_toggle="false"
            :live_editing="true"
            :value="make.color_filter"
            :default_value="'#fc4b60'"
            @save="
              updatePubliMeta({
                color_filter: $event,
              })
            "
          />
        </div>

        <button
          type="button"
          class="u-button u-button_bleumarine"
          @click="show_render_modal = true"
        >
          <b-icon icon="check" />
          {{ $t("preview") }}
        </button>
        <ExportSaveMakeModal2
          v-if="show_render_modal"
          :base_instructions="base_instructions"
          :make="make"
          @close="show_render_modal = false"
        />
      </div>
      <div class="_cropWindow">
        <MediaContent
          :file="base_media"
          :resolution="1600"
          :show_fs_button="true"
          :context="'full'"
        />
        <div
          class="_coloredFilter"
          v-if="make.effect_type === 'colored_filter'"
          :style="{ backgroundColor: make.color_filter }"
        />
      </div>
    </div>
  </div>
</template>
<script>
import ExportSaveMakeModal2 from "@/components/makes/ExportSaveMakeModal2.vue";

export default {
  props: {
    make: Object,
    base_media: Object,
  },
  components: {
    ExportSaveMakeModal2,
  },
  data() {
    return {
      show_render_modal: false,

      available_effects: [
        // { key: "watermark", label: "Watermark" },
        { key: "black_and_white", label: this.$t("black_and_white") },
        { key: "colored_filter", label: this.$t("colored_filter") },
        { key: "slow_down", label: this.$t("slow_down") },
        { key: "speed_up", label: this.$t("speed_up") },
        { key: "reverse", label: this.$t("reverse") },
        // { key: "rotate", label: this.$t("rotate") },
        // { key: "mirror", label: this.$t("mirror") },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    base_instructions() {
      const recipe = "video_effects";
      const effect_type = this.make.effect_type;
      const suggested_file_name =
        this.base_media.$media_filename + "-" + effect_type;
      const base_media_path = this.makeMediaFilePath({
        $path: this.base_media.$path,
        $media_filename: this.base_media.$media_filename,
      });

      let effect_opts = {};

      if (effect_type === "colored_filter")
        effect_opts = {
          color_filter: this.make.color_filter,
        };

      return {
        recipe,
        effect_type,
        effect_opts,
        suggested_file_name,
        base_media_path,
      };
    },
  },
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
    position: relative;
    flex: 1 1 250px;
  }
}

._coloredFilter {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 1;
  mix-blend-mode: overlay;
}
</style>
