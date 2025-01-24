<template>
  <div class="_sectionsSummary">
    <ReorderedList
      :field_name="'sections_list'"
      :items="sections"
      :path="publication.$path"
      :active_item_meta="opened_section_meta_filename"
      :can_edit="can_edit"
      @openItem="openSection"
      @createItem="createSection"
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
import { add } from "ol/coordinate";

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
  created() {},
  mounted() {
    if (this.can_edit && this.sections.length === 0) this.createSection();
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
        this.$emit("openFirstSection");
      }
    },
    async createSection() {
      const filename = this.new_section_title + " text.txt";
      const { meta_filename } = await this.$api.uploadText({
        path: this.publication.$path,
        filename,
        content: "",
      });

      const new_section_meta = await this.createSection2({
        publication: this.publication,
        additional_meta: {
          section_title: this.new_section_title,
          main_text_meta: meta_filename,
        },
      });
      this.$emit("toggleSection", new_section_meta);
    },
  },
};
</script>
<style lang="scss" scoped>
._sectionsSummary {
  // max-width: 60ch;
  // padding: 0 calc(var(--spacing) * 1);

  // ::v-deep summary {
  // border: 2px solid var(--c-gris);
  // }
}

._createSection {
  padding: calc(var(--spacing) / 4);
}
</style>
