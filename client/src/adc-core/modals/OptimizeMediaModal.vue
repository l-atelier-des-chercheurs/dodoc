<template>
  <BaseModal2 :size="modal_size" @close="removeAndCloseModal">
    <template v-if="is_optimizing">
      <div class="u-instructions u-spacingBottom">
        {{ $t("optimization_in_progress") }}
      </div>

      <div>
        <div />
        <div>
          <AnimatedCounter :value="task_progress" />
        </div>
      </div>
    </template>
    <template v-else>
      <template v-if="fail_message">
        <div class="u-instructions u-spacingBottom">
          {{ fail_message }}
        </div>
      </template>
      <template v-if="optimized_file">
        <!-- <div class="u-instructions u-spacingBottom">
          {{ $t("optimization_completed") }}
        </div> -->

        <div class="_mediaPreview" :data-type="optimized_file.$type">
          <MediaContent
            :file="optimized_file"
            :resolution="1600"
            :context="'full'"
            :zoom_on_click="true"
            :show_fs_button="true"
          />
        </div>

        <div class="u-spacingBottom" />
        <ShowOptimizedFileInfos
          :original_file="media"
          :optimized_file="optimized_file"
        />
      </template>

      <template slot="footer">
        <button type="button" class="u-button" @click="removeAndCloseModal">
          <b-icon icon="arrow-left-short" />
          {{ $t("back") }}
        </button>
        <template v-if="optimized_file">
          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="keepBoth"
          >
            <b-icon icon="file-plus" />
            {{ $t("save_as_new_media") }}
          </button>
          <button
            type="button"
            class="u-button u-button_red"
            @click="replaceOriginal"
          >
            <b-icon icon="save2-fill" />
            {{ $t("replace_original") }}
          </button>
          <DownloadFile :file="optimized_file" />
        </template>
      </template>
    </template>
  </BaseModal2>
</template>

<script>
import ShowOptimizedFileInfos from "@/adc-core/fields/ShowOptimizedFileInfos.vue";

export default {
  props: {
    media: Object,
    instructions: Object,
  },
  components: {
    ShowOptimizedFileInfos,
  },
  data() {
    return {
      is_optimizing: false,
      optimized_file: undefined,
      task_progress: 0,
      fail_message: undefined,
    };
  },
  async created() {
    this.is_optimizing = true;
    await this.startOptimization();
  },
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    modal_size() {
      return this.is_optimizing ? "small" : "large";
    },
  },
  methods: {
    async startOptimization() {
      const current_task_id = await this.$api.optimizeFile({
        path: this.media.$path,
        instructions: this.instructions,
      });
      this.$api.join({ room: "task_" + current_task_id });

      this.$alertify.delay(4000).log(this.$t("optimization_started"));

      const checkProgress = ({ task_id, progress }) => {
        if (task_id !== current_task_id) return;
        this.task_progress = progress;
      };

      this.$eventHub.$on("task.status", checkProgress);

      const checkIfEnded = ({ task_id, event, message }) => {
        if (task_id !== current_task_id) return;
        this.$eventHub.$off("task.ended", checkIfEnded);
        this.$api.leave({ room: "task_" + current_task_id });

        if (event === "completed") {
          this.optimized_file = message.file;
        } else if (event === "aborted") {
          this.fail_message = this.$t("optimization_aborted");
        } else if (event === "failed") {
          this.fail_message =
            this.$t("optimization_failed") + " : " + message.info;
        }
        this.is_optimizing = false;
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
    async keepBoth() {
      this.$emit("close");
    },
    async replaceOriginal() {
      const old_source_file = JSON.parse(JSON.stringify(this.media));
      const new_source_file = JSON.parse(JSON.stringify(this.optimized_file));

      // set original media to new source file
      await this.$api.updateMeta({
        path: this.media.$path,
        new_meta: {
          $media_filename: new_source_file.$media_filename,
          $type: new_source_file.$type,
          $optimized: true,
        },
      });

      // CLEAN UP
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

      this.optimized_file = undefined;
      this.$emit("close");
    },
    removeAndCloseModal() {
      if (this.optimized_file)
        this.$api.deleteItem({ path: this.optimized_file.$path });
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
._mediaPreview {
  border: 2px solid var(--c-gris_clair);
  background-color: var(--c-gris_clair);
  border-radius: 2px;

  &[data-type="image"] {
    aspect-ratio: 1/1;
  }
  &[data-type="video"] {
    ::v-deep video {
      max-height: 50vh;
    }
  }
  ::v-deep {
    ._mediaContent {
      height: 100%;
    }
    ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: scale-down;
      max-width: none;
      background-color: var(--c-gris_clair);
      border-radius: 2px;
    }
  }
}
</style>
