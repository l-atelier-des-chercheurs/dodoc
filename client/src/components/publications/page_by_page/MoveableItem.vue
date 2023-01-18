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
    :active="can_edit"
    :key="component_key"
    :value="transform"
    :parent="true"
    :acceptRatio="false"
    :handlerSize="15"
    @dragend="dragEnd"
    @resizeend="resizeEnd"
    @rotateend="rotateEnd"
  >
    <!-- x={{ transform.x }}; y={{ transform.y }}; width={{ transform.width }};
    height={{ transform.height }}<br />
    x={{ publimodule.x }}; y={{ publimodule.y }}; width={{ publimodule.width }};
    height={{ publimodule.height }} -->

    <!-- <div class="_moveableItem--content"> -->
    <!-- style="background: red; width: 100%; height: 100%" -->
    <PublicationModule
      class="_moveableItem--content"
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
/* eslint-disable */
import DDR from "@/ddr/index.vue"; // eslint-disable-line
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
    // if (this.publimodule.x)
    this.setTransformFromPubli();
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
        const was_updated = this.setTransformFromPubli();
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
    setTransformFromPubli() {
      let was_updated = false;

      Object.keys(this.transform).map((k) => {
        if (typeof this.publimodule[k] === "number") {
          if (["x", "y", "width", "height"].includes(k)) {
            const px = this.turnCMtoPX(this.publimodule[k]);
            if (this.transform[k] !== px) {
              this.transform[k] = px;
              was_updated = true;
            }
          } else if (k === "rotation") {
            if (this.transform[k] !== this.publimodule[k]) {
              this.transform[k] = this.publimodule[k];
              was_updated = true;
            }
          }
        }
      });
      return was_updated;
      // this.$set(this.transform, k, this.publimodule[k]);
    },
    turnCMtoPX(num) {
      return this.roundToDec(num * 37.8);
    },
    turnPXtoCM(num) {
      return this.roundToDec(num / 37.8);
    },
    roundToDec(num) {
      return Math.round((num + Number.EPSILON) * 100) / 100;
    },
    dragEnd(event, transform) {
      if (JSON.stringify(transform) === JSON.stringify(this.transform))
        return false;

      this.transform = transform;
      this.updateTransform(transform);
    },
    resizeEnd(event, transform) {
      if (JSON.stringify(transform) === JSON.stringify(this.transform))
        return false;

      this.transform = transform;
      this.updateTransform(transform);
    },
    rotateEnd(event, transform) {
      if (JSON.stringify(transform) === JSON.stringify(this.transform))
        return false;

      this.transform = transform;
      this.updateTransform(transform);
    },
    async updateTransform(transform) {
      let new_meta = JSON.parse(JSON.stringify(transform));
      Object.keys(new_meta).map((k) => {
        if (["x", "y", "width", "height"].includes(k)) {
          new_meta[k] = this.turnPXtoCM(new_meta[k]);
          // update transform with this value
          this.transform[k] = this.turnCMtoPX(new_meta[k]);
        }
      });

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
._moveableItem--content {
  height: 100%;
  padding: 0;

  ::v-deep ._content {
    height: 100%;
    overflow: hidden;
  }
}
</style>
