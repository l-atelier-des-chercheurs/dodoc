<template>
  <div class="_recentlyEdited" v-if="show_recently_edited">
    <DLabel :str="$t('projects_you_edited_last')" />
    <button
      type="button"
      class="u-button u-button_icon _closeBtn"
      @click="show_recently_edited = false"
    >
      <b-icon icon="x-lg" />
    </button>
    <div v-if="paths.length > 0">
      <LoadSelectedProjects :key="paths.join('.')" :paths="paths" />
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
    return {
      show_recently_edited: false,
    };
  },
  created() {
    this.show_recently_edited = this.paths.length > 0;
  },
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
<style lang="scss" scoped>
._recentlyEdited {
  position: fixed;
  bottom: 0;
  right: calc(var(--spacing) * 2);
  max-width: 280px;
  width: 100%;
  max-height: 300px;
  z-index: 1000;
  padding: var(--spacing);
  background: white;
  border-radius: var(--border-radius) var(--border-radius);
  box-shadow: var(--panel-shadows);

  overflow: auto;

  > * {
    max-height: 30vh;
  }
}

._closeBtn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}
</style>
