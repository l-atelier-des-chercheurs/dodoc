<template>
  <div class="_imageselect">
    <template v-if="!image">
      <div class="_imageselect--upload">
        <input
          type="file"
          accept="image/*"
          :id="id"
          class="inputfile-2"
          @change="onFileChange"
        />
        <label :for="id" class="u-button u-button_big">
          <svg width="20" height="17" viewBox="0 0 20 17">
            <path
              d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
            />
          </svg>
          {{ _instructions }}
        </label>
      </div>

      <div class="_imageselect--takePhoto">
        <button
          type="button"
          class="u-button u-button_big"
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
          :can_add_to_fav="false"
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

      <!-- <div
        class="_imageselect--selectFromMedias"
        v-if="load_from_projects_medias"
      >
        <label>{{ $t("or_choose_from_image_medias") }}</label>
        <select v-model="show_medias_from_project">
          <option key="''" :value="''">—</option>
          <option
            v-for="project in $root.projects_that_are_accessible"
            :key="project.slugFolderName"
            :value="project.slugFolderName"
          >
            {{ project.name }}
          </option>
        </select>
        <div
          class="_imageselect--selectFromMedias--imageList"
          v-if="!!show_medias_from_project"
        >
          <template
            v-if="
              getProjectsImages({
                project_slug: show_medias_from_project,
              }) === false
            "
          >
            <small>
              <i>{{ $t("loading") }}</i>
            </small>
          </template>
          <template
            v-else-if="
              getProjectsImages({
                project_slug: this.show_medias_from_project,
              }).length === 0
            "
          >
            <small>
              <i>{{ $t("no_images_to_show") }}</i>
            </small>
          </template>
          <button
            v-else
            type="button"
            v-for="image in getProjectsImages({
              project_slug: this.show_medias_from_project,
            })"
            :key="image.metaFileName"
            @click="selectThisImageForPreview({ image })"
          >
            <img
              :src="mediasImagesPreviewURL({ thumbs: image.thumbs, size: 360 })"
            />
          </button>
        </div>
      </div> -->
    </template>

    <div class="_imageselect--image" v-else>
      <img v-if="typeof image === 'string'" :src="image" draggable="false" />
      <img
        v-if="typeof image === 'object'"
        :src="getPreviewFromMedias(image)"
        draggable="false"
      />
      <button class="buttonLink" type="button" @click="removeImage">
        {{ $t("remove_image") }}
      </button>
    </div>
  </div>
</template>
<script>
import CaptureView from "@/adc-core/capture/CaptureView.vue";

export default {
  props: {
    existing_preview: [Boolean, String],

    instructions: String,

    project_slug: {
      type: String,
      default: "",
    },
    load_from_projects_medias: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    CaptureView,
  },
  data() {
    return {
      image: this.existing_preview,
      id: `image_select_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      show_medias_from_project: "",
      enable_capture_mode: false,
    };
  },

  created() {},
  mounted() {
    this.show_medias_from_project = this.project_slug ? this.project_slug : "";
  },
  beforeDestroy() {},

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
    // first_project_slug() {
    //   if (Object.keys(this.$root.store.projects).length === 0) return "";
    //   return Object.keys(this.$root.store.projects)[0];
    // },
  },
  methods: {
    // getProjectsImages({ project_slug }) {
    //   if (
    //     !project_slug ||
    //     !this.$root.store.projects.hasOwnProperty(project_slug)
    //   ) {
    //     return [];
    //   }

    //   const medias = this.$root.store.projects[project_slug].medias;
    //   if (medias.length === 0) return false;

    //   const images = Object.values(
    //     this.$root.store.projects[project_slug].medias
    //   ).filter((m) => m.type === "image");

    //   return images;
    // },
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      const file = files[0];

      this.$emit("newPreview", file);

      this.createImage(file).then((res) => {
        setTimeout(() => {
          this.image = res;
        }, 20);
      });
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
._imageselect--image {
  width: 200px;
}

._imageselect--takePhoto {
  > button {
    background: var(--c-orange);
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
