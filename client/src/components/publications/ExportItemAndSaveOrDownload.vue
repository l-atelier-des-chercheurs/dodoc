<template>
  <BaseModal2 @close="removeAndCloseModal">
    <template v-if="is_exporting">
      <div class="u-instructions u-spacingBottom">
        {{ $t("export_in_progress") }}
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
      <template v-if="created_doc">
        <div
          v-if="instructions.recipe === 'webpage'"
          class="u-instructions"
          v-html="$t('webpage_export_instructions')"
        />
        <MediaContent
          v-else
          class="_preview"
          :file="created_doc"
          :resolution="1600"
          :context="'full'"
        />
        <div class="u-spacingBottom" />
        <ShowExportedFileInfos :file="created_doc" />

        <a
          :disabled="!export_href"
          :download="created_doc.$media_filename"
          :href="export_href"
          target="_blank"
          class="u-buttonLink"
        >
          {{ $t("download") }}
        </a>
      </template>
      <template slot="footer">
        <button type="button" class="u-button" @click="removeAndCloseModal">
          <b-icon icon="arrow-left-short" />
          {{ $t("back") }}
        </button>
        <button
          type="button"
          class="u-button u-button_red"
          @click="saveToProject"
        >
          <span class="u-icon" v-html="dodoc_icon_collect" />
          {{ $t("save_to_project") }}
        </button>
      </template>
    </template>
  </BaseModal2>
</template>
<script>
import ShowExportedFileInfos from "@/components/fields/ShowExportedFileInfos.vue";

export default {
  props: {
    publication_path: String,
    instructions: Object,
  },
  components: { ShowExportedFileInfos },
  data() {
    return {
      is_exporting: false,
      created_doc: undefined,
      task_progress: 0,
      fail_message: undefined,
    };
  },
  created() {},
  async mounted() {
    await this.startExport();
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    export_href() {
      if (!this.created_doc) return false;
      return this.makeMediaFileURL({
        $path: this.created_doc.$path,
        $media_filename: this.created_doc.$media_filename,
      });
    },
  },
  methods: {
    async startExport() {
      const current_task_id = await this.$api.exportFolder({
        path: this.publication_path,
        instructions: this.instructions,
      });
      this.$api.join({ room: "task_" + current_task_id });

      this.$alertify.delay(4000).log(this.$t("compilation_started"));

      this.is_exporting = true;

      const checkProgress = ({ task_id, progress }) => {
        if (task_id !== current_task_id) return;
        this.task_progress = progress;
      };

      this.$eventHub.$on("task.status", checkProgress);

      const checkIfEnded = ({ task_id, message }) => {
        if (task_id !== current_task_id) return;
        this.$eventHub.$off("task.ended", checkIfEnded);
        this.$api.leave({ room: "task_" + current_task_id });
        if (message.event === "completed") {
          this.created_doc = message.file;
        } else if (message.event === "aborted") {
          this.fail_message = this.$t("failed_to_export");
          //
        } else if (message.event === "failed") {
          this.fail_message =
            this.$t("failed_to_export") + " : " + message.info;
        }
        this.is_exporting = false;
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
    async saveToProject() {
      this.$eventHub.$emit("pane.animate", "collect");
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("media_was_saved_to_project"));
      this.$emit("close");
    },
    removeAndCloseModal() {
      if (this.created_doc)
        this.$api.deleteItem({ path: this.created_doc.$path });
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._preview {
  border: 2px solid var(--c-gris_clair);
  background-color: var(--c-gris_clair);

  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1;
}

._saveNotice {
  position: absolute;
  inset: -2px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
