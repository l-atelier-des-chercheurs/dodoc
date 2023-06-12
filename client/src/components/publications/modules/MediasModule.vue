<template>
  <transition name="fade_fast" mode="out-in">
    <div
      class="_mediasModule"
      :style="`--number_of_medias: ${medias_with_linked.length}`"
      :key="medias_with_linked.length > 1 ? 'multiple' : 'single'"
    >
      <transition name="pagechange" mode="out-in">
        <MosaicMediaGrid
          v-if="publimodule.module_type === 'mosaic'"
          :medias_with_linked="medias_with_linked"
          :context="context"
          :page_template="page_template"
          :show_fs_button="show_fs_button"
          :number_of_max_medias="number_of_max_medias"
          :publication_path="publication_path"
          :can_edit="can_edit"
          @addMedias="addMedias"
          @removeMediaAtIndex="removeMediaAtIndex"
          @updateMediaOpt="updateMediaOpt"
        />
        <FilesList
          v-else-if="publimodule.module_type === 'files'"
          :medias_with_linked="medias_with_linked"
          :publication_path="publication_path"
          :can_edit="can_edit"
          @addMedias="addMedias"
          @reorderMedias="reorderMedias"
          @removeMediaAtIndex="removeMediaAtIndex"
        />
        <MediaCarousel
          v-else-if="publimodule.module_type === 'carousel'"
          :medias_with_linked="medias_with_linked"
          :context="context"
          :page_template="page_template"
          :show_fs_button="show_fs_button"
          :publication_path="publication_path"
          :can_edit="can_edit"
          @addMedias="addMedias"
          @removeMediaAtIndex="removeMediaAtIndex"
          @updateMediaOpt="updateMediaOpt"
        />
      </transition>
    </div>
  </transition>
</template>
<script>
import MosaicMediaGrid from "@/components/publications/modules/MosaicMediaGrid.vue";
import FilesList from "@/components/publications/modules/FilesList.vue";
import MediaCarousel from "@/components/publications/modules/MediaCarousel.vue";

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
    MosaicMediaGrid,
    FilesList,
    MediaCarousel,
  },
  data() {
    return {};
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
    },
    removeMediaAtIndex(index) {
      const source_medias = this.publimodule.source_medias.slice();
      source_medias.splice(index, 1);
      if (source_medias.length === 0) this.$emit("remove");
      else this.$emit("updateMeta", { source_medias });
    },
    reorderMedias(new_order) {
      const previous_source_medias = this.publimodule.source_medias.slice();
      const source_medias = new_order.reduce((acc, m) => {
        const item = previous_source_medias.find(
          (sm) => sm.meta_filename_in_project === m
        );
        if (item) acc.push(item);
        return acc;
      }, []);
      this.$emit("updateMeta", { source_medias });
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
