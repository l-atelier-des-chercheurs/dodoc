<template>
  <Modal
    @close="$emit('close')"
    @submit="editThisMedia"
    :read_only="read_only"
    :typeOfModal="
      media.type !== 'text' ? 'LargeAndNoScroll' : 'LargeAndNoScroll'
    "
    :askBeforeClosingModal="askBeforeClosingModal"
    :show_sidebar="$root.media_modal.show_sidebar"
    :is_minimized="$root.media_modal.minimized"
    :is_loading="is_sending_content_to_server"
    :can_minimize="true"
    :media_navigation="true"
  >
    <template slot="header">
      <div class>
        <template v-if="can_edit_media">{{ $t("edit_the_media") }}</template>
        <template v-else>{{ $t("media") }}</template>
      </div>
      <small class="font-normal">{{ media.media_filename }}</small>
      <ClientsCheckingOut
        :type="'projects'"
        :slugFolderName="slugProjectName"
        :metaFileName="media.metaFileName"
      />
    </template>

    <template slot="sidebar">
      <!-- <small>{{ this.$root.all_authors }}</small> -->
      <div v-if="!read_only" class="m_modal--buttonrow">
        <!-- CONFLICT WITH QR PRINTING -->
        <!-- <button type="button"
          class="buttonLink"
          @click.prevent="printMedia()"
          >
          {{ $t('print') }}
        </button>-->

        <a
          :download="media.media_filename"
          :href="mediaURL"
          target="_blank"
          class="buttonLink hide_on_print"
          :disabled="read_only"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="46.7px"
            height="70px"
            viewBox="0 0 46.7 70"
            style="enable-background: new 0 0 46.7 70;"
            xml:space="preserve"
          >
            <g>
              <g>
                <path
                  class="st0"
                  d="M8.5,35.2l4.6,4.2c2.7,2.5,4.8,4.7,6.4,7.3l0-46.7h7.7l0,46.6c1.7-2.5,3.8-4.7,6.4-7.1l4.6-4.2l5.3,6.2
			L23.3,59.6L3.2,41.5L8.5,35.2z"
                />
              </g>
              <polygon class="st0" points="46.7,70 0,70 0,62.4 46.6,62.4 	" />
            </g>
          </svg>
          {{ $t("download") }}
        </a>

        <button
          type="button"
          class="buttonLink"
          :class="{ 'is--active': showQRModal }"
          @click="showQRModal = !showQRModal"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px"
            y="0px"
            width="20px"
            height="20px"
            viewBox="0 0 90 90"
            style="enable-background: new 0 0 90 90;"
            xml:space="preserve"
          >
            <path
              d="M48,0v42h42V0H48z M84,36H54V6h30V36z M13,77h16V61H13V77z M0,90h42V48H0V90z M6,54h30v30H6V54z M63,48H48v13h15V48z M69,54
              h8v7h-8v12h-8v-8h-9v8h5v9h-9v8h21v-8h13v-9h-5v-8h13V48H69V54z M0,42h42V0H0V42z M6,6h30v30H6V6z M90,90v-8h-8v8H90z M13,29h16V13
              H13V29z M77,13H61v16h16V13z"
            />
          </svg>
          <span class>{{ $t("share") }}</span>
        </button>

        <template v-if="showQRModal">
          <hr />
          <CreateQRCode :slugFolderName="slugProjectName" :media="media" />
        </template>

        <button
          type="button"
          v-if="can_edit_media"
          class="buttonLink"
          :class="{ 'is--active': showCopyToProjectOptions }"
          @click="showCopyToProjectOptions = !showCopyToProjectOptions"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="91.6px"
            height="95px"
            viewBox="0 0 91.6 95"
            style="enable-background: new 0 0 91.6 95;"
            xml:space="preserve"
          >
            <polygon
              class="st0"
              points="39.5,11.8 83,11.8 83,55.4 72.7,55.4 72.7,67.2 94.8,67.2 94.8,0 27.7,0 27.7,22.2 39.5,22.2 	"
            />
            <path
              class="st0"
              d="M67.2,27.7L0,27.7l0,67.2l67.2,0L67.2,27.7z M55.4,83l-43.6,0l0-43.6l43.6,0L55.4,83z"
            />
          </svg>
          <span class>{{ $t("duplicate") }}</span>
        </button>

        <div v-if="showCopyToProjectOptions" class="margin-bottom-small">
          <label v-html="$t('add_to_project')" />
          <div class="input-group">
            <select v-model="upload_to_folder">
              <option
                v-for="project in all_projects"
                :key="project.slugFolderName"
                :value="project.slugFolderName"
              >{{ project.name }}</option>
            </select>
            <button
              type="button"
              @click="copyMediaToProject(upload_to_folder)"
              :disabled="upload_to_folder === ''"
              v-html="$t('copy')"
              class="bg-bleuvert"
            />
          </div>
        </div>

        <button
          type="button"
          class="buttonLink"
          :class="{ 'is--active': show_edit_media_options }"
          @click="show_edit_media_options = !show_edit_media_options"
          v-if="
            can_edit_media && (media.type === 'image' || media.type === 'video' || media.type === 'audio')
          "
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="77.6px"
            height="85.4px"
            viewBox="0 0 77.6 85.4"
            style="enable-background: new 0 0 77.6 85.4;"
            xml:space="preserve"
          >
            <path
              d="M73.9,39h-7.6c-1.6-5.6-6.7-9.7-12.7-9.7S42.5,33.5,40.8,39H3.7c-2,0-3.7,1.6-3.7,3.7c0,2,1.6,3.7,3.7,3.7h37.1
		c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h7.6c2,0,3.7-1.6,3.7-3.7C77.6,40.7,76,39,73.9,39z M53.6,48.7c-3.2,0-6-2.6-6-6
		s2.6-6,6-6s6,2.6,6,6S56.8,48.7,53.6,48.7z"
            />
            <path
              d="M3.7,17.1h7.9c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h36.9c2,0,3.7-1.6,3.7-3.7S76,9.7,73.9,9.7H37
		C35.4,4.1,30.3,0,24.3,0S13.2,4.1,11.6,9.7H3.7c-2,0-3.7,1.6-3.7,3.7S1.6,17.1,3.7,17.1z M24.3,7.4c3.2,0,6,2.6,6,6s-2.6,6-6,6
		s-6-2.8-6-6S21.1,7.4,24.3,7.4z"
            />
            <path
              d="M73.9,68.3H37c-1.6-5.6-6.7-9.7-12.7-9.7s-11.1,4.1-12.7,9.7H3.7c-2,0-3.7,1.6-3.7,3.7s1.6,3.7,3.7,3.7h7.9
		c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h36.9c2,0,3.7-1.6,3.7-3.7S76,68.3,73.9,68.3z M24.3,78c-3.2,0-6-2.6-6-6s2.6-6,6-6
		s6,2.6,6,6S27.5,78,24.3,78z"
            />
          </svg>
          {{ $t("adjust") }}
        </button>
        <div v-if="show_edit_media_options" class="bg-gris_tresclair border">
          <button
            type="button"
            class="buttonLink"
            @click="editRawMedia('rotate_image', { angle: 90 })"
            v-if="media.type === 'image'"
          >{{ $t("rotate_clockwise") }}</button>
          <button
            type="button"
            class="buttonLink"
            @click="editRawMedia('optimize_video')"
            v-if="media.type === 'video' || media.type === 'audio'"
          >{{ $t("optimize") }}</button>
          <button
            type="button"
            class="buttonLink"
            @click="editRawMedia('reset')"
            v-if="!!media.original_media_filename"
          >{{ $t("revert_to_original") }}</button>
          <button
            type="button"
            class="buttonLink"
            :class="{ 'is--active': trim_mode }"
            @click="trim_mode = !trim_mode"
            v-if="media.type === 'video' || media.type === 'audio'"
          >{{ $t("trim") }}</button>

          <div v-if="trim_mode" class="ta-le">
            <div class="margin-sides-small margin-vert-verysmall">
              <small>{{ $t("trim_video_instructions") }}</small>
            </div>
            <div class="flex-wrap flex-space-betwen">
              <div class="margin-small margin-vert-verysmall">
                <label>{{ $t("beginning") }}</label>
                <div class>
                  <input type="time" class="bg-blanc" v-model="trim_options.beginning" />
                </div>
              </div>
              <div class="margin-small margin-vert-verysmall">
                <label>{{ $t("end") }}</label>
                <div class>
                  <input type="time" class="bg-blanc" v-model="trim_options.end" />
                </div>
              </div>
            </div>
            <!-- <hr class="margin-vert-small" /> -->
            <div class="margin-sides-verysmall margin-vert-verysmall">
              <button
                type="button"
                class="button-greenthin"
                @click="editRawMedia('trim', trim_options)"
              >{{ $t('create') }}</button>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="buttonLink hide_on_print"
          @click.prevent="removeMedia()"
          v-if="can_edit_media"
          :disabled="read_only"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="91.6px"
            height="95px"
            viewBox="0 0 91.6 95"
            style="enable-background: new 0 0 91.6 95;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
            />
          </svg>
          {{ $t("remove") }}
        </button>

        <hr class="hide_on_print" />
      </div>

      <div class="hide_on_print">
        <!-- Fav or not -->
        <div
          class="margin-bottom-small"
          v-if="can_edit_media || (!can_edit_media && !!mediadata.fav)"
        >
          <span class="switch switch-xs">
            <input
              type="checkbox"
              class="switch"
              id="favswitch_editmedia"
              v-model="mediadata.fav"
              :disabled="!can_edit_media"
            />
            <label for="favswitch_editmedia" :class="{ 'c-rouge': mediadata.fav }">
              {{ $t("fav") }}
              <svg
                version="1.1"
                class="inline-svg"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
                x="0px"
                y="0px"
                width="78.5px"
                height="106.4px"
                viewBox="0 0 78.5 106.4"
                style="enable-background: new 0 0 78.5 106.4;"
                xml:space="preserve"
              >
                <polygon
                  class="st0"
                  points="60.4,29.7 78.5,7.3 78.5,7.3 12.7,7.3 12.7,52 78.5,52 78.5,52 	"
                />
                <polygon class="st0" points="9.6,106.4 0,106.4 0,2 9.6,0 " />
              </svg>
            </label>
          </span>
        </div>

        <div class="margin-vert-verysmall">
          <label>
            <button
              type="button"
              class="button-nostyle text-uc button-triangle"
              :class="{ 'is--active': show_media_infos }"
              @click="show_media_infos = !show_media_infos"
            >{{ $t("infos_about_the_media") }}</button>
          </label>

          <div v-if="show_media_infos" class="margin-vert-verysmall">
            <div class="m_metaField" v-if="!!media.type">
              <div>{{ $t("type") }}</div>
              <div>{{ $t(media.type) }}</div>
            </div>
            <div class="m_metaField" v-if="media_size && media.type !== 'text'">
              <div>{{ $t("size") }}</div>
              <div>{{ $root.formatBytes(media_size) }}</div>
            </div>
            <div class="m_metaField" v-if="media_dimensions">
              <div>{{ $t("dimensions") }}</div>
              <div>{{ media_dimensions }}</div>
            </div>

            <div
              class="m_metaField"
              v-if="
                !!project_name &&
                $root.current_project.slugFolderName !== slugProjectName
              "
            >
              <div>{{ $t("project") }}</div>
              <div>
                <button
                  type="button"
                  @click="minimizeMediaAndShowProject"
                  :content="$t('open_project')"
                  v-tippy="{
                    placement: 'top',
                    delay: [600, 0],
                  }"
                  style="text-transform: initial;"
                >
                  {{ project_name }}
                  ↑
                </button>
                <!-- <img class="mediaTypeIcon" :src="mediaTypeIcon[media.type]" /> -->
              </div>
            </div>
            <!-- <div class="m_metaField" v-if="!!media.authors">
          <div>
            {{ $t('author') }}
          </div>
          <div>
            {{ media.authors }}
          </div>
            </div>-->

            <DateField :title="'created'" :date="media.date_created" />

            <DateField
              v-if="media.hasOwnProperty('date_uploaded')"
              :title="'uploaded'"
              :date="media.date_uploaded"
            />

            <DateField
              v-if="
                media.hasOwnProperty('date_uploaded') &&
                media.date_uploaded !== media.date_modified
              "
              :title="'edited'"
              :date="media.date_modified"
            />
          </div>
        </div>

        <!-- Caption -->
        <div v-if="!read_only || !!mediadata.caption" class="margin-bottom-small">
          <label>{{ $t("caption") }}</label>
          <br />
          <textarea v-model="mediadata.caption" :readonly="read_only || !can_edit_media"></textarea>
        </div>

        <!-- Type of media (if guessed wrong from filename, will only be stored in the meta file and used as a reference when displaying that media on the client) -->
        <!-- Disabled for now: if an image or video is tagged as "text" or marked, a folder becomes unreadable -->
        <!-- <div class="margin-bottom-small">
          <label>{{ $t('type') }}</label>
          <select v-if="!read_only" ref="type" v-model="mediadata.type">
            <option v-for="mediaType in $root.state.structure.media.type.options" :key="mediaType">
              {{ mediaType }}
            </option>
          </select>
          <input type="text" v-else :value="mediadata.type" readonly>
        </div>-->

        <!-- Keywords -->
        <!-- <div v-if="!read_only || !!mediadata.keywords" class="margin-bottom-small">
          <label>{{ $t('keywords') }}</label>
          <textarea v-model="mediadata.keywords" :readonly="read_only">
          </textarea>
        </div>-->

        <!-- Keywords -->
        <div class="margin-bottom-small">
          <label>{{ $t("keywords") }}</label>
          <TagsInput
            :keywords="mediadata.keywords"
            :read_only="read_only || !can_edit_media"
            @tagsChanged="(newTags) => (mediadata.keywords = newTags)"
          />
        </div>

        <!-- Author(s) -->
        <div class="margin-bottom-small">
          <label>{{ $t("author") }}</label>

          <AuthorsInput
            :currentAuthors.sync="mediadata.authors"
            :read_only="read_only || !can_edit_media"
          />

          <small v-if="can_edit_media">{{ $t("author_instructions") }}</small>
          <!-- <textarea v-model="mediadata.authors[0]" :readonly="read_only">
          </textarea>-->
        </div>
      </div>
    </template>

    <template slot="submit_button">{{ $t("save") }}</template>

    <template slot="preview">
      <MediaContent
        :context="'edit'"
        :slugFolderName="slugProjectName"
        :media="media"
        :folderType="'projects'"
        :read_only="read_only || !can_edit_media"
        v-model="mediadata.content"
      />
      <div class="m_mediaOptions"></div>
    </template>
  </Modal>
</template>
<script>
import MediaContent from "../subcomponents/MediaContent.vue";
import DateTime from "../subcomponents/DateTime.vue";
import CreateQRCode from "./qr/CreateQRCode.vue";
import { setTimeout } from "timers";
import AuthorsInput from "../subcomponents/AuthorsInput.vue";
import TagsInput from "../subcomponents/TagsInput.vue";
import ClientsCheckingOut from "../subcomponents/ClientsCheckingOut.vue";

export default {
  props: {
    slugProjectName: String,
    slugMediaName: String,
    media: Object,
    read_only: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    DateTime,
    MediaContent,
    CreateQRCode,
    AuthorsInput,
    TagsInput,
    ClientsCheckingOut,
  },
  data() {
    return {
      showQRModal: false,
      showCopyToProjectOptions: false,
      is_minimized: false,
      show_edit_media_options: false,
      show_media_infos: false,

      upload_to_folder: this.slugProjectName,
      is_sending_content_to_server: false,

      mediadata: {
        type: this.media.type,
        authors: this.media.authors,
        caption: this.media.caption,
        keywords: this.media.keywords,
        fav: this.media.fav,
        content: this.media.content,
      },
      mediaURL: `/${this.slugProjectName}/${this.media.media_filename}`,
      askBeforeClosingModal: false,

      trim_options: {
        beginning: "",
        end: "",
      },

      trim_mode: false,

      is_ready: false,
    };
  },
  watch: {
    mediadata: {
      handler() {
        if (this.is_ready) {
          this.askBeforeClosingModal = true;
        }
      },
      deep: true,
    },
    trim_mode() {
      if (this.trim_mode) {
        this.trim_options.beginning = "00:00";
        this.trim_options.end = this.$root.formatDurationToMinuteHours(
          this.media_duration * 1000
        );
      }
    },
  },
  created() {
    if (typeof this.mediadata.authors === "string") {
      if (this.mediadata.authors !== "") {
        this.mediadata.authors = this.mediadata.authors.split(",").map((a) => {
          return { name: a };
        });
      } else {
        this.mediadata.authors = [];
      }
    }
    this.$nextTick(() => {
      this.is_ready = true;
    });
  },
  computed: {
    all_projects() {
      return this.$root.projects_that_are_accessible;
    },
    can_edit_media() {
      return this.$root.canEditFolder({
        type: "projects",
        slugFolderName: this.slugProjectName,
      });
    },
    project_name() {
      if (
        !this.slugProjectName ||
        !this.$root.store.projects.hasOwnProperty(this.slugProjectName)
      ) {
        return false;
      }
      return this.$root.store.projects[this.slugProjectName].name;
    },
    media_size() {
      if (
        !this.media.file_meta ||
        !this.media.file_meta.find((m) => m.hasOwnProperty("size"))
      )
        return false;
      return this.media.file_meta.find((m) => m.hasOwnProperty("size")).size;
    },
    media_dimensions() {
      if (
        !this.media.file_meta ||
        !this.media.file_meta.find((m) => m.hasOwnProperty("width")) ||
        !this.media.file_meta.find((m) => m.hasOwnProperty("height"))
      )
        return false;
      return (
        this.media.file_meta.find((m) => m.hasOwnProperty("width")).width +
        " × " +
        this.media.file_meta.find((m) => m.hasOwnProperty("height")).height
      );
    },
    media_duration: function () {
      if (
        !this.media.hasOwnProperty("duration") &&
        !(
          this.media.hasOwnProperty("file_meta") &&
          this.media.file_meta.some((f) => f.hasOwnProperty("duration"))
        )
      )
        return false;

      const duration = this.media.hasOwnProperty("duration")
        ? this.media.duration
        : this.media.file_meta.find((f) => f.hasOwnProperty("duration"))
            .duration;
      return duration;
    },
  },
  methods: {
    printMedia: function () {
      window.print();
    },
    minimizeMediaAndShowProject: function () {
      this.$root.media_modal.minimized = true;
      this.$root.openProject(this.slugProjectName);
    },
    removeMedia: function () {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveMedia"),
          () => {
            this.$root.removeMedia({
              type: "projects",
              slugFolderName: this.slugProjectName,
              slugMediaName: this.slugMediaName,
            });
            // then close that popover
            this.$emit("close", "");
          },
          () => {}
        );
    },
    editThisMedia: function () {
      console.log("editThisMedia");

      this.$eventHub.$once(
        "socketio.projects.media_listed",
        this.editWereSaved
      );

      this.$root.editMedia({
        type: "projects",
        slugFolderName: this.slugProjectName,
        slugMediaName: this.slugMediaName,
        data: this.mediadata,
      });

      // show loader if modifications took more than .25 seconds to happen
      setTimeout(() => {
        this.is_sending_content_to_server = true;

        // indicate that changes could not be saved after 5 seconds
        setTimeout(() => {
          if (this.is_sending_content_to_server) {
            this.is_sending_content_to_server = false;
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t("notifications.failed_to_save_media"));
          }
        }, 5000);
      }, 250);
    },
    editWereSaved() {
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("notifications.successfully_saved"));
      this.is_sending_content_to_server = false;
      this.$emit("close", "");
    },
    copyMediaToProject(to_slugFolderName) {
      console.log("copyMediaToProject " + to_slugFolderName);
      this.$socketio.copyMediaToFolder({
        type: "projects",
        from_slugFolderName: this.slugProjectName,
        to_slugFolderName,
        slugMediaName: this.slugMediaName,
      });

      this.showCopyToProjectOptions = false;
    },
    editRawMedia: function (type, detail) {
      console.log("editRawMedia");
      this.$root.editMedia({
        type: "projects",
        slugFolderName: this.slugProjectName,
        slugMediaName: this.slugMediaName,
        data: this.mediadata,
        recipe_with_data: {
          apply_to: this.media.media_filename,
          type,
          detail,
        },
      });
    },
  },
};
</script>
<style>
.m_mediaOptions {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 100;
  background-color: white;
  margin: 50px 10px;
  /* padding: 15px; */
}
</style>
