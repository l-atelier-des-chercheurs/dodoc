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
      'is--editable': can_edit,
      'is--active': can_edit && is_active,
      'is--beingEdited': content_is_edited,
      'panzoom-exclude': can_edit,
    }"
    :active="
      can_edit &&
      is_active &&
      publimodule.locked !== true &&
      content_is_edited !== true
    "
    :key="component_key"
    :value="transform"
    :parent="false /* bind to container */"
    :acceptRatio="aspect_ratio"
    :handlerSize="15"
    :grid="grid"
    :id="publimodule.$path"
    :zoom="scale"
    :style="module_z_index"
    @dragend="dragEnd"
    @resizestart="resizeStart"
    @resizeend="resizeEnd"
    @rotateend="rotateEnd"
  >
    <span class="_activator" @mousedown="setActive" @dblclick="editText">
      <PublicationModule
        class="_moveableItem--content"
        :publimodule="publimodule"
        :can_edit="can_edit && is_active"
        :borderRadius="turnCMtoPX(publimodule.border_radius) || 0"
        :context="'page_by_page'"
        :number_of_max_medias="1"
        @duplicate="onDuplicateModule"
        @contentIsEdited="contentIsEdited"
        @contentIsNotEdited="contentIsNotEdited"
        :style="module_styles"
      />
    </span>
    <div class="_unlockBtn" v-if="can_edit">
      <button
        type="button"
        class="u-button u-button_orange u-button_small u-button_round u-colorBlack"
        v-if="publimodule.locked === true"
        @click="unlock()"
      >
        <sl-icon name="lock" />
      </button>
      <button
        type="button"
        class="u-button u-button_orange u-button_small u-button_round u-colorBlack"
        v-if="
          can_edit &&
          is_active &&
          !content_is_edited &&
          (!publimodule.locked || publimodule.locked === false)
        "
        @click="lock()"
      >
        <sl-icon name="unlock" />
        <!-- {{ $t("lock") }} -->
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
    scale: Number,
    is_active: Boolean,
  },
  components: {
    DDR,
    PublicationModule,
  },
  data() {
    return {
      transform: { x: 0, y: 0, width: 300, height: 300, rotation: 0 },
      component_key: 1,
      aspect_ratio: true,
      content_is_edited: false,
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
    console.log(`MoveableItem / mounted ${this.publimodule.$path}`);

    this.$eventHub.$on(`module.panTo.${this.publimodule.$path}`, this.panTo);
    this.$eventHub.$on(
      `module.enable_edit.${this.module_meta_filename}`,
      this.setActive
    );
  },
  beforeDestroy() {
    this.$eventHub.$off(`module.panTo.${this.publimodule.$path}`, this.panTo);
    this.$eventHub.$off(
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
    is_active() {
      if (!this.is_active) {
        this.contentIsNotEdited();
      }
    },
  },
  computed: {
    module_meta_filename() {
      return this.publimodule.$path.split("/").at(-1);
    },
    grid() {
      return [this.gridstep, this.gridstep];
    },
    module_z_index() {
      return `
        z-index: ${this.publimodule.z_index ? this.publimodule.z_index : 0}
      `;
    },
    module_styles() {
      return {
        "--set-fontSize": (this.publimodule.text_size || 100) + "%",
        "--set-margins":
          (this.turnCMtoPX(this.publimodule.margins) || 0) + "px",
        "--set-opacity": this.publimodule.opacity || 1,
        "--set-borderRadius":
          (this.turnCMtoPX(this.publimodule.border_radius) || 0) + "px",
        "--set-backgroundColor":
          this.publimodule.background_color || "transparent",
        "--set-outlineColor": this.publimodule.outline_color || "black",
        "--set-outlineWidth":
          (this.turnCMtoPX(this.publimodule.outline_width) || 0) + "px",
      };
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
      if (!num) return false;
      return this.roundToDec(num * this.magnification);
    },
    turnPXtoCM(num) {
      return this.roundToDec(num / this.magnification);
    },
    contentIsEdited($toolbar) {
      this.$eventHub.$emit(`module.text_editing_enabled`, $toolbar);
      this.content_is_edited = true;
    },
    contentIsNotEdited() {
      this.$eventHub.$emit(`module.text_editing_disabled`);
      this.content_is_edited = false;
    },
    roundToDec(num) {
      return Math.round((num + Number.EPSILON) * 100) / 100;
    },
    firstMedia(page_module) {
      if (!page_module) return false;
      try {
        const media_path = page_module.source_medias[0].path;
        return this.getSourceMedia({
          source_media_path: media_path,
        });
      } catch (err) {
        return false;
      }
    },

    dragEnd(event, transform) {
      if (JSON.stringify(transform) === JSON.stringify(this.transform))
        return false;
      if (
        this.turnPXtoCM(transform.x) === this.turnPXtoCM(this.transform.x) &&
        this.turnPXtoCM(transform.y) === this.turnPXtoCM(this.transform.y)
      )
        return false;

      // this.transform = transform;
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

      // this.transform = transform;
      this.updateTransform(transform);

      event.stopPropagation();
    },
    rotateEnd(event, transform) {
      if (JSON.stringify(transform) === JSON.stringify(this.transform))
        return false;

      // this.transform = transform;
      this.updateTransform(transform);

      event.stopPropagation();
    },
    async updateTransform(transform) {
      let new_meta = JSON.parse(JSON.stringify(transform));
      Object.keys(new_meta).map((k) => {
        if (new_meta[k] !== this.transform[k]) {
          if (["x", "y", "width", "height"].includes(k)) {
            new_meta[k] = this.turnPXtoCM(new_meta[k]);
            this.transform[k] = this.turnCMtoPX(new_meta[k]);
          } else {
            this.transform[k] = this.turnCMtoPX(this.turnPXtoCM(new_meta[k]));
          }
        } else {
          delete new_meta[k];
        }
      });

      await this.updateModuleMeta({
        new_meta,
      });
    },
    panTo() {
      this.$eventHub.$emit(`panzoom.panTo`, {
        x: this.transform.x,
        y: this.transform.y,
      });
    },
    setActive($event) {
      if (this.is_active) return false;

      if (this.content_is_edited) return $event.stopPropagation();
      if (!this.can_edit || this.is_active) return;
      if (this.publimodule.locked === true) return;

      this.$eventHub.$emit(`module.setActive`, this.publimodule.$path);
    },
    editText() {
      if (!this.is_active) return;

      const first_media = this.firstMedia(this.publimodule);
      if (!first_media || first_media.$type !== "text") return;

      const meta_filename = this.publimodule.$path.substring(
        this.publimodule.$path.lastIndexOf("/") + 1
      );
      this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
    },
    async lock() {
      const new_meta = {
        locked: true,
      };
      await this.updateModuleMeta({
        new_meta,
      });
      this.$eventHub.$emit(`module.setActive`, false);
    },
    async unlock() {
      const new_meta = {
        locked: false,
      };
      await this.updateModuleMeta({
        new_meta,
      });
      setTimeout(() => {
        this.setActive();
      }, 100);
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
      setTimeout(() => {
        this.$eventHub.$emit(`module.setActive`, path);
      }, 100);
    },
  },
};
</script>
<style lang="scss" scoped>
._moveableItem {
  // not all because of rotate
  // transition-property: left, top, right, bottom;
  // transition-duration: 0.15s;
  // transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);

  &.is--locked {
    pointer-events: none;
  }
  &.is--active {
    // z-index: 1500;
  }

  &.is--editable {
    ::v-deep .u-floatingFsButton {
      display: none;
    }
  }
  &.is--editable:not(.is--beingEdited):not(.is--locked) {
    cursor: pointer;
    cursor: -webkit-grab;
    cursor: -moz-grab;
    cursor: grab;
  }

  &.is--editable:hover:not(.is--locked) {
    outline: 2px dotted var(--c-noir);
  }

  &.is--beingEdited {
    outline: 2px dotted var(--c-orange) !important;

    ::v-deep {
      // ._collaborativeEditor .ql-editor {
      //   background: linear-gradient(rgba(255, 255, 255, 0.6) 55%, transparent);
      //   padding-bottom: 250px;
      // }
    }
  }

  &.yoyoo-ddr:not(.is--beingEdited) {
    &.active {
      border: none;
      outline: 2px dotted var(--c-orange) !important;

      ::v-deep {
        .bl,
        .br,
        .tl,
        .tr {
          background: var(--c-orange);
        }
      }
    }
    &.ddr-dragging {
      cursor: -webkit-grabbing;
      cursor: -moz-grabbing;
      cursor: dragging;

      // transition-property: left, top, right, bottom;
      // transition-duration: 0.05s;
      // transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
}

._moveableItem--content {
  height: 100%;
  padding: 0;
  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  ::v-deep ._content {
    height: 100%;
    overflow: hidden;

    ._moduleMosaic,
    ._mediaGrid,
    ._mediaGrid--item,
    ._mediaContent {
      height: 100%;
    }
    ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: var(--object-fit, cover);
      object-position: center;
    }
    .plyr__poster {
      background-size: var(--object-fit, cover);
      background-position: center;
      background-color: transparent;
    }
    .plyr--video,
    .plyr__video-wrapper {
      background-color: transparent;
    }

    .plyr__video-wrapper video {
      object-fit: var(--object-fit, cover);
      object-position: center;
    }
    .plyr--video {
      min-width: 50px;
    }
  }
}

// custom props
._moveableItem ::v-deep {
  ._publicationModule:not(.is--shape) {
    // border-radius: var(--set-borderRadius);
    // overflow: hidden;
    // outline-color: var(--set-outlineColor);
    // outline-width: var(--set-outlineWidth);
    // outline-style: solid;

    .ql-editor {
      font-size: var(--set-fontSize);
    }
    .ql-editor,
    ._mediaContent--image,
    ._mediaContent[data-filetype="video"],
    ._mediaContent[data-filetype="audio"] {
      padding: var(--set-margins);
      opacity: var(--set-opacity);

      border-radius: var(--set-borderRadius);
      overflow: hidden;

      background: var(--set-backgroundColor);
      border-color: var(--set-outlineColor);
      border-width: var(--set-outlineWidth);
      border-style: solid;
    }
  }

  ._publicationModule.is--shape {
    padding: var(--set-margins);
    opacity: var(--set-opacity);

    fill: var(--set-backgroundColor);
    stroke: var(--set-outlineColor);
    stroke-width: var(--set-outlineWidth);
  }
}

._moveableItem.is--editable:not(.is--beingEdited):not(.is--locked) ._activator {
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--c-orange_clair);
    opacity: 0;

    transition: opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }

  &:hover {
    &::after {
      opacity: 0.15;
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
  width: 100%;
  pointer-events: none;
  padding: calc(var(--spacing) / 2);

  display: flex;
  justify-content: flex-start;

  > * {
    // background: white;
    pointer-events: auto;
  }
}
</style>
