<template>
  <div>
    <button type="button" class="u-buttonLink" @click="show_modal = true">
      <b-icon icon="tools" />
      {{ $t("optimize") }}
    </button>

    <BaseModal2
      v-if="show_modal"
      :title="$t('optimize')"
      @close="show_modal = false"
    >
      <LoaderSpinner v-if="is_optimizing" />
      <div v-if="!optimize_file">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="optimizeMedia"
        >
          <b-icon icon="tools" />
          {{ $t("preview_optimize") }}
        </button>
        <div class="u-instructions">
          {{ $t("wont_remove_original") }}
        </div>
      </div>
      <div class="" v-else>
        <MediaContent
          :file="optimize_file"
          :context="'full'"
          :show_fs_button="true"
          :is_draggable="false"
        />
        <button type="button" class="u-buttonLink" @click="replaceOriginal">
          <b-icon icon="file-plus" />
          {{ $t("replace_original") }}
        </button>
      </div>
    </BaseModal2>
  </div>
</template>
<script>
export default {
  props: {
    media: Object,
  },
  components: {},
  data() {
    return {
      show_modal: false,
      is_optimizing: false,
      optimize_file: undefined,
    };
  },
  i18n: {
    messages: {
      fr: {
        optimize: "Optimiser",
        preview_optimize: "Créer une version optimisée",
        wont_remove_original: "Ne supprimera pas l’original",
      },
      en: {
        optimize: "Optimize",
        preview_optimize: "Create optimized version",
        wont_remove_original: "Will not remove the original",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async optimizeMedia() {
      this.is_optimizing = true;

      const instructions = {
        recipe: "optimize_media",
        suggested_file_name: this.media.$media_filename,
        base_media_path: this.makeMediaFilePath({
          $path: this.media.$path,
          $media_filename: this.media.$media_filename,
        }),
        additional_meta: {
          $origin: "collect",
        },
      };
      const current_task_id = await this.$api.optimizeFile({
        path: this.media.$path,
        instructions,
      });
      this.$api.join({ room: "task_" + current_task_id });

      const checkIfEnded = ({ task_id, message }) => {
        if (task_id !== current_task_id) return;
        this.is_optimizing = false;
        this.$eventHub.$off("task.ended", checkIfEnded);
        this.$api.leave({ room: "task_" + current_task_id });

        if (message.event === "completed") {
          message.file;
          this.optimize_file = message.file;
        } else if (message.event === "aborted") {
          //
        } else if (message.event === "failed") {
          this.$alertify.delay(4000).error(message.event);
          //
        }
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
    async replaceOriginal() {
      const old_source_file = this.media.$media_filename;
      const new_source_file = this.optimize_file.$media_filename;

      // set original media to new source file
      await this.$api.updateMeta({
        path: this.media.$path,
        new_meta: {
          $media_filename: new_source_file,
          $type: this.optimize_file.$type,
        },
      });

      // CLEAN UP
      // set optimized media to old source file
      await this.$api.updateMeta({
        path: this.optimize_file.$path,
        new_meta: {
          $media_filename: old_source_file,
        },
      });
      // remove optimized media
      await this.$api.deleteItem({
        path: this.optimize_file.$path,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
