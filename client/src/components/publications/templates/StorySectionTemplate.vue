<template>
  <div class="_storySectionTemplate">
    <div class="u-displayAsPublic" v-if="can_edit">
      <div class="_sticky">
        <div class="_content">
          <ToggleInput
            :content.sync="display_as_public"
            :label="$t('preview')"
          />
        </div>
      </div>
    </div>

    <SectionsList
      :publication="publication"
      :opened_section_meta_filename="opened_section_meta_filename"
      :can_edit="can_edit && !display_as_public"
      @toggleSection="$emit('updatePane', { key: 'section', value: $event })"
    />
    <PublicationSettings v-if="can_edit">
      <StorySettings :publication="publication" />
    </PublicationSettings>
  </div>
</template>
<script>
import SectionsList from "@/components/publications/story/SectionsList.vue";
import PublicationSettings from "@/components/publications/PublicationSettings.vue";
import StorySettings from "@/components/publications/story/StorySettings.vue";

export default {
  props: {
    publication: Object,
    pane_infos: Object,
    can_edit: Boolean,
  },
  components: {
    SectionsList,
    PublicationSettings,
    StorySettings,
  },
  data() {
    return {
      display_as_public: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    opened_section_meta_filename() {
      return this.pane_infos?.section;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._storySectionTemplate {
  position: relative;
}
</style>
