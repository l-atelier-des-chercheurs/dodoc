<template>
  <div class="_montageModules">
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
            :publication_path="make.$path"
            :types_available="['capture', 'import']"
            :pick_from_types="['image', 'video']"
            :available_modes="['photo', 'video']"
            :context="'montage'"
            @addModules="
              ({ meta_filenames }) => insertModules({ meta_filenames, index })
            "
          />
        </div>
        <div :key="_module.$path">
          <MontageModule
            :index="index + 1"
            :makemodule="_module"
            :module_position="
              section_modules_list.length === 1
                ? 'alone'
                : index === 0
                ? 'first'
                : index === section_modules_list.length - 1
                ? 'last'
                : 'inbetween'
            "
            :default_image_duration="default_image_duration"
            @moveUp="
              moveModuleTo({ path: _module.$path, new_position: index - 1 })
            "
            @moveDown="
              moveModuleTo({ path: _module.$path, new_position: index + 1 })
            "
            @remove="removeModule(_module.$path)"
          />
        </div>
      </template>
    </transition-group>
    <div class="_lastModule">
      <ModuleCreator
        :publication_path="make.$path"
        :start_collapsed="false"
        :types_available="['capture', 'import']"
        :pick_from_types="['image', 'video']"
        :available_modes="['photo', 'video']"
        :context="'montage'"
        @addModules="addModules"
      />
    </div>

    <transition name="pagechange" mode="out-in">
      <div class="_bottomRow" v-if="export_is_available">
        <div class="_equationIcon">
          <b-icon icon="chevron-double-down" />
        </div>
        <div class="">
          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="show_render_modal = true"
          >
            <b-icon icon="check" />
            {{ $t("create") }}
          </button>
        </div>
      </div>
    </transition>

    <ExportSaveMakeModal2
      v-if="show_render_modal"
      :base_instructions="base_instructions"
      :make_path="make.$path"
      :reference_media="first_media"
      :default_resolution_preset="'high'"
      @close="show_render_modal = false"
    />
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import MontageModule from "@/components/makes/MontageModule.vue";
import ExportSaveMakeModal2 from "@/components/makes/ExportSaveMakeModal2.vue";
export default {
  props: {
    make: Object,
  },
  components: {
    ModuleCreator,
    MontageModule,
    ExportSaveMakeModal2,
  },
  data() {
    return {
      show_render_modal: false,
      default_image_duration: 2,
    };
  },
  async created() {
    if (!this.sections || this.sections.length === 0) {
      await this.createSection2({
        publication: this.make,
        additional_meta: {
          section_title: "montage",
        },
      });
    }
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    export_name() {
      return "video_montage.mp4";
    },
    export_is_available() {
      return this.section_modules_list.length > 0;
    },
    montage() {
      return this.section_modules_list.reduce((acc, _module) => {
        const media = this.firstMedia(_module);
        if (media) {
          let instr = {
            path: this.makeMediaFilePath({
              $path: media.$path,
              $media_filename: media.$media_filename,
            }),
            type: media.$type,
            transition_in: _module.transition_in,
            transition_out: _module.transition_out,
          };

          if (media.$type === "image")
            instr.image_duration =
              _module.image_duration || this.default_image_duration;

          acc.push(instr);
        }
        return acc;
      }, []);
    },
    sections() {
      return this.getSectionsWithProps({
        publication: this.make,
        group: "sections_list",
      });
    },
    first_section() {
      return this.sections.at(0);
    },
    first_media() {
      if (this.section_modules_list.length > 0) {
        const first_module = this.section_modules_list.at(0);
        return this.firstMedia(first_module);
      }
      return undefined;
    },
    first_media_ratio() {
      return this.first_media?.$infos?.ratio || undefined;
    },
    section_modules_list() {
      return this.getModulesForSection({
        publication: this.make,
        section: this.first_section,
      }).map(({ _module }) => _module);
    },
    base_instructions() {
      return {
        recipe: this.make.type,
        suggested_file_name: this.make.type,
        montage: this.montage,
      };
    },
  },
  methods: {
    async addModules({ meta_filenames }) {
      await this.insertModuleMetaFilenamesToList2({
        publication: this.make,
        section: this.first_section,
        meta_filenames,
      });
    },
    async insertModules({ meta_filenames, index }) {
      await this.insertModuleMetaFilenamesToList2({
        publication: this.make,
        section: this.first_section,
        index,
        meta_filenames,
      });
    },
    async moveModuleTo({ path, new_position }) {
      await this.moveModuleTo2({
        publication: this.make,
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
        publication: this.make,
        section: this.first_section,
        source_meta_filename,
        copy_meta_filename,
      });
    },
    async removeModule(path) {
      await this.removeModule2({
        publication: this.make,
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
