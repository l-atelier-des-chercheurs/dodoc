<template>
  <div class="_sectionsList">
    <!-- @click="unselectModule" -->
    <SectionsSummary
      v-show="can_edit || sections.length > 1"
      :publication="publication"
      :sections="sections"
      :opened_section_meta_filename="opened_section_meta_filename"
      :can_edit="can_edit"
      @toggleSection="$emit('toggleSection', $event)"
      @openFirstSection="openFirstSection"
    />
    <transition name="pagechange" mode="out-in">
      <OpenedSection
        v-if="opened_section_meta_filename"
        :key="opened_section_meta_filename"
        :publication="publication"
        :sections="sections"
        :opened_section_meta_filename="opened_section_meta_filename"
        :can_edit="can_edit"
        @toggleSection="$emit('toggleSection', $event)"
      />
    </transition>
  </div>
</template>
<script>
import SectionsSummary from "@/components/publications/story/SectionsSummary.vue";
import OpenedSection from "@/components/publications/story/OpenedSection.vue";

export default {
  props: {
    publication: Object,
    opened_section_meta_filename: String,
    can_edit: Boolean,
  },
  components: {
    SectionsSummary,
    OpenedSection,
  },
  provide() {
    return {
      $getMetaFilenamesAlreadyPresent: () =>
        this.meta_filenames_already_present,
    };
  },

  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    sections() {
      return this.getSectionsWithProps({
        publication: this.publication,
        group: "sections_list",
      });
    },
    meta_filenames_already_present() {
      const { current, other } = this.getMediasAlreadyPresentInPublication({
        publication: this.publication,
        sections: this.sections,
        opened_section_meta_filename: this.opened_section_meta_filename,
      });

      return [
        {
          label: this.$t("in_this_section"),
          medias: current,
          color: "var(--c-orange)",
        },
        {
          label: this.$t("in_another_section"),
          medias: other,
          color: "var(--c-bleuvert)",
        },
      ];
    },
  },
  methods: {
    openFirstSection() {
      const section_meta_filename = this.getFilename(this.sections[0].$path);
      this.$emit("toggleSection", section_meta_filename);
    },
    unselectModule() {
      this.$eventHub.$emit("module.none_edited");
    },
  },
};
</script>
<style lang="scss" scoped>
._sectionsList {
  position: relative;
  // z-index: 1;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) * 1 + 8%);
}
</style>
