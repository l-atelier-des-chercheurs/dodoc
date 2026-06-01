<template>
  <div class="_exportPane">
    <img :src="preview_image" />
    <div class="_btnRow">
      <button
        type="button"
        class="u-button u-button_white"
        @click="$emit('back')"
      >
        <b-icon icon="arrow-left-short" />
        {{ $t("previous") }}
      </button>

      <button
        v-if="available_save_actions.includes('saveAsNew')"
        type="button"
        class="u-button u-button_bleuvert"
        data-action="saveAsNew"
        @click="buttonSaveAsNew"
      >
        <b-icon icon="file-plus" />
        {{ $t("save_as_new_media") }}
      </button>
      <button
        v-if="available_save_actions.includes('replaceOriginal')"
        type="button"
        class="u-button u-button_red"
        data-action="replaceOriginal"
        @click="replaceOriginal"
      >
        <b-icon icon="save2-fill" />
        {{ $t("replace_original") }}
      </button>
      <div
        v-if="available_save_actions.includes('download')"
        data-action="download"
        class="_download_media_without_validation"
      >
        <a
          v-if="final_image_blob_url"
          :href="final_image_blob_url"
          :download="final_image_filename"
          class="u-button u-button_bleuvert"
          target="_blank"
        >
          <b-icon icon="download" />
          {{ $t("download") }}
          <!-- <template v-if="final_image_blob">
            — {{ formatBytes(final_image_blob.size) }}
          </template> -->
        </a>
      </div>

      <div class="_spinner" v-if="is_saving" key="loader">
        <AnimatedCounter :value="media_being_sent_percent" />
      </div>
    </div>
  </div>
</template>
<script>
import BlobUrlForDownload from "@/mixins/BlobUrlForDownload.js";
import { replaceOriginalWithNewFile } from "@/utils/replaceOriginalMedia.js";
import { getCopyableMediaMeta } from "@/utils/mediaMeta.js";

export default {
  mixins: [BlobUrlForDownload],
  props: {
    media: { type: Object, required: true },
    available_save_actions: {
      type: Array,
      default: () => ["saveAsNew", "replaceOriginal", "download"],
    },
    preview_image: { type: String, default: null },
    final_image_blob: {
      default: null,
      validator(value) {
        return value === null || value instanceof Blob;
      },
    },
    final_image_filename: { type: String, required: true },
    processing_label: { type: String, required: true },
  },
  data() {
    return {
      is_saving: false,
      media_being_sent_percent: 0,
    };
  },
  methods: {
    async buttonSaveAsNew() {
      await this.saveAsNew();
      this.$emit("close");
    },
    async saveAsNew() {
      this.is_saving = true;

      const path = this.getParent(this.media.$path);
      const additional_meta = getCopyableMediaMeta(this.media, {
        $origin: "collect",
        $processing: [this.processing_label],
      });

      const onProgress = (progressEvent) => {
        this.media_being_sent_percent = parseInt(
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        );
      };

      const { uploaded_meta, meta_filename } = await this.$api
        .uploadFile({
          path,
          filename: this.final_image_filename,
          file: this.final_image_blob,
          additional_meta,
          onProgress,
        })
        .catch((err) => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("media_couldnt_be_sent"));
          throw err;
        });

      this.is_saving = false;
      return { uploaded_meta, meta_filename };
    },
    async replaceOriginal() {
      const { uploaded_meta, meta_filename } = await this.saveAsNew();
      const temp_path = this.getParent(this.media.$path) + "/" + meta_filename;
      const new_file = {
        $path: temp_path,
        $media_filename: uploaded_meta.$media_filename,
        $type: uploaded_meta.$type ?? this.media.$type,
      };
      await replaceOriginalWithNewFile(
        this.$api,
        this.media,
        new_file,
        this.processing_label,
        true
      );
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._exportPane {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  height: 100%;

  img {
    flex: 1 1 0;
    width: 100%;
    overflow: hidden;
    object-fit: contain;
    background-color: var(--c-noir);
    padding: calc(var(--spacing) / 2);
  }

  ._btnRow {
    flex: 0 0 auto;
  }
}

._btnRow {
  position: relative;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);
}

._spinner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);

  display: flex;
  justify-content: center;
  align-items: center;
}

._download_media_without_validation {
  padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 4);
  margin-bottom: -0.2em;
  line-height: 1;
  text-align: right;

  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  a {
  }
}
</style>
