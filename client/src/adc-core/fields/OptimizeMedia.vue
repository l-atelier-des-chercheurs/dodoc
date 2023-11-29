<template>
  <div>
    <button type="button" class="u-buttonLink" @click="show_modal = true">
      <b-icon :icon="media.$optimized === true ? 'check2-circle' : 'tools'" />
      {{ $t("optimize") }}
    </button>

    <BaseModal2
      v-if="show_modal"
      :title="$t('optimize')"
      :size="modal_width"
      @close="show_modal = false"
    >
      <LoaderSpinner v-if="is_optimizing" />
      <div v-if="!optimized_file">
        <div
          v-if="media.$optimized === true"
          class="u-spacingBottom u-instructions"
        >
          {{ $t("already_optimized") }}
        </div>
        <div class="u-spacingBottom">
          <SelectField2
            :value="resolution_preset_picked"
            :options="presets"
            :can_edit="true"
            :hide_validation="true"
            @change="resolution_preset_picked = $event"
          />
        </div>

        <div class="" slot="footer">
          <div class="u-spacingBottom">
            <button
              type="button"
              class="u-button u-button_bleuvert"
              @click="optimizeMedia"
            >
              <b-icon icon="tools" />
              {{ $t("preview_optimize") }}
            </button>
          </div>
          <div class="u-instructions">
            {{ $t("wont_remove_original") }}
          </div>
        </div>
      </div>
      <div class="" v-else>
        <div class="u-spacingBottom _mediaPreview">
          <MediaContent
            :file="optimized_file"
            :context="'full'"
            :zoom_on_click="true"
            :show_fs_button="true"
            :is_draggable="false"
          />
        </div>
        <div class="u-spacingBottom">
          <DLabel :str="$t('filename')" />
          <div class="_comp">
            <span>
              {{ media.$media_filename }}
            </span>
            <b-icon icon="arrow-right-circle" />
            <strong>
              {{ optimized_file.$media_filename }}
            </strong>
          </div>
        </div>
        <div class="u-spacingBottom">
          <DLabel :str="$t('size')" />
          <div class="_comp">
            <span>
              <template v-if="media.$infos && media.$infos.size">
                {{ formatBytes(media.$infos.size) }}
              </template>
              <template v-else> ? </template>
            </span>
            <b-icon icon="arrow-right-circle" />
            <strong>
              <template
                v-if="optimized_file.$infos && optimized_file.$infos.size"
              >
                {{ formatBytes(optimized_file.$infos.size) }}
              </template>
              <template v-else> ? </template>
            </strong>
          </div>
        </div>
        <div class="u-spacingBottom">
          <DLabel :str="$t('resolution')" />
          <div class="_comp">
            <span>
              <template
                v-if="media.$infos && media.$infos.width && media.$infos.height"
              >
                {{ media.$infos.width + "×" + media.$infos.height }}
              </template>
              <template v-else> ? </template>
            </span>
            <b-icon icon="arrow-right-circle" />
            <strong>
              <template
                v-if="
                  optimized_file.$infos &&
                  optimized_file.$infos.width &&
                  optimized_file.$infos.height
                "
              >
                {{
                  optimized_file.$infos.width +
                  "×" +
                  optimized_file.$infos.height
                }}
              </template>
              <template v-else> ? </template>
            </strong>
          </div>
        </div>
        <hr />
        <div class="_btnRow">
          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="keepBoth"
          >
            <b-icon icon="file-plus" />
            {{ $t("add_optimized_to_lib") }}
          </button>
          <button
            type="button"
            class="u-button u-button_red"
            @click="replaceOriginal"
          >
            <b-icon icon="save2-fill" />
            {{ $t("replace_original") }}
          </button>
          <button type="button" class="u-buttonLink" @click="cancel">
            <b-icon icon="x-circle" />
            {{ $t("cancel") }}
          </button>
        </div>
        <div class=""></div>
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
      optimized_file: undefined,
      resolution_preset_picked: "source",

      presets: [
        {
          key: "source",
          text: this.$t("same_as_source"),
        },
        {
          key: "high",
          text: this.$t("high"),
        },
        {
          key: "medium",
          text: this.$t("medium"),
        },
      ],
    };
  },
  i18n: {
    messages: {
      fr: {
        optimize: "Optimiser",
        already_optimized:
          "Ce média a déjà été optimisé, l’optimiser à nouveau risque de dégrader sa qualité de manière importante.",
        preview_optimize: "Créer une version optimisée",
        wont_remove_original: "Ne supprimera pas l’original",
        add_optimized_to_lib: "Conserver l’original et la nouvelle version",
        replace_original: "Remplacer et supprimer l’original",
      },
      en: {
        optimize: "Optimize",
        preview_optimize: "Create optimized version",
        wont_remove_original: "Will not remove the original",
        add_optimized_to_lib: "Keep original media and add new version",
        replace_original: "Replace and remove original media",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    show_modal() {
      if (!this.show_modal) {
        this.optimized_file = "";
      }
    },
  },
  computed: {
    modal_width() {
      if (this.optimized_file) return "large";
      return undefined;
    },
  },
  methods: {
    async optimizeMedia() {
      this.is_optimizing = true;
      const instructions = {
        recipe: "optimize_media",
        suggested_file_name: this.media.$media_filename,
        quality_preset: this.resolution_preset_picked,
        base_media_path: this.makeMediaFilePath({
          $path: this.media.$path,
          $media_filename: this.media.$media_filename,
        }),
        additional_meta: {
          $origin: "collect",
          $optimized: true,
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
          this.optimized_file = message.file;
        } else if (message.event === "aborted") {
          //
        } else if (message.event === "failed") {
          this.$alertify.delay(4000).error(message.event);
          //
        }
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
    async cancel() {
      await this.$api.deleteItem({
        path: this.optimized_file.$path,
      });
      this.show_modal = false;
    },
    keepBoth() {
      this.show_modal = false;
    },
    async replaceOriginal() {
      const old_source_file = this.media.$media_filename;
      const new_source_file = this.optimized_file.$media_filename;

      // set original media to new source file
      await this.$api.updateMeta({
        path: this.media.$path,
        new_meta: {
          $media_filename: new_source_file,
          $type: this.optimized_file.$type,
          $optimized: true,
        },
      });

      // CLEAN UP
      // set optimized media to old source file
      await this.$api.updateMeta({
        path: this.optimized_file.$path,
        new_meta: {
          $media_filename: old_source_file,
        },
      });
      // remove optimized media
      await this.$api.deleteItem({
        path: this.optimized_file.$path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._btnRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: calc(var(--spacing) / 2);
}

._mediaPreview {
  aspect-ratio: 1/1;
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
      background-color: var(--c-gris);
      border-radius: 2px;
    }
  }
}
._comp {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}
</style>
