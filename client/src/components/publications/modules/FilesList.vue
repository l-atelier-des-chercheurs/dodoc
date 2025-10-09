<template>
  <div class="_filesList">
    <DLabel :str="mode === 'source' ? $t('source_files') : undefined" />
    <SlickList
      :key="/* slicklist stays active otherwise */ slicklist_key"
      class="_listOfFiles"
      axis="y"
      :value="medias_with_linked"
      @input="$emit('reorderMedias', $event)"
      :useDragHandle="true"
    >
      <SlickItem
        v-for="({ _linked_media }, index) in medias_with_linked"
        :key="_linked_media.$path"
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
          v-if="_linked_media && _linked_media.$path"
          class="_link"
          :file="_linked_media"
        >
          <button
            type="button"
            class="_link--previewBtn"
            v-if="
              ['image', 'video', 'audio', 'pdf', 'stl', 'url'].includes(
                _linked_media.$type
              )
            "
            @click.prevent="show_media_preview_for = _linked_media"
          >
            <MediaContent
              class="_preview"
              :context="'preview'"
              :file="_linked_media"
              :resolution="220"
            />
          </button>
          <div class="_preview _preview--none" v-else>
            <b-icon icon="file-earmark-arrow-down" />
          </div>

          <BaseModal2
            v-if="show_media_preview_for === _linked_media"
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
            v-text="_linked_media.$media_filename"
          />
          <template v-if="_linked_media.$infos.size && mode === 'source'">
            <!-- |&nbsp; -->
            <span
              class="u-instructions _link--filesize"
              v-text="formatBytes(_linked_media.$infos.size)"
            />
          </template>

          <b-icon
            v-if="mode === 'source'"
            class="_download"
            icon="file-earmark-arrow-down-fill"
          />
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

    <div v-if="edit_mode" class="_addBtnSection">
      <button
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
  directives: { handle: HandleDirective },
  data() {
    return {
      show_media_picker: false,
      show_media_preview_for: null,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    slicklist_key() {
      let key = this.edit_mode + "_";
      this.medias_with_linked.forEach((media) => {
        key += media._linked_media.$path + "_";
      });
      return key;
    },
  },
  methods: {},
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
    background: var(--c-gris);
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
}

._dragHandle {
  cursor: grab;
}
</style>
