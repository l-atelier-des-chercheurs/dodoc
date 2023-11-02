<template>
  <div class="_sectionsSummary">
    <!-- <DetailsPane
      ref="details"
      :header="$t('chapters')"
      :icon="'card-list'"
      :has_items="sections.length > 0 ? sections.length : false"
      :is_open_initially="sections.length === 0"
    > -->
    <ReorderedList
      :field_name="'sections_list'"
      :items="sections"
      :path="publication.$path"
      :active_item_meta="opened_section_meta_filename"
      :can_edit="can_edit"
      @openItem="openSection"
      v-slot="slotProps"
    >
      <span v-if="slotProps.item.section_title">
        {{ slotProps.item.section_title }}
      </span>
      <span v-else v-html="`<i>${$t('untitled')}</i>`" />
    </ReorderedList>

    <template v-if="can_edit">
      <!-- <template v-if="sections.length > 0">
        <hr />
      </template> -->
      <div class="_buttonRow">
        <button
          type="button"
          class="u-buttonLink _createSection"
          @click="createSection"
        >
          {{ $t("create_section") }}
        </button>
        <RemoveMenu
          :remove_text="$t('remove_section')"
          @remove="removeSection"
        />
      </div>
    </template>
    <!-- </DetailsPane> -->
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
        remove_section: "Supprimer le chapitre",
      },
      en: {
        create_section: "Create chapter",
        remove_section: "Remove this chapter",
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
    async removeSection() {
      await this.removeSection2({
        publication: this.publication,
        group: "sections_list",
        path: this.opened_section.$path,
      });
      // todo open previous section
    },
  },
};
</script>
<style lang="scss" scoped>
._sectionsSummary {
  // max-width: 60ch;
  width: 100%;
  margin: 0 auto;
  margin-bottom: calc(var(--spacing) / 1);
  // padding: 0 calc(var(--spacing) * 1);

  // ::v-deep summary {
  // border: 2px solid var(--c-gris);
  // }
}

._createSection {
  padding: calc(var(--spacing) / 4);
}

._buttonRow {
  display: flex;
  flex-flow: row wrap;
}
</style>
