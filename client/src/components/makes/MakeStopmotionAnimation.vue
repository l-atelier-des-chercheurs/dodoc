<template>
  <div>
    <transition-group
      tag="div"
      class="_listOfModules"
      name="StoryModules"
      appear
      :duration="700"
    >
      <template v-for="(_module, index) in section_modules_list">
        <StopmotionModule
          :key="_module.$path"
          :index="index"
          :makemodule="_module"
          :number_of_modules="section_modules_list.length"
          :imposed_ratio="first_media_ratio"
          :module_position="
            section_modules_list.length === 1
              ? 'alone'
              : index === 0
              ? 'first'
              : index === section_modules_list.length - 1
              ? 'last'
              : 'inbetween'
          "
          @moveTo="moveModuleTo"
          @moveUp="
            moveModuleTo({ path: _module.$path, new_position: index - 1 })
          "
          @moveDown="
            moveModuleTo({ path: _module.$path, new_position: index + 1 })
          "
          @remove="removeModule"
        />
      </template>
      <ModuleCreator
        key="mc_0"
        :publication_path="make.$path"
        :start_collapsed="false"
        :types_available="['capture', 'import']"
        :context="'montage'"
        @addModules="addModules"
      />
    </transition-group>

    <transition name="pagechange" mode="out-in">
      <div class="_bottomRow" v-if="export_is_available">
        <div class="_equationIcon">
          <b-icon icon="chevron-double-down" />
        </div>
        <div class="_create">
          <div class="">
            <label class="u-label">{{ $t("img_per_second") }}</label>
            <select v-model.number="frame_rate" size="small">
              <option>2</option>
              <option>4</option>
              <option>8</option>
              <option>15</option>
              <option>24</option>
              <option>30</option>
            </select>
          </div>
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
      :title="$t('export_stomotion')"
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
          <DLabel>
            {{ $t("resolution") }}
          </DLabel>
          <SelectField2
            :value="resolution_preset_picked"
            :options="presets"
            :can_edit="true"
            :hide_validation="true"
            @change="resolution_preset_picked = $event"
          />

          <div v-if="resolution_preset_picked === 'custom'">
            <div class="u-spacingBottom" />
            <CustomResolutionInput
              :width.sync="custom_resolution_width"
              :height.sync="custom_resolution_height"
              :ratio="first_media_ratio"
            />
          </div>

          <div class="u-spacingBottom" />
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
import StopmotionModule from "@/components/makes/StopmotionModule.vue";
import ExportSaveMakeModal from "@/components/makes/ExportSaveMakeModal.vue";

export default {
  props: {
    make: Object,
  },
  components: {
    ModuleCreator,
    StopmotionModule,
    ExportSaveMakeModal,
  },
  data() {
    return {
      show_save_export_modal: false,
      is_exporting: false,
      created_video: false,
      export_href: undefined,
      frame_rate: 4,

      custom_resolution_width: 1920,
      custom_resolution_height: 1080,

      resolution_preset_picked: "original",
    };
  },
  async created() {
    if (!this.sections || this.sections.length === 0) {
      await this.createSection2({
        publication: this.make,
        type: "section",
        group: "sections_list",
        title: "stopmotion",
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
    first_media: {
      handler() {
        if (!this.first_media?.$infos) return;
        const { width, height } = this.first_media.$infos;
        if (width && height) {
          this.custom_resolution_width = width;
          this.custom_resolution_height = height;
        }
      },
      immediate: true,
    },
  },
  computed: {
    presets() {
      let presets = [];

      let source = {
        key: "original",
        text: this.$t("original"),
      };
      if (this.first_media) {
        const { width, height } = this.first_media.$infos;
        source.width = width;
        source.height = height;
        source.instructions = `${width} × ${height} pixels`;
      }
      presets.push(source);
      presets = presets.concat([
        {
          key: "vhigh",
          text: this.$t("very_high"),
          instructions: "1920 × 1080 pixels",
          width: 1920,
          height: 1080,
        },
        {
          key: "high",
          text: this.$t("high"),
          instructions: "1280 × 720 pixels",
          width: 1280,
          height: 720,
        },
        {
          key: "medium",
          text: this.$t("medium"),
          instructions: "640 × 480 pixels",
          width: 640,
          height: 480,
        },
        {
          key: "low",
          text: this.$t("low"),
          instructions: "480 × 360 pixels",
          width: 480,
          height: 360,
        },
        {
          key: "rough",
          text: "→" + this.$t("rough"),
          instructions: "360 × 240 pixels",
          width: 360,
          height: 240,
        },
        {
          key: "custom",
          text: "↓" + this.$t("custom"),
        },
      ]);

      return presets;
    },
    export_name() {
      return "stopmotion.mp4";
    },
    export_is_available() {
      return this.section_modules_list.length > 0;
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
    section_modules_list() {
      return this.getModulesForSection({
        publication: this.make,
        section: this.first_section,
      }).map(({ _module }) => _module);
    },
    first_media_ratio() {
      return this.first_media?.$infos?.ratio || undefined;
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

      let output_width, output_height;
      if (this.resolution_preset_picked === "custom") {
        output_width = this.custom_resolution_width;
        output_height = this.custom_resolution_height;
      } else {
        const preset = this.presets.find(
          (p) => p.key === this.resolution_preset_picked
        );
        output_width = preset.width;
        output_height = preset.height;
      }

      const additional_meta = {
        $origin: "make",
      };
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      const images_meta = this.section_modules_list.reduce((acc, m) => {
        const meta_filename_in_project =
          m.source_medias[0]?.meta_filename_in_project;
        if (meta_filename_in_project) {
          acc.push({
            m: meta_filename_in_project,
            d: 1,
          });
        }
        return acc;
      }, []);

      // m: meta, d: duration
      const current_task_id = await this.$api.exportFolder({
        path: this.make.$path,
        instructions: {
          recipe: this.make.type,
          images_meta,
          frame_rate: this.frame_rate,
          output_width,
          output_height,
          export_format: "mp4",
          additional_meta,
        },
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
._listOfModules {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--spacing);
  margin: var(--spacing) 0;
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

._create {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing);
  color: white;

  label {
    color: inherit;
  }
}
</style>
