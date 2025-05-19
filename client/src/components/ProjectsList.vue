<template>
  <div class="_projectsList">
    <div
      v-if="projects.length === 0"
      class="u-instructions _noProjects"
      :key="'noprojects'"
    >
      {{ $t("no_projects") }}
    </div>
    <template v-else>
      <PinnedNonpinnedFolder
        :field_name="'projects_pinned'"
        :label="$t('projects_pinned')"
        :content="projects_pinned"
        :path="path"
        :folders="projects"
        :can_edit="can_edit"
        v-slot="slotProps"
      >
        <ProjectPresentation
          :project="slotProps.item"
          :context="'list'"
          :display_original_space="display_original_space"
          :can_edit="false"
          @toggleFilter="$emit('toggleFilter', $event)"
        />
      </PinnedNonpinnedFolder>
    </template>
  </div>
</template>
<script>
import ProjectPresentation from "@/components/ProjectPresentation.vue";
import PinnedNonpinnedFolder from "@/adc-core/ui/PinnedNonpinnedFolder.vue";

export default {
  props: {
    projects: Array,
    projects_pinned: {
      type: Array,
      default: () => [],
    },
    path: String,
    context: { default: "list", type: String },
    display_original_space: Boolean,
    can_edit: Boolean,
  },
  components: {
    ProjectPresentation,
    PinnedNonpinnedFolder,
  },
  data() {
    return {};
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
._projectsList {
}
._noProjects {
  margin: calc(var(--spacing) / 2) 0 calc(var(--spacing) / 2);
  text-align: center;
}
</style>
