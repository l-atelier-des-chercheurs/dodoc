<template>
  <div class="_sectionsSummary">
    <DetailsPane
      ref="details"
      :header="$t('summary')"
      :icon="'card-list'"
      :has_items="sections.length > 0 ? sections.length : false"
      :is_open_initially="sections.length === 0"
    >
      <ReorderedList
        :field_name="'sections_list'"
        :items="sections"
        :path="publication.$path"
        :active_item_meta="opened_section_meta_filename"
        :can_edit="can_edit"
        @openItem="openSection"
        v-slot="slotProps"
      >
        <span
          v-if="is_associated_to_map"
          class="_colorInd"
          :style="
            'color: ' + (slotProps.item.section_color || default_view_color)
          "
          v-text="'⬤'"
        />
        <span v-if="slotProps.item.section_title">
          {{ slotProps.item.section_title }}
        </span>
        <span v-else v-html="`<i>${$t('untitled')}</i>`" />
      </ReorderedList>

      <template v-if="can_edit">
        <template v-if="sections.length > 0">
          <hr />
        </template>
        <button type="button" class="u-buttonLink" @click="createSection">
          {{ $t("create_section") }}
        </button>
      </template>
    </DetailsPane>
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
  created() {},
  mounted() {
    if (this.sections.length > 0 && !this.opened_section_meta_filename) {
      const section_path = this.sections[0].$path;
      this.openSection(section_path);
    } else if (this.sections.length === 0) {
      this.createSection();
    }
    this.$eventHub.$on(`sections.open_summary`, this.openSummary);
  },
  beforeDestroy() {
    this.$eventHub.$off(`sections.open_summary`, this.openSummary);
  },
  watch: {},
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
  },
  methods: {
    openSummary() {
      this.$refs.details.$el.open = true;
    },
    closeSummary() {
      this.$refs.details.$el.open = false;
    },
    openSection(path) {
      this.$emit("toggleSection", this.getFilename(path));
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
  },
};
</script>
<style lang="scss" scoped>
._sectionsSummary {
  max-width: 60ch;
  width: 100%;
  margin: 0 auto;
  margin-bottom: calc(var(--spacing) / 1);
  padding: 0 calc(var(--spacing) * 1);

  ::v-deep summary {
    border: 2px solid var(--c-gris);
  }
}
</style>
