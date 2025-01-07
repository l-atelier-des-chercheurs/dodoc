<template>
  <div>
    <ToggledSection
      :label="$t('projects_you_edited_last')"
      :show_toggle.sync="show_toggle"
    >
      <div class="" v-if="paths">
        <LoadSelectedProjects :key="paths.join('.')" :paths="paths" />
      </div>
      <div v-else>
        {{ $t("nothing_to_show") }}
      </div>
    </ToggledSection>
  </div>
</template>
<script>
import LoadSelectedProjects from "@/components/project/LoadSelectedProjects.vue";

export default {
  props: {},
  components: {
    LoadSelectedProjects,
  },
  data() {
    return {
      show_toggle: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    paths() {
      if (!this.connected_as?.projects_recently_edited) return false;
      return this.connected_as.projects_recently_edited.slice().reverse();
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
