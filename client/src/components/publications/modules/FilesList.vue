<template>
  <div class="_filesList">
    <DLabel :str="mode === 'source' ? $t('source_files') : undefined" />
    <SlickList
      :key="/* slicklist stays active otherwise */ slicklist_key"
      class="_listOfFiles"
      axis="y"
      :value="local_items"
      @input="reorderMedias"
      :useDragHandle="true"
    >
      <SlickItem
        v-for="(media, index) in local_items"
        :key="(media._linked_media && media._linked_media.$path) || index"
        :index="index"
        class="_reorderedFile"
      >
        <button
          type="button"
          v-if="edit_mode"
          class="u-button u-button_icon _dragHandle"
        >
          <b-icon v-handle icon="grip-vertical" :label="$t('move')" />
        </button>
        <component
          :is="mode === 'source' ? 'DownloadFile' : 'span'"
          v-if="media._linked_media && media._linked_media.$path"
          class="_link"
          :file="media._linked_media"
        >
          <button
            type="button"
            class="_link--previewBtn"
            v-if="
              media._linked_media &&
              ['image', 'video', 'audio', 'pdf', 'stl', 'url'].includes(
                media._linked_media.$type
              )
            "
            @click.prevent="show_media_preview_for = media._linked_media"
          >
            <MediaContent
              class="_preview"
              :context="'preview'"
              :file="media._linked_media"
              :resolution="220"
            />
          </button>
          <div class="_preview _preview--none" v-else>
            <b-icon icon="file-earmark-arrow-down" />
          </div>

          <BaseModal2
            v-if="show_media_preview_for === media._linked_media"
            @close="show_media_preview_for = null"
          >
            <MediaContent
              :file="show_media_preview_for"
              :context="'preview'"
              :resolution="1600"
            />
            <div class="u-spacingBottom" />
            <DownloadFile :file="show_media_preview_for" />
          </BaseModal2>

          <span
            class="_link--filename"
            v-text="media._linked_media && media._linked_media.$media_filename"
          />
          <template
            v-if="
              media._linked_media &&
              media._linked_media.$infos &&
              media._linked_media.$infos.size &&
              mode === 'source'
            "
          >
            <!-- |&nbsp; -->
            <span
              class="u-instructions _link--filesize"
              v-text="formatBytes(media._linked_media.$infos.size)"
            />
          </template>

          <button type="button" class="u-button u-button_icon _download">
            <b-icon
              v-if="mode === 'source'"
              class=""
              icon="file-earmark-arrow-down-fill"
            />
          </button>
        </component>

        <div class="_removeItem" v-if="edit_mode">
          <EditBtn
            :btn_type="'remove'"
            :label_position="'left'"
            :is_unfolded="false"
            @click="$emit('removeMediaAtIndex', { index })"
          />
        </div>
      </SlickItem>
    </SlickList>

    <div v-if="edit_mode || (mode === 'source' && download_all_meta_filenames.length > 0)" class="_addBtnSection">
      <button
        v-if="mode === 'source' && download_all_meta_filenames.length > 0"
        type="button"
        class="u-button u-button_bleuvert u-button_small"
        :disabled="is_downloading_sources"
        @click="downloadAllSources"
      >
        <b-icon v-if="is_downloading_sources" icon="arrow-repeat" class="_spinner" />
        <b-icon v-else icon="file-earmark-arrow-down" />
        {{ $t("download_all") }}
      </button>
      <button
        v-if="edit_mode"
        type="button"
        class="u-button u-button_bleuvert u-button_small"
        @click="show_media_picker = true"
      >
        <b-icon icon="plus-circle" />
        {{ $t("add_files") }}
      </button>
      <MediaPicker
        v-if="show_media_picker"
        :publication_path="publication_path"
        @pickMedias="$emit('pickMedias', $event)"
        @close="show_media_picker = false"
      />
      <DropZone @mediaDropped="$emit('pickMedias', [$event])" />
    </div>
  </div>
</template>
<script>
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";
import MediaPicker from "@/components/publications/MediaPicker.vue";
import PathsMixin from "@/mixins/Paths.js";

export default {
  props: {
    medias_with_linked: Array,
    publication_path: String,
    mode: String,
    edit_mode: Boolean,
  },
  components: {
    SlickItem,
    SlickList,
    MediaPicker,
  },
  mixins: [PathsMixin],
  directives: { handle: HandleDirective },
  data() {
    return {
      show_media_picker: false,
      show_media_preview_for: null,
      local_items: undefined,
      is_downloading_sources: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    medias_with_linked: {
      handler() {
        this.local_items = this.medias_with_linked || [];
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    slicklist_key() {
      let key = this.edit_mode + "_";
      const list = this.local_items || [];
      list.forEach((media) => {
        key += media._linked_media?.$path + "_";
      });
      return key;
    },
    download_all_folder_path() {
      const items = this.local_items || [];
      const first = items.find((m) => m._linked_media?.$path);
      return first ? this.getParent(first._linked_media.$path) : null;
    },
    download_all_meta_filenames() {
      const folder = this.download_all_folder_path;
      if (!folder) return [];
      const items = this.local_items || [];
      return items
        .filter((m) => m._linked_media?.$path && this.getParent(m._linked_media.$path) === folder)
        .map((m) => this.getFilename(m._linked_media.$path));
    },
  },
  methods: {
    reorderMedias(items) {
      this.local_items = items;
      this.$emit("reorderMedias", items);
    },
    async downloadAllSources() {
      const path = this.download_all_folder_path;
      const meta_filenames = this.download_all_meta_filenames;
      if (!path || meta_filenames.length === 0) return;
      this.is_downloading_sources = true;
      try {
        await this.$api.downloadSources({ path, meta_filenames });
      } catch (err) {
        this.$alertify?.error(this.$t("failed_to_download"));
      } finally {
        this.is_downloading_sources = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._filesList {
  position: relative;
  z-index: 0;
  text-align: center;
}

._listOfFiles {
  padding: 0;
  margin: 0;

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);
}

._reorderedFile {
  z-index: 10001;
  padding: 0;
  min-height: 2em;
  background: white;
  border: 1px solid var(--c-gris);

  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  word-break: break-word;
  align-items: center;

  // padding: 0 calc(var(--spacing) / 2);
  padding: 0;
  // gap: calc(var(--spacing) / 2);
  border-radius: 5px;

  justify-content: space-between;

  &:hover,
  &:focus-visible {
    // background: var(--c-gris);
  }

  ._link {
    flex: 1 1 auto;
    overflow: hidden;

    font-variant: none;
    font-weight: 400;
    letter-spacing: 0;
    font-size: var(--sl-font-size-small);
    text-decoration: none;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: calc(var(--spacing) / 1);

    > * {
      flex: 0 0 auto;
    }

    ._link--previewBtn {
      padding: 0;
      background: transparent;
    }

    ._preview {
      flex: 0 0 auto;
      font-size: 100%;

      width: 60px;
      height: 60px;
      overflow: hidden;
      border-radius: 4px;
      // border: calc(var(--spacing) / 2) solid transparent;
      // margin: 0;
      // padding: calc(var(--spacing) / 2);

      background: var(--c-gris_clair);

      &:hover,
      &:focus-visible {
        background: white;
      }

      &._preview--none {
        display: flex;
        justify-content: center;
        align-items: center;

        font-size: 150%;
      }

      ::v-deep ._mediaContent--image {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        max-width: none;
      }
    }

    ._link--filename {
      // text-overflow: ellipsis;
      // white-space: nowrap;
      // overflow: hidden;
      flex: 1 1 0;
      text-align: left;

      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;

      white-space: break-spaces;
    }
    ._link--filesize {
      flex: 0 0 50px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
    }
  }
}
._addBtnSection {
  padding-top: calc(var(--spacing) / 4);
  // text-align: left;
}

._removeItem,
._download {
  margin: calc(var(--spacing) / 4);

  &:last-child {
    margin-right: calc(var(--spacing) / 1);
  }
}

._dragHandle {
  cursor: grab;
}

._spinner {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
