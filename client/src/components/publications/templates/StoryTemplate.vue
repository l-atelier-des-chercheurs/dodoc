<template>
  <div class="_storyTemplate">
    <div class="_mediasList">
      <transition-group tag="div" name="StoryModules" appear :duration="700">
        <div
          v-for="(meta_filename, index) in modules_list"
          :key="meta_filename"
        >
          <PublicationModule
            class="_mediaPublication"
            :publimodule="findFileFromMetaFilename(meta_filename)"
            :position="
              index === 0
                ? 'first'
                : index === modules_list.length - 1
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

    <ModuleCreator
      v-if="$api.is_logged_in"
      :publication_path="publication.$path"
      @appendModuleMetaFilenameToList="appendModuleMetaFilenameToList"
    />
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import PublicationModule from "@/components/publications/modules/PublicationModule.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    ModuleCreator,
    PublicationModule,
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
    modules_list() {
      if (
        this.publication.modules_list &&
        Array.isArray(this.publication.modules_list)
      ) {
        const modules_list = this.publication.modules_list.reduce(
          (acc, meta_filename) => {
            const _module = this.findFileFromMetaFilename(meta_filename);
            if (_module) {
              acc.push(meta_filename);
            }
            return acc;
          },
          []
        );
        return modules_list;
      }
      return [];
    },
  },
  methods: {
    async appendModuleMetaFilenameToList({ meta_filename }) {
      this.fetch_status = "pending";
      this.fetch_error = null;
      try {
        const modules_list = this.modules_list.slice();
        modules_list.push(meta_filename);

        this.response = await this.$api.updateMeta({
          path: this.publication.$path,
          new_meta: {
            modules_list,
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
      let modules_list = this.modules_list.slice();
      const target_meta_index = modules_list.findIndex(
        (m) => m === meta_filename
      );
      if (target_meta_index + dir < 0) return false;
      else if (target_meta_index + dir > modules_list.length - 1) return false;

      modules_list.move(target_meta_index, target_meta_index + dir);
      this.response = await this.updatePubliMeta({ modules_list });
    },
    async removePublicationMedia(meta_filename) {
      let modules_list = this.modules_list.slice();
      modules_list = modules_list.filter((_mf) => _mf !== meta_filename);
      this.response = await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta: {
          modules_list,
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
