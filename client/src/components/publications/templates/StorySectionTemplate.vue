<template>
  <div>
    <!-- <RadioSwitch
      v-if="can_edit"
      class="_switch"
      :content.sync="current_view"
      :options="[
        {
          label: $t('settings'),
          value: 'settings',
        },
        {
          label: $t('list_of_sections'),
          value: 'pages',
        },
      ]"
    /> -->

    <StorySettings
      v-if="current_view === 'settings' && can_edit"
      :publication="publication"
    />
    <SectionsList
      v-else
      :publication="publication"
      :section_opened_meta="section_opened_meta"
      :can_edit="can_edit"
      @toggleSection="$emit('toggleSection', $event)"
      @closePublication="$emit('closePublication')"
    />
  </div>
</template>
<script>
import StorySettings from "@/components/publications/story/StorySettings.vue";
import SectionsList from "@/components/publications/story/SectionsList.vue";

export default {
  props: {
    publication: Object,
    section_opened_meta: String,
    can_edit: Boolean,
  },
  components: {
    StorySettings,
    SectionsList,
  },
  data() {
    return {
      current_view: "section",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._switch {
  margin: calc(var(--spacing) * 1) 0;
}
</style>
