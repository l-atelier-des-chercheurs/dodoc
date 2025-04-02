<template>
  <div class="_mediaLibrary">
    <section class="_scrollBox">
      <div class="_importCreateTextButtons">
        <div class="_importCreateTextButtons--import">
          <ImportFileZone
            :multiple="true"
            :files_to_import.sync="files_to_import"
          />
          <UploadFiles
            v-if="files_to_import.length > 0"
            :files_to_import="files_to_import"
            :path="project.$path"
            :allow_caption_edition="true"
            @importedMedias="mediaJustImported($event)"
            @close="files_to_import = []"
          />
        </div>
        <div class="_importCreateTextButtons--createText">
          <button class="u-button u-button_bleuvert" @click="createText">
            {{ $t("add_text") }}
          </button>
        </div>
      </div>

      <div class="_topSection" v-if="medias.length > 0">
        <div class="_row">
          <div class="_topSection--left">
            <div class="_mediaCount">
              <template v-if="filtered_medias.length === medias.length">
                {{ medias.length }} {{ $t("medias").toLowerCase() }}
              </template>
              <template v-else>
                <button
                  type="button"
                  class="u-button u-button_transparent is--active _mediaCount--filtered"
                  @click="resetFilters"
                >
                  {{ filtered_medias.length }}
                  <span class="_mediaCount--slash">/</span>
                  {{ medias.length }}
                </button>
                {{ $t("medias").toLowerCase() }}
              </template>
            </div>

            <button
              type="button"
              class="u-button u-button_transparent"
              :class="{ 'is--active': filters_opened }"
              @click="toggleFilters"
            >
              <b-icon icon="filter" />
              {{ $t("filter") }}
            </button>

            <button
              type="button"
              class="u-button u-button_transparent"
              v-if="!batch_mode && select_mode !== 'single'"
              @click="batch_mode = !batch_mode"
            >
              <b-icon icon="hand-index" />
              {{ $t("select") }}
            </button>
            <button
              type="button"
              v-if="batch_mode"
              class="u-button u-button_transparent"
              :class="{ 'is--active': batch_mode }"
              @click="cancelSelect"
            >
              <b-icon icon="hand-index" />
              {{ $t("cancel") }}
            </button>
            <button
              type="button"
              class="u-button u-button_transparent"
              v-if="batch_mode"
              :disabled="filtered_medias.length === 0"
              @click="selectAllVisibleMedias"
            >
              <b-icon icon="plus-square" />
              {{ $t("select_all") }}
            </button>
          </div>
          <div class="_topSection--right">
            <button
              type="button"
              class="u-button u-button_icon _favFilter"
              :title="$t('filter_by_fav')"
              @click="fav_filter = !fav_filter"
            >
              <b-icon :icon="fav_filter ? 'star-fill' : 'star'" />
            </button>

            <div class="_tileMode">
              <button
                class="u-button u-button_transparent"
                type="button"
                :class="{
                  'is--active': tile_mode === 'table',
                }"
                @click="tile_mode = 'table'"
              >
                <b-icon icon="list-ol" />
              </button>
              <button
                class="u-button u-button_transparent"
                type="button"
                :class="{
                  'is--active': tile_mode === 'tiny',
                }"
                @click="tile_mode = 'tiny'"
              >
                <b-icon icon="grid-3x2-gap-fill" />
              </button>
              <button
                class="u-button u-button_transparent"
                type="button"
                :class="{
                  'is--active': tile_mode === 'medium',
                }"
                @click="tile_mode = 'medium'"
              >
                <b-icon icon="grid-fill" />
              </button>
              <button
                class="u-button u-button_transparent"
                type="button"
                :class="{
                  'is--active': tile_mode === 'map',
                }"
                @click="tile_mode = 'map'"
              >
                <b-icon icon="map-fill" />
              </button>
            </div>
          </div>
        </div>
        <div class="_row _filters" v-if="filters_opened">
          <select
            class="_selectMediaKeyword"
            size="small"
            v-model="keyword_of_media_to_display"
            :class="{
              'is--active': keyword_of_media_to_display !== 'all',
            }"
          >
            <option key="all" value="all" v-text="$t('all_keywords')" />
            <option
              v-for="keyword_of_media in keywords_of_medias"
              :key="keyword_of_media"
              :value="keyword_of_media"
              :disabled="quantityOfMediaWithKeyword(keyword_of_media) === 0"
              v-text="
                keyword_of_media +
                formattedQuantityWithKeyword(keyword_of_media)
              "
            />
          </select>

          <select
            class="_selectMediaOrigin"
            size="small"
            v-model="origin_of_media_to_display"
            :class="{
              'is--active': origin_of_media_to_display !== 'all',
            }"
          >
            <option
              v-for="origin in origins_of_medias"
              :key="origin.key"
              :value="origin.key"
              :disabled="
                quantityOfMediaWithKey({
                  key: '$origin',
                  val: origin.key,
                }) === 0
              "
              v-text="
                origin.label +
                formattedQuantity({
                  key: '$origin',
                  val: origin.key,
                })
              "
            />
          </select>

          <select
            class="_selectMediaType"
            size="small"
            :disabled="
              show_only_media_of_types && show_only_media_of_types !== 'all'
            "
            v-model="type_of_media_to_display"
            :class="{
              'is--active': type_of_media_to_display !== 'all',
            }"
          >
            <option
              v-for="type_of_media in types_of_medias"
              :key="type_of_media.key"
              :value="type_of_media.key"
              :disabled="
                quantityOfMediaWithKey({
                  key: '$type',
                  val: type_of_media.key,
                }) === 0
              "
              v-text="
                type_of_media.label +
                formattedQuantity({
                  key: '$type',
                  val: type_of_media.key,
                })
              "
            />
          </select>

          <select
            class="_selectMediaAuthor"
            size="small"
            v-model="author_of_media_to_display"
            :class="{
              'is--active': author_of_media_to_display !== 'all',
            }"
          >
            <option key="all" value="all" v-text="$t('all_accounts')" />
            <option
              v-for="author_of_media in authors_of_medias"
              :key="author_of_media.$path"
              :value="author_of_media.$path"
              :disabled="quantityOfMediaWithAuthor(author_of_media.$path) === 0"
              v-text="
                author_of_media.name +
                formattedQuantityWithAuthor(author_of_media.$path)
              "
            />
          </select>

          <div class="_groupBy" v-if="tile_mode !== 'map' && false">
            <div v-for="group_option in group_options" :key="group_option.key">
              <input
                type="radio"
                :id="group_option.key"
                :value="group_option.key"
                v-model="group_mode"
              />
              <label
                :for="group_option.key"
                v-text="group_option.label"
                :class="{
                  'is--selected': group_option.key === group_mode,
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="show_only_media_of_types_notice" class="_filterNotice">
        {{ show_only_media_of_types_notice }}
      </div>

      <div class="_noMedia" v-if="medias.length === 0">
        {{ $t("no_media_in_project") }}
      </div>

      <transition name="pagechange" mode="out-in">
        <MediaMap
          v-if="tile_mode === 'map'"
          key="mediaMap"
          :medias="filtered_medias"
          @toggleMediaFocus="toggleMediaFocus"
        />
        <div v-else :key="group_mode" class="_gridSection">
          <div
            class="_dayFileSection"
            v-for="{ label, files } in grouped_medias"
            :key="label"
          >
            <div class="_mediaLibrary--lib--label">
              <strong>{{ label }}</strong>
              <!-- <div class="u-nut" data-isfilled>
                {{ files.length }}
              </div> -->
            </div>
            <transition-group
              tag="div"
              class="_mediaLibrary--lib--grid"
              :data-tilemode="tile_mode"
              name="StoryModules"
              ref="mediaTiles"
              appear
            >
              <MediaTile
                v-for="file of files"
                :key="file.$path"
                :project_path="project.$path"
                :index="file._index"
                :file="file"
                :was_focused="media_just_focused === getFilename(file.$path)"
                :is_selectable="mediaTileIsSelectable(file.$path)"
                :is_selected="selected_medias_paths.includes(file.$path)"
                :data-filepath="file.$path"
                :tile_mode="tile_mode"
                :is_already_selected="mediaTileAlreadySelected(file.$path)"
                @toggleMediaFocus="toggleMediaFocus(file.$path)"
                @setSelected="(present) => setSelected(present, file.$path)"
              />
            </transition-group>
          </div>
        </div>
      </transition>

      <transition name="slideup">
        <div v-if="selected_medias_paths.length > 0" class="_selectBtn">
          <div class="_selectBtn--content">
            <div class="_selectBtn--content--title">
              {{ selected_medias_paths.length }}
              {{ $t("medias_selected").toLowerCase() }}
            </div>

            <div class="_selectBtn--content--buttons">
              <template v-if="select_mode">
                <button
                  type="button"
                  class="u-button u-button_bleuvert"
                  @click="addMedias(selected_medias_paths)"
                >
                  {{ `${$t("add")} (${selected_medias_paths.length})` }}
                </button>
              </template>
              <template v-else-if="batch_mode">
                <button
                  type="button"
                  class="u-button u-button_bleuvert"
                  @click="show_batch_informations_edit_modal = true"
                >
                  <b-icon icon="info-square" />
                  {{ $t("edit_informations") }}
                </button>
                <BatchEditInformationsModal
                  v-if="show_batch_informations_edit_modal"
                  :selected_medias="selected_medias"
                  :keywords_suggestions="keywords_of_medias"
                  @close="show_batch_informations_edit_modal = false"
                />
                <DuplicateMedia :paths="selected_medias_paths">
                  <button
                    type="button"
                    class="u-button u-button_bleuvert"
                    slot="button"
                  >
                    <b-icon icon="file-plus" />
                    {{ $t("duplicate_or_move") }}
                  </button>
                </DuplicateMedia>
                <button
                  type="button"
                  class="u-button u-button_red"
                  @click="removeAllMedias"
                >
                  <b-icon icon="trash" />
                  {{ $t("remove") }}
                </button>
              </template>

              <button type="button" class="u-buttonLink" @click="cancelSelect">
                <b-icon icon="x-circle" />
                {{ $t("unselect") }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </section>
    <transition name="mediaModal" mode="in-out">
      <MediaModal
        v-if="focused_media"
        :key="focused_media.$path"
        :file="focused_media"
        :select_mode="select_mode"
        :keywords_suggestions="keywords_of_medias"
        :position_in_list="focused_media_position_in_list"
        @remove="removeMedia(focused_media.$path)"
        @close="closeMediaFocus()"
        @select="addMedias([focused_media.$path])"
        @prevMedia="prevMedia"
        @nextMedia="nextMedia"
      />
    </transition>
  </div>
</template>
<script>
import ImportFileZone from "@/adc-core/ui/ImportFileZone.vue";
import MediaTile from "@/components/MediaTile.vue";
import MediaModal from "@/components/MediaModal.vue";
import BatchEditInformationsModal from "@/components/BatchEditInformationsModal.vue";
import DuplicateMedia from "@/components/DuplicateMedia.vue";

export default {
  props: {
    project: Object,
    media_focused: [Boolean, String],
    select_mode: String,
    hide_already_present_medias: Boolean,
    meta_filenames_already_present: [Boolean, Array],
    show_only_media_of_types: [String, Array],
  },
  components: {
    ImportFileZone,
    MediaTile,
    MediaModal,
    BatchEditInformationsModal,
    MediaMap: () => import("@/adc-core/ui/MediaMap.vue"),
    DuplicateMedia,
  },
  data() {
    return {
      selected_medias_paths: [],
      batch_mode: false,
      show_batch_informations_edit_modal: false,
      filters_opened: false,

      tile_mode: localStorage.getItem("library_tile_mode") || "tiny",
      files_to_import: [],

      media_just_focused: undefined,

      hide_dropzone_timeout: undefined,

      fav_filter: false,

      group_mode: "day",
      // group_mode: localStorage.getItem("library_group_mode") || "day",
      group_options: [
        {
          key: "day",
          label: this.$t("day"),
        },
        {
          key: "month",
          label: this.$t("month"),
        },
        {
          key: "year",
          label: this.$t("year"),
        },
      ],

      keyword_of_media_to_display: "all",

      type_of_media_to_display: "all",
      types_of_medias: [
        {
          key: "all",
          label: this.$t("all_medias_types"),
        },
        {
          key: "image",
          label: this.$t("image"),
        },
        {
          key: "video",
          label: this.$t("video"),
        },
        {
          key: "audio",
          label: this.$t("audio"),
        },
        {
          key: "text",
          label: this.$t("text"),
        },
        {
          key: "pdf",
          label: this.$t("pdf"),
        },
        {
          key: "stl",
          label: this.$t("stl"),
        },
        {
          key: "obj",
          label: this.$t("obj"),
        },
        {
          key: "other",
          label: this.$t("other"),
        },
      ],

      origin_of_media_to_display: "all",
      origins_of_medias: [
        {
          key: "all",
          label: this.$t("all_origins"),
        },
        {
          key: "capture",
          label: "1 • " + this.$t("capture"),
        },
        {
          key: "collect",
          label: "2 • " + this.$t("collect"),
        },
        {
          key: "make",
          label: "3 • " + this.$t("make"),
        },
        {
          key: "publish",
          label: "4 • " + this.$t("publish"),
        },
      ],

      author_of_media_to_display: "all",
    };
  },
  created() {},
  mounted() {
    console.log(`MediaLibrary / mounted`);
    window.addEventListener("keyup", this.handleKeyPress);

    if (this.media_focused)
      this.$nextTick(() => {
        // this.scrollToMediaTile(this.media_focused);
      });
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handleKeyPress);
  },
  watch: {
    tile_mode() {
      localStorage.setItem("library_tile_mode", this.tile_mode);
    },
    group_mode() {
      localStorage.setItem("library_group_mode", this.group_mode);
    },
  },
  computed: {
    medias() {
      return this.project.$files || [];
    },
    sorted_medias() {
      let _medias = JSON.parse(JSON.stringify(this.medias));
      _medias = _medias
        .sort(
          (a, b) => +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded)
        )
        .reverse()
        .map((m, index) => {
          m._index = index + 1;
          return m;
        })
        .reverse();
      return _medias;
    },
    filtered_medias() {
      return this.sorted_medias.filter((m) => {
        if (this.hide_already_present_medias === true)
          if (this.mediaTileAlreadySelected(m.$path)) return false;

        if (this.fav_filter === true) if (m.fav !== true) return false;

        if (
          !this.show_only_media_of_types ||
          this.show_only_media_of_types === "all"
        ) {
          if (this.type_of_media_to_display !== "all")
            if (m.$type !== this.type_of_media_to_display) return false;
        } else {
          if (Array.isArray(this.show_only_media_of_types)) {
            if (!this.show_only_media_of_types.includes(m.$type)) return false;
          } else if (typeof this.show_only_media_of_types === "string") {
            if (m.$type !== this.show_only_media_of_types) return false;
          }
        }

        if (this.origin_of_media_to_display !== "all")
          if (m.$origin !== this.origin_of_media_to_display) return false;

        if (this.author_of_media_to_display !== "all")
          if (!m.$authors?.includes(this.author_of_media_to_display))
            return false;

        if (this.keyword_of_media_to_display !== "all")
          if (!m.keywords?.includes(this.keyword_of_media_to_display))
            return false;

        if (this.tile_mode === "map") if (!m.$location) return false;

        return true;
      });
    },
    grouped_medias() {
      return this.groupFilesBy(
        this.filtered_medias,
        ["$date_uploaded"],
        this.group_mode
      );
    },
    keywords_of_medias() {
      return this.sorted_medias.reduce((acc, m) => {
        m.keywords?.map((k) => {
          if (!acc.some((_k) => _k === k)) {
            if (k) acc.push(k);
          }
        });
        return acc;
      }, []);
    },
    focused_media() {
      if (!this.media_focused) return false;
      const _focused_media =
        this.sorted_medias.find(
          (f) => this.getFilename(f.$path) === this.media_focused
        ) || false;
      if (_focused_media && this.$refs.mediaTiles)
        this.scrollToMediaTile(_focused_media.$path);

      return _focused_media;
    },
    focused_media_index() {
      return this.filtered_medias.findIndex(
        (m) => m.$path === this.focused_media.$path
      );
    },
    focused_media_position_in_list() {
      if (this.filtered_medias.length === 1) return "alone";
      if (this.focused_media_index === 0) return "first";
      if (this.focused_media_index === this.filtered_medias.length - 1)
        return "last";
      return "none";
    },
    authors_of_medias() {
      return this.sorted_medias.reduce((acc, m) => {
        m.$authors?.map((a_path) => {
          if (!acc.some((a) => a.$path === a_path)) {
            const a = this.getAuthor(a_path);
            // if author is found, add
            if (a) acc.push(a);
          }
        });
        return acc;
      }, []);
    },
    show_only_media_of_types_notice() {
      if (
        Array.isArray(this.show_only_media_of_types) &&
        this.show_only_media_of_types.length > 0
      ) {
        const types = this.show_only_media_of_types.map((t) =>
          this.$t(t).toLowerCase()
        );
        return this.$t("show_only_media_of_types", {
          types: types.join("/"),
        });
      }
      return false;
    },
    selected_medias() {
      return this.selected_medias_paths.map((p) =>
        this.medias.find((m) => m.$path === p)
      );
    },
  },
  methods: {
    scrollToMediaTile(path) {
      path;
      // const focused_tile = this.$refs.mediaTiles.querySelector(
      //   `[data-filepath="${slug}"]`
      // );
      // if (focused_tile)
      // focused_tile.scrollIntoView({
      //   behavior: "smooth",
      //   block: "center",
      //   inline: "nearest",
      // });
    },
    handleKeyPress(event) {
      if (
        (!this.$el.closest("._baseModal") && this.$root.modal_is_opened) ||
        event.target.tagName.toLowerCase() === "input" ||
        event.target.tagName.toLowerCase() === "textarea" ||
        event.target.className.includes("ql-editor") ||
        event.target.hasAttribute("contenteditable")
      )
        return;

      switch (event.key) {
        case "Escape":
          this.closeMediaFocus();
          break;
        case "w":
        case "z":
        case "ArrowLeft":
          this.prevMedia();
          break;
        case "s":
        case "ArrowRight":
          this.nextMedia();
          break;
        // case "a":
        // case "q":
        // case " ":
        //   this.toggleMediaFocus();
        //   break;
      }

      return false;
    },
    resetFilters() {
      this.type_of_media_to_display = "all";
      this.origin_of_media_to_display = "all";
      this.author_of_media_to_display = "all";
      this.keyword_of_media_to_display = "all";
      this.fav_filter = false;
    },
    toggleFilters() {
      this.filters_opened = !this.filters_opened;
    },
    mediaTileIsSelectable() {
      return this.batch_mode;
    },
    mediaTileAlreadySelected(path) {
      if (!this.meta_filenames_already_present) return false;

      const meta_filename = this.getFilename(path);

      const meta_filename_is_present = this.meta_filenames_already_present.find(
        (list) => list.medias.includes(meta_filename)
      );

      if (meta_filename_is_present) {
        const label = meta_filename_is_present.label;
        const color = meta_filename_is_present.color;
        return { label, color };
      }
      return false;
    },
    async moveMedias() {
      console.log("moveMedias");

      // await this.$api.moveMedias({
      //   paths: this.selected_medias_paths,
      //   destination_path: this.project.$path,
      // });
    },
    async removeAllMedias() {
      for (const path of this.selected_medias_paths) {
        await this.removeMedia(path);
        this.selected_medias_paths = this.selected_medias_paths.filter(
          (p) => p !== path
        );
      }
      this.batch_mode = false;
    },
    selectAllVisibleMedias() {
      this.selected_medias_paths = this.filtered_medias.map((fm) => fm.$path);
    },

    cancelSelect() {
      this.selected_medias_paths = [];
      if (this.batch_mode) this.batch_mode = false;
    },
    quantityOfMediaWithKey({ key, val }) {
      if (val === "all") return false;
      const num = this.sorted_medias.filter(
        (m) => m[key] && m[key] === val
      ).length;
      return num;
    },
    formattedQuantity({ key, val }) {
      const qty = this.quantityOfMediaWithKey({ key, val });
      if (qty === false) return "";
      return ` (${qty})`;
    },
    quantityOfMediaWithAuthor(author_path) {
      const num = this.sorted_medias.filter((m) =>
        m.$authors?.includes(author_path)
      ).length;
      return num;
    },
    formattedQuantityWithAuthor(author_path) {
      const qty = this.quantityOfMediaWithAuthor(author_path);
      if (qty === false) return "";
      return ` (${qty})`;
    },
    quantityOfMediaWithKeyword(keyword_key) {
      const num = this.sorted_medias.filter((m) =>
        m.keywords?.includes(keyword_key)
      ).length;
      return num;
    },
    formattedQuantityWithKeyword(keyword_key) {
      const qty = this.quantityOfMediaWithKeyword(keyword_key);
      if (qty === false) return "";
      return ` (${qty})`;
    },
    async createText() {
      const filename = "text-" + +new Date() + ".txt";
      const { meta_filename } = await this.$api.uploadText({
        path: this.project.$path,
        filename,
        content: "…",
        additional_meta: {
          $origin: "collect",
        },
      });
      const path = this.project.$path + "/" + meta_filename;
      this.toggleMediaFocus(path);
    },
    mediaJustImported(list_of_added_metas) {
      if (!this.select_mode || this.select_mode === "single") return false;

      const new_medias_path = list_of_added_metas.map(
        (meta_filename) => this.project.$path + "/" + meta_filename
      );

      if (this.select_mode === "multiple") {
        this.selected_medias_paths =
          this.selected_medias_paths.concat(new_medias_path);
        this.batch_mode = true;
      }

      // todo add focus ring to indicate medias just sent
      // this.$alertify
      //   .closeLogOnClick(true)
      //   .delay(4000)
      //   .success(list_of_added_metas);
    },
    toggleMediaFocus(path) {
      if (!path) return this.$emit("update:media_focused", undefined);

      const filename = this.getFilename(path);
      if (this.media_focused === filename) {
        this.closeMediaFocus();
      } else {
        this.openMediaFocus(filename);
      }
    },
    openMediaFocus(filename) {
      this.$emit("update:media_focused", filename);
      this.media_just_focused = filename;
    },
    closeMediaFocus() {
      this.$emit("update:media_focused", undefined);
    },
    setSelected(present, path) {
      if (present) this.selected_medias_paths.push(path);
      else
        this.selected_medias_paths = this.selected_medias_paths.filter(
          (sm) => sm !== path
        );
    },
    addMedias(medias) {
      this.$emit("addMedias", medias);
    },
    async removeMedia(path) {
      await this.$api.deleteItem({
        path,
      });
      this.closeMediaFocus();
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("media_removed"));
    },
    prevMedia() {
      if (this.focused_media_index === 0) return;
      this.toggleMediaFocus(
        this.filtered_medias[this.focused_media_index - 1].$path
      );
    },
    nextMedia() {
      if (this.focused_media_index === this.filtered_medias.length - 1) return;
      this.toggleMediaFocus(
        this.filtered_medias[this.focused_media_index + 1].$path
      );
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaLibrary {
  position: relative;
  background: var(--color-collect);
  height: 100%;

  // --active-color: var(--c-vert);
}

._scrollBox {
  height: 100%;
  overflow: auto;
}

._mediaLibrary--lib {
  overflow: auto;
}

._mediaLibrary--lib--label {
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2) 0;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--c-orange);

  strong {
    text-transform: capitalize;
    // padding: 0 calc(var(--spacing) / 2);
  }

  ::v-deep {
    .u-nut {
      background: var(--c-noir);
    }
  }
}

._mediaLibrary--lib--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 2px;
  padding: 0 calc(var(--spacing) / 2);

  &[data-tilemode="medium"] {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  &[data-tilemode="table"] {
    display: block;
  }
}

._mediaLibrary--focusPane {
  // background: var(--c-bleumarine);
}

._focusBtns {
  position: absolute;
  top: 0;
  right: 0;
}

._topSection {
  border-bottom: 2px solid var(--c-orange_clair);
  padding: calc(var(--spacing) / 8) 0;

  > ._row {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: flex-start;
    gap: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);

    z-index: 1;

    &._filters {
      justify-content: center;
      border-top: 2px solid var(--c-orange_clair);
    }
  }
}

._noMedia {
  padding: calc(var(--spacing) / 1) calc(var(--spacing) / 2);
  font-size: var(--sl-font-size-small);
  text-align: center;
  text-transform: lowercase;
  font-style: italic;
}

._topSection--left {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-start;
  gap: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  padding-left: calc(var(--spacing) / 2);
}
._topSection--right {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
}

._dayFileSection {
  margin-bottom: calc(var(--spacing) / 4);
}

._gridSection {
  padding-bottom: calc(var(--spacing) / 2);
}

._mediaCount {
  // color: black;
  // margin-bottom: 0;
  // font-weight: 600;
}
._mediaCount--filtered {
  font-weight: 700;
  font-size: inherit;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 4);
  // color: black;
  // border-radius: 7px;
}
._mediaCount--slash {
  display: inline-block;
  padding: 0 calc(var(--spacing) / 4);
}

._selectBtn {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: calc(var(--spacing) / 2);
  pointer-events: none;
}
._selectBtn--content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  gap: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 4);
  background: white;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.85);
  pointer-events: auto;
  border-radius: 5px;
}
._selectBtn--content--title {
  font-weight: 700;
  text-align: center;
}
._selectBtn--content--buttons {
  display: flex;
  justify-content: center;
  gap: calc(var(--spacing) / 4);
  text-align: center;
}

._selectMediaOrigin,
._selectMediaType,
._selectMediaAuthor,
._selectMediaKeyword {
  width: 21ch;
}

._groupBy {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);

  > * {
    display: flex;
    flex-flow: row nowrap;
  }

  input {
    accent-color: var(--active-color);
    // visibility: hidden;
    // width: 1px;
    // height: 1px;
  }

  label {
    cursor: pointer;
    &.is--selected {
      font-weight: 600;
    }
  }
}

._importCreateTextButtons {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  justify-content: stretch;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);

  > * {
    // flex: 1 1 0;
  }
}

._importCreateTextButtons--import {
  --dropzone-color1: var(--c-orange);
  --dropzone-color2: var(--c-rouge);
  color: white;

  width: 100%;
}

._importCreateTextButtons--createText {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  // background: var(--c-bleuvert);
}

._tileMode {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);

  button {
    padding: calc(var(--spacing) / 1.5);
  }
}

._favFilter {
  color: var(--c-rouge);
}
._filterNotice {
  background: var(--c-bleuvert);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 1);
  text-align: center;
  font-weight: bold;
  text-transform: lowercase;
}
</style>
