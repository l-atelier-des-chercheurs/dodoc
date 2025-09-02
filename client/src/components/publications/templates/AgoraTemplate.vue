<template>
  <div class="_montageModules">
    <div class="u-spacingBottom">
      <ToggleField
        :label="$t('autoscroll')"
        :field_name="'autoscroll'"
        :content="publication.autoscroll === true"
        :path="publication.$path"
        :can_edit="can_edit"
      />
    </div>

    <div class="_titleBar">
      <TitleField
        :field_name="'presentation'"
        :label="$t('presentation')"
        :content="publication.presentation"
        :path="publication.$path"
        :required="true"
        :can_edit="can_edit"
        :instructions="'ne sera pas affiché sur la page publique'"
      />
    </div>

    <transition-group
      tag="div"
      class="_listOfModules"
      name="StoryModules"
      appear
      :duration="700"
    >
      <template v-for="(_module, index) in section_modules_list">
        <div class="_spacer" :key="'mc_' + index">
          <ModuleCreator
            :publication_path="publication.$path"
            :types_available="['import']"
            @addModules="
              ({ meta_filenames }) => insertModules({ meta_filenames, index })
            "
          />
        </div>
        <AgoraModule
          :key="_module.$path"
          :index="index + 1"
          :agoramodule="_module"
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
          @remove="removeModule(_module.$path)"
        />
      </template>
    </transition-group>
    <div class="_lastModule">
      <ModuleCreator
        :publication_path="publication.$path"
        :start_collapsed="false"
        :types_available="['import']"
        @addModules="addModules"
      />
    </div>
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import AgoraModule from "@/components/publications/agora/AgoraModule.vue";

export default {
  props: {
    publication: Object,
    can_edit: Boolean,
  },
  components: {
    ModuleCreator,
    AgoraModule,
  },
  data() {
    return {};
  },
  i18n: {
    fr: {
      autoscroll: "Défilement automatique",
    },
    en: {
      autoscroll: "Scroll automatically",
    },
  },
  async created() {
    if (!this.sections || this.sections.length === 0) {
      await this.createSection2({
        publication: this.publication,
        additional_meta: {
          section_title: "agora",
        },
      });
    }
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    sections() {
      return this.getSectionsWithProps({
        publication: this.publication,
        group: "sections_list",
      });
    },
    first_section() {
      return this.sections.at(0);
    },
    section_modules_list() {
      return this.getModulesForSection({
        publication: this.publication,
        section: this.first_section,
      }).map(({ _module }) => _module);
    },
  },
  methods: {
    async addModules({ meta_filenames }) {
      await this.insertModuleMetaFilenamesToList2({
        publication: this.publication,
        section: this.first_section,
        meta_filenames,
      });
    },
    async insertModules({ meta_filenames, index }) {
      await this.insertModuleMetaFilenamesToList2({
        publication: this.publication,
        section: this.first_section,
        index,
        meta_filenames,
      });
    },
    async moveModuleTo({ path, new_position }) {
      await this.moveModuleTo2({
        publication: this.publication,
        section: this.first_section,
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
        section: this.first_section,
        source_meta_filename,
        copy_meta_filename,
      });
    },
    async removeModule(path) {
      await this.removeModule2({
        publication: this.publication,
        section: this.first_section,
        path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._montageModules {
  padding: calc(var(--spacing) * 1);
  max-width: 680px;
  margin: 0 auto;
  width: 100%;

  ::v-deep {
    ._moduleCreator {
      justify-content: center;
    }
  }
}

._listOfModules {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
}

._lastModule {
  padding: calc(var(--spacing) * 1);
}

._spacer {
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing) * 1);

  transition: all 0.2s linear;

  ::v-deep {
    ._moduleCreator {
      // position: absolute;
      // background: white;
      padding: calc(var(--spacing) / 4);
      z-index: 1;
      border-radius: 0;

      &.is--collapsed {
        padding: 0;
      }
    }
  }
}

._equationIcon {
  font-size: 2em;
  line-height: 1;
  margin: calc(var(--spacing) * 2);
  color: white;
}

._bottomRow {
  margin-top: calc(var(--spacing) * 2);
  text-align: center;
}

._preview {
}
</style>
