<template>
  <div>
    <transition-group
      tag="div"
      class="_listOfModules"
      name="StoryModules"
      appear
    >
      <div
        v-for="(_module, index) in section_modules_list"
        :key="_module.$path"
      >
        <StopmotionModule
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
      </div>
      <ModuleCreator
        key="mc_0"
        :publication_path="make.$path"
        :start_collapsed="false"
        :types_available="['capture', 'import']"
        :pick_from_types="['image']"
        :context="'montage'"
        @addModules="addModules"
      />
    </transition-group>

    <transition name="pagechange" mode="out-in">
      <div class="_bottomRow" v-if="section_modules_list.length > 0">
        <div class="_equationIcon">
          <b-icon icon="chevron-double-down" />
        </div>
        <div>
          <div class="_create">
            <div class="_fpsPick">
              <RangeValueInput
                :can_toggle="false"
                :label="$t('img_per_second')"
                :value="frame_rate"
                :min="2"
                :max="30"
                :step="1"
                :ticks="[2, 4, 8, 15, 24, 30]"
                :default_value="4"
                @save="updateFrameRate"
              />

              <!-- <label class="u-label">{{ $t("img_per_second") }}</label>
            <select v-model.number="frame_rate" size="small">
              <option>2</option>
              <option>4</option>
              <option>8</option>
              <option>15</option>
              <option>24</option>
              <option>30</option>
              <option value="custom">{{ $t("custom") }}</option>
            </select>
            <input
              v-model.number="frame_rate"
              type="number"
              min="1"
              max="60"
              step="1"
              list="frame_rate_options"
            />
            <datalist id="frame_rate_options">
              <option v-for="i in 60" :value="i" :key="i" />
            </datalist> -->
            </div>
            <button
              type="button"
              class="u-button u-button_bleumarine"
              :disabled="!export_is_available"
              @click="show_render_modal = true"
            >
              <b-icon icon="check" />
              {{ $t("make") }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <ExportSaveMakeModal2
      v-if="show_render_modal"
      :base_instructions="base_instructions"
      :make_path="make.$path"
      :reference_media="first_media"
      :possible_formats="possible_formats"
      :default_resolution_preset="'high'"
      @close="show_render_modal = false"
    />
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import StopmotionModule from "@/components/makes/StopmotionModule.vue";
import ExportSaveMakeModal2 from "@/components/makes/ExportSaveMakeModal2.vue";

export default {
  props: {
    make: Object,
  },
  components: {
    ModuleCreator,
    StopmotionModule,
    ExportSaveMakeModal2,
  },
  data() {
    return {
      show_render_modal: false,
      is_exporting: false,
      created_video: false,
      export_href: undefined,
      frame_rate: this.make.frame_rate || 4,

      custom_resolution_width: 1920,
      custom_resolution_height: 1080,

      resolution_preset_picked: "original",
    };
  },
  async created() {
    if (!this.sections || this.sections.length === 0) {
      await this.createSection2({
        publication: this.make,
        additional_meta: {
          section_title: "stopmotion",
        },
      });
    }
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
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
    "make.frame_rate": {
      handler() {
        this.frame_rate = this.make.frame_rate;
      },
      immediate: true,
    },
  },
  computed: {
    possible_formats() {
      return [
        {
          key: "mp4",
          text: this.$t("video_mp4"),
        },
        {
          key: "gif",
          text: this.$t("video_gif"),
        },
      ];
    },
    export_is_available() {
      return this.section_modules_list.length > 1;
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
    base_instructions() {
      const recipe = "stopmotion_animation";

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

      return {
        recipe,
        images_meta,
        frame_rate: this.frame_rate,
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
    async removeModule(path) {
      await this.removeModule2({
        publication: this.make,
        section: this.first_section,
        path,
      });
    },
    updateFrameRate(frame_rate) {
      this.$api.updateMeta({
        path: this.make.$path,
        new_meta: { frame_rate },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._listOfModules {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  margin-top: calc(var(--spacing) * 2);
  text-align: center;
}

._create {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing);
  background: white;
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
  border-radius: var(--input-border-radius);

  label {
    color: inherit;
  }
}

._fpsPick {
}
</style>
