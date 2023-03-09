<template>
  <div
    class="_mediaContent"
    :data-filetype="file.$type"
    :draggable="is_draggable"
    @dragstart="startMediaDrag($event)"
    @dragend="endMediaDrag()"
  >
    <template v-if="file.$type === 'image'">
      <img :src="thumb" class="_mediaContent--image" loading="eager" />
      <template v-if="context === 'full'">
        <FullscreenBtn
          class="u-floatingFsButton"
          :icon="'fullscreen'"
          :label="$t('fullscreen')"
          @click="show_fullscreen = true"
        />
        <FullscreenView
          v-if="show_fullscreen"
          :image_src="file_full_path"
          @close="show_fullscreen = false"
        />
      </template>
    </template>
    <template v-else-if="file.$type === 'video' || file.$type === 'audio'">
      <template v-if="context === 'preview'">
        <img :src="thumb" class="_mediaContent--image" />
      </template>
      <template v-else>
        <vue-plyr
          :key="file_full_path"
          ref="plyr"
          :emit="['volumechange', 'timeupdate']"
          @volumechange="volumeChanged"
          @timeupdate="videoTimeUpdated"
        >
          <video :poster="thumb" :src="file_full_path" preload="none" />
        </vue-plyr>
      </template>
    </template>
    <template v-else-if="file.$type === 'pdf'">
      <template v-if="context === 'preview'">
        <img :src="thumb" class="_mediaContent--image" />
      </template>
      <template v-else>
        <iframe class="_mediaContent--pdfIframe" :src="file_full_path" />
      </template>
    </template>
    <template v-else-if="file.$type === 'stl'">
      <img :src="thumb" class="_mediaContent--image" />
    </template>
    <small v-else class="u-fontCode fieldCaption _fileName">
      <sl-icon name="file-earmark" /> {{ file.$media_filename }}
    </small>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    resolution: {
      type: Number,
      default: 180,
    },
    context: {
      type: String,
      default: "preview",
      // preview, full
    },
    is_draggable: {
      type: Boolean,
      default: true,
    },
  },
  components: {},
  data() {
    return {
      is_dragged: false,
      show_fullscreen: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    thumb() {
      const path_to_parent = this.file.$path.substring(
        0,
        this.file.$path.lastIndexOf("/")
      );
      return this.makeRelativeURLFromThumbs({
        $thumbs: this.file.$thumbs,
        $type: this.file.$type,
        $path: path_to_parent,
        resolution: this.resolution,
      });
    },
    file_full_path() {
      const p = this.makeMediaFilePath({
        $path: this.file.$path,
        $media_filename: this.file.$media_filename,
      });
      return `/${p}?v=${this.timestamp}`;
    },
    timestamp() {
      if (this.file.$date_created) return +new Date(this.file.$date_created);
      else return +new Date();
    },
  },
  methods: {
    startMediaDrag($event) {
      console.log(`MediaContent / startMediaDrag`);

      this.is_dragged = true;
      $event.dataTransfer.setData("text/plain", JSON.stringify(this.file));
      $event.dataTransfer.effectAllowed = "link";
      this.$eventHub.$emit(`mediadrag.start`);
    },
    endMediaDrag() {
      this.is_dragged = false;
      console.log(`MediaContent / endMediaDrag`);
      this.$eventHub.$emit(`mediadrag.end`);
    },

    volumeChanged(event) {
      const vol = Math.round(Number(event.detail.plyr.volume) * 100);
      this.$emit("media.volumeChanged", vol);
    },
    videoTimeUpdated(event) {
      this.$emit("media.videoTimeUpdated", event.detail.plyr.media.currentTime);
    },

    // async updateCaption() {
    //   this.fetch_status = "pending";
    //   this.fetch_error = null;
    //   try {
    //     const response = await this.$axios.patch(
    //       `/projects/${this.project_slug}/${this.file.$slug}`,
    //       {
    //         caption: this.new_caption,
    //       }
    //     );
    //     this.response = response.data;
    //     this.fetch_status = "success";
    //   } catch (e) {
    //     this.fetch_status = "error";
    //     this.fetch_error = e.response.data;
    //   }
    // },
    // async removeFile() {
    //   try {
    //     const response = await this.$axios.delete(
    //       `/projects/${this.project_slug}/${this.file.$slug}`
    //     );
    //     this.response = response.data;
    //     this.fetch_status = "success";
    //   } catch (e) {
    //     this.fetch_status = "error";
    //     this.fetch_error = e.response.data;
    //   }
    // },
  },
};
</script>
<style lang="scss" scoped>
._fileName {
  padding: calc(var(--spacing) / 4);
}

._mediaContent {
  &[data-filetype="other"] {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

._mediaContent--pdfIframe {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
