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
    :handlerSize="18"
    :grid="grid"
    :id="publimodule.$path"
    :zoom="scale"
    :style="module_z_index"
    @dragstart="dragStart"
    @drag="onDrag"
    @dragend="dragEnd"
    @resizestart="resizeStart"
    @resizeend="resizeEnd"
    @rotateend="rotateEnd"
  >
    <span
      class="_activator panzoom-exclude"
      @mousedown="setActive"
      @dblclick="dblClick"
    >
      <PublicationModule
        class="_moveableItem--content"
        :publimodule="publimodule"
        :border_radius="scaled_border_radius"
        :context="context"
        :page_template="'page_by_page'"
        :number_of_max_medias="1"
        :magnification="magnification"
        :can_edit="can_edit && is_active"
        :module_being_edited="module_being_edited"
        @update:module_being_edited="
          $emit('update:module_being_edited', $event)
        "
        @duplicate="onDuplicateModule"
        @contentIsEdited="contentIsEdited"
        @contentIsNotEdited="contentIsNotEdited"
        :style="module_styles"
      />
      <div class="_textOverflowNotice" v-if="can_edit && text_overflows">
        <button
          type="button"
          class="u-button u-button_icon u-button_red u-button_small"
          @click="setHeightToTextBloc"
        >
          <b-icon icon="text-paragraph" />
        </button>
      </div>
    </span>
    <div class="_bottomLeftButton">
      <template v-if="can_edit">
        <button
          type="button"
          class="u-button u-button_orange u-button_icon u-button_small u-colorBlack"
          v-if="publimodule.locked === true"
          @click.stop="unlock()"
          @touchstart.stop="unlock()"
        >
          <b-icon icon="lock" />
        </button>
        <button
          type="button"
          class="u-button u-button_orange u-button_icon u-button_small u-colorBlack"
          v-if="
            can_edit &&
            is_active &&
            !content_is_edited &&
            (!publimodule.locked || publimodule.locked === false)
          "
          @click.stop="lock()"
          @touchstart.stop="unlock()"
        >
          <b-icon icon="unlock" />
          <!-- {{ $t("lock") }} -->
        </button>
      </template>

      <button
        type="button"
        class="u-button u-button_orange u-button_small u-colorBlack"
        v-if="on_click_action"
        @click.stop="onClickAction()"
        @touchstart.stop="onClickAction()"
      >
        <b-icon icon="link" />
        <template
          v-if="on_click_action.type === 'page' && on_click_action.page_id"
        >
          {{ $t("page") }}
        </template>
        <template
          v-else-if="on_click_action.type === 'url' && on_click_action.url"
        >
          www
        </template>
      </button>
    </div>

    <button
      v-if="on_click_action && !can_edit"
      type="button"
      class="_clickZone"
      :title="
        on_click_action.type === 'page'
          ? $t('navigate_to_page')
          : $t('open_webpage')
      "
      @click="onClickAction()"
    />

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
    context: String,
    publimodule: Object,
    can_edit: Boolean,
    magnification: Number,
    gridstep: Number,
    scale: Number,
    module_being_edited: String,
    is_active: Boolean,
  },
  components: {
    DDR,
    PublicationModule,
  },
  data() {
    return {
      transform: { x: 0, y: 0, width: 300, height: 300, rotation: 0 },
      text_overflows: false,
      component_key: 1,
      aspect_ratio: true,
      content_is_edited: false,
    };
  },
  created() {
    // if (this.publimodule.x)
    this.setTransformFromPubli();
    // todo get ratio from linked image, set initial transform based on that

    this.setNewComponentKey();
  },
  mounted() {
    // console.log(`MoveableItem / mounted ${this.publimodule.$path}`);

    this.$eventHub.$on(`module.panTo.${this.module_meta_filename}`, this.panTo);
    this.$eventHub.$on(
      `module.enable_edit.${this.module_meta_filename}`,
      this.setActive
    );
  },
  beforeDestroy() {
    this.$eventHub.$off(
      `module.panTo.${this.module_meta_filename}`,
      this.panTo
    );
    this.$eventHub.$off(
      `module.enable_edit.${this.module_meta_filename}`,
      this.setActive
    );
  },
  watch: {
    transform: {
      handler() {
        if (this.first_media?.$type === "text") {
          this.detectOverflowText();
        }
      },
      deep: true,
    },
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

        if (
          this.first_media?.$type &&
          ["pdf", "embed", "url", "audio", "video"].includes(
            this.first_media.$type
          )
        )
          this.setNewComponentKey();
      } else {
        if (this.first_media.$type !== "text") {
          this.$emit("update:module_being_edited", this.publimodule.$path);
        }
      }
    },
    "first_media.$content": {
      handler() {
        if (this.first_media?.$type === "text") {
          this.detectOverflowText();
        }
      },
    },
  },
  computed: {
    first_media() {
      return this.firstMedia(this.publimodule);
    },
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
    on_click_action() {
      if (
        this.publimodule.on_click?.type === "page" &&
        this.publimodule.on_click?.page_id
      )
        return { type: "page", page_id: this.publimodule.on_click.page_id };
      else if (
        this.publimodule.on_click?.type === "url" &&
        this.publimodule.on_click?.url
      )
        return { type: "url", url: this.publimodule.on_click.url };
      else return false;
    },
    scaled_border_radius() {
      if (!this.publimodule.border_radius) return;

      const x =
        this.turnCMtoPX(this.publimodule.border_radius) /
        (this.turnCMtoPX(this.publimodule.width) / 100);
      const y =
        this.turnCMtoPX(this.publimodule.border_radius) /
        (this.turnCMtoPX(this.publimodule.height) / 100);

      return { x, y };
    },
    module_styles() {
      return {
        // "--set-fontSize": (this.publimodule.text_size || 100) + "%",
        "--set-margins":
          (this.turnCMtoPX(this.publimodule.margins) || 0) + "px",
        "--set-opacity": this.publimodule.opacity || 1,
        "--set-borderRadius":
          (this.turnCMtoPX(this.publimodule.border_radius) || 0) + "px",
        "--set-dropShadow": this.publimodule.drop_shadow,
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
    },
    detectOverflowText() {
      const bloc_height = this.transform.height;
      const text_height = this.$el.querySelector(".ql-editor").offsetHeight;
      this.text_overflows = text_height > bloc_height;
    },
    async setHeightToTextBloc() {
      const text_height = this.turnPXtoCM(
        this.$el.querySelector(".ql-editor").offsetHeight + 2
      );
      await this.updateModuleMeta({
        new_meta: { height: text_height },
      });
    },
    turnCMtoPX(num) {
      if (!num) return false;
      return this.roundToDec(num * this.magnification);
    },
    turnPXtoCM(num) {
      return this.roundToDec(num / this.magnification);
    },
    contentIsEdited(event) {
      this.$eventHub.$emit(`module.text_editing_enabled`, event);
      this.content_is_edited = true;
    },
    contentIsNotEdited() {
      this.$eventHub.$emit(`module.text_editing_disabled`);
      this.$emit("update:module_being_edited", undefined);
      this.content_is_edited = false;
    },

    dragStart() {
      // console.log("dragStart");
      // this.$eventHub.$emit(`module.dragStart`);
    },
    onDrag(event) {
      // console.log("ondrag");
      // todo calculate deltaX with start, propagate to other active modules
      // see https://github.com/zuimeiaj/yoyoo-ddr/blob/edf46aafd86654ab315cfa5b3fc41d68bb7c0273/src/examples/vseditor/plugins/plugin-selection.vue#L120
      // this.$eventHub.$emit(`module.onDrag`);
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
    onClickAction() {
      if (this.on_click_action?.type === "page") {
        this.$eventHub.$emit(
          "publication.togglePage",
          this.on_click_action.page_id
        );
      } else if (this.on_click_action?.type === "url") {
        window.open(this.on_click_action.url, "_blank");
      }
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
    async dblClick() {
      if (!this.is_active) return;

      if (!this.first_media) return;

      if (this.first_media.$type === "text") this.editText();
      else {
        // resize height to match ratio
        const media_ratio = this.first_media.$infos?.ratio;
        const height = this.publimodule.width * media_ratio;
        await this.updateModuleMeta({
          new_meta: { height },
        });
      }
    },
    editText() {
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

  &.is--locked.is--editable {
    pointer-events: none;
  }
  &.is--active {
    // z-index: 1500;
  }

  &.is--editable {
    // ::v-deep .u-floatingFsButton {
    //   display: none;
    // }
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

  &.yoyoo-ddr {
    .resize-handler,
    .rotate-handler {
      transition: 0.2s cubic-bezier(0.19, 1, 0.22, 1);
    }

    &:not(.is--beingEdited) {
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
}

._moveableItem--content {
  height: 100%;
  padding: 0;
  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  ::v-deep ._content {
    height: 100%;
    // disabled to see caption
    // overflow: hidden;

    ._mediasModule {
      height: 100%;
      // necessary for box-shadows to be visible in page by page
      overflow: visible;
    }

    ._mediaGrid,
    ._mediaGrid--item {
      height: 100%;
    }

    ._mediaGrid ._mediaContent {
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
  ._publicationModule[data-type="mosaic"] {
    ._content > ._collaborativeEditor .ql-editor,
    ._mediaContent--image,
    ._mediaContent[data-filetype="video"],
    ._mediaContent[data-filetype="url"],
    ._mediaContent[data-filetype="pdf"],
    ._mediaContent[data-filetype="other"],
    ._mediaContent[data-filetype="audio"] {
      padding: var(--set-margins);
      opacity: var(--set-opacity);
      aspect-ratio: unset;

      border-radius: var(--set-borderRadius);

      filter: drop-shadow(0px 4px 20px rgba(0, 0, 0, var(--set-dropShadow, 0)));
      overflow: hidden;

      background: var(--set-backgroundColor);
      border-color: var(--set-outlineColor);
      border-width: var(--set-outlineWidth);
      border-style: solid;
    }

    ._captionField {
      pointer-events: none;
    }

    ._mediaContent--iframe--content {
      resize: none;
    }
  }
  ._publicationModule[data-type="files"],
  ._publicationModule[data-type="carousel"],
  ._publicationModule[data-type="text"] {
    padding: var(--set-margins);
    opacity: var(--set-opacity);
    aspect-ratio: unset;

    border-radius: var(--set-borderRadius);
    filter: drop-shadow(0px 4px 20px rgba(0, 0, 0, var(--set-dropShadow, 0)));

    overflow: hidden;

    background: var(--set-backgroundColor);
    border-color: var(--set-outlineColor);
    border-width: var(--set-outlineWidth);
    border-style: solid;
  }

  ._publicationModule[data-type="text"] {
    // .ql-tooltip {
    //   position: fixed;
    //   width: 320px !important;
    // }

    > ._content > ._floatingEditBtn {
      display: none;
    }

    .ql-editor {
      padding: 0;
    }
    ._toolbarAndEditorContainer {
      background: transparent;
    }
  }

  ._publicationModule[data-type="shape"] {
    padding: var(--set-margins);
    opacity: var(--set-opacity);
    filter: drop-shadow(0px 4px 20px rgba(0, 0, 0, var(--set-dropShadow, 0)));

    fill: var(--set-backgroundColor);
    stroke: var(--set-outlineColor);
    stroke-width: var(--set-outlineWidth);
  }
}

._moveableItem:not(.ddr-dragging):not(.ddr-rotating) {
  // not doing anything because of component_key, which makes sure that items move when their props change
  // when another user is editing the same item
  // transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
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
    pointer-events: none;

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

._bottomLeftButton {
  position: absolute;
  bottom: 0;
  left: 0;
  pointer-events: none;
  padding: calc(var(--spacing) / 2);

  display: flex;
  justify-content: flex-start;
  gap: calc(var(--spacing) / 2);

  > * {
    // background: white;
    pointer-events: auto;
    cursor: pointer;
  }
}

._textOverflowNotice {
  position: absolute;
  left: 0;
  width: 100%;
  padding-left: calc(var(--spacing) * 3);
  bottom: calc(var(--spacing) / -1);
  z-index: 1;
  pointer-events: none;

  button {
    // border: 1px solid black;
    pointer-events: auto;
  }
}

._clickZone {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--c-orange_clair);
  opacity: 0;

  transition: opacity 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus-visible {
    opacity: 0.1;
  }
}
</style>
