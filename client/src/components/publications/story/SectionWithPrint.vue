<template>
  <div>
    <template v-if="display_mode === 'section'">
      <SectionsList
        :publication="publication"
        :sections="sections"
        :can_edit="false"
        :opened_section="opened_section"
        :opened_section_modules_list="opened_section_modules_list"
        @openSection="openSection"
      />
    </template>
    <template v-else>
      <div class="_allSections">
        <div class="_section" v-for="section of sections" :key="section.$path">
          <SingleSection
            :publication="publication"
            :section="section"
            :modules_list="
              getModulesForSection({
                publication: publication,
                section: section,
              })
            "
            :can_edit="false"
          />
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import SectionsList from "@/components/publications/story/SectionsList.vue";
import SingleSection from "@/components/publications/story/SingleSection.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    SectionsList,
    SingleSection,
  },
  data() {
    return {
      display_mode: "all",
    };
  },
  created() {
    if (this.$route.query?.display === "section") this.display_mode = "section";
  },
  mounted() {
    if (
      this.display_mode === "section" &&
      !this.opened_section &&
      this.sections_list.length > 0
    ) {
      const section_meta = this.sections_list[0].meta_filename;
      this.updatePageQuery({ section_meta });
    }
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    sections_list() {
      return this.publication.sections_list || [];
    },
    sections() {
      const all_sections = this.publication.$files
        ? this.publication.$files.filter((f) =>
            Object.prototype.hasOwnProperty.call(f, "section_type")
          )
        : [];

      if (all_sections.length === 0 || !this.publication.sections_list)
        return [];

      return this.publication.sections_list.map(({ meta_filename }) => {
        return all_sections.find((s) => s.$path.endsWith("/" + meta_filename));
      });
    },
    opened_section() {
      if (this.sections.length === 0) return false;
      if (!this.$route.query?.section) return false;
      else {
        return this.sections.find((s) =>
          s.$path.endsWith("/" + this.$route.query.section)
        );
      }
    },
    opened_section_modules_list() {
      return this.getModulesForSection({
        publication: this.publication,
        section: this.opened_section,
      });
    },
  },
  methods: {
    openSection(section_path) {
      const section_meta = section_path.substring(
        section_path.lastIndexOf("/") + 1
      );
      this.updatePageQuery({ section_meta });
    },
    updatePageQuery({ section_meta }) {
      let query = {};

      if (this.$route.query)
        query = JSON.parse(JSON.stringify(this.$route.query));

      if (section_meta === false) delete query.section;
      else if (section_meta) query.section = section_meta;

      this.$router.push({ query });
    },
  },
};
</script>
<style lang="scss" scoped>
._allSections {
}

._section {
  margin: calc(var(--spacing) * 4) 0;
  page-break-inside: avoid;
  page-break-after: always;

  @media print {
    margin: 0;
    // padding-top: calc(var(--spacing) * 2);
  }
}
</style>
