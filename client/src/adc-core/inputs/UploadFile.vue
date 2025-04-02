<template>
  <div class="_uploadFile" :class="['is--' + status]">
    <div class="_uploadFile--progressBar">
      <div
        class="_uploadFile--progressBar--bar"
        :style="`--progress-percent: ${(upload_percentage || 0) / 100}`"
      />
      <div class="_uploadFile--progressBar--percent">
        <span>
          {{ $t(status) }}
        </span>
        <span>
          {{ upload_percentage ? upload_percentage + "%" : "" }}
        </span>
      </div>
    </div>
    <div class="_uploadFile--row">
      <div class="_uploadFile--preview">
        <img
          v-if="file_type === 'image'"
          class="_uploadFile--image"
          width="50"
          :src="preview"
        />
        <template v-else>
          <b-icon icon="eye-slash" />
        </template>
        <!-- <div v-else class="_uploadFile--image" /> -->
      </div>

      <div :title="file.name" class="_uploadFile--infos">
        <template v-if="!allow_caption_edition || !sent_file">
          <div class="u-metaField">
            <DLabel :str="$t('filename')" />
            <div class="u-filename">{{ file.name }}</div>
          </div>
          <SizeDisplay v-if="file.size" :size="file.size" />
        </template>
        <div v-else class="_captionEditor">
          <!-- <hr /> -->
          <div class="u-spacingBottom">
            <TitleField
              :label="$t('caption')"
              :field_name="'caption'"
              :content="sent_file.caption"
              :path="sent_file.$path"
              :input_type="'editor'"
              :custom_formats="['bold', 'italic', 'link']"
              :can_edit="true"
            />
          </div>
          <div class="u-spacingBottom">
            <TitleField
              :label="$t('credit/reference')"
              :field_name="'$credits'"
              :content="sent_file.$credits"
              :path="sent_file.$path"
              :input_type="'editor'"
              :custom_formats="['bold', 'italic', 'link']"
              :can_edit="true"
            />
          </div>
        </div>
      </div>
      <div class="_uploadFile--action">
        <button
          type="button"
          class="u-button u-button_icon u-button_bleuvert"
          v-if="status === 'waiting'"
          @click="uploadFile"
        >
          <b-icon icon="play-fill" />
        </button>
        <button
          type="button"
          class="u-button u-button_icon"
          v-else-if="['waiting', 'sending'].includes(status)"
          @click="$emit('skip')"
        >
          <b-icon icon="x-lg" />
        </button>
        <button
          type="button"
          class="u-button u-button_icon"
          v-else-if="status === 'sent'"
          @click="$emit('hide')"
        >
          <b-icon
            icon="check"
            style="font-size: 1.5em"
            :aria-label="$t('hide')"
          />
        </button>
        <button
          type="button"
          v-else
          class="u-button u-button_bleuvert"
          @click="retrySend"
        >
          {{ $t("retry") }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    file: File,
    path: String,
    allow_caption_edition: Boolean,
  },
  components: {},
  data() {
    return {
      status: "waiting",
      upload_percentage: undefined,
      preview: undefined,

      new_file_caption: "",
      sent_file: undefined,

      file_caption: "",
      file_credits: "",
    };
  },
  created() {
    this.preview = URL.createObjectURL(this.file);
  },
  mounted() {},
  beforeDestroy() {
    if (this.preview) URL.revokeObjectURL(this.preview);
  },
  watch: {},
  computed: {
    file_type() {
      if (this.file.type?.includes("image")) return "image";
      return undefined;
    },
  },
  methods: {
    async uploadFile() {
      this.status = "sending";
      this.upload_percentage = 0;

      let additional_meta = {};
      additional_meta.$origin = "collect";
      if (this.file.lastModified)
        additional_meta.$date_created = this.file.lastModified;
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      const onProgress = (progressEvent) => {
        this.upload_percentage = parseInt(
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        );
      };

      const { meta_filename, uploaded_meta } = await this.$api
        .uploadFile({
          path: this.path,
          filename: this.file.name,
          file: this.file,
          additional_meta,
          onProgress,
        })
        .catch((err) => {
          this.status = "error";
          if (err.code !== "file_size_limit_exceeded")
            this.$alertify.delay(4000).error(err.message);
          this.error = err.message;
          throw err;
        });

      this.upload_percentage = 100;
      this.status = "sent";

      setTimeout(() => {
        this.sent_file = this.$api.store[this.path].$files.find(
          (f) => f.$path === uploaded_meta.$path
        );
      }, 500);

      this.$emit("uploaded", meta_filename);
    },
    cancelSend() {},
    retrySend() {
      // todo
    },
  },
};
</script>
<style lang="scss" scoped>
._uploadFile {
  position: relative;

  background-color: var(--c-gris_clair);

  color: var(--c-noir);
  border: 2px solid var(--c-gris_clair);

  border-radius: 4px;
  overflow: hidden;
}

._uploadFile--row {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: stretch;
  gap: calc(var(--spacing) / 2);

  > * {
    flex: 1 1 auto;
    position: relative;
    z-index: 1;
  }
}

._uploadFile--progressBar {
  position: relative;
  width: 100%;
  height: 1rem;

  background: white;
  // border-radius: 4px;
  overflow: hidden;

  ._uploadFile--progressBar--bar {
    position: absolute;
    width: 100%;
    height: 100%;
    transform: scale(var(--progress-percent, 0), 1);
    transform-origin: left center;

    transition: all 0.2s;
    background-color: var(--active-color);
  }

  ._uploadFile--progressBar--percent {
    position: absolute;
    width: 100%;
    // top: -0.1rem;
    // right: 0.25rem;
    padding: 0 calc(var(--spacing) / 2);
    text-align: right;
    font-size: var(--sl-font-size-x-small);
    font-family: var(--sl-font-mono);
    font-weight: 700;

    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
  }
}

// &.is--success {
// }
// &.is--failed {
//   &::before {
//     background-color: var(--color-noir);
//   }
// }

._uploadFile--preview {
  position: relative;
  display: flex;
  place-content: center;
  place-items: center;
  flex: 0 0 auto;
  width: 150px;
  max-width: 20vw;
  aspect-ratio: 1/1;
  height: auto;
  background-color: white;

  img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    object-fit: cover;
  }
}

._uploadFile--infos {
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2);

  .u-filename {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}

._uploadFile--size {
  flex: 0 0 70px;
}
._uploadFile--action {
  flex: 0 0 70px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

._captionEditor {
  ::v-deep ._collaborativeEditor._collaborativeEditor {
    // background-color: white;
  }
}
</style>
