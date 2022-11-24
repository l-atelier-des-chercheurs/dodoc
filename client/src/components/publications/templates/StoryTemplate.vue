<template>
  <div class="_storyTemplate">
    <div class="_mediasList">
      <transition-group tag="div" name="StoryModules" appear :duration="700">
        <div
          v-for="(meta_filename, index) in list_of_metas"
          :key="meta_filename"
        >
          <MediaPublication
            class="_mediaPublication"
            :publication_file="findFileFromMetaFilename(meta_filename)"
            :position="
              index === 0
                ? 'first'
                : index === list_of_metas.length - 1
                ? 'last'
                : 'inbetween'
            "
            @resize="resize({ meta_filename, new_size: $event })"
            @moveUp="moveTo({ meta_filename, dir: -1 })"
            @moveDown="moveTo({ meta_filename, dir: +1 })"
            @remove="removePublicationMedia(meta_filename)"
          />
        </div>
      </transition-group>
    </div>

    <!-- {{ publication.$files.map((f) => f.$path) }} -->
    <MediaPicker
      v-if="$api.is_logged_in"
      :publication_path="publication.$path"
      @appendMetaFilenameToList="appendMetaFilenameToList"
    />
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";
import MediaPublication from "@/components/publications/MediaPublication.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    MediaPicker,
    MediaPublication,
  },
  data() {
    return {
      medias: [],
      fetch_publication_error: null,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    list_of_metas() {
      if (
        this.publication.list_of_metas &&
        Array.isArray(this.publication.list_of_metas)
      )
        return this.publication.list_of_metas;
      else return [];
    },
  },
  methods: {
    async appendMetaFilenameToList({ meta_filename }) {
      this.fetch_status = "pending";
      this.fetch_error = null;
      try {
        const list_of_metas = this.list_of_metas.slice();
        list_of_metas.push(meta_filename);

        this.response = await this.$api.updateMeta({
          path: this.publication.$path,
          new_meta: {
            list_of_metas,
          },
        });
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
    findFileFromMetaFilename(meta_filename) {
      return this.publication.$files.find((f) => {
        const _meta_name = f.$path.substring(f.$path.lastIndexOf("/") + 1);
        return _meta_name === meta_filename;
      });
    },
    async moveTo({ meta_filename, dir }) {
      let list_of_metas = this.list_of_metas.slice();
      const target_meta_index = list_of_metas.findIndex(
        (m) => m === meta_filename
      );
      if (target_meta_index + dir < 0) return false;
      else if (target_meta_index + dir > list_of_metas.length - 1) return false;

      list_of_metas.move(target_meta_index, target_meta_index + dir);
      this.response = await this.updatePubliMeta({ list_of_metas });
    },
    async removePublicationMedia(meta_filename) {
      let list_of_metas = this.list_of_metas.slice();
      list_of_metas = list_of_metas.filter((_mf) => _mf !== meta_filename);
      this.response = await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta: {
          list_of_metas,
        },
      });

      const file = this.findFileFromMetaFilename(meta_filename);
      await this.$api
        .deleteItem({
          path: file.$path,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
    },
    async updatePubliMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta,
      });
    },
    async updateMediaMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._storyTemplate {
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  align-items: center;
  // text-align: center;
  background: white;
  gap: calc(var(--spacing) / 1);
  // padding: calc(var(--spacing) / 1);
  margin: calc(var(--spacing) / 1) auto;

  max-width: 800px;
}

._mediasList {
  width: 100%;
}

._mediaPublication {
  position: relative;
  margin-bottom: calc(var(--spacing) * 2);

  ::v-deep > * {
    // height: 100%;
  }
}
</style>
