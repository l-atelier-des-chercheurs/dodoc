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
    :class="{
      'is--locked': publimodule.locked === true,
    }"
    :active="can_edit && is_active && publimodule.locked !== true"
    :key="component_key"
    :value="transform"
    :parent="false /* bind to container */"
    :acceptRatio="aspect_ratio"
    :handlerSize="15"
    :grid="grid"
    :id="publimodule.$path"
    :zoom="zoom"
    @dragend="dragEnd"
    @resizestart="resizeStart"
    @resizeend="resizeEnd"
    @rotateend="rotateEnd"
  >
    <span @mousedown="setActive">
      <PublicationModule
        class="_moveableItem--content"
        :publimodule="publimodule"
        :can_edit="can_edit && is_active"
        :context="'page_by_page'"
        :number_of_max_medias="1"
        @duplicate="onDuplicateModule"
      />
    </span>
    <div class="_unlockBtn" v-if="can_edit">
      <button
        type="button"
        class="u-buttonLink"
        v-if="publimodule.locked === true"
        @click="unlock()"
      >
        <sl-icon name="unlock" />
        {{ $t("unlock") }}
      </button>
    </div>

    <!-- <small class="_coords">
      x={{ publimodule.x }}; y={{ publimodule.y }}; width={{
        publimodule.width
      }}; height={{ publimodule.height }}
    </small> -->
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
    magnification: Number,
    gridstep: Number,
    zoom: Number,
    is_active: Boolean,
  },
  components: {
    DDR,
    PublicationModule,
  },
  data() {
    return {
      transform: { x: 100, y: 100, width: 300, height: 300, rotation: 0 },
      component_key: 1,
      aspect_ratio: true,
    };
  },
  created() {
    // if (this.publimodule.x)
    this.setTransformFromPubli();
    // else debugger;
    // todo get ratio from linked image, set initial transform based on that

    this.setNewComponentKey();
  },
  mounted() {
    this.$eventHub.$on(
      `module.enable_edit.${this.module_meta_filename}`,
      this.setActive
    );
  },
  beforeDestroy() {
    this.$eventHub.$on(
      `module.enable_edit.${this.module_meta_filename}`,
      this.setActive
    );
  },
  watch: {
    publimodule: {
      handler() {
        // todo change key to re-render component if coordinates were changed and diff from transform (means it was changed on another client)
        const was_updated = this.setTransformFromPubli();
        if (was_updated) this.setNewComponentKey();
      },
      deep: true,
    },
    magnification() {
      const was_updated = this.setTransformFromPubli();
      if (was_updated) this.setNewComponentKey();
    },
  },
  computed: {
    module_meta_filename() {
      return this.publimodule.$path.split("/").at(-1);
    },
    grid() {
      return [this.gridstep, this.gridstep];
    },
  },
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
      return this.roundToDec(num * this.magnification);
    },
    turnPXtoCM(num) {
      return this.roundToDec(num / this.magnification);
    },
    roundToDec(num) {
      return Math.round((num + Number.EPSILON) * 100) / 100;
    },
    dragEnd(event, transform) {
      if (JSON.stringify(transform) === JSON.stringify(this.transform))
        return false;

      this.transform = transform;
      this.updateTransform(transform);

      event.stopPropagation();
    },
    resizeStart(event, transform) {
      if (
        event.target.classList.contains("br") ||
        event.target.classList.contains("bl") ||
        event.target.classList.contains("tl") ||
        event.target.classList.contains("tr")
      )
        return (this.aspect_ratio = true);
      return (this.aspect_ratio = false);
    },
    resizeEnd(event, transform) {
      if (JSON.stringify(transform) === JSON.stringify(this.transform))
        return false;

      this.transform = transform;
      this.updateTransform(transform);

      event.stopPropagation();
    },
    rotateEnd(event, transform) {
      if (JSON.stringify(transform) === JSON.stringify(this.transform))
        return false;

      this.transform = transform;
      this.updateTransform(transform);

      event.stopPropagation();
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

      await this.updateModuleMeta({
        new_meta,
      });
    },
    setActive() {
      this.$eventHub.$emit(`module.setActive`, this.publimodule.$path);
    },
    async unlock() {
      const new_meta = {
        locked: false,
      };
      await this.updateModuleMeta({
        new_meta,
      });
      this.setActive();
    },
    async updateModuleMeta({ new_meta }) {
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
    onDuplicateModule(meta_filename) {
      const path =
        this.publimodule.$path.substring(
          0,
          this.publimodule.$path.lastIndexOf("/") + 1
        ) + meta_filename;
      this.$eventHub.$emit(`module.setActive`, path);
    },
  },
};
</script>
<style lang="scss" scoped>
._moveableItem {
  // not all because of rotate
  transition-property: left, top, right, bottom;
  transition-duration: 0.15s;
  transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);

  &:hover:not(.is--locked) {
    outline: 2px dotted var(--c-noir);
  }

  &.yoyoo-ddr.active {
    border: none;
    outline: 2px dotted var(--c-orange);

    ::v-deep {
      .bl,
      .br,
      .tl,
      .tr {
        background: var(--c-orange);
      }
    }
  }
}

._moveableItem--content {
  height: 100%;
  padding: 0;

  ::v-deep ._content {
    height: 100%;
    overflow: hidden;

    ._moduleMosaic,
    ._mediaGrid,
    ._mediaGrid--item,
    ._mediaContent {
      height: 100%;
    }
    img,
    .plyr--video {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;

      // plyr
      min-width: 50px;
    }
  }
}
._coords {
  position: absolute;
  bottom: 0;
  left: 0;
  background: white;
  margin: calc(var(--spacing) * 1);
  // padding: calc(var(--spacing) * 1);
}

._unlockBtn {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  margin: calc(var(--spacing) * 1);

  > * {
    background: white;
    pointer-events: auto;
  }
}
</style>
