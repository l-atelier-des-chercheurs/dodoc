<template>
  <div>
    <template v-if="display_mode === 'section'">
      <SectionsList
        :publication="publication"
        :opened_section_meta_filename="opened_section_meta_filename"
        :can_edit="false"
        @toggleSection="toggleSection"
      />
    </template>
    <template v-else>
      <div class="_allSections">
        <div class="_section" v-for="section of sections" :key="section.$path">
          <SingleSection
            :publication="publication"
            :section="section"
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
    if (
      this.$route.query?.display === "section" ||
      window.app_infos.page_is_standalone_html
    )
      this.display_mode = "section";
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    opened_section_meta_filename() {
      const query = JSON.parse(JSON.stringify(this.$route.query));
      if (query.section) return query.section;
      return "";
    },
    sections() {
      return this.getSectionsWithProps({
        publication: this.publication,
        group: "sections_list",
      });
    },
  },
  methods: {
    toggleSection(section_meta_filename) {
      this.updatePageQuery({
        prop: "section",
        val: section_meta_filename,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._allSections {
}

._section {
  padding: 0;
  page-break-inside: avoid;
  page-break-after: always;

  @media print {
    // padding-top: calc(var(--spacing) * 2);
  }
}
</style>
