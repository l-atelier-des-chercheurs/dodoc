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
          <div class="_text">
            <div class="_sectionTitle">
              <TitleField
                :field_name="'section_title'"
                :content="section.section_title || $t('untitled')"
                :path="section.$path"
                :required="true"
                :maxlength="60"
                :tag="'h1'"
                :can_edit="can_edit"
              />
              <RemoveMenu
                v-if="can_edit"
                :remove_text="$t('remove_section')"
                :show_button_text="false"
                @remove="removeSection"
              />
            </div>

            <!-- legacy field – only existing description can be edited -->
            <TitleField
              v-if="section.section_description"
              :field_name="'section_description'"
              :label="can_edit ? $t('description') : ''"
              :content="section.section_description"
              :path="section.$path"
              :maxlength="1280"
              :input_type="'markdown'"
              :can_edit="can_edit"
            />
          </div>
          <div class="_buttons" v-if="can_edit">
            <!-- <div>
              <button
                type="button"
                class="u-buttonLink"
                @click="$emit('close')"
              >
                <sl-icon name="x" />
                {{ $t("close") }}
              </button>
            </div> -->
          </div>
        </div>
        <transition-group
          tag="div"
          class="_storyModules"
          name="StoryModules"
          appear
          :duration="700"
        >
          <template v-for="(_module, index) in section_modules_list">
            <div class="_spacer" :key="'mc_' + index">
              <ModuleCreator
                v-if="can_edit"
                :publication_path="publication.$path"
                :types_available="['text', 'link']"
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
              :module_being_edited.sync="module_being_edited"
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
          :types_available="['text', 'link']"
          @addModules="addModules"
        />
      </div>
    </div>
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import PublicationModule from "@/components/publications/modules/PublicationModule.vue";

export default {
  props: {
    publication: Object,
    section: Object,
    can_edit: Boolean,
  },
  components: {
    ModuleCreator,
    PublicationModule,
  },
  data() {
    return {
      medias: [],
      module_being_edited: undefined,
    };
  },
  i18n: {
    messages: {
      fr: {
        remove_section: "Supprimer le chapitre",
      },
      en: {
        remove_section: "Remove this chapter",
      },
    },
  },
  created() {
    this.$eventHub.$on("module.none_edited", this.unselectModuleEdited);
  },
  async mounted() {},
  beforeDestroy() {
    this.$eventHub.$off("module.none_edited", this.unselectModuleEdited);
  },
  watch: {},
  computed: {
    section_modules_list() {
      return this.getModulesForSection({
        publication: this.publication,
        section: this.section,
      }).map(({ _module }) => _module);
    },
    story_styles() {
      return this.makeStoryStyles({ publication: this.publication });
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
      const pin_path = this.publication.$path + "/" + meta_filename;
      setTimeout(() => {
        this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
        this.$eventHub.$emit("publication.map.openPin", pin_path);
      }, 150);
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
    unselectModuleEdited() {
      this.module_being_edited = undefined;
    },
    async removeSection() {
      this.$emit("prevSection");
      await this.removeSection2({
        publication: this.publication,
        group: "sections_list",
        path: this.section.$path,
      });
    },

    async removeModule(path) {
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

._storyModules {
  // display: grid;
  // grid-template-columns: repeat(12, 1fr);
  // grid-gap: calc(var(--spacing) / 4);
}

._sectionTitle {
  display: flex;
  align-items: baseline;
}

._mediaPublication {
  position: relative;
  // margin-top: calc(var(--spacing) * 2);
  // margin-bottom: calc(var(--spacing) * 2);
  // grid-column-end: span 12;

  // margin-bottom: 0;

  ::v-deep {
    > ._content {
      min-height: 45px;
    }
    // ._floatingEditBtn[data-action="disable"] {
    //   display: none;
    // }
    ._mediaContent--image,
    .plyr {
      border-radius: 3px;
    }
  }
}
._spacer {
  min-height: 3rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  // padding: 0 calc(var(--spacing) * 2);

  transition: all 0.2s linear;

  ::v-deep {
    ._moduleCreator {
      // position: absolute;
      // background: white;
      // padding: calc(var(--spacing) / 4);
      // z-index: 1;
      // border-radius: 0;

      &.is--collapsed {
        padding: 0;
      }
    }
  }
}

._topbar {
  display: flex;
  flex-flow: row wrap;
  align-items: baseline;
  justify-content: space-between;

  margin: calc(var(--spacing) * 1) 0 0;

  // border-bottom: 2px solid var(--c-gris);
  > * {
    &._text {
      flex: 1 1 56ch;
    }
    &._buttons {
      flex: 1 1 auto;
      display: flex;
      flex-flow: row wrap;
      // justify-content: flex-end;
      gap: calc(var(--spacing) * 1);
    }
  }
}

._lastModule {
  margin-top: calc(var(--spacing) * 2);
}
</style>
