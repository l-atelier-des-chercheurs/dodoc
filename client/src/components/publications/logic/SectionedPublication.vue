<template>
  <div>
    <SectionsList
      :publication="publication"
      :sections="sections"
      :opened_section="opened_section"
      :can_edit="can_edit"
      @toggleSection="$emit('toggleSection', $event)"
      @closePublication="$emit('closePublication')"
      @createSection="createSection"
      @removeSection="removeSection"
      @updateOrder="updateOrder"
      @openSection="openSection"
      @closeSection="closeSection"
    />
  </div>
</template>
<script>
import SectionsList from "@/components/publications/story/SectionsList.vue";

export default {
  props: {
    publication: Object,
    section_opened_meta: String,
    can_edit: Boolean,
  },
  components: {
    SectionsList,
  },
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  provide() {
    return {
      $getMetaFilenamesAlreadyPresent: () =>
        this.meta_filenames_already_present,
    };
  },
  created() {},
  mounted() {
    if (this.sections_list && !this.section_opened_meta) {
      this.$emit("toggleSection", this.sections_list[0].meta_filename);
    }
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    sections_list() {
      return Array.isArray(this.publication.sections_list)
        ? this.publication.sections_list
        : [];
    },
    sections() {
      const all_sections = this.publication.$files
        ? this.publication.$files.filter((f) =>
            Object.prototype.hasOwnProperty.call(f, "section_type")
          )
        : [];

      if (all_sections.length === 0 || !this.sections_list.length === 0)
        return [];

      return this.sections_list.map(({ meta_filename }) => {
        return all_sections.find((s) => s.$path.endsWith("/" + meta_filename));
      });
    },
    opened_section() {
      return this.sections.find((f) =>
        f.$path.endsWith("/" + this.section_opened_meta)
      );
    },
    meta_filenames_already_present() {
      const current = [];
      const other = [];

      this.sections.map((s) => {
        const is_current_section = s.$path === this.opened_section?.$path;

        if (s.modules_list && Array.isArray(s.modules_list))
          s.modules_list.map((module_meta) => {
            const section_module = this.sections.find((f) => {
              return this.getFilename(f.$path) === module_meta;
            });
            if (
              section_module?.source_medias &&
              Array.isArray(section_module.source_medias)
            )
              section_module.source_medias.map((sm) => {
                if (is_current_section)
                  current.push(sm.meta_filename_in_project);
                else other.push(sm.meta_filename_in_project);
              });
          });
      });
      return { current, other };
    },
  },
  methods: {
    async createSection() {
      const section_meta_filename = await this.$api
        .uploadFile({
          path: this.publication.$path,
          additional_meta: {
            section_type: "-",
            requested_slug: "section",
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      let sections_list = this.sections_list.slice();
      sections_list.push({
        meta_filename: section_meta_filename,
      });
      await this.updatePubliMeta({
        sections_list,
      });
      this.$emit("toggleSection", section_meta_filename);
    },
    async removeSection(path) {
      const section_meta_filename = this.getFilename(path);
      let sections_list = this.sections_list.slice();
      sections_list = sections_list.filter(
        (f) => f.meta_filename !== section_meta_filename
      );
      this.updatePubliMeta({
        sections_list,
      });
      await this.$api.deleteItem({
        path,
      });
    },
    updateOrder(items) {
      const sections_list = items.map((i) => {
        return {
          meta_filename: this.getFilename(i.$path),
        };
      });

      if (JSON.stringify(sections_list) === JSON.stringify(this.sections_list))
        return "no_update_necessary";

      this.updatePubliMeta({
        sections_list,
      });
    },
    openSection(path) {
      const section_meta_filename = this.getFilename(path);
      this.$emit("toggleSection", section_meta_filename);
    },
    closeSection() {
      this.$eventHub.$emit(`sections.open_summary`);
      this.$emit("toggleSection", false);
    },
    async updatePubliMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
