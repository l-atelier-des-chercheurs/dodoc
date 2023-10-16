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
  i18n: {
    messages: {
      fr: {
        in_this_section: "Dans cette section",
        in_another_section: "Dans une autre section",
      },
    },
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
