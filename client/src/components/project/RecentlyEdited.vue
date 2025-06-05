<template>
  <div class="_recentlyEdited" v-if="show_recently_edited">
    <div class="_title">
      <DLabel :str="$t('projects_you_edited_last')" />
    </div>
    <button
      type="button"
      class="u-button u-button_icon _closeBtn"
      @click="show_recently_edited = false"
    >
      <b-icon icon="x-lg" />
    </button>
    <div v-if="paths.length > 0" class="_content">
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
  position: relative;
  // right: 0;
  // top: 55px;
  // width: 140px;
  // max-height: 300px;
  z-index: 1000;
  padding: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) * 2) auto;
  // padding-top: calc(var(--spacing) / 2);
  // background: var(--c-bleumarine);
  background: var(--c-gris_clair);
  // color: white;
  max-width: min(var(--max-column-width), var(--max-column-width-px));

  border-radius: var(--border-radius) 0 0 var(--border-radius);
  // box-shadow: var(--panel-shadows);
  // display: flex;
  // flex-direction: row;

  overflow: auto;

  > * {
    max-height: 30vh;
  }

  ::v-deep label {
    // color: white;
  }
}

._closeBtn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

._title {
  // writing-mode: vertical-rl;
  // text-orientation: mixed;
  // transform: rotate(180deg);
  // margin-right: calc(var(--spacing) / 2);
  // white-space: nowrap;
}

._content {
  overflow: auto;
}
</style>
