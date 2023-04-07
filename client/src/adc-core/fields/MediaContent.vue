<template>
  <div
    class="_mediaContent"
    :data-filetype="file.$type"
    :draggable="is_draggable"
    @dragstart="startMediaDrag($event)"
    @dragend="endMediaDrag()"
  >
    <template v-if="file.$type === 'image'">
      <template v-if="context === 'preview'">
        <img :src="thumb" class="_mediaContent--image" loading="eager" />
      </template>
      <template v-else>
        <img
          :src="file_full_path"
          class="_mediaContent--image"
          loading="eager"
        />
      </template>
      <template v-if="show_fullscreen_button">
        <FullscreenBtn
          class="u-floatingFsButton"
          :icon="'fullscreen'"
          :label="$t('fullscreen')"
          @click="show_fullscreen = true"
        />
        <FullscreenView v-if="show_fullscreen" @close="show_fullscreen = false">
          <img :src="file_full_path" />
        </FullscreenView>
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
    <template v-else-if="file.$type === 'url'">
      <template v-if="context === 'preview'">
        <img :src="thumb" class="_mediaContent--image" />
      </template>
      <template v-else>
        <template v-if="url_to_site.type === 'any'">
          <iframe
            class="_mediaContent--iframe"
            :src="url_to_site.src"
            frameborder="0"
          />
        </template>
        <vue-plyr v-else :key="file_full_path">
          <div class="plyr__video-embed">
            <iframe
              :src="url_to_site.src"
              class="_mediaContent--iframe"
              allowfullscreen
              allowtransparency
              allow="autoplay"
              :poster="thumb"
              frameborder="0"
            />
          </div>
        </vue-plyr>
      </template>
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
      default: 220,
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
    show_fullscreen_button: {
      type: Boolean,
      default: false,
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
    url_to_site() {
      if (!this.file.$content) return false;
      return this.transformURL(this.file.$content);
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
  position: relative;

  &[data-filetype="other"] {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &[data-filetype="url"] {
    aspect-ratio: 16/9;
  }
  &[data-filetype="pdf"] {
    aspect-ratio: 16/9;
  }
}

._mediaContent--pdfIframe {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid #535659;
}
._mediaContent--iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid #535659;
}
</style>
