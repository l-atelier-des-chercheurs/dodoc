<template>
  <div class="m_project--library">
    <div class="m_actionbar" v-show="$root.state.connected">
      <div class="m_actionbar--buttonBar" v-if="can_edit_project">
        <button
          type="button"
          class="barButton barButton_capture"
          @click="openCapture"
          :disabled="read_only || !can_edit_project"
        >
          <span>{{ $t("capture") }}</span>
        </button>

        <label
          class="barButton barButton_import button"
          :disabled="read_only || !can_edit_project"
          :for="`add_file_${id}`"
        >
          <span>
            {{ $t("import") }}
            <!-- <div v-html="field.svg" /> -->
          </span>
          <input
            type="file"
            multiple
            :id="`add_file_${id}`"
            name="file"
            :disabled="read_only || !can_edit_project"
            @change="updateInputFiles($event)"
            accept
            style="width: 1px; height: 1px; overflow: hidden"
          />
        </label>

        <transition name="fade_fast" :duration="150">
          <div
            v-if="!read_only && show_drop_container && can_edit_project"
            @drop="dropHandler($event)"
            class="_drop_indicator"
          >
            <div>
              <img src="/images/i_importer.svg" draggable="false" />
              <label>{{ $t("drop_here_to_import") }}</label>
            </div>
          </div>
        </transition>

        <UploadFileModal
          v-if="selected_files.length > 0"
          @close="selected_files = []"
          :read_only="read_only"
          :slugFolderName="slugProjectName"
          :type="'projects'"
          :selected_files.sync="selected_files"
        />

        <button
          type="button"
          class="barButton barButton_text"
          @click="createTextMedia"
          :disabled="read_only || !can_edit_project"
        >
          <span>{{ $t("write") }}</span>
        </button>

        <button
          type="button"
          class="barButton barButton_qrCode"
          @click="openQRCodeModal"
          :disabled="read_only || !can_edit_project"
        >
          <span>{{ $t("qr_code") }}</span>
        </button>

        <button
          type="button"
          class="barButton barButton_recipes bg-bleuvert"
          @click="openPubliPaneToPubliWithFilterProject"
          :disabled="read_only"
        >
          <span>{{ $t("recipes") }}</span>
        </button>
      </div>

      <div class="m_actionbar--text">
        <!-- {{ $t("showing") }} -->
        <span :class="{ 'c-rouge': sortedMedias.length !== allMedias.length }">
          {{ sortedMedias.length }}
          {{ $t("medias_of") }}
          {{ allMedias.length }}
        </span>
        <template v-if="$root.allKeywords.length >= 0">
          —
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_filters }"
            @click="show_filters = !show_filters"
          >
            {{ $t("filters") }}
          </button>
          <button
            type="button"
            class="button-nostyle text-uc padding-left-verysmall"
            v-if="has_filters_enabled"
            @click="removeAllFilters"
          >
            {{ $t("remove_filters") }}
          </button>
        </template>

        <template v-if="!show_medias_instead_of_projects && show_filters">
          <TagsAndAuthorFilters
            :allKeywords="mediaKeywords"
            :allAuthors="mediaAuthors"
            :allTypes="mediaTypes"
            :keywordFilter="$root.settings.media_filter.keyword"
            :authorFilter="$root.settings.media_filter.author"
            :favFilter="$root.settings.media_filter.fav"
            @setKeywordFilter="(a) => $root.setMediaKeywordFilter(a)"
            @setAuthorFilter="(a) => $root.setMediaAuthorFilter(a)"
            @setFavFilter="(a) => $root.setFavFilter(a)"
            @setTypeFilter="(a) => $root.setTypeFilter(a)"
          />
        </template>
      </div>
    </div>
    <transition-group class="m_project--library--medias" name="list-complete">
      <div v-for="[day, medias] in groupedMedias" :key="day">
        <h3
          class="font-folder_title margin-sides-small margin-none margin-bottom-small"
        >
          {{ $root.formatDateToHuman(day) }}
          <span v-if="medias.length > 0" class="_media_counter">{{
            medias.length
          }}</span>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle _fold_button"
            :class="{
              'is--active': !folded_days.includes(day),
            }"
            @click="toggleDayFolding(day)"
          >
            {{ !folded_days.includes(day) ? $t("fold") : $t("unfold") }}
          </button>
        </h3>
        <div class="m_mediaShowAll" v-if="!folded_days.includes(day)">
          <div v-for="media in medias" :key="media.slugMediaName">
            <MediaCard
              :key="media.metaFileName"
              :media="media"
              :metaFileName="media.metaFileName"
              :slugProjectName="slugProjectName"
              :can_edit_media="can_edit_project"
              :preview_size="180"
              :class="{
                'is--just_added': last_media_added.includes(media.metaFileName),
                'is--opened_in_media_modal':
                  $root.media_modal.current_slugProjectName ===
                    slugProjectName &&
                  media.metaFileName === $root.media_modal.current_metaFileName,
              }"
              :is_selected="
                mediaIsSelected({
                  slugFolderName: slugProjectName,
                  metaFileName: media.metaFileName,
                })
              "
              @toggleSelect="
                toggleSelectMedia({
                  slugFolderName: slugProjectName,
                  metaFileName: media.metaFileName,
                })
              "
            />
          </div>
        </div>
      </div>
    </transition-group>

    <transition name="fade_fast" :duration="400">
      <SelectorBar
        v-if="selected_medias.length > 0"
        :selected_medias="selected_medias"
        :slugFolderName="slugProjectName"
        @deselect="selected_medias = []"
      />
    </transition>
  </div>
</template>
<script>
import UploadFileModal from "./modals/UploadFileModal.vue";
import MediaCard from "./subcomponents/MediaCard.vue";
import TagsAndAuthorFilters from "./subcomponents/TagsAndAuthorFilters.vue";
import SelectorBar from "./subcomponents/SelectorBar.vue";
import { setTimeout } from "timers";
import debounce from "debounce";

export default {
  props: {
    project: Object,
    slugProjectName: String,
    read_only: Boolean,
    can_edit_project: Boolean,
  },
  components: {
    MediaCard,
    UploadFileModal,
    TagsAndAuthorFilters,
    SelectorBar,
  },
  data() {
    return {
      mediaSort: {
        field: "date_uploaded",
        // type: "date",
        // order: "descending"
      },

      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5),

      selected_files: [],
      is_iOS_device:
        !!window.navigator.platform &&
        /iPad|iPhone|iPod/.test(navigator.platform),
      show_filters: false,

      show_drop_container: false,

      media_metaFileName_initially_present: [],
      last_media_added: [],

      selected_medias: [],

      folded_days: [],
    };
  },
  mounted() {
    if (
      !!this.$root.settings.media_filter.keyword ||
      !!this.$root.settings.media_filter.author ||
      !!this.$root.settings.media_filter.fav ||
      !!this.$root.settings.media_filter.type
    ) {
      this.show_filters = true;
    }
    document.addEventListener("dragover", this.ondragover);

    this.cancelDragOver = debounce(this.cancelDragOver, 300);
    this.$eventHub.$on("modal.prev_media", this.prevMedia);
    this.$eventHub.$on("modal.next_media", this.nextMedia);
    this.$eventHub.$on("socketio.media_created_or_updated", this.media_created);
  },
  created() {},
  beforeDestroy() {
    this.$root.settings.media_filter.author = "";
    this.$root.settings.media_filter.keyword = "";
    this.$root.settings.media_filter.fav = false;
    this.$root.settings.media_filter.type = "";

    document.removeEventListener("dragover", this.ondragover);

    this.$eventHub.$off("modal.prev_media", this.prevMedia);
    this.$eventHub.$off("modal.next_media", this.nextMedia);
    this.$eventHub.$off(
      "socketio.media_created_or_updated",
      this.media_created
    );
  },
  watch: {
    "project.medias": function () {
      if (this.media_metaFileName_initially_present.length === 0) {
        this.media_metaFileName_initially_present = Object.values(
          this.project.medias
        ).map((m) => m.metaFileName);
      } else {
        this.last_media_added = Object.values(this.project.medias)
          .map((m) => m.metaFileName)
          .filter(
            (s) => !this.media_metaFileName_initially_present.includes(s)
          );
      }
    },
  },

  computed: {
    mediaKeywords() {
      // grab all keywords from this.project.medias
      return this.$root.getAllKeywordsFrom(this.project.medias);
    },
    mediaAuthors() {
      return this.$root.getAllAuthorsFrom(this.project.medias);
    },
    mediaTypes() {
      return this.$root.getAllTypesFrom(this.project.medias);
    },
    allMedias() {
      if (!this.project.medias || typeof this.project.medias !== "object") {
        return false;
      }
      const allMedias = Object.values(this.project.medias).filter(
        (m) => !m.hasOwnProperty("_isAbsent") || m._isAbsent === false
      );
      return allMedias;
    },
    filteredMedias: function () {
      return this.allMedias.filter((m) => this.$root.filterMedia(m));
    },
    sortedMedias: function () {
      let sortedMedias = this.$_.sortBy(
        this.filteredMedias,
        this.mediaSort.field
      );
      return sortedMedias.reverse();
    },
    has_filters_enabled() {
      return (
        this.$root.settings.media_filter.keyword !== "" ||
        this.$root.settings.media_filter.author !== "" ||
        this.$root.settings.media_filter.fav !== false ||
        this.$root.settings.media_filter.type !== ""
      );
    },
    groupedMedias: function () {
      let mediaGroup = this.$_.groupBy(this.sortedMedias, (media) => {
        let _date;

        if (
          media.hasOwnProperty(this.mediaSort.field) &&
          !!media[this.mediaSort.field]
        ) {
          _date = media[this.mediaSort.field];
        } else {
          return this.$t("invalid_date");
        }

        var dateMoment = this.$moment(_date);
        return dateMoment.format("YYYY-MM-DD");
      });
      mediaGroup = this.$_.pairs(mediaGroup);
      mediaGroup = this.$_.sortBy(mediaGroup);
      mediaGroup = mediaGroup.reverse();
      return mediaGroup;
    },
  },
  methods: {
    prevMedia() {
      this.mediaNav(-1);
    },
    nextMedia() {
      this.mediaNav(+1);
    },
    toggleDayFolding(day) {
      if (this.folded_days.includes(day))
        this.folded_days = this.folded_days.filter((t) => t !== day);
      else this.folded_days.push(day);
    },
    mediaNav(relative_index) {
      const current_media_index = this.sortedMedias.findIndex(
        (m) => m.metaFileName === this.$root.media_modal.current_metaFileName
      );
      const new_media = this.sortedMedias[current_media_index + relative_index];
      this.$root.closeMedia();

      if (
        !!new_media &&
        new_media.hasOwnProperty("metaFileName") &&
        !!new_media.metaFileName
      ) {
        this.$nextTick(() => {
          this.openMediaModal(new_media.metaFileName);
        });
      }
    },
    removeAllFilters() {
      this.$root.settings.media_filter.author = "";
      this.$root.settings.media_filter.keyword = "";
      this.$root.settings.media_filter.fav = false;
      this.$root.settings.media_filter.type = "";
    },
    toggleSelectMedia({ slugFolderName, metaFileName }) {
      if (this.mediaIsSelected({ slugFolderName, metaFileName })) {
        this.selected_medias = this.selected_medias.filter(
          (m) =>
            !(
              m.slugFolderName === slugFolderName &&
              m.metaFileName === metaFileName
            )
        );
      } else {
        if (!this.can_edit_project) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              this.$t(
                'notifications["access_or_editing_restricted_to_authors"]'
              )
            );
          return false;
        }

        this.selected_medias.push({
          slugFolderName,
          metaFileName,
        });
      }
    },
    mediaIsSelected({ slugFolderName, metaFileName }) {
      return this.selected_medias.some(
        (m) =>
          m.metaFileName === metaFileName && m.slugFolderName === slugFolderName
      );
    },
    openMediaModal(metaFileName) {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • MediaLibrary: openMediaModal");
      }
      this.$root.openMedia({
        slugProjectName: this.slugProjectName,
        metaFileName,
      });
    },
    createTextMedia() {
      this.$root
        .createMedia({
          slugFolderName: this.slugProjectName,
          type: "projects",
          additionalMeta: {
            type: "text",
          },
        })
        .then((mdata) => {
          this.openMediaModal(mdata.metaFileName);
        });
    },
    openCapture() {
      // if (this.is_iOS_device) {
      //   this.$alertify
      //     .closeLogOnClick(true)
      //     .delay(8000)
      //     .error(this.$t("notifications.ios_not_compatible_with_capture"));
      //   setTimeout(() => {
      //     this.$alertify
      //       .closeLogOnClick(true)
      //       .delay(8000)
      //       .success(this.$t("notifications.instead_import_with_this_button"));
      //   }, 1500);
      // }
      this.$root.do_navigation.view = "CaptureView";
    },
    openQRCodeModal() {
      this.$root.openCreateQrModal({
        slugFolderName: this.slugProjectName,
        type: "projects",
      });
    },
    openPubliPaneToPubliWithFilterProject() {
      this.$root.openPubliPanel();
      this.$root.settings.publication_filter.project = this.slugProjectName;
      this.$eventHub.$emit("resizePanels", [{}, { size: 50 }, {}]);
    },
    updateInputFiles($event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / updateSelectedFiles`);
      }
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    ondragover() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / ondragover`);
      }

      this.show_drop_container = true;
      this.cancelDragOver();
    },
    cancelDragOver() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / cancelDragOver`);
      }
      this.show_drop_container = false;
    },
    dropHandler($event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / dropHandler`);
      }

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();

      if ($event.dataTransfer.items) {
        let files = [];
        for (var i = 0; i < $event.dataTransfer.items.length; i++) {
          if ($event.dataTransfer.items[i].kind === "file") {
            files.push($event.dataTransfer.items[i].getAsFile());
          }
        }
        this.selected_files = files;
      } else {
        for (var i = 0; i < $event.dataTransfer.files.length; i++) {
          this.selected_files = Array.from($event.dataTransfer.files);
        }
      }
    },
  },
};
</script>
<style></style>
