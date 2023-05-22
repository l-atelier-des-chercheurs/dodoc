<template>
  <div>
    <template v-if="display_mode === 'section'">
      <SectionsList
        :publication="publication"
        :can_edit="false"
        :section_opened_meta="section_opened_meta"
        @toggleSection="section_opened_meta = $event"
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
      section_opened_meta: "",
      display_mode: "all",
    };
  },
  created() {
    if (this.$route.query?.display === "section") this.display_mode = "section";

    if (this.publication.sections_list)
      this.section_opened_meta =
        this.publication.sections_list[0].meta_filename;
  },
  mounted() {},
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
  },
  methods: {},
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
    padding-top: calc(var(--spacing) * 2);
  }
}
</style>
