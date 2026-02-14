<template>
  <BaseModal2 :title="$t('optimize_resize')" @close="$emit('close')">
    <div class="_batchResizeModal" v-if="!is_resizing">
      <div class="_batchResizeModal--content">
        <p class="u-instructions u-spacingBottom">
          {{ selected_images.length }} {{ $t("medias_selected").toLowerCase() }}
        </p>

        <div class="_batchResizeModal--content--images u-spacingBottom">
          <div
            class="_batchResizeModal--content--images--image"
            v-for="image in selected_images"
            :key="image.$path"
          >
            <img
              :src="
                makeMediaFilePath({
                  $path: image.$path,
                  $media_filename: image.$media_filename,
                  with_timestamp: true,
                  $date_created: image.$date_created,
                })
              "
              loading="lazy"
            />
          </div>
        </div>

        <div class="_batchResizeModal--content--quality u-spacingBottom">
          <DLabel :str="$t('image_quality')" />
          <SelectField2
            :value="image_quality_picked"
            :options="image_quality_options"
            :can_edit="true"
            :hide_validation="true"
            @change="image_quality_picked = $event"
          />
        </div>

        <div class="_batchResizeModal--content--action u-spacingBottom">
          <RadioSwitch
            :content.sync="replace_or_save"
            :options="replace_save_options"
          />
        </div>
      </div>
    </div>

    <template slot="footer">
      <div />
      <div class="_batchResizeModal--footer">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          :disabled="is_resizing"
          @click="startBatchResize"
        >
          <LoaderSpinner v-if="is_resizing" class="_inlineSpinner" />
          <template v-else>
            <b-icon icon="tools" />
            {{ $t("optimize_resize") }}
          </template>
        </button>
        <template v-if="is_resizing">
          <span class="_progressText">
            {{ current_index }}/{{ selected_images.length }}
          </span>
        </template>
      </div>
    </template>
  </BaseModal2>
</template>
<script>
import RadioSwitch from "@/adc-core/ui/RadioSwitch.vue";
import SelectField2 from "@/adc-core/fields/SelectField2.vue";
import Medias from "@/mixins/Medias.js";
import Paths from "@/mixins/Paths.js";

export default {
  props: {
    selected_medias: {
      type: Array,
      required: true,
    },
  },
  components: {
    RadioSwitch,
    SelectField2,
  },
  mixins: [Medias, Paths],
  data() {
    return {
      image_quality_picked: "source",
      replace_or_save: "save_new",
      is_resizing: false,
      current_index: 0,
    };
  },
  computed: {
    selected_images() {
      return this.selected_medias.filter((m) => m?.$type === "image");
    },
    image_quality_options() {
      return [
        {
          key: "source",
          text: this.$t("close_to_source"),
          instructions: "",
        },
        {
          key: "high",
          text: this.$t("high"),
          instructions: this.$t("resolution_on_largest_side", {
            resolution: 1920,
          }),
        },
        {
          key: "medium",
          text: this.$t("medium"),
          instructions: this.$t("resolution_on_largest_side", {
            resolution: 1280,
          }),
        },
      ];
    },
    replace_save_options() {
      return [
        { value: "replace", label: this.$t("replace_original") },
        { value: "save_new", label: this.$t("save_as_new_media") },
      ];
    },
  },
  methods: {
    getDimensionsForImage(image) {
      const w = image.$infos?.width;
      const h = image.$infos?.height;
      if (this.image_quality_picked === "source") {
        return { image_width: w, image_height: h };
      }
      const max_side = this.image_quality_picked === "high" ? 1920 : 1280;
      if (!w || !h) return { image_width: max_side, image_height: undefined };
      const scale = w >= h ? max_side / w : max_side / h;
      return {
        image_width: Math.round(w * scale),
        image_height: Math.round(h * scale),
      };
    },
    buildInstructionsForImage(image) {
      const dims = this.getDimensionsForImage(image);
      let suggested_file_name = "resized";
      if (image.$media_filename)
        suggested_file_name = this.getFilenameWithoutExt(image.$media_filename);

      return {
        recipe: "optimize_media",
        suggested_file_name,
        image_width: dims.image_width,
        image_height: dims.image_height,
        base_media_path: this.makeMediaFilePath({
          $path: image.$path,
          $media_filename: image.$media_filename,
        }),
        additional_meta: {
          $origin: "collect",
          $processing: ["resized"],
        },
      };
    },
    async replaceOriginalWithOptimized(media, optimized_file) {
      const old_source_file = JSON.parse(JSON.stringify(media));
      const new_source_file = JSON.parse(JSON.stringify(optimized_file));

      const processing = media.$processing || [];
      processing.push("resized");

      // set original media to new source file
      await this.$api.updateMeta({
        path: media.$path,
        new_meta: {
          $media_filename: new_source_file.$media_filename,
          $type: new_source_file.$type,
          $processing: processing,
        },
      });

      // CLEAN UP (same as OptimizeMediaModal.replaceOriginal)
      // set optimized media to old source file
      await this.$api.updateMeta({
        path: old_source_file.$path,
        new_meta: {
          $media_filename: old_source_file.$media_filename,
        },
      });
      // remove optimized media
      await this.$api.deleteItem({
        path: old_source_file.$path,
      });
    },
    async runOneOptimize(media) {
      const instructions = this.buildInstructionsForImage(media);
      const task_id = await this.$api.optimizeFile({
        path: media.$path,
        instructions,
      });
      this.$api.join({ room: "task_" + task_id });

      return new Promise((resolve, reject) => {
        const onEnd = ({ task_id: tid, event, message }) => {
          if (tid !== task_id) return;
          this.$eventHub.$off("task.ended", onEnd);
          this.$api.leave({ room: "task_" + task_id });
          if (event === "completed") resolve(message.file);
          else if (event === "failed")
            reject(new Error(message?.info || "optimization_failed"));
          else reject(new Error("aborted"));
        };
        this.$eventHub.$on("task.ended", onEnd);
      });
    },
    async startBatchResize() {
      if (this.is_resizing || this.selected_images.length === 0) return;
      this.is_resizing = true;
      this.current_index = 0;

      const replace_existing = this.replace_or_save === "replace";

      try {
        for (let i = 0; i < this.selected_images.length; i++) {
          this.current_index = i + 1;
          const media = this.selected_images[i];
          const optimized_file = await this.runOneOptimize(media);

          if (replace_existing) {
            await this.replaceOriginalWithOptimized(media, optimized_file);
          }
          // keepBoth: do nothing, optimized file is already a new item in the folder
        }
        this.$alertify.success(this.$t("saved"));
        this.$emit("ended");
      } catch (err) {
        this.$alertify.error(
          this.$t("optimization_failed") + " " + (err.message || "")
        );
      } finally {
        this.is_resizing = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._batchResizeModal {
  &--content {
    &--images {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
    }
    &--images--image {
      aspect-ratio: 1;
      border-radius: 4px;
      overflow: hidden;
      background: var(--c-gris_clair);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    &--quality,
    &--action {
      // max-width: 320px;
    }
  }
  &--footer {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

._inlineSpinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: middle;
}

._progressText {
  font-size: var(--sl-font-size-small);
  color: var(--sl-color-neutral-600);
}
</style>
