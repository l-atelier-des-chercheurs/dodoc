<template>
  <div class="_mediaLibrary" @dragover="onDragover">
    <section class="_scrollBox">
      <div class="_topSection">
        <input
          type="file"
          multiple="multiple"
          :id="id + '-add_file'"
          name="file"
          accept=""
          class="inputfile-2"
          @change="updateInputFiles($event)"
        />
        <label :for="id + '-add_file'">
          <svg width="20" height="17" viewBox="0 0 20 17">
            <path
              d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
            />
          </svg>
          {{ $t("import") }}
        </label>
        <UploadFiles
          v-if="selected_files.length > 0"
          :selected_files="selected_files"
          :path="project.$path"
          @importedMedias="mediaJustImported"
          @close="selected_files = []"
        />

        <br />

        <form
          v-if="show_create_link_field"
          class="input-validation-required"
          @submit.prevent="createLink"
        >
          <input type="url" required v-model="url_to" />
          <br />
          <input type="submit" />
        </form>

        <small v-if="medias.length === 0">
          {{ $t("no_media_in_project") }}
        </small>
        <div v-if="medias.length" class="u-label _mediaCount">
          {{ $t("number_of_media") }} = {{ medias.length }}
        </div>
      </div>

      <transition-group
        tag="div"
        class="_mediaLibrary--lib--grid"
        name="StoryModules"
        ref="mediaTiles"
        appear
      >
        <MediaTile
          v-for="file of sorted_medias"
          :key="file.$path"
          :project_path="project.$path"
          :file="file"
          :was_focused="media_just_focused === getFilename(file.$path)"
          :data-filepath="file.$path"
          :is_already_selected="
            meta_filenames_already_present.some((mf) =>
              file.$path.endsWith('/' + mf)
            )
          "
          @toggleMediaFocus="(path) => toggleMediaFocus(path)"
        />
      </transition-group>
    </section>
    <transition name="mediaModal" mode="in-out">
      <MediaModal
        v-if="focused_media"
        :key="focused_media.$path"
        :file="focused_media"
        :project_path="project.$path"
        :select_mode="select_mode"
        :position_in_list="focused_media_position_in_list"
        @duplicate="duplicateMedia(focused_media.$path)"
        @copy="
          copyMedia({
            media_path: focused_media.$path,
            destination_path_to_folder: $event,
          })
        "
        @remove="removeMedia(focused_media.$path)"
        @close="toggleMediaFocus(focused_media.$path)"
        @select="selectMedia(focused_media.$path)"
        @prevMedia="prevMedia"
        @nextMedia="nextMedia"
      />
    </transition>

    <transition name="dropzone" :duration="150">
      <div class="_dropzone" v-if="show_dropzone">
        <DropZone @mediaDropped="mediaDropped" />
      </div>
    </transition>
  </div>
</template>
<script>
import MediaTile from "@/components/MediaTile.vue";
import MediaModal from "@/components/MediaModal";

export default {
  props: {
    project: Object,
    media_focused: [Boolean, String],
    select_mode: {
      type: Boolean,
      default: false,
    },
    meta_filenames_already_present: { type: Array, default: () => [] },
  },
  components: {
    MediaTile,
    MediaModal,
  },
  data() {
    return {
      selected_files: [],
      id: `image_select_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      show_create_link_field: false,
      url_to: "https://latelier-des-chercheurs.fr/",

      media_just_focused: undefined,

      show_dropzone: false,
      hide_dropzone_timeout: undefined,
    };
  },
  created() {},
  mounted() {
    console.log(`MediaLibrary / mounted`);

    if (this.media_focused)
      this.$nextTick(() => {
        // this.scrollToMediaTile(this.media_focused);
      });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    medias() {
      return this.project.$files || [];
    },
    sorted_medias() {
      const _medias = JSON.parse(JSON.stringify(this.medias));
      _medias.sort(
        (a, b) => +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded)
      );
      return _medias;
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
      return this.sorted_medias.findIndex(
        (m) => m.$path === this.focused_media.$path
      );
    },
    focused_media_position_in_list() {
      if (this.sorted_medias.length === 1) return "alone";
      if (this.focused_media_index === 0) return "first";
      if (this.focused_media_index === this.sorted_medias.length - 1)
        return "last";
      return "none";
    },
  },
  methods: {
    onDragover($event) {
      if ($event.dataTransfer.files?.length === 0) return false;

      this.show_dropzone = true;

      clearTimeout(this.hide_dropzone_timeout);
      this.hide_dropzone_timeout = setTimeout(() => {
        this.show_dropzone = false;
      }, 500);
    },
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
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    mediaDropped(files) {
      this.selected_files = Array.from(files);
      this.show_dropzone = false;
      // debugger;
    },
    mediaJustImported(list_of_added_metas) {
      list_of_added_metas;
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
    selectMedia(path) {
      this.$emit("selectMedia", path);
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
    async duplicateMedia(path) {
      const new_media_path = await this.$api.copyFile({
        path,
      });
      new_media_path;
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("media_duplicated"));
    },
    async copyMedia({ media_path, destination_path_to_folder }) {
      const new_media_path = await this.$api.copyFile({
        path: media_path,
        destination_path_to_folder,
      });
      new_media_path;
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("media_copied"));
      this.toggleMediaFocus(false);
    },
    prevMedia() {
      this.toggleMediaFocus(
        this.sorted_medias[this.focused_media_index - 1].$path
      );
    },
    nextMedia() {
      this.toggleMediaFocus(
        this.sorted_medias[this.focused_media_index + 1].$path
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

  --active-color: var(--c-vert);
}

._scrollBox {
  height: 100%;
  overflow: auto;
}

._mediaLibrary--lib {
  overflow: auto;
}

._mediaLibrary--lib--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 2px;
  padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 2);
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
  gap: calc(var(--spacing) / 2);

  background: var(--color-collect);
  z-index: 1;
  padding: calc(var(--spacing) / 2);
}

._mediaCount {
  color: black;
  margin-bottom: 0;
}
</style>