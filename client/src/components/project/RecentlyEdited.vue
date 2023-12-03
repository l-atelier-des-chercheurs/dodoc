<template>
  <div>
    <DLabel :str="$t('projects_you_edited_last')" />
    <div class="" v-if="paths">
      <!-- disabled because it flashes up/down -->
      <!-- <transition name="pagechange" mode="in-out"> -->
      <LoadSelectedProjects :key="paths.join('.')" :paths="paths" />
      <!-- </transition> -->
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
      if (!this.connected_as?.projects_recently_edited) return false;
      return this.connected_as.projects_recently_edited.slice().reverse();
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
