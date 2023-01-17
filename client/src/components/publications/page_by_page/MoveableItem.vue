<template>
  <!-- <div class="container"> -->
  <!-- <div class="" style="position: absolute">
      {{ transform }}
    </div> -->
  <!-- <div class="_moveableItem">
    <img class="" :src="src" />
  </div> -->
  <DDR
    class="_moveableItem"
    :key="component_key"
    :value="transform"
    :parent="true"
    :acceptRatio="false"
    @dragend="dragEnd"
    @resizeend="resizeEnd"
    @rotateend="rotateEnd"
  >
    <!-- <div class="_moveableItem--content"> -->
    <!-- style="background: red; width: 100%; height: 100%" -->
    <PublicationModule
      class="_mediaPublication"
      :publimodule="publimodule"
      :can_edit="can_edit"
      :context="'page_by_page'"
      @duplicate="duplicateModule"
      @remove="removeModule"
    />
    <!-- </div> -->
  </DDR>
</template>
<script>
// import DDR from "yoyoo-ddr";
import "yoyoo-ddr/dist/yoyoo-ddr.css";
import PublicationModule from "@/components/publications/modules/PublicationModule.vue";

/* eslint-disable no-unused-vars */
export default {
  name: "app",
  props: {
    publimodule: Object,
    can_edit: Boolean,
  },
  components: {
    DDR,
    PublicationModule,
  },
  data() {
    return {
      transform: { x: 100, y: 100, width: 300, height: 300, rotation: 0 },
      component_key: 1,
    };
  },
  created() {
    if (this.publimodule.x) this.updateTransformFromPubli();
    // else debugger;
    // todo get ratio from linked image, set initial transform based on that

    this.setNewComponentKey();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    publimodule: {
      handler() {
        // todo change key to re-render component if coordinates were changed and diff from transform (means it was changed on another client)
        const was_updated = this.updateTransformFromPubli();
        if (was_updated) this.setNewComponentKey();
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    setNewComponentKey() {
      this.component_key = new Date().getTime();
    },
    updateTransformFromPubli() {
      let was_updated = false;
      Object.keys(this.transform).map((k) => {
        if (typeof this.publimodule[k] === "number")
          if (this.transform[k] !== this.publimodule[k]) {
            this.transform[k] = this.publimodule[k];
            was_updated = true;
          }
      });
      return was_updated;
      // this.$set(this.transform, k, this.publimodule[k]);
    },
    dragEnd(event, transform) {
      if (JSON.stringify(transform) === JSON.stringify(this.transform))
        return false;

      this.transform = transform;
      this.updateMeta(transform);
    },
    resizeEnd(event, transform) {
      if (JSON.stringify(transform) === JSON.stringify(this.transform))
        return false;

      this.transform = transform;
      this.updateMeta(transform);
    },
    rotateEnd(event, transform) {
      if (JSON.stringify(transform) === JSON.stringify(this.transform))
        return false;

      this.transform = transform;
      this.updateMeta(transform);
    },
    async updateMeta(new_meta) {
      // transform to x, y, width, height, rotation
      await this.$api
        .updateMeta({
          path: this.publimodule.$path,
          new_meta,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
    },

    duplicateModule() {},
    removeModule() {},
  },
};
</script>
<style lang="scss" scoped>
._moveableItem {
  width: 50px;
}

._moveableItem--content {
  overflow: hidden;

  ::v-deep ._publicationModule {
    padding: 0;
  }
}

._mediaPublication {
  padding: 0;
}
</style>
