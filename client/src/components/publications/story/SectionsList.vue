<template>
  <div class="_sectionsList">
    <SectionsSummary
      v-if="can_edit || sections.length > 1"
      :publication="publication"
      :sections="sections"
      :opened_section_meta_filename="opened_section_meta_filename"
      :can_edit="can_edit"
      @toggleSection="$emit('toggleSection', $event)"
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
    <PublicationSettings v-if="can_edit">
      <StorySettings :publication="publication" />
    </PublicationSettings>
  </div>
</template>
<script>
import PublicationSettings from "@/components/publications/PublicationSettings.vue";
import StorySettings from "@/components/publications/story/StorySettings.vue";
import SectionsSummary from "@/components/publications/story/SectionsSummary.vue";
import OpenedSection from "@/components/publications/story/OpenedSection.vue";

export default {
  props: {
    publication: Object,
    opened_section_meta_filename: String,
    can_edit: Boolean,
  },
  components: {
    PublicationSettings,
    StorySettings,
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
      const current = [];
      const other = [];

      this.sections.map((s) => {
        const is_current_section =
          this.getFilename(s.$path) === this.opened_section_meta_filename;

        const modules = this.getModulesForSection({
          publication: this.publication,
          section: s,
        });

        debugger;

        modules.map(({ _module }) => {
          if (_module?.source_medias && Array.isArray(_module.source_medias))
            _module.source_medias.map((sm) => {
              if (is_current_section) current.push(sm.meta_filename_in_project);
              else other.push(sm.meta_filename_in_project);
            });
        });
      });
      return { current, other };
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._sectionsList {
  position: relative;
  padding: calc(var(--spacing) / 1);
}

._sectionTitle {
}
</style>
