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
          :imposed_ratio="imposed_ratio"
          @moveTo="moveModuleTo"
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
  },
  computed: {
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
    section_modules_list() {
      return this.getModulesForSection({
        publication: this.make,
        section: this.first_section,
      }).map(({ _module }) => _module);
    },
    imposed_ratio() {
      if (this.section_modules_list.length > 0) {
        const first_module = this.section_modules_list.at(0);
        return this.firstMedia(first_module)?.$infos?.ratio;
      }
      return false;
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

      const { width: output_width, height: output_height } = this.presets.find(
        (p) => p.key === this.resolution_preset_picked
      );

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

      debugger;

      // m: meta, d: duration
      const current_task_id = await this.$api.exportFolder({
        path: this.make.$path,
        instructions: {
          recipe: "make_stopmotion",
          images_meta,
          frame_rate: 10,
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
</style>
