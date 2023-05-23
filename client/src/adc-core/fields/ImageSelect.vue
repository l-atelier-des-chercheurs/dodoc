<template>
  <div class="_imageselect">
    <template v-if="!image">
      <div
        class="_imageselect--upload"
        v-if="available_options.includes('import')"
      >
        <input
          type="file"
          accept="image/*"
          :id="id"
          class="inputfile-2"
          @change="onFileChange"
        />
        <label :for="id" class="u-button">
          <svg width="20" height="17" viewBox="0 0 20 17">
            <path
              d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
            />
          </svg>
          {{ _instructions }}
        </label>
      </div>

      <div
        class="_imageselect--fromLib"
        v-if="available_options.includes('project')"
      >
        <button
          type="button"
          class="u-button u-button_orange"
          @click="show_picker = true"
        >
          <svg
            class="inlineSVG"
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
            <path style="fill: var(--c-orange)" d="m42 42h21.6v21h-21.6z" />
            <path style="fill: var(--c-orange)" d="m73.2 42h21.6v21h-21.6z" />
            <path style="fill: var(--c-orange)" d="m104.4 42h21.6v21h-21.6z" />
            <path style="fill: var(--c-orange)" d="m42 73.5h21.6v21h-21.6z" />
            <path style="fill: var(--c-orange)" d="m73.2 73.5h21.6v21h-21.6z" />
            <path
              style="fill: var(--c-orange)"
              d="m104.4 73.5h21.6v21h-21.6z"
            />
            <path style="fill: var(--c-orange)" d="m42 105h21.6v21h-21.6z" />
            <path style="fill: var(--c-orange)" d="m73.2 105h21.6v21h-21.6z" />
            <path style="fill: var(--c-orange)" d="m104.4 105h21.6v21h-21.6z" />
          </svg>
          &nbsp;
          {{ $t("from_project") }}
        </button>
        <PickMediaFromProjects
          v-if="show_picker"
          :path="path"
          @selectMedia="selectMediaFromLib"
          @close="show_picker = false"
        />
      </div>

      <div
        class="_imageselect--takePhoto"
        v-if="available_options.includes('capture')"
      >
        <button
          type="button"
          class="u-button u-button_red"
          @click="enable_capture_mode = true"
        >
          <img
            class="inlineSVG"
            :src="$root.publicPath + 'images/i_record.svg'"
          />
          &nbsp;
          <span>
            {{ $t("take_picture") }}
          </span>
        </button>

        <CaptureView
          v-if="enable_capture_mode"
          :available_modes="['photo']"
          :return_temp_media="true"
          :must_validate_media="false"
          @close="enable_capture_mode = false"
          @tempMedia="tempMedia"
        />

        <div v-if="enable_capture_mode">
          <button type="button" class="" @click="enable_capture_mode = false">
            <span>{{ $t("cancel") }}</span>
            <!-- <img src="/images/i_close_sansfond.svg" draggable="false" /> -->
          </button>
        </div>
      </div>

      <small>{{ $t("or_paste_an_image") }}</small>
    </template>

    <div class="_imageselect--image" v-else>
      <img v-if="typeof image === 'string'" :src="image" draggable="false" />
      <button class="u-buttonLink" type="button" @click="removeImage">
        {{ $t("remove_image") }}
      </button>
    </div>
  </div>
</template>
<script>
import PickMediaFromProjects from "@/components/publications/PickMediaFromProjects.vue";

export default {
  props: {
    existing_preview: [Boolean, String],
    path: String,
    instructions: String,
    available_options: {
      type: Array,
      default: () => ["import", "project", "capture"],
    },
  },
  components: {
    PickMediaFromProjects,
    CaptureView: () => import("@/adc-core/capture/CaptureView.vue"),
  },
  data() {
    return {
      image: this.existing_preview,
      id: `image_select_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      show_picker: false,
      show_medias_from_project: "",
      enable_capture_mode: false,
    };
  },

  created() {},
  mounted() {
    window.addEventListener("paste", this.handlePaste);
  },
  beforeDestroy() {
    window.removeEventListener("paste", this.handlePaste);
  },

  watch: {
    // show_medias_from_project: function () {
    //   this.$socketio.listMedias({
    //     type: "projects",
    //     slugFolderName: this.show_medias_from_project,
    //   });
    // },
  },
  computed: {
    _instructions() {
      return this.instructions !== undefined
        ? this.instructions
        : this.$t("upload_from_device");
    },
  },
  methods: {
    handlePaste(e) {
      if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        console.log(
          `Story — METHODS • handlePaste: for files.length = ${e.clipboardData.files.length} with size ${e.clipboardData.files[0].size}`
        );
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log("Importation depuis presse-papier");

        this.$nextTick(() => {
          const file = e.clipboardData.files[0];
          this.setNewPreview(file);
        });
      } else {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.no_image_in_clipboard"));
      }
    },
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      const file = files[0];
      this.setNewPreview(file);
    },
    setNewPreview(file) {
      this.$emit("newPreview", file);

      this.createImage(file).then((res) => {
        setTimeout(() => {
          this.image = res;
        }, 20);
      });
    },
    selectMediaFromLib({ path_to_source_media_meta }) {
      const file = this.getMediaInFolder({
        path_to_source_media_meta,
      });
      const path_to_project = this.getParent(file.$path);
      this.image = this.makeRelativeURLFromThumbs({
        $thumbs: file.$thumbs,
        $type: file.$type,
        $path: path_to_project,
        resolution: 1600,
      });
      this.$emit("newPreview", path_to_source_media_meta);
    },
    createImage(blob) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    },
    removeImage: function () {
      this.image = "";
      this.$emit("newPreview", "");
    },

    async tempMedia($event) {
      const file = new File([$event.rawData], "filename");
      this.$emit("newPreview", file);

      const res = await this.createImage($event.rawData).catch(() => {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error("failed to load photo");
      });

      this.image = res;
      this.enable_capture_mode = false;
    },

    mediasImagesPreviewURL({ thumbs, size }) {
      if (!thumbs) return false;

      const small_thumb = thumbs.filter((m) => m.size === size);
      if (small_thumb.length == 0) {
        return false;
      }

      let pathToSmallestThumb = small_thumb[0].path;

      let url = `/${pathToSmallestThumb}`;
      return url;
    },
    selectThisImageForPreview({ image }) {
      this.image = {
        metaFileName: image.metaFileName,
        slugFolderName: this.show_medias_from_project,
        type: "projects",
      };

      this.image.thumb = this.getPreviewFromMedias(this.image);
      this.$emit("newPreview", this.image);
    },
    getPreviewFromMedias(image) {
      const slugFolderName = image.slugFolderName;
      const media = this.getProjectsImages({
        project_slug: slugFolderName,
      }).find((m) => m.metaFileName === image.metaFileName);
      const url = this.mediasImagesPreviewURL({
        thumbs: media.thumbs,
        size: 1600,
      });
      return url;
    },
  },
};
</script>
<style scoped lang="scss">
._imageselect {
  display: flex;
  flex-flow: column nowrap;
  flex: 1 1 auto;

  gap: calc(var(--spacing) / 4);
}

._imageselect--image {
  width: 200px;
}

._imageselect--upload {
  ::v-deep label {
    width: 100%;
  }
}

._imageselect--takePhoto,
._imageselect--fromLib {
  > button {
    width: 100%;
  }
}

._close_button {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  // background-color: white;

  img {
    width: auto;
  }
}
</style>
