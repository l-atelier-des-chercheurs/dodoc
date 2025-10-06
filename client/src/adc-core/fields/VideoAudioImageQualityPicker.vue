<template>
  <div>
    <template v-if="['image', 'video'].includes(media_type)">
      <ToggledSection
        :label="media_type === 'video' ? $t('enable_image') : undefined"
        :show_toggle.sync="enable_image"
        :can_toggle="media_type === 'video'"
      >
        <ResolutionDisplay
          v-if="media_width || media_height"
          :label="$t('current_resolution')"
          :width="media_width"
          :height="media_height"
        />

        <DLabel :str="$t('image_quality')" />
        <div class="">
          <SelectField2
            :value="image_quality_picked"
            :options="image_quality_presets"
            :can_edit="true"
            :hide_validation="true"
            @change="updateImagePreset"
          />
        </div>
        <div v-if="image_quality_picked === 'custom'">
          <div class="u-spacingBottom" />
          <CustomResolutionInput
            :width.sync="custom_resolution_width"
            :height.sync="custom_resolution_height"
            :ratio="media_ratio"
            :is_video="media_type === 'video'"
          />
          <div class="u-spacingBottom" />
          <NumberInput
            v-if="media_type === 'video' && video_bitrate !== 'no_video'"
            :label="$t('bitrate')"
            :instructions="$t('bitrate_instructions')"
            :value="video_bitrate"
            :min="0"
            :suffix="'kbps'"
            :size="'normal'"
            @update:value="$emit('update:video_bitrate', $event)"
          />
        </div>
      </ToggledSection>
      <div class="u-spacingBottom" />
    </template>

    <div v-if="['video', 'audio'].includes(media_type)" class="">
      <ToggledSection
        :label="media_type === 'video' ? $t('enable_sound') : undefined"
        :show_toggle.sync="enable_audio"
        :can_toggle="media_type === 'video'"
      >
        <DLabel :str="$t('audio_quality')" />
        <SelectField2
          :value="audio_quality_picked"
          :options="audio_quality_options"
          :can_edit="true"
          :hide_validation="true"
          @change="updateAudioQuality"
        />
        <NumberInput
          v-if="audio_quality_picked === 'custom'"
          :label="$t('bitrate')"
          :value="audio_bitrate"
          :min="0"
          :max="320"
          :suffix="'kbps'"
          :size="'normal'"
          @update:value="$emit('update:audio_bitrate', $event)"
        />
      </ToggledSection>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    media_type: String,
    media_width: Number,
    media_height: Number,

    image_width: Number,
    image_height: Number,
    video_bitrate: [Number, String],
    audio_bitrate: [Number, String],
  },
  components: {},
  data() {
    return {
      image_quality_picked: undefined,
      audio_quality_picked: undefined,

      custom_resolution_width: this.media_width,
      custom_resolution_height: this.media_height,

      enable_image: true,
      enable_audio: true,
    };
  },
  created() {},
  mounted() {
    this.updateImagePreset("source");
    this.updateAudioQuality("source");
  },
  beforeDestroy() {},
  watch: {
    enable_image(new_value) {
      if (!new_value) this.$emit("update:video_bitrate", "no_video");
      else this.updateImagePreset("source");
    },
    enable_audio(new_value) {
      if (!new_value) this.$emit("update:audio_bitrate", "no_audio");
      else this.updateAudioQuality("source");
    },
    custom_resolution_width(new_value) {
      this.$emit("update:image_width", new_value);
    },
    custom_resolution_height(new_value) {
      this.$emit("update:image_height", new_value);
    },
  },
  computed: {
    image_quality_presets() {
      let presets = [];
      if (this.media_type === "video") {
        presets.push({
          key: "source",
          text: this.$t("close_to_source"),
          width: this.media_width || undefined,
          height: this.media_height || undefined,
          bitrate: 4000,
        });
        presets.push({
          key: "high",
          text: this.$t("high"),
          width: 1920,
          height: 1080,
          bitrate: 4000,
        });
        presets.push({
          key: "medium",
          text: this.$t("medium"),
          width: 1280,
          height: 720,
          bitrate: 2000,
        });
        presets.push({
          key: "rough",
          text: this.$t("rough"),
          width: 640,
          height: 360,
          bitrate: 1000,
        });
        presets.push({
          key: "custom",
          text: "↓ " + this.$t("custom_f"),
        });
      }

      if (this.media_type === "image") {
        presets.push(
          {
            key: "source",
            text: this.$t("close_to_source"),
            width: this.media_width || undefined,
            height: this.media_height || undefined,
          },
          {
            key: "high",
            text: this.$t("high"),
            width: 1920,
          },
          {
            key: "medium",
            text: this.$t("medium"),
            width: 1280,
          },
          {
            key: "custom",
            text: "↓ " + this.$t("custom_f"),
          }
        );
      }

      return presets.map((p) => this.makeInstructions(p));
    },

    audio_quality_options() {
      let presets = [
        {
          key: "source",
          text: this.$t("very_high"),
          bitrate: 256,
        },
        {
          key: "high",
          text: this.$t("high"),
          bitrate: 192,
        },
        {
          key: "medium",
          text: this.$t("medium"),
          bitrate: 128,
        },
        {
          key: "custom",
          text: "↓ " + this.$t("custom_f"),
        },
      ];

      return presets.map((p) => this.makeInstructions(p));
    },
    media_ratio() {
      return this.media_height / this.media_width;
    },
  },
  methods: {
    updateImagePreset(new_value) {
      this.image_quality_picked = new_value;

      if (new_value === "custom") {
        this.$emit("update:image_width", this.custom_resolution_width);
        this.$emit("update:image_height", this.custom_resolution_height);
        this.$emit("update:video_bitrate", this.video_bitrate);
        return;
      }

      const preset = this.image_quality_presets.find(
        (p) => p.key === new_value
      );
      if (!preset) return;

      const { width, height, bitrate } = preset;
      this.$emit("update:image_width", width);
      this.$emit("update:image_height", height);
      this.$emit("update:video_bitrate", bitrate);
    },
    updateAudioQuality(new_value) {
      this.audio_quality_picked = new_value;

      if (new_value === "custom") {
        this.$emit("update:audio_bitrate", this.audio_bitrate);
        return;
      }

      const { bitrate } = this.audio_quality_options.find(
        (p) => p.key === new_value
      );
      this.$emit("update:audio_bitrate", bitrate);
    },
    makeInstructions(p) {
      if (p.key !== "custom") {
        let instructions = [];
        if (p.width && p.height) {
          instructions.push(
            this.$t("resolution_w_h", { width: p.width, height: p.height })
          );
        } else if (p.width && !p.height) {
          instructions.push(
            this.$t("resolution_on_largest_side", {
              resolution: p.width,
            })
          );
        }
        if (p.bitrate) {
          instructions.push(
            this.$t("bitrate_kbps", { bitrate: p.bitrate }).toLowerCase()
          );
        }
        p.instructions = instructions.join(", ");
      }
      return p;
    },
  },
};
</script>
<style lang="scss" scoped></style>
