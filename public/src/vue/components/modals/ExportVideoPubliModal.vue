<template>
  <Modal @close="$emit('close')" class="m_exportModal" :typeOfModal="'ExportVideo'">
    <template slot="header">
      <span class>{{ $t("export_creation") }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-sides-medium font-small">
        <div class>
          <div class="margin-bottom-small">{{ instructions }}</div>

          <div class="margin-bottom-small">
            <label>{{ $t("quality") }}</label>
            <select v-model="resolution">
              <option
                v-for="q in available_qualities"
                :value="q.resolution"
                :key="q.resolution.width + q.resolution.height"
              >{{ q.label }}</option>
              <option :value="'draft'" :key="'draft'">→ {{ $t("draft").toLowerCase() }}</option>
              <option :value="'custom'" :key="'custom'">↓ {{ $t("custom").toLowerCase() }}</option>
            </select>
            <div v-if="resolution === 'draft'">
              <small>{{ $t("video_export_draft_instructions") }}</small>
            </div>
            <div v-else-if="resolution === 'custom'">
              <small>
                {{
                $t("video_export_custom_quality_instructions")
                }}
              </small>
            </div>
            <div v-else class="label">{{ resolution.width }} × {{ resolution.height }}</div>
          </div>

          <div v-if="resolution === 'custom'" class="margin-bottom-small input-group">
            <input
              class
              type="number"
              min="2"
              max="4096"
              step="2"
              v-model.number="custom_resolution.width"
            />
            <span class="font-large padding-verysmall">×</span>
            <input
              class
              type="number"
              min="2"
              max="2160"
              step="2"
              v-model.number="custom_resolution.height"
            />
          </div>

          <div class="margin-bottom-small">
            <button
              type="button"
              class="margin-small margin-left-none bg-bleuvert c-blanc button-allwide"
              :disabled="disable_generation_button"
              @click="downloadVideo"
            >
              <template v-if="!video_request_status">
                {{
                $t("make_video")
                }}
              </template>
              <template v-else-if="video_request_status === 'waiting_for_server'">
                <span class="loader loader-xs" />
                {{ $t("notifications.creation_in_progress") }}
              </template>
              <template v-else-if="video_request_status === 'generated'">
                {{
                $t("notifications.video_created")
                }}
              </template>
              <template v-else-if="video_request_status === 'failed'">
                {{
                $t("notifications.video_creation_failed")
                }}
              </template>
            </button>
          </div>

          <div v-if="video_request_status === 'generated'">
            <hr class />
            <div class="mediaContainer">
              <vue-plyr :options="plyr_options">
                <video :src="link_to_video" controls preload="auto" />
              </vue-plyr>
            </div>
            <div v-if="resolution !== 'draft'" class="margin-vert-small">
              <a
                v-if="link_to_video !== false"
                class="buttonLink margin-left-none padding-left-none"
                :href="link_to_video"
              >{{ $t("download") }}</a>
            </div>
            <div v-if="resolution !== 'draft'" class="margin-vert-small">
              <AddCreationToProject
                v-if="exported_video_name !== false"
                :publication="publication"
                :media_filename="exported_video_name"
                @close="$emit('close')"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import { setTimeout } from "timers";
import AddCreationToProject from "../subcomponents/AddCreationToProject.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    instructions: String,
  },
  components: {
    Modal,
    AddCreationToProject,
  },
  data() {
    return {
      video_request_status: false,
      link_to_video: false,
      video_is_playing: false,
      exported_video_name: false,

      resolution: {
        width: 1280,
        height: 720,
      },
      custom_resolution: {
        width: 1280,
        height: 720,
      },
      available_qualities: [
        {
          label: this.$t("very_high"),
          resolution: {
            width: 1920,
            height: 1080,
          },
        },
        {
          label: this.$t("high"),
          resolution: {
            width: 1280,
            height: 720,
          },
        },
        {
          label: this.$t("medium"),
          resolution: {
            width: 854,
            height: 480,
          },
        },
        {
          label: this.$t("low"),
          resolution: {
            width: 640,
            height: 360,
          },
        },
      ],

      plyr_options: {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "fullscreen",
        ],
        iconUrl: "/images/plyr.svg",
      },
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    resolution: {
      handler() {
        this.video_request_status = false;
      },
      deep: true,
    },
    custom_resolution: {
      handler() {
        this.video_request_status = false;
      },
      deep: true,
    },
  },
  computed: {
    disable_generation_button() {
      if (this.video_request_status !== false) return true;
      if (this.resolution === "custom") {
        if (
          this.custom_resolution.width === 0 ||
          this.custom_resolution.width % 2 !== 0 ||
          this.custom_resolution.height === 0 ||
          this.custom_resolution.height % 2 !== 0
        )
          return true;
      }
      return false;
    },
  },
  methods: {
    downloadVideo() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • ExportVideoPubli: downloadVideo`);

      let options = {};

      if (this.resolution === "custom") {
        if (
          Number.isInteger(this.custom_resolution.width) &&
          Number.isInteger(this.custom_resolution.height)
        ) {
          options.resolution = {
            width: this.custom_resolution.width,
            height: this.custom_resolution.height,
          };
        }
      } else if (this.resolution === "draft") {
        options.resolution = {
          width: 426,
          height: 240,
        };
        options.bitrate = "1000k";
      } else {
        options.resolution = this.resolution;
      }

      this.$eventHub.$once(
        "socketio.publication.videoIsGenerated",
        this.videoPubliIsGenerated
      );
      this.$eventHub.$once(
        "socketio.publication.videoFailedToGenerate",
        this.videoPubliFailedToGenerate
      );

      this.$socketio.downloadVideoPubli({
        slugPubliName: this.slugPubliName,
        options,
      });
      this.video_request_status = "waiting_for_server";
    },
    videoPubliIsGenerated({ videoName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: videoPubliIsGenerated`);
      }

      this.$eventHub.$off("socketio.publication.videoFailedToGenerate");

      this.video_request_status = "generated";
      this.link_to_video =
        window.location.origin + "/_publications/video/" + videoName;
      this.exported_video_name = videoName;
    },
    videoPubliFailedToGenerate() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: videoPubliFailedToGenerate`);
      }

      this.$eventHub.$off("socketio.publication.videoIsGenerated");

      this.video_request_status = "failed";
    },
  },
};
</script>
