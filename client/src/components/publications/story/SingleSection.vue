<template>
  <div class="_singleSection">
    <div class="_storyContainer">
      <div class="_storyContent" :style="story_styles">
        <div class="_topbar">
          <SectionTitle :section="section" :can_edit="can_edit" />
          <div class="u-sameRow">
            <RemoveMenu :remove_text="$t('remove')" @remove="$emit('remove')" />
            <div>
              <button
                type="button"
                class="u-buttonLink"
                @click="$emit('close')"
              >
                <sl-icon name="x" />
                {{ $t("close") }}
              </button>
            </div>
          </div>
        </div>

        <transition-group tag="div" name="StoryModules" appear :duration="700">
          <template v-for="(meta_filename, index) in modules_list">
            <PublicationModule
              class="_mediaPublication"
              :key="meta_filename"
              :publimodule="findModuleFromMetaFilename(meta_filename)"
              :module_position="
                modules_list.length === 1
                  ? 'alone'
                  : index === 0
                  ? 'first'
                  : index === modules_list.length - 1
                  ? 'last'
                  : 'inbetween'
              "
              :can_edit="can_edit"
              @resize="resize({ meta_filename, new_size: $event })"
              @moveUp="moveTo({ meta_filename, dir: -1 })"
              @moveDown="moveTo({ meta_filename, dir: +1 })"
              @duplicate="
                duplicatePublicationMedia({
                  source_meta_filename: meta_filename,
                  copy_meta_filename: $event,
                })
              "
              @remove="removeModuleFromList(meta_filename)"
            />
            <div class="_spacer" :key="'mc_' + index">
              <ModuleCreator
                v-if="can_edit"
                :publication_path="publication.$path"
                :meta_filenames_already_present="meta_filenames_already_present"
                @addModule="
                  ({ meta_filename }) =>
                    insertModuleMetaFilenameToList({
                      meta_filename,
                      index: index + 1,
                    })
                "
              />
            </div>
          </template>
        </transition-group>
      </div>
    </div>

    <ModuleCreator
      v-if="can_edit && (!modules_list || modules_list.length === 0)"
      :publication_path="publication.$path"
      @addModule="appendModuleMetaFilenameToList"
    />
  </div>
</template>
<script>
import SectionTitle from "@/components/publications/story/SectionTitle.vue";
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import PublicationModule from "@/components/publications/modules/PublicationModule.vue";

export default {
  props: {
    publication: Object,
    section: Object,
    can_edit: Boolean,
  },
  components: {
    SectionTitle,
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
    story_styles() {
      // const width = (this.publication.story_width || 800) + "px";
      // if (this.publication.story_is_not_responsive === true)
      //   return { width, maxWidth: "none" };
      // else return { maxWidth: width };
      return "";
    },
    modules_list() {
      if (
        this.section.modules_list &&
        Array.isArray(this.section.modules_list)
      ) {
        const modules_list = this.section.modules_list.reduce(
          (acc, meta_filename) => {
            const _module = this.findModuleFromMetaFilename(meta_filename);
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
    meta_filenames_already_present() {
      return this.modules_list.reduce((acc, meta_filename) => {
        const module = this.findModuleFromMetaFilename(meta_filename);
        if (module.source_medias) {
          module.source_medias.map((sm) => {
            if (sm.meta_filename_in_project)
              acc.push(sm.meta_filename_in_project);
          });
        }
        return acc;
      }, []);
    },
  },
  methods: {
    async appendModuleMetaFilenameToList({ meta_filename }) {
      const modules_list = this.modules_list.slice();
      modules_list.push(meta_filename);

      await this.updateMeta({ modules_list });

      this.toggleNewModuleEdit({ meta_filename });
    },
    async insertModuleMetaFilenameToList({ meta_filename, index }) {
      const modules_list = this.modules_list.slice();
      modules_list.splice(index, 0, meta_filename);

      await this.updateMeta({ modules_list });
      this.toggleNewModuleEdit({ meta_filename });
    },
    async updateMeta(new_meta) {
      this.fetch_status = "pending";
      this.fetch_error = null;
      try {
        this.response = await this.$api.updateMeta({
          path: this.section.$path,
          new_meta,
        });
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
    findModuleFromMetaFilename(meta_filename) {
      if (!this.publication.$files) return [];
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
      this.response = await this.updateMeta({ modules_list });
    },
    async duplicatePublicationMedia({
      source_meta_filename,
      copy_meta_filename,
    }) {
      source_meta_filename;
      copy_meta_filename;

      let modules_list = this.modules_list.slice();
      const position_of_original_media = modules_list.findIndex(
        (_mf) => _mf === source_meta_filename
      );

      modules_list.splice(
        position_of_original_media + 1,
        0,
        copy_meta_filename
      );

      this.response = await this.updateMeta({ modules_list });
    },
    async removeModuleFromList(meta_filename) {
      let modules_list = this.modules_list.slice();
      modules_list = modules_list.filter((_mf) => _mf !== meta_filename);

      this.response = await this.updateMeta({ modules_list });
    },
    toggleNewModuleEdit({ meta_filename }) {
      setTimeout(() => {
        console.log(`emit module.enable_edit.${meta_filename}`);
        this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
      }, 50);
    },
  },
};
</script>
<style lang="scss" scoped>
._singleSectionx {
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  align-items: center;
  margin: 0 auto calc(var(--spacing) * 4);
}

._settings {
  position: relative;
  top: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  // width: 100%;
  background: white;
  padding: calc(var(--spacing) / 8) calc(var(--spacing) / 4);
  margin: calc(var(--spacing) / 2) auto 0;
  max-width: 240px;
}

._storyContainer {
  width: 100%;
  overflow: auto;
}
._storyContent {
  width: 100%;
  background: white;
  max-width: 800px;
  padding: calc(var(--spacing) * 1) 0;
  margin: calc(var(--spacing) / 2) auto;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

._mediaPublication {
  position: relative;
  // margin-bottom: calc(var(--spacing) * 2);
  margin-bottom: 0;

  ::v-deep {
    ._content {
      min-height: calc(24px * 3);
    }
    ._floatingEditBtn[data-action="disable"] {
      display: none;
    }
  }
}
._spacer {
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing) / 4) 0;
}

._topbar {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;

  margin: 0 calc(var(--spacing) / 1) calc(var(--spacing) * 1.5);
  padding-bottom: calc(var(--spacing) / 1);
  border-bottom: 2px solid var(--c-gris);
}
</style>