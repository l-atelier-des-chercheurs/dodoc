<template>
  <div
    class="_uploadFile"
    :class="
      (['is--' + status],
      {
        'is--mobileView': $root.is_mobile_view,
      })
    "
  >
    <div class="_uploadFile--progressBar">
      <div
        class="_uploadFile--progressBar--bar"
        :style="`--progress-percent: ${(upload_percentage || 0) / 100}`"
      />
      <div class="_uploadFile--progressBar--percent">
        <span> {{ index_indicator }}</span>
        <span>
          {{ $t(status).toLowerCase() }}
          {{
            upload_percentage && upload_percentage < 100
              ? " – " + upload_percentage + "%"
              : ""
          }}
        </span>
      </div>
    </div>
    <div class="_uploadFile--row">
      <div class="_uploadFile--preview">
        <template v-if="!sent_file">
          <img
            v-if="file_type === 'image'"
            class="_uploadFile--image"
            width="50"
            :src="preview"
          />
          <template v-else>
            <b-icon icon="eye-slash" />
          </template>
        </template>
        <template v-else>
          <MediaContent
            :file="sent_file"
            :context="'full'"
            :resolution="1600"
          />
        </template>
      </div>

      <div :title="file.name" class="_uploadFile--infos">
        <div class="_infos--row">
          <div class="u-metaField">
            <DLabel :str="$t('filename')" />
            <div class="u-filename">{{ file.name }}</div>
          </div>
          <SizeDisplay
            class="_sizeDisplay"
            v-if="file.size"
            :size="file.size"
          />
        </div>

        <template v-if="sent_file">
          <hr />
          <div v-if="allow_caption_edition" class="_infos--row _captionEditor">
            <div class="u-spacingBottom">
              <TitleField
                :label="$t('caption')"
                :field_name="'caption'"
                :content="sent_file.caption"
                :path="sent_file.$path"
                :input_type="'editor'"
                :custom_formats="['bold', 'italic', 'link', 'emoji']"
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
                :custom_formats="['bold', 'italic', 'link', 'emoji']"
                :can_edit="true"
              />
            </div>
          </div>
          <div v-if="optimization_strongly_recommended" class="u-instructions">
            <div class="u-spacingBottom">
              {{ $t("convert_to_format") }}
              <button
                type="button"
                class="u-button u-button_orange"
                @click="show_optimize_modal = true"
              >
                <b-icon :icon="'file-play-fill'" />
                {{ $t("convert_shorten") }}
              </button>
            </div>
          </div>
          <OptimizeMedia
            v-if="show_optimize_modal"
            :media="sent_file"
            @close="show_optimize_modal = false"
          />
        </template>
      </div>
      <div class="_uploadFile--action">
        <transition name="fade" mode="out-in">
          <!-- <button
          type="button"
          class="u-button u-button_icon u-button_bleuvert"
          v-if="status === 'waiting'"
          @click="uploadFile"
        >
          <b-icon icon="play-fill" />
        </button> -->
          <button
            type="button"
            class="u-button u-button_icon"
            key="skip"
            v-if="status === 'waiting'"
            @click="$emit('skip')"
          >
            <b-icon icon="x-lg" />
          </button>
          <LoaderSpinner
            v-else-if="['creating_thumb', 'sending'].includes(status)"
            key="loading"
          />
          <button
            type="button"
            class="u-button u-button_icon"
            key="hide"
            v-else-if="status === 'sent'"
            @click="$emit('hide')"
          >
            <b-icon
              icon="check-circle-fill
          "
              :aria-label="$t('hide')"
            />
          </button>
          <button
            type="button"
            v-else
            key="retry"
            class="u-button u-button_bleuvert"
            @click="retrySend"
          >
            {{ $t("retry") }}
          </button>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>
import MediaContent from "../fields/MediaContent.vue";

export default {
  props: {
    file: File,
    index_indicator: String,
    path: String,
    allow_caption_edition: Boolean,
  },
  components: {
    OptimizeMedia: () => import("@/adc-core/fields/OptimizeMedia.vue"),
  },
  data() {
    return {
      status: "waiting",
      upload_percentage: undefined,
      preview: undefined,

      new_file_caption: "",
      sent_file: undefined,

      file_caption: "",
      file_credits: "",

      show_optimize_modal: false,
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
    optimization_strongly_recommended() {
      return this.fileShouldBeOptimized({
        filename: this.sent_file.$media_filename,
      });
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

        if (this.upload_percentage === 100 && this.status !== "sent")
          this.status = "creating_thumb";
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

      this.$emit("uploaded", { filename: this.file.name, meta_filename });
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

  color: var(--c-noir);
  // border-radius: 4px;
  overflow: hidden;
  border: 2px solid var(--c-gris_clair);

  // border: 2px solid var(--c-gris_clair);
  background: white;

  // border-radius: 4px;
  overflow: hidden;

  &:not(:last-child) {
    // border-bottom: 4px solid var(--c-gris_clair);
    // margin-bottom: calc(var(--spacing));
  }
}

._uploadFile--row {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: stretch;
  gap: calc(var(--spacing) / 2);

  .is--mobileView & {
    flex-flow: column nowrap;
  }

  > * {
    flex: 1 1 auto;
    position: relative;
    z-index: 1;
    overflow: hidden;
  }
}

._uploadFile--progressBar {
  position: relative;
  width: 100%;
  height: 1.5rem;
  // margin-bottom: 2px;

  background: white;
  // border-radius: 6px 6px 0 0;
  overflow: hidden;

  ._uploadFile--progressBar--bar {
    position: absolute;
    width: 100%;
    height: 100%;
    transform: scale(var(--progress-percent, 0), 1);
    transform-origin: left center;

    transition: all 0.2s;
    background-color: var(--c-orange);
  }

  ._uploadFile--progressBar--percent {
    position: absolute;
    width: 100%;
    height: 100%;
    // top: -0.1rem;
    // right: 0.25rem;
    padding: 0 calc(var(--spacing) / 2);
    text-align: right;
    font-size: var(--sl-font-size-x-small);
    font-family: var(--sl-font-mono);
    font-weight: 500;

    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
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
  width: 140px;
  max-width: 40vw;
  aspect-ratio: 1/1;
  overflow: hidden;
  height: auto;
  background-color: var(--c-gris_clair);

  .is--mobileView & {
    max-width: none;
    width: 100%;
    aspect-ratio: 2/1;
  }

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

._infos--row {
  display: flex;
  flex-flow: row nowrap;
  justify-content: stretch;
  align-items: flex-start;
  gap: calc(var(--spacing) / 2);

  > * {
    flex: 1 0 20ch;
    margin-bottom: 0;
    overflow: hidden;

    &._sizeDisplay {
      // flex: 0 0 20ch;
    }
  }
}
._captionEditor {
  ::v-deep ._collaborativeEditor._collaborativeEditor {
    // background-color: white;
  }
}
</style>
