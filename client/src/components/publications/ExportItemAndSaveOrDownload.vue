<template>
  <BaseModal2 :title="$t('export_publi')" @close="$emit('close')">
    <template v-if="is_exporting">
      <div class="u-instructions">
        {{ $t("export_in_progress") }}
      </div>
      <div class="">
        <b><AnimatedCounter :value="task_progress" /></b>
      </div>
    </template>
    <template v-else>
      <MediaContent
        class="_preview"
        v-if="created_doc"
        :file="created_doc"
        :resolution="1600"
        :context="'full'"
      />
      <div class="u-sameRow" slot="footer">
        <a
          :disabled="!export_href"
          :download="export_name"
          :href="export_href"
          target="_blank"
          class="u-buttonLink"
        >
          {{ $t("download") }}
        </a>
        <button
          type="button"
          class="u-button u-button_red"
          @click="saveToProject"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 168 168"
            style="enable-background: new 0 0 168 168"
            xml:space="preserve"
          >
            <path
              style="fill: var(--c-rouge)"
              d="M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84 C168,37.6,130.4,0,84,0z"
            />
            <g style="fill: var(--c-orange)">
              <path d="m42 42h21.6v21h-21.6z" />
              <path d="m73.2 42h21.6v21h-21.6z" />
              <path d="m104.4 42h21.6v21h-21.6z" />
              <path d="m42 73.5h21.6v21h-21.6z" />
              <path d="m73.2 73.5h21.6v21h-21.6z" />
              <path d="m104.4 73.5h21.6v21h-21.6z" />
              <path d="m42 105h21.6v21h-21.6z" />
              <path d="m73.2 105h21.6v21h-21.6z" />
              <path d="m104.4 105h21.6v21h-21.6z" />
            </g>
          </svg>
          {{ $t("save_to_project") }}
        </button>
      </div>
      <div class="_saveNotice" v-if="finished_saving_to_project">
        {{ $t("media_was_saved_to_project") }}
      </div>
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    publication_path: String,
    instructions: Object,
  },
  components: {},
  data() {
    return {
      is_exporting: false,
      created_doc: undefined,
      task_progress: 0,
      finished_saving_to_project: false,
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
    export_name() {
      return this.created_doc?.$media_filename;
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
          //
        } else if (message.event === "failed") {
          message.info;
        }
        this.is_exporting = false;
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
    async saveToProject() {
      this.finished_saving_to_project = true;
      this.$eventHub.$emit("animatePane", "collect");
      setTimeout(() => {
        this.$emit("close");
      }, 3000);
    },
  },
};
</script>
<style lang="scss" scoped>
._preview {
  border: 2px solid var(--c-gris);
  aspect-ratio: 1;
}
</style>
