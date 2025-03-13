<template>
  <div class="_videoEffects">
    <div class="_topContent">
      <div class="_leftBtns">
        <DLabel :str="$t('effect')" />

        <select :value="selected_effect_type" @change="setEffectType">
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
          v-if="selected_effect_type === 'colored_filter'"
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
        <div
          v-else-if="selected_effect_type === 'speed_up'"
          class="u-spacingBottom"
        >
          <RangeValueInput
            :label="$t('playback_speed')"
            :value="make.playback_speed"
            :can_toggle="false"
            :min="100"
            :max="1000"
            :step="1"
            :default_value="100"
            :suffix="'%'"
            :ticks="[100, 200, 500, 1000]"
            @save="
              updatePubliMeta({
                playback_speed: $event,
              })
            "
          />
          <small
            v-if="make.playback_speed < 50"
            v-html="$t('slowing_video_down_limit')"
          />
        </div>
        <div
          v-else-if="selected_effect_type === 'slow_down'"
          class="u-spacingBottom"
        >
          <RangeValueInput
            :label="$t('playback_speed')"
            :value="make.playback_speed"
            :can_toggle="false"
            :min="1"
            :max="100"
            :step="1"
            :default_value="50"
            :suffix="'%'"
            :ticks="[1, 10, 25, 50]"
            @save="
              updatePubliMeta({
                playback_speed: $event,
              })
            "
          />
          <small
            v-if="make.playback_speed < 50"
            v-html="$t('slowing_video_down_limit')"
          />
        </div>
        <div
          v-else-if="selected_effect_type === 'mirror'"
          class="u-spacingBottom"
        >
          <select
            :value="make.flip"
            @change="
              updatePubliMeta({
                flip: $event.target.value,
              })
            "
          >
            <option value="vflip">
              {{ $t("vertical_flip").toLowerCase() }}
            </option>
            <option value="hflip">
              {{ $t("horizontal_flip").toLowerCase() }}
            </option>
            <option value="hflip, vflip">
              {{ $t("both").toLowerCase() }}
            </option>
          </select>
        </div>
        <div
          v-else-if="selected_effect_type === 'rotate'"
          class="u-spacingBottom"
        >
          <select
            :value="make.rotation"
            @change="
              updatePubliMeta({
                rotation: $event.target.value,
              })
            "
          >
            <option value="cw">{{ $t("move_right") }} ⟳</option>
            <option value="ccw">{{ $t("move_left") }} ⟲</option>
          </select>
        </div>
      </div>
      <div
        class="_cropWindow"
        :data-rotate="rotate_preview"
        :data-isblackandwhite="selected_effect_type === 'black_and_white'"
      >
        <MediaContent
          :file="base_media"
          :resolution="1600"
          :show_fs_button="true"
          :context="'full'"
        />
        <div
          class="_coloredFilter"
          v-if="selected_effect_type === 'colored_filter'"
          :style="{ backgroundColor: make.color_filter }"
        />
      </div>
    </div>
    <div class="_bottomBtns">
      <div class="_equationIcon">
        <b-icon icon="chevron-double-down" />
      </div>

      <button
        type="button"
        class="u-button u-button_bleumarine"
        :disabled="!base_instructions"
        @click="show_render_modal = true"
      >
        <b-icon icon="check" />
        {{ $t("make") }}
      </button>
      <div>
        <div v-if="!base_instructions" class="fieldCaption u-colorRed">
          <small v-html="$t('all_fields_not_filled')" />
        </div>
      </div>

      <ExportSaveMakeModal2
        v-if="show_render_modal"
        :base_instructions="base_instructions"
        :make_path="make.$path"
        :reference_media="base_media"
        :allow_disable_audio="true"
        @close="show_render_modal = false"
      />
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
        { key: "rotate", label: this.$t("rotate") },
        { key: "mirror", label: this.$t("mirror") },
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
      const effect_type = this.selected_effect_type;
      const suggested_file_name =
        this.base_media.$media_filename + "-" + effect_type;
      const base_media_path = this.makeMediaFilePath({
        $path: this.base_media.$path,
        $media_filename: this.base_media.$media_filename,
      });

      let effect_opts = {};

      if (effect_type === "colored_filter") {
        if (!this.make.color_filter) return false;
        effect_opts = {
          color_filter: this.make.color_filter,
        };
      } else if (effect_type === "slow_down" || effect_type === "speed_up") {
        if (!this.make.playback_speed) return false;
        effect_opts = {
          playback_speed: this.make.playback_speed,
        };
      } else if (effect_type === "mirror") {
        if (!this.make.flip) return false;
        effect_opts = {
          flip: this.make.flip,
        };
      } else if (effect_type === "rotate") {
        if (!this.make.rotation) return false;
        effect_opts = {
          rotation: this.make.rotation,
        };
      }

      return {
        recipe,
        effect_type,
        effect_opts,
        suggested_file_name,
        base_media_path,
      };
    },
    rotate_preview() {
      if (this.selected_effect_type === "rotate") return this.make.rotation;
      else if (this.selected_effect_type === "mirror") return this.make.flip;
      return false;
    },
    selected_effect_type: {
      get() {
        return this.make.effect_type || "black_and_white";
      },
    },
    base_media_width() {
      return this.base_media?.$infos?.width;
    },
    base_media_height() {
      return this.base_media?.$infos?.height;
    },
  },
  methods: {
    setEffectType(event) {
      const new_effect_type = event.target.value;

      let new_meta = {
        effect_type: new_effect_type,
      };

      if (new_effect_type === "colored_filter") {
        new_meta.color_filter = "#fc4b60";
      } else if (new_effect_type === "speed_up") {
        new_meta.playback_speed = 200;
      } else if (new_effect_type === "slow_down") {
        new_meta.playback_speed = 50;
      } else if (new_effect_type === "rotate") {
        new_meta.rotation = "cw";
      } else if (new_effect_type === "mirror") {
        new_meta.flip = "hflip";
      }

      this.updatePubliMeta(new_meta);
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
  border-radius: 6px;
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  background: white;
  padding: calc(var(--spacing) / 4);
}

._topContent {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) * 1);

  ._leftBtns {
    flex: 0 0 240px;
  }
  ._cropWindow {
    position: relative;
    flex: 0 1 50vmin;
  }
}

._cropWindow {
  position: relative;

  ::v-deep .plyr__video-wrapper {
    transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
    transform-origin: center;
  }

  &[data-isblackandwhite="true"] {
    ::v-deep .plyr__video-wrapper {
      filter: grayscale(100%);
    }
  }

  &[data-rotate="cw"] {
    ::v-deep .plyr__video-wrapper {
      transform: rotate(90deg);
    }
  }
  &[data-rotate="ccw"] {
    ::v-deep .plyr__video-wrapper {
      transform: rotate(-90deg);
    }
  }
  &[data-rotate="hflip"] {
    ::v-deep .plyr__video-wrapper {
      transform: scale(-1, 1);
    }
  }
  &[data-rotate="vflip"] {
    ::v-deep .plyr__video-wrapper {
      transform: scale(1, -1);
    }
  }
  &[data-rotate="hflip, vflip"] {
    ::v-deep .plyr__video-wrapper {
      transform: scale(-1, -1);
    }
  }

  > * {
    width: 100%;
    aspect-ratio: 1/1;
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

  pointer-events: none;
}

._bottomBtns {
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  gap: 0;
  padding-bottom: calc(var(--spacing) * 1);
}

._equationIcon {
  font-size: 2em;
  line-height: 1;
  margin: calc(var(--spacing) * 2) 0;
  color: var(--c-bleumarine_fonce);
}
</style>
