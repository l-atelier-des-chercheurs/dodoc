<template>
  <div class="_pickimage">
    <div class="_pickimage--upload" v-if="available_options.includes('import')">
      <input
        type="file"
        accept="image/*"
        :id="id"
        class="inputfile-2"
        @change="onFileChange"
      />
      <label :for="id" class="u-button">
        <svg class="inlineSVG" width="20" height="17" viewBox="0 0 20 17">
          <path
            d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
          />
        </svg>
        <span>
          &thinsp;
          {{ _instructions }}
        </span>
      </label>
    </div>

    <div
      class="_pickimage--fromLib"
      v-if="available_options.includes('project')"
    >
      <button
        type="button"
        class="u-button u-button_orange"
        @click="show_picker = true"
      >
        <span class="u-icon" v-html="dodoc_icon_collect" />
        <span>
          {{ $t("from_project") }}
        </span>
      </button>
      <PickMediaFromProjects
        v-if="show_picker"
        :title="$t('pick_media')"
        :path="path"
        :select_mode="'single'"
        :pick_from_types="['image']"
        @pickMedias="pickMediasFromLib"
        @close="show_picker = false"
      />
    </div>

    <div
      class="_pickimage--takePhoto"
      v-if="available_options.includes('capture')"
    >
      <button
        type="button"
        class="u-button u-button_red"
        v-if="!enable_capture_mode"
        @click="enable_capture_mode = true"
      >
        <img
          class="inlineSVG"
          :src="$root.publicPath + 'images/i_record.svg'"
        />
        <span>
          {{ $t("take_picture") }}
        </span>
      </button>

      <BaseModal2
        :size="'full'"
        v-if="enable_capture_mode"
        :nopadding="true"
        @close="enable_capture_mode = false"
      >
        <CaptureView
          :available_modes="[]"
          :selected_mode="'photo'"
          :return_temp_media="true"
          :must_validate_media="false"
          @close="enable_capture_mode = false"
          @tempMedia="tempMedia"
        />
      </BaseModal2>

      <!-- <div v-if="enable_capture_mode">
          <button type="button" class="" @click="enable_capture_mode = false">
            <span>{{ $t("cancel") }}</span>
          </button>
        </div> -->
    </div>

    <small class="u-instructions">{{ $t("or_paste_an_image") }}</small>
  </div>
</template>
<script>
export default {
  props: {
    path: String,
    instructions: String,
    available_options: {
      type: Array,
      default: () => ["import", "project", "capture"],
    },
  },
  components: {
    CaptureView: () => import("@/adc-core/capture/CaptureView.vue"),
  },
  data() {
    return {
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
  watch: {},
  computed: {
    _instructions() {
      return this.instructions !== undefined
        ? this.instructions
        : this.$t("upload_an_image");
    },
  },
  methods: {
    handlePaste($event) {
      if ($event.clipboardData.files && $event.clipboardData.files.length > 0) {
        $event.preventDefault();
        $event.stopPropagation();
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log("Importation depuis presse-papier");
        const file = $event.clipboardData.files[0];
        this.$nextTick(() => {
          this.$emit("newPreview", { type: "file", data: file });
        });
      } else {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("no_image_in_clipboard"));
      }
    },
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      const file = files[0];
      this.$emit("newPreview", { type: "file", data: file });
    },
    async pickMediasFromLib(medias) {
      // mode === 'single', so we should get only one file
      const media = medias[0];
      const path_to_project = this.getParent(media.$path);
      const image_url = this.makeRelativeURLFromThumbs({
        $thumbs: media.$thumbs,
        $type: media.$type,
        $path: path_to_project,
        resolution: 1600,
      });

      // const image_url = this.makeMediaFileURL({
      //   $path: path_to_project,
      //   $media_filename: media.$media_filename,
      // });
      const blob = await fetch(image_url).then((r) => r.blob());
      const file = new File([blob], media.$media_filename);

      this.$emit("newPreview", { type: "file", data: file });
    },
    async tempMedia($event) {
      const file = new File([$event.rawData], "filename");
      this.$emit("newPreview", { type: "file", data: file });
    },
  },
};
</script>
<style scoped lang="scss">
._pickimage {
  display: flex;
  flex-flow: column nowrap;
  flex: 1 1 auto;
  width: 100%;

  gap: calc(var(--spacing) / 4);
}

._pickimage--upload {
  ::v-deep label {
    width: 100%;
  }
}

._pickimage--takePhoto,
._pickimage--fromLib {
  > button {
    width: 100%;
  }
}
</style>
