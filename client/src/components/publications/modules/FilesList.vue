<template>
  <div class="_filesList">
    <DLabel :str="$t('source_files')" />
    <SlickList
      class="_listOfFiles"
      axis="y"
      :value="medias_with_linked.map((m, index) => index)"
      @input="updateOrder"
      :useDragHandle="true"
    >
      <SlickItem
        v-for="({ _linked_media }, index) in medias_with_linked"
        :key="_linked_media.$path"
        :index="index"
        class="_reorderedFile"
      >
        <span v-handle class="u-dragHandle" v-if="can_edit">
          <sl-icon name="grip-vertical" label="Déplacer" />
        </span>
        <span v-if="_linked_media && _linked_media.$path" class="_link">
          <MediaContent
            class="_preview"
            :file="_linked_media"
            :resolution="50"
            v-if="
              ['image', 'video', 'audio', 'pdf', 'stl', 'url'].includes(
                _linked_media.$type
              )
            "
          />
          <sl-icon name="file-earmark-arrow-down" class="_preview" v-else />
          <span
            class="_link--filename"
            v-text="_linked_media.$media_filename"
          />
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

    <div v-if="can_edit">
      <button type="button" class="u-addBtn" @click="show_media_picker = true">
        <sl-icon name="plus-circle" />
      </button>
      <MediaPicker
        v-if="show_media_picker"
        :publication_path="publication_path"
        :prevent_duplicates="true"
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
  methods: {
    updateOrder($event) {
      debugger;
      $event;
    },
  },
};
</script>
<style lang="scss">
._listOfFiles {
  padding: 0;
  margin: 0;

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);
}

._reorderedFile {
  z-index: 10000;
  padding: 0;
  border-radius: 2px;
  min-height: 2em;
  background: var(--c-gris);
  // border: 1px solid var(--c-gris_fonce);

  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  word-break: break-word;
  align-items: center;

  gap: calc(var(--spacing) / 4);
  border-radius: 4px;

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
      white-space: break-spaces;
    }
  }
}
</style>
