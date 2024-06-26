<template>
  <BaseModal2 :title="$t('export')" @close="$emit('close')">
    <div class="_cont">
      <template v-if="!created_video">
        <div>
          <DLabel :str="$t('quality')" />
          <div class="">
            <SelectField2
              :value="resolution_preset_picked"
              :options="presets"
              :can_edit="true"
              :hide_validation="true"
              @change="resolution_preset_picked = $event"
            />
          </div>
        </div>
        <div class="_spinner" v-if="is_exporting" key="loader">
          <AnimatedCounter :value="progress_percent" />
        </div>
      </template>
      <template v-else>
        <div class="_preview">
          <MediaContent
            :file="created_video"
            :resolution="1600"
            :show_fs_button="true"
            :context="'full'"
          />
        </div>
      </template>
    </div>

    <div slot="footer">
      <template v-if="!created_video">
        <div>
          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="renderVideo"
          >
            <b-icon icon="tools" />
            {{ $t("preview_new") }}
          </button>
        </div>
        <div class="u-instructions">
          {{ $t("wont_remove_original") }}
        </div>
      </template>
      <template v-else>
        <div class="u-sameRow">
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
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    base_instructions: Object,
    make: Object,
  },
  components: {},
  data() {
    return {
      is_exporting: false,
      finished_saving_to_project: false,
      resolution_preset_picked: "source",
      progress_percent: 0,

      presets: [
        {
          key: "source",
          text: this.$t("close_to_source"),
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

      created_video: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    export_href() {
      if (!this.created_video) return "";
      return this.makeMediaFileURL({
        $path: this.created_video.$path,
        $media_filename: this.created_video.$media_filename,
      });
    },
    export_name() {
      if (!this.created_video) return "";
      return this.created_video.$media_filename;
    },
  },
  methods: {
    async renderVideo() {
      this.progress_percent = 0;
      this.is_exporting = true;
      this.created_video = false;

      let instructions = Object.assign({}, this.base_instructions);

      const additional_meta = {};
      additional_meta.$origin = "make";
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      // output_height ?

      instructions.additional_meta = additional_meta;

      const current_task_id = await this.$api.exportFolder({
        path: this.make.$path,
        instructions,
      });

      this.$api.join({ room: "task_" + current_task_id });

      const updateProgress = ({ task_id, progress }) => {
        if (task_id !== current_task_id) return;
        this.progress_percent = progress;
      };
      this.$eventHub.$on("task.status", updateProgress);

      const checkIfEnded = ({ task_id, message }) => {
        if (task_id !== current_task_id) return;
        this.$eventHub.$off("task.ended", checkIfEnded);
        this.$api.leave({ room: "task_" + current_task_id });

        if (message.event === "completed") {
          this.created_video = message.file;
        } else if (message.event === "aborted") {
          //
        } else if (message.event === "failed") {
          message.info;
        }

        this.progress_percent = 100;
        this.is_exporting = false;
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
    async saveToProject() {
      this.finished_saving_to_project = true;
      setTimeout(() => {
        this.$emit("close");
      }, 3000);
    },
  },
};
</script>
<style lang="scss" scoped>
._cont {
}

._saveNotice {
  position: absolute;
  inset: -2px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
}

._spinner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);

  display: flex;
  justify-content: center;
  align-items: center;
}

._preview {
  margin: calc(var(--spacing) * 1) 0;
}
</style>
