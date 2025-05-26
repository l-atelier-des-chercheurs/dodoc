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
          key="mosaic"
          :medias_with_linked="medias_with_linked"
          :publimodule="publimodule"
          :context="context"
          :page_template="page_template"
          :show_fs_button="show_fs_button"
          :number_of_max_medias="number_of_max_medias"
          :publication_path="publication_path"
          :edit_mode="edit_mode"
          :can_edit="can_edit"
          @pickMedias="pickMedias"
          @removeMediaAtIndex="removeMediaAtIndex"
          @updateMediaOpt="updateMediaOpt"
        />
        <FilesList
          v-else-if="publimodule.module_type === 'files'"
          key="filelist"
          :mode="'source'"
          :medias_with_linked="medias_with_linked"
          :publication_path="publication_path"
          :edit_mode="edit_mode"
          :can_edit="can_edit"
          @pickMedias="pickMedias"
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
          :publi_width="publimodule.size"
          :edit_mode="edit_mode"
          :can_edit="can_edit"
          @pickMedias="pickMedias"
          @reorderMedias="reorderMedias"
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
    edit_mode: Boolean,
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
      return this.publimodule.source_medias.reduce((acc, source_media) => {
        const _linked_media = this.getSourceMedia({
          source_media,
          folder_path: this.publication_path,
        });
        if (_linked_media) {
          const obj = Object.assign({}, source_media, { _linked_media });
          acc.push(obj);
        }
        return acc;
      }, []);
    },
  },
  methods: {
    async pickMedias(medias) {
      let source_medias = this.publimodule.source_medias.slice() || [];
      for (const media of medias) {
        const import_mode = this.$root.publication_include_mode;
        const new_entry = await this.prepareMediaForPublication({
          path_to_source_media_meta: media.$path,
          publication_path: this.publication_path,
          import_mode,
        });
        source_medias.push(new_entry);
      }
      this.$emit("updateMeta", { source_medias });
    },
    async removeMediaAtIndex({ index, remove_source = true }) {
      const source_medias = this.publimodule.source_medias.slice();
      const source_media = source_medias[index];

      source_medias.splice(index, 1);
      if (source_medias.length === 0)
        this.$emit("remove", { with_content: false });
      else this.$emit("updateMeta", { source_medias });

      if (
        Object.prototype.hasOwnProperty.call(source_media, "meta_filename") &&
        remove_source === true
      ) {
        const media = this.getSourceMedia({
          source_media: { meta_filename: source_media.meta_filename },
          folder_path: this.publication_path,
        });
        await this.$api.deleteItem({
          path: media.$path,
        });
      }
    },
    reorderMedias(new_order) {
      const source_medias = new_order.map((m) => {
        delete m._linked_media;
        return m;
      });
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
</style>
