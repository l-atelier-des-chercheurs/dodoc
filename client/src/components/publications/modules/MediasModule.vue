<template>
  <transition name="fade_fast" mode="out-in">
    <div
      class="_mediasModule"
      :style="`--number_of_medias: ${medias_with_linked.length}`"
      :key="medias_with_linked.length > 1 ? 'multiple' : 'single'"
    >
      <MosaicMediaGrid
        v-if="publimodule.module_type === 'mosaic'"
        :medias_with_linked="medias_with_linked"
        :context="context"
        :page_template="page_template"
        :show_fs_button="show_fs_button"
        :number_of_max_medias="number_of_max_medias"
        :can_edit="can_edit"
        @addMedias="addMedias"
        @removeMediaAtIndex="removeMediaAtIndex"
        @showMediaPicker="show_media_picker = true"
        @updateMediaOpt="updateMediaOpt"
      />
      <FilesList
        v-if="publimodule.module_type === 'files'"
        :medias_with_linked="medias_with_linked"
        :can_edit="can_edit"
        @addMedias="addMedias"
        @removeMediaAtIndex="removeMediaAtIndex"
        @showMediaPicker="show_media_picker = true"
      />
      <MediaPicker
        v-if="show_media_picker"
        :publication_path="publication_path"
        @addMedias="addMedias"
        @close="show_media_picker = false"
      />
    </div>
  </transition>
</template>
<script>
// import { Splitpanes, Pane } from "splitpanes";
import MediaPicker from "@/components/publications/MediaPicker.vue";
import MosaicMediaGrid from "@/components/publications/modules/MosaicMediaGrid.vue";
import FilesList from "@/components/publications/modules/FilesList.vue";

export default {
  props: {
    publimodule: Object,
    context: {
      type: String,
      default: "full",
    },
    page_template: String,
    number_of_max_medias: [Boolean, Number],
    show_fs_button: Boolean,
    can_edit: Boolean,
  },
  components: {
    // Splitpanes,
    // Pane,
    MediaPicker,
    MosaicMediaGrid,
    FilesList,
  },
  data() {
    return {
      show_media_picker: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    publication_path() {
      return this.getParent(this.publimodule.$path);
    },
    medias_with_linked() {
      if (!this.publimodule.source_medias) return [];
      return this.publimodule.source_medias.map((source_media) => {
        const _linked_media = this.getSourceMedia({
          source_media,
          folder_path: this.publication_path,
        });
        return Object.assign({}, source_media, { _linked_media });
      });
    },
  },
  methods: {
    addMedias({ path_to_source_media_metas }) {
      const source_medias_to_append = path_to_source_media_metas.map(
        (path_to_source_media_meta) => {
          return {
            meta_filename_in_project: this.getFilename(
              path_to_source_media_meta
            ),
          };
        }
      );
      const previous_source_medias =
        this.publimodule.source_medias.slice() || [];
      const source_medias = previous_source_medias.concat(
        source_medias_to_append
      );
      this.$emit("updateMeta", { source_medias });
      this.show_media_picker = false;
    },
    removeMediaAtIndex(index) {
      const source_medias = this.publimodule.source_medias.slice();
      source_medias.splice(index, 1);
      if (source_medias.length === 0) this.$emit("remove");
      else this.$emit("updateMeta", { source_medias });
    },
    updateMediaOpt({ index, opt }) {
      const source_medias = this.publimodule.source_medias.slice();
      Object.assign(source_medias[index], opt);
      this.$emit("updateMeta", { source_medias });
    },
  },
};
</script>
<style lang="scss" scoped>
._mediasModule {
  --number_of_medias: 1;
  position: relative;
}

._dropzone {
  position: absolute;
  width: 100%;
  height: 100%;

  ::v-deep ._dropNotice {
    transform: rotate(-90deg);
  }
}

sl-icon-button::part(base) {
  font-size: 1.5em;
  color: var(--c-bleuvert);
}
</style>
