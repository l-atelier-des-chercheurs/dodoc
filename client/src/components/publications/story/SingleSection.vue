<template>
  <div class="_singleSection">
    <div class="_storyContainer">
      <div class="_storyContent" v-if="section" :style="story_styles">
        <div
          class="_topbar"
          v-if="
            can_edit || section.section_title || section.section_description
          "
        >
          <SectionTitle class="_text" :section="section" :can_edit="can_edit" />
          <div class="_buttons" v-if="can_edit">
            <RemoveMenu :remove_text="$t('remove')" @remove="removeSection" />
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
          <template v-for="(_module, index) in section_modules_list">
            <div class="_spacer" :key="'mc_' + index">
              <!-- v-if="can_edit || index > 0" -->
              <ModuleCreator
                v-if="can_edit"
                :publication_path="publication.$path"
                :types_available="['text', 'medias', 'files', 'link']"
                @addModules="
                  ({ meta_filenames }) =>
                    insertModules({ meta_filenames, index })
                "
              />
            </div>

            <PublicationModule
              class="_mediaPublication"
              :key="_module.$path"
              :publimodule="_module"
              :module_position="
                section_modules_list.length === 1
                  ? 'alone'
                  : index === 0
                  ? 'first'
                  : index === section_modules_list.length - 1
                  ? 'last'
                  : 'inbetween'
              "
              :can_edit="can_edit"
              @moveUp="
                moveModuleTo({ path: _module.$path, new_position: index - 1 })
              "
              @moveDown="
                moveModuleTo({ path: _module.$path, new_position: index + 1 })
              "
              @duplicate="
                duplicatePublicationMedia({
                  source_module_path: _module.$path,
                  copy_meta_filename: $event,
                })
              "
              @remove="removeModule(_module.$path)"
            />
          </template>
        </transition-group>
        <ModuleCreator
          v-if="can_edit"
          class="_lastModule"
          :start_collapsed="false"
          :publication_path="publication.$path"
          :types_available="['text', 'medias', 'files', 'link']"
          @addModules="addModules"
        />
      </div>
    </div>
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
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    section_modules_list() {
      return this.getModulesForSection({
        publication: this.publication,
        section: this.section,
      }).map(({ _module }) => _module);
    },
    story_styles() {
      const width = (this.publication.story_width || 900) + "px";
      if (this.publication.story_is_not_responsive === true)
        return { width, maxWidth: "none" };
      else return { maxWidth: width };
    },
  },
  methods: {
    async addModules({ meta_filenames }) {
      await this.insertModuleMetaFilenamesToList2({
        publication: this.publication,
        section: this.section,
        meta_filenames,
      });

      const meta_filename = meta_filenames.at(-1);
      this.toggleNewModuleEdit({ meta_filename });
    },
    async insertModules({ meta_filenames, index }) {
      await this.insertModuleMetaFilenamesToList2({
        publication: this.publication,
        section: this.section,
        index,
        meta_filenames,
      });
      const meta_filename = meta_filenames.at(-1);
      this.toggleNewModuleEdit({ meta_filename });
    },
    toggleNewModuleEdit({ meta_filename }) {
      setTimeout(() => {
        this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
      }, 50);
    },
    async moveModuleTo({ path, new_position }) {
      await this.moveModuleTo2({
        publication: this.publication,
        section: this.section,
        meta_filename: this.getFilename(path),
        new_position,
      });
    },
    async duplicatePublicationMedia({
      source_module_path,
      copy_meta_filename,
    }) {
      const source_meta_filename = this.getFilename(source_module_path);
      await this.duplicatePublicationMedia2({
        publication: this.publication,
        section: this.section,
        source_meta_filename,
        copy_meta_filename,
      });
    },

    async removeSection() {
      await this.removeSection2({
        publication: this.publication,
        group: "sections_list",
        path: this.section.$path,
      });
      this.$emit("close");
    },
    async removeModule(path) {
      // todo deleteitem already called
      await this.removeModule2({
        publication: this.publication,
        section: this.section,
        path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._singleSection {
  position: relative;
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  align-items: center;
  margin: 0 auto calc(var(--spacing) * 4);
}

._storyContainer {
  width: 100%;
  // overflow: auto;
}
._storyContent {
  width: 100%;
  background: white;
  max-width: 800px;
  padding: 0;
  margin: 0 auto;
  padding-bottom: calc(var(--spacing) * 2);
  // border-radius: 15px;
  // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

  transition: width 0.25s cubic-bezier(0.19, 1, 0.22, 1);
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
    ._mediaContent--image,
    .plyr {
      border-radius: 3px;
    }
  }
}
._spacer {
  min-height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 calc(var(--spacing) * 2);

  ::v-deep {
    ._moduleCreator {
      padding: calc(var(--spacing) / 1);
      &.is--collapsed {
        padding: 0;
      }
    }
  }
}

._topbar {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: space-between;

  margin: 0 calc(var(--spacing) * 2) 0;
  padding: calc(var(--spacing) * 1.5) 0;
  border-bottom: 2px solid var(--c-gris);

  > * {
    &._text {
      flex: 1 1 56ch;
    }
    &._buttons {
      flex: 1 1 auto;
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-end;
      gap: calc(var(--spacing) * 1);
    }
  }
}

._lastModule {
  margin-top: calc(var(--spacing) * 2);
}
</style>
