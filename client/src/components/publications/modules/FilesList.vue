<template>
  <div class="_filesList">
    <DLabel :str="$t('source_files')" />
    <SlickList
      :key="/* slicklist stays active otherwise */ can_edit"
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
        <!-- <div class="u-dragHandle" > -->
        <b-icon
          v-if="can_edit"
          v-handle
          icon="grip-vertical"
          :label="$t('move')"
        />
        <!-- </div> -->
        <span v-if="_linked_media && _linked_media.$path" class="_link">
          <MediaContent
            class="_preview"
            :file="_linked_media"
            :resolution="220"
            v-if="
              ['image', 'video', 'audio', 'pdf', 'stl', 'url'].includes(
                _linked_media.$type
              )
            "
          />

          <div class="_preview _preview--none" v-else>
            <sl-icon name="file-earmark-arrow-down" />
          </div>
          <span
            class="_link--filename"
            v-text="_linked_media.$media_filename"
          />
          <template v-if="_linked_media.$infos.size">
            <!-- |&nbsp; -->
            <span
              class="u-instructions _link--filesize"
              v-text="formatBytes(_linked_media.$infos.size)"
            />
          </template>
        </span>

        <DownloadFile
          v-if="_linked_media && _linked_media.$path"
          :file="_linked_media"
        >
          <sl-icon-button name="file-earmark-arrow-down-fill" />
        </DownloadFile>

        <sl-icon-button
          name="x"
          size="small"
          v-if="can_edit"
          @click="$emit('removeMediaAtIndex', index)"
        />
      </SlickItem>
    </SlickList>

    <div v-if="can_edit" class="_addBtnSection">
      <button
        type="button"
        class="u-button u-button_transparent u-addBtn"
        @click="show_media_picker = true"
      >
        <sl-icon name="plus-circle" />
        {{ $t("add_files") }}
      </button>
      <MediaPicker
        v-if="show_media_picker"
        :publication_path="publication_path"
        @addMedias="$emit('addMedias', $event)"
        @close="show_media_picker = false"
      />
      <DropZone @mediaDropped="$emit('addMedias', $event)" />
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
    can_edit: Boolean,
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
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
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
  z-index: 10;
  padding: 0;
  border-radius: 2px;
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
  border-radius: 2px;

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
    font-size: var(--sl-font-size-x-small);
    text-decoration: none;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: calc(var(--spacing) / 1);

    > * {
      flex: 1 1 50px;
    }

    ._preview {
      flex: 0 0 auto;
      font-size: 100%;

      width: 45px;
      height: 45px;
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
  padding: calc(var(--spacing) / 4);
  text-align: left;
}
</style>
