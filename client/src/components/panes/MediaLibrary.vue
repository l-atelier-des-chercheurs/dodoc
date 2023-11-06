<template>
  <div class="_mediaLibrary">
    <section class="_scrollBox">
      <div class="_importButton">
        <!-- // TODO create component -->
        <label :for="id + '-add_file'" @drop="onDrop">
          <div class="u-button">
            <svg width="20" height="17" viewBox="0 0 20 17">
              <path
                d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
              />
            </svg>
            {{ $t("import") }}
          </div>
          <div class="u-instructions">
            {{ $t("or_drag_drop_file_here").toLowerCase() }}
          </div>
        </label>
        <input
          type="file"
          multiple="multiple"
          :id="id + '-add_file'"
          name="file"
          accept=""
          class=""
          @change="updateInputFiles($event)"
        />
        <UploadFiles
          v-if="files_to_import.length > 0"
          :files_to_import="files_to_import"
          :path="project.$path"
          @importedMedias="mediaJustImported"
          @close="files_to_import = []"
        />
      </div>

      <div class="_topSection">
        <div class="_topSection--left">
          <div class="u-sameRow">
            <small v-if="medias.length === 0">
              {{ $t("no_media_in_project") }}
            </small>
            <template v-else-if="medias.length > 0">
              <div class="_mediaCount">
                {{ $t("number_of_media") }} = {{ medias.length }}
                <template v-if="filtered_medias.length !== medias.length">
                  (<span v-html="$t('displayed:').toLowerCase()" />&nbsp;{{
                    filtered_medias.length
                  }})
                </template>
              </div>
              <button
                type="button"
                class="u-buttonLink"
                v-if="!select_mode && !batch_mode"
                @click="batch_mode = !batch_mode"
              >
                <b-icon icon="hand-index" />
                {{ $t("select") }}
              </button>
              <button
                type="button"
                class="u-buttonLink"
                v-if="batch_mode"
                @click="cancelSelect"
              >
                <b-icon icon="x-circle" />
                {{ $t("cancel") }}
              </button>
              <button
                type="button"
                class="u-buttonLink"
                v-if="select_mode || batch_mode"
                @click="selectAllVisibleMedias"
              >
                {{ $t("select_all") }}
              </button>
            </template>
          </div>
        </div>
        <div class="_topSection--right">
          <div class="_groupBy">
            <select
              size="small"
              :disabled="show_only_media_type && show_only_media_type !== 'all'"
              v-model="type_of_media_to_display"
              :class="{
                'is--active': type_of_media_to_display !== 'all',
              }"
            >
              <option
                v-for="type_of_media in types_of_medias"
                :key="type_of_media.key"
                :value="type_of_media.key"
                v-text="
                  type_of_media.label +
                  ` (${quantityOfMediaWithType(type_of_media.key)})`
                "
              />
            </select>

            <template v-if="tile_mode !== 'map'">
              <div
                v-for="group_option in group_options"
                :key="group_option.key"
              >
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
            </template>
          </div>

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
                :is_selected="selected_medias.includes(file.$path)"
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
        <div v-if="selected_medias.length > 0" class="_selectBtn">
          <template v-if="select_mode">
            <button
              type="button"
              class="u-button u-button_bleuvert"
              @click="addMedias(selected_medias)"
            >
              {{ `${$t("add")} (${selected_medias.length})` }}
            </button>
          </template>
          <template v-else-if="batch_mode">
            <button
              type="button"
              class="u-button u-button_red"
              @click="removeAllMedias(selected_medias)"
            >
              {{ `${$t("remove")} (${selected_medias.length})` }}
            </button>
          </template>

          <button type="button" class="u-buttonLink" @click="cancelSelect">
            <b-icon icon="x-circle" />
            {{ $t("cancel") }}
          </button>
        </div>
      </transition>
    </section>
    <transition name="mediaModal" mode="in-out">
      <MediaModal
        v-if="focused_media"
        :key="focused_media.$path"
        :file="focused_media"
        :project_path="project.$path"
        :select_mode="select_mode"
        :position_in_list="focused_media_position_in_list"
        @remove="removeMedia(focused_media.$path)"
        @close="toggleMediaFocus(focused_media.$path)"
        @select="addMedias([focused_media.$path])"
        @prevMedia="prevMedia"
        @nextMedia="nextMedia"
      />
    </transition>
    <DropZone @fileDropped="fileDropped" />
  </div>
</template>
<script>
import MediaTile from "@/components/MediaTile.vue";
import MediaModal from "@/components/MediaModal";

export default {
  props: {
    project: Object,
    media_focused: [Boolean, String],
    select_mode: String,
    hide_already_present_medias: Boolean,
    meta_filenames_already_present: [Boolean, Array],
    show_only_media_type: String,
  },
  components: {
    MediaTile,
    MediaModal,
    MediaMap: () => import("@/components/project/MediaMap.vue"),
  },
  data() {
    return {
      files_to_import: [],
      id: `image_select_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      url_to: "https://latelier-des-chercheurs.fr/",

      selected_medias: [],
      batch_mode: false,

      tile_mode: localStorage.getItem("library_tile_mode") || "tiny",

      media_just_focused: undefined,

      hide_dropzone_timeout: undefined,

      group_mode: localStorage.getItem("library_group_mode") || "day",
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

      type_of_media_to_display: this.show_only_media_type || "all",
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
          key: "other",
          label: this.$t("other"),
        },
      ],
    };
  },
  created() {},
  mounted() {
    console.log(`MediaLibrary / mounted`);
    window.addEventListener("paste", this.handlePaste);
    window.addEventListener("keyup", this.handleKeyPress);

    if (this.media_focused)
      this.$nextTick(() => {
        // this.scrollToMediaTile(this.media_focused);
      });
  },
  beforeDestroy() {
    window.removeEventListener("paste", this.handlePaste);
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
      let _filtered_medias = this.sorted_medias;
      if (this.hide_already_present_medias === true)
        _filtered_medias = _filtered_medias.filter(
          (m) => !this.mediaTileAlreadySelected(m.$path)
        );

      if (this.type_of_media_to_display !== "all")
        _filtered_medias = _filtered_medias.filter(
          (m) => m.$type === this.type_of_media_to_display
        );

      return _filtered_medias;
    },
    grouped_medias() {
      return this.groupFilesBy(
        this.filtered_medias,
        ["$date_uploaded"],
        this.group_mode
      );
    },
    focused_media() {
      if (!this.media_focused) return false;
      const _focused_media =
        this.project.$files.find(
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
          this.toggleMediaFocus();
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

    handlePaste($event) {
      if (!this.$el.closest("._baseModal") && this.$root.modal_is_opened)
        return;

      if ($event.clipboardData.files?.length > 0)
        this.files_to_import = Array.from($event.clipboardData.files);
    },
    onDrop($event) {
      if ($event.dataTransfer.files?.length > 0)
        this.files_to_import = Array.from($event.dataTransfer.files);
    },
    mediaTileIsSelectable() {
      return this.select_mode === "multiple" || this.batch_mode;
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
    async removeAllMedias(selected_medias) {
      for (const path of selected_medias) {
        await this.removeMedia(path);
        this.selected_medias = this.selected_medias.filter((p) => p !== path);
      }
      this.batch_mode = false;
    },
    selectAllVisibleMedias() {
      this.selected_medias = this.filtered_medias.map((fm) => fm.$path);
    },
    cancelSelect() {
      this.selected_medias = [];
      if (this.batch_mode) this.batch_mode = false;
    },
    quantityOfMediaWithType(type_of_media_key) {
      return this.sorted_medias.filter(
        (m) => type_of_media_key === "all" || m.$type === type_of_media_key
      ).length;
    },
    updateInputFiles($event) {
      this.files_to_import = Array.from($event.target.files);
      $event.target.value = "";
    },
    fileDropped(files) {
      this.files_to_import = Array.from(files);
    },
    mediaJustImported(list_of_added_metas) {
      if (!this.select_mode || this.select_mode === "single") return false;

      const new_medias_path = list_of_added_metas.map(
        (meta_filename) => this.project.$path + "/" + meta_filename
      );

      if (this.select_mode === "multiple")
        this.selected_medias = this.selected_medias.concat(new_medias_path);

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
        this.$emit("update:media_focused", undefined);
      } else {
        this.$emit("update:media_focused", filename);
        this.media_just_focused = filename;
      }
    },
    setSelected(present, path) {
      if (present) this.selected_medias.push(path);
      else
        this.selected_medias = this.selected_medias.filter((sm) => sm !== path);
    },
    addMedias(medias) {
      this.$emit("addMedias", medias);
    },
    async removeMedia(path) {
      await this.$api.deleteItem({
        path,
      });
      this.toggleMediaFocus(path);
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("media_removed"));
    },
    prevMedia() {
      this.toggleMediaFocus(
        this.filtered_medias[this.focused_media_index - 1].$path
      );
    },
    nextMedia() {
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
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
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
  padding: 0 2px;

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
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) / 2);

  // background: var(--color-collect);
  z-index: 1;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);

  border-bottom: 2px solid var(--c-orange_clair);
}

._topSection--left {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-start;
  gap: calc(var(--spacing) / 2);
}
._topSection--right {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 2);
}

._gridSection {
  padding-bottom: calc(var(--spacing) / 2);
}

._mediaCount {
  // color: black;
  // margin-bottom: 0;
}

._selectBtn {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: calc(var(--spacing) / 1);
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}
._addBtn {
  --side-width: 24px;
  display: block;
  // width: var(--side-width);
  // height: var(--side-width);
  padding: calc(var(--spacing) / 4);
  border-radius: calc(var(--side-width) / 2);
  background: transparent;
  font-size: 1.4em;

  color: var(--c-noir);

  display: flex;

  &:hover,
  &:focus {
    background: rgba(0, 0, 0, 0.1);
  }
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

  > select {
    width: 20ch;
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

._importButton {
  width: 100%;
  padding: calc(var(--spacing) / 2);
  padding-bottom: 0;

  label {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    gap: calc(var(--spacing) / 2);
    cursor: pointer;

    width: 100%;
    max-width: none;

    border: 2px dotted white;
    border-radius: 10px;
    box-shadow: 0 1px 10px rgb(0 0 0 / 20%);
    padding: calc(var(--spacing) / 2);

    &:hover,
    &:focus-visible {
      border-color: var(--c-rouge);
    }
  }
  .u-button {
    display: flex;
    flex-flow: row nowrap;
    background: var(--c-rouge);
    color: white;
  }
  .u-instructions {
    color: white;
  }
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
</style>
