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
          @moveTo="moveModuleTo"
          @remove="removeModule"
        />
      </template>
    </transition-group>
    <ModuleCreator
      :publication_path="make.$path"
      :start_collapsed="false"
      :types_available="['capture', 'import']"
      :context="'montage'"
      @addModules="addModules"
    />
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import StopmotionModule from "@/components/makes/StopmotionModule.vue";

export default {
  props: {
    make: Object,
  },
  components: {
    ModuleCreator,
    StopmotionModule,
  },
  data() {
    return {};
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
  watch: {},
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
</style>
