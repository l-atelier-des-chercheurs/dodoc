<template>
  <div>
    <DLabel :str="$t('projects_you_edited_last')" />
    <div
      v-if="
        connected_as.latest_edited_projects &&
        connected_as.latest_edited_projects.length > 0
      "
    >
      <LoadSelectedProjects :paths="paths" />
    </div>
    <div v-else>
      {{ $t("nothing_to_show") }}
    </div>
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
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    paths() {
      return this.connected_as.latest_edited_projects.slice().reverse();
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
