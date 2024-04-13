<template>
  <div class="_sectionsSummary" :style="story_styles">
    <ReorderedList
      :field_name="'sections_list'"
      :items="sections"
      :path="publication.$path"
      :active_item_meta="opened_section_meta_filename"
      :can_edit="can_edit"
      @openItem="openSection"
      @createItem="createSection"
      @removeOpened="removeOpenedSection"
      v-slot="slotProps"
    >
      <template v-if="slotProps.item.section_title">
        {{ slotProps.item.section_title }}
      </template>
      <template v-else>
        <i>{{ $t("untitled") }}</i>
      </template>
    </ReorderedList>
  </div>
</template>
<script>
export default {
  props: {
    publication: Object,
    sections: Array,
    opened_section_meta_filename: String,
    can_edit: Boolean,
  },
  components: {},
  inject: {
    $getMapOptions: {
      default: false,
    },
  },
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {
        create_section: "Créer un chapitre",
      },
      en: {
        create_section: "Create chapter",
      },
    },
  },
  created() {},
  mounted() {
    if (this.can_edit && this.sections.length === 0) this.createSection();
    this.openFirstSectionIfNoneOpened();
    this.openExistingSectionIfNotExisting();
  },
  beforeDestroy() {},
  watch: {
    opened_section_meta_filename() {
      this.openFirstSectionIfNoneOpened();
    },
  },
  computed: {
    is_associated_to_map() {
      return this.$getMapOptions;
    },
    default_view_color() {
      return this.$getMapOptions().default_view_color;
    },
    story_styles() {
      return this.makeStoryStyles({ publication: this.publication });
    },
    new_section_title() {
      let idx = this.sections.length + 1;
      const makeTitle = (i) => this.$t("section") + " " + i;

      let new_section_title = makeTitle(idx);
      while (this.sections.some((s) => s.section_title === new_section_title)) {
        idx++;
        new_section_title = makeTitle(idx);
      }
      return new_section_title;
    },
    opened_section() {
      return this.sections.find(
        (s) => this.getFilename(s.$path) === this.opened_section_meta_filename
      );
    },
  },
  methods: {
    openSection(path) {
      this.$emit("toggleSection", this.getFilename(path));
    },
    openFirstSectionIfNoneOpened() {
      if (this.sections.length > 0 && !this.opened_section_meta_filename) {
        this.openFirstSection();
      }
    },
    openFirstSection() {
      const section_path = this.sections[0].$path;
      this.openSection(section_path);
    },
    openExistingSectionIfNotExisting() {
      if (this.opened_section_meta_filename && !this.opened_section) {
        this.openFirstSection();
      }
    },

    async createSection() {
      const new_section_meta = await this.createSection2({
        publication: this.publication,
        type: "section",
        group: "sections_list",
        title: this.new_section_title,
      });
      this.$emit("toggleSection", new_section_meta);
    },
    async removeOpenedSection() {
      await this.removeSection2({
        publication: this.publication,
        group: "sections_list",
        path: this.opened_section.$path,
      });
      this.openFirstSection();
    },
  },
};
</script>
<style lang="scss" scoped>
._sectionsSummary {
  // max-width: 60ch;
  width: 100%;
  margin: 0 auto;
  margin-bottom: calc(var(--spacing) * 1);
  // padding: 0 calc(var(--spacing) * 1);

  // ::v-deep summary {
  // border: 2px solid var(--c-gris);
  // }
}

._createSection {
  padding: calc(var(--spacing) / 4);
}
</style>
