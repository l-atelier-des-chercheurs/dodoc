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
      <div class="_item">
        {{ slotProps.item.section_type }}
        <h2 class="_item--title">
          <template v-if="slotProps.item.section_title">
            {{ slotProps.item.section_title }}
          </template>
          <template v-else>
            <i>{{ $t("untitled") }}</i>
          </template>
        </h2>
        <div class="_item--content">
          <div
            class="_item--content--text"
            v-if="previewContent(slotProps.item)"
          >
            <CollaborativeEditor3 :content="previewContent(slotProps.item)" />
          </div>
        </div>
      </div>
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
          section_type: "html",
          main_text_meta: meta_filename,
        },
      });
      this.$emit("toggleSection", new_section_meta);
    },
    previewContent(chapter) {
      const sub_content = chapter._main_text?.$content;
      if (sub_content) {
        return sub_content.substring(0, 100) + "...";
      }
      return "";
    },
  },
};
</script>
<style lang="scss" scoped>
._sectionsSummary {
  position: relative;
  height: 100%;
  overflow: auto;
  background-color: var(--c-gris_clair);

  padding: calc(var(--spacing) / 1);
}

._createSection {
  padding: calc(var(--spacing) / 4);
}

._item {
  padding: calc(var(--spacing) / 2);
  background: white;
  width: 350px;
  height: 350px;
  text-align: left;
  text-decoration: none;

  a {
    text-decoration: none;
  }

  &--title {
    font-weight: bold;
  }
}
</style>
