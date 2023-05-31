<template>
  <div class="_filesList">
    <!-- FilesList -->
    <!-- <pre>{{ medias_with_linked }}</pre> -->
    <DLabel :str="$t('source_files')" />
    <div
      class="_file"
      v-for="({ _linked_media }, index) in medias_with_linked"
      :key="_linked_media.$path"
    >
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
        <span class="_link--filename" v-text="_linked_media.$media_filename" />
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
    </div>

    <div v-if="can_edit">
      <button type="button" class="u-addBtn" @click="$emit('showMediaPicker')">
        <sl-icon name="plus-circle" />
      </button>
      <DropZone @mediaDropped="$emit('addMedias', $event)" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    medias_with_linked: Array,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {};
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
  padding: 0;
  margin: 0;

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);

  > ._file {
    // margin: calc(var(--spacing) / 4) 0;
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

    &:hover {
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
}
</style>
