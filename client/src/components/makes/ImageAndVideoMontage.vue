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
            @addModules="
              ({ meta_filenames }) => insertModules({ meta_filenames, index })
            "
          />
        </div>
        <MontageModule
          :key="_module.$path"
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
        <!-- <PublicationModule
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
        /> -->
      </template>
    </transition-group>
    <div class="_lastModule">
      <ModuleCreator
        :publication_path="make.$path"
        :start_collapsed="false"
        :types_available="['capture', 'import']"
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
            @click="show_save_export_modal = true"
          >
            <b-icon icon="check" />
            {{ $t("create") }}
          </button>
        </div>
      </div>
    </transition>

    <ExportSaveMakeModal
      v-if="show_save_export_modal"
      :title="$t('export_montage')"
      :export_name="export_name"
      :export_href="export_href"
      :enable_options="created_video !== false"
      @close="show_save_export_modal = false"
    >
      <div class="_spinner" v-if="is_exporting" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else>
        <div v-if="!created_video">
          <!-- <select v-model="resolution_preset_picked">
            <option
              v-for="res in presets"
              :key="res"
              v-text="res"
              :value="res"
            />
          </select> -->

          <SelectField2
            :value="resolution_preset_picked"
            :options="presets"
            :can_edit="true"
            :hide_validation="true"
            @change="resolution_preset_picked = $event"
          />

          <br />

          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="renderMontage"
          >
            <b-icon icon="check" />
            {{ $t("create") }}
          </button>
        </div>
        <div v-else>
          <button type="button" class="u-buttonLink" @click="cancelExport">
            <b-icon icon="arrow-left-short" />
            {{ $t("back") }}
          </button>
          <br />

          <MediaContent
            class="_preview"
            :file="created_video"
            :resolution="1600"
            :context="'full'"
          />
        </div>
      </div>
    </ExportSaveMakeModal>
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import MontageModule from "@/components/makes/MontageModule.vue";
import ExportSaveMakeModal from "@/components/makes/ExportSaveMakeModal.vue";

export default {
  props: {
    make: Object,
  },
  components: {
    ModuleCreator,
    MontageModule,
    ExportSaveMakeModal,
  },
  data() {
    return {
      show_save_export_modal: false,
      is_exporting: false,
      created_video: false,
      export_href: undefined,
      default_image_duration: 2,

      resolution_preset_picked: "high",
      presets: [
        {
          key: "vhigh",
          text: this.$t("very_high"),
          instructions: "1920 × 1080",
          width: 1920,
          height: 1080,
        },
        {
          key: "high",
          text: this.$t("high"),
          instructions: "1280 × 720",
          width: 1280,
          height: 720,
        },
        {
          key: "medium",
          text: this.$t("medium"),
          instructions: "640 × 480",
          width: 640,
          height: 480,
        },
        {
          key: "low",
          text: this.$t("low"),
          instructions: "480 × 360",
          width: 480,
          height: 360,
        },
        {
          key: "rough",
          text: "→" + this.$t("rough"),
          instructions: "360 × 240",
          width: 360,
          height: 240,
        },
        {
          key: "custom",
          text: "↓" + this.$t("custom"),
          instructions: "512 × 512",
        },
      ],
    };
  },
  i18n: {
    messages: {
      fr: {
        export_montage: "Exporter le montage",
      },
      en: {
        export_montage: "Export montage",
      },
    },
  },
  async created() {
    if (!this.sections || this.sections.length === 0) {
      await this.createSection2({
        publication: this.make,
        type: "section",
        group: "sections_list",
        title: "montage",
      });
    }
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    show_save_export_modal() {
      if (!this.show_save_export_modal) {
        if (this.created_video) this.created_video = false;
      }
    },
  },
  computed: {
    export_name() {
      return "video_montage.mp4";
    },
    export_is_available() {
      return this.section_modules_list.length > 1;
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
    section_modules_list() {
      return this.getModulesForSection({
        publication: this.make,
        section: this.first_section,
      }).map(({ _module }) => _module);
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
    async cancelExport() {
      this.$api.deleteItem({
        path: this.created_video.$path,
      });
      this.created_video = false;
    },
    async renderMontage() {
      this.is_exporting = true;
      this.created_video = false;
      this.export_href = undefined;

      const { width: output_width, height: output_height } = this.presets.find(
        (p) => p.key === this.resolution_preset_picked
      );

      const additional_meta = {};
      additional_meta.$origin = "make";
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      let instructions = {
        recipe: this.make.type,
        suggested_file_name: this.make.type,
        montage: this.montage,
        output_width,
        output_height,
        additional_meta,
      };

      const current_task_id = await this.$api.exportFolder({
        path: this.make.$path,
        instructions,
      });
      this.$api.join({ room: "task_" + current_task_id });

      const checkIfEnded = ({ task_id, message }) => {
        if (task_id !== current_task_id) return;
        this.$eventHub.$off("task.ended", checkIfEnded);
        this.$api.leave({ room: "task_" + current_task_id });

        if (message.event === "completed") {
          message.file;
          this.created_video = message.file;
          this.export_href = this.makeMediaFileURL({
            $path: this.created_video.$path,
            $media_filename: this.created_video.$media_filename,
          });
        } else if (message.event === "aborted") {
          //
        } else if (message.event === "failed") {
          message.info;
        }

        this.is_exporting = false;
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
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
