<template>
  <div
    class="_publicationModule"
    :data-type="module_type"
    @mouseleave="show_advanced_menu = false"
  >
    <div
      class="_sideOptions"
      v-if="can_edit && page_template !== 'page_by_page'"
    >
      <span>
        <button
          v-if="
            $listeners.hasOwnProperty('moveUp') &&
            module_position !== 'first' &&
            module_position !== 'alone'
          "
          type="button"
          class="_sideBtns _moveBefore"
          @click="$emit('moveUp')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 168 168"
            style="transform: rotate(90deg)"
          >
            <path
              d="M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z"
              style="fill: currentColor"
            />
          </svg>
        </button>
      </span>
      <div class="_options">
        <button
          type="button"
          class="_sideBtns"
          :class="{
            'is--active': show_advanced_menu,
          }"
          @click.stop="show_advanced_menu = !show_advanced_menu"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="24"
            height="24"
            viewBox="0 0 48 48"
            xml:space="preserve"
            style="fill: currentColor"
          >
            <!-- <circle cx="12" cy="4" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="20" r="2" /> -->
            <circle cx="12" cy="24" r="4" />
            <circle cx="24" cy="24" r="4" />
            <circle cx="36" cy="24" r="4" />
          </svg>
        </button>
        <div class="_advanced_menu" v-if="show_advanced_menu">
          <sl-button
            variant="default"
            size="small"
            pill
            @click="changeModuleType"
          >
            {{ $t(`module.label.${publimodule.module_type}`) }}
          </sl-button>
          <div class="_buttonRow">
            <button
              type="button"
              class="u-button"
              :class="{
                'is--active': !publimodule.size || publimodule.size === 100,
              }"
              @click="updateMeta({ size: 100 })"
            >
              100%
            </button>
            <template v-for="size in [66.6, 50, 33.3]">
              <button
                :key="size"
                type="button"
                class="u-button"
                :class="{
                  'is--active': publimodule.size === size,
                }"
                @click="updateMeta({ size: size })"
              >
                {{ size }}%
              </button>
            </template>
          </div>

          <div
            class="_buttonRow"
            v-if="publimodule.size && publimodule.size !== 100"
          >
            <button
              type="button"
              class="u-button"
              :class="{
                'is--active':
                  !publimodule.align || publimodule.align === 'left',
              }"
              @click="updateMeta({ align: 'left' })"
            >
              <sl-icon name="align-start" />
            </button>
            <button
              type="button"
              class="u-button"
              :class="{
                'is--active': publimodule.align === 'center',
              }"
              @click="updateMeta({ align: 'center' })"
            >
              <sl-icon name="align-center" />
            </button>
            <button
              type="button"
              class="u-button"
              :class="{
                'is--active': publimodule.align === 'right',
              }"
              @click="updateMeta({ align: 'right' })"
            >
              <sl-icon name="align-end" />
            </button>
          </div>

          <div class="_buttonRow">
            <button type="button" class="u-button" @click="duplicateModule">
              {{ $t("duplicate") }}
            </button>
            <button type="button" class="u-button" @click="removeModule">
              {{ $t("remove") }}
            </button>
          </div>
        </div>
      </div>
      <span>
        <button
          v-if="
            $listeners.hasOwnProperty('moveDown') &&
            module_position !== 'last' &&
            module_position !== 'alone'
          "
          type="button"
          class="_sideBtns _moveAfter"
          @click="$emit('moveDown')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 168 168"
            style="transform: rotate(90deg)"
          >
            <path
              d="M78.31,117l14.07-15.31a65.3,65.3,0,0,1,6.15-6.15,47.52,47.52,0,0,1,6.29-4.37H34.17V75.29h70.65a39.1,39.1,0,0,1-6.08-4.37q-2.8-2.46-6.36-6.15L78.31,49.46l13-11.07L131.6,83.21,91.29,128Z"
              style="fill: currentColor"
            />
          </svg>
        </button>
      </span>
    </div>

    <div class="_content" :style="media_styles">
      <MediasModule
        v-if="['mosaic', 'carousel', 'files'].includes(publimodule.module_type)"
        :publimodule="publimodule"
        :can_edit="can_edit"
        :context="context"
        :page_template="page_template"
        :number_of_max_medias="number_of_max_medias"
        :show_fs_button="show_fs_button"
        @updateMeta="updateMeta"
        @remove="removeModule"
      />
      <CollaborativeEditor2
        v-else-if="publimodule.module_type === 'text' && first_media"
        ref="textBloc"
        :path="first_media.$path"
        :content="first_media.$content"
        :scrollingContainer="$el"
        :line_selected="false"
        :can_edit="can_edit"
        @lineClicked="$emit('lineClicked', $event)"
        @contentIsEdited="$emit('contentIsEdited', $event)"
        @contentIsNotEdited="$emit('contentIsNotEdited', $event)"
      />
      <template v-else-if="module_type === 'shape'">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            v-if="publimodule.module_type === 'ellipsis'"
            cx="50"
            cy="50"
            :r="50 - (publimodule.outline_width * magnification) / 8"
            vector-effect="non-scaling-stroke"
          />
          <rect
            v-else-if="publimodule.module_type === 'rectangle'"
            :x="(publimodule.outline_width * magnification) / 4"
            :y="(publimodule.outline_width * magnification) / 4"
            :width="100 - (publimodule.outline_width * magnification) / 2"
            :height="100 - (publimodule.outline_width * magnification) / 2"
            vector-effect="non-scaling-stroke"
            :rx="border_radius.x"
            :ry="border_radius.y"
          />
          <g v-else-if="publimodule.module_type === 'line'">
            <rect
              width="100"
              height="100"
              vector-effect="non-scaling-stroke"
              stroke="none"
              :rx="border_radius.x"
              :ry="border_radius.y"
            />
            <line
              :x1="(publimodule.outline_width * magnification) / 4 || 0"
              y1="50"
              :x2="100 - ((publimodule.outline_width * magnification) / 4 || 0)"
              y2="50"
              vector-effect="non-scaling-stroke"
            />
          </g>
          <g v-else-if="publimodule.module_type === 'arrow'">
            <rect
              width="100"
              height="100"
              vector-effect="non-scaling-stroke"
              stroke="none"
              :rx="border_radius.x"
              :ry="border_radius.y"
            />
            <line
              :x1="(publimodule.outline_width * magnification) / 4 || 0"
              y1="50"
              :x2="100 - ((publimodule.outline_width * magnification) / 4 || 0)"
              y2="50"
              vector-effect="non-scaling-stroke"
            />

            <g
              :transform="`
                translate(${
                  100 - ((publimodule.outline_width * magnification) / 4 || 0)
                }, 50)`"
              preserveAspectRatio
            >
              <line
                x1="0"
                y1="0"
                x2="-10"
                y2="-10"
                vector-effect="non-scaling-stroke"
              />

              <line
                x1="0"
                y1="0"
                x2="-10"
                y2="10"
                vector-effect="non-scaling-stroke"
              />
            </g>
          </g>
        </svg>
      </template>
      <template v-else-if="publimodule.module_type === 'free_drawing'">
        <!-- <MediaFreeDrawing
          :inline_edit_mode="inline_edit_mode"
          :slugPubliName="slugPubliName"
          :media="media"
          :mediaSize="mediaSize"
        /> -->
      </template>

      <small v-else>{{ $t("nothing_to_show") }}</small>
    </div>
  </div>
</template>
<script>
import MediasModule from "@/components/publications/modules/MediasModule.vue";

export default {
  props: {
    publimodule: Object,
    module_position: String,
    can_edit: Boolean,
    magnification: Number,
    border_radius: {
      type: Object,
      default: () => ({
        x: 0,
        y: 0,
      }),
    },
    context: String,
    page_template: String,
    number_of_max_medias: {
      type: [Boolean, Number],
      default: false,
    },
  },
  components: {
    MediasModule,
  },
  data() {
    return {
      show_advanced_menu: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on(
      `module.enable_edit.${this.module_meta_filename}`,
      this.enableEditForText
    );
    this.$eventHub.$on(
      `module.duplicate.${this.module_meta_filename}`,
      this.duplicateModule
    );
    this.$eventHub.$on(
      `module.remove.${this.module_meta_filename}`,
      this.removeModule
    );
  },
  beforeDestroy() {
    this.$eventHub.$off(
      `module.enable_edit.${this.module_meta_filename}`,
      this.enableEditForText
    );
    this.$eventHub.$off(
      `module.duplicate.${this.module_meta_filename}`,
      this.duplicateModule
    );
    this.$eventHub.$off(
      `module.remove.${this.module_meta_filename}`,
      this.removeModule
    );
  },
  watch: {},
  computed: {
    module_meta_filename() {
      return this.publimodule.$path.split("/").at(-1);
    },

    module_type() {
      if (
        ["ellipsis", "rectangle", "line", "arrow"].includes(
          this.publimodule.module_type
        )
      )
        return "shape";
      return this.publimodule.module_type;
    },
    show_fs_button() {
      if (this.page_template === "page_by_page")
        return this.publimodule.show_fs_button === true;
      return true;
    },
    first_media() {
      if (
        !this.publimodule.source_medias ||
        this.publimodule.source_medias.length === 0
      )
        return false;
      const source_media = this.publimodule.source_medias[0];
      if (source_media) {
        const publication_path = this.getParent(this.publimodule.$path);
        return this.getSourceMedia({
          source_media,
          folder_path: publication_path,
        });
      }
      return false;
    },
    media_styles() {
      let margin_left = 0;
      if (this.publimodule.align === "center")
        if (this.publimodule.size === 66.6) margin_left = 16.6;
        else if (this.publimodule.size === 50) margin_left = 25;
        else if (this.publimodule.size === 33.3) margin_left = 33.3;
      if (this.publimodule.align === "right")
        if (this.publimodule.size === 66.6) margin_left = 33.3;
        else if (this.publimodule.size === 50) margin_left = 50;
        else if (this.publimodule.size === 33.3) margin_left = 66.6;
      return {
        "--module-width": this.publimodule.size || 100,
        "--module-margin-left": margin_left,
      };
    },
  },
  methods: {
    async updateMeta(new_meta) {
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
    enableEditForText() {
      // this.$el.scrollIntoView({
      //   behavior: "smooth",
      //   block: "center",
      //   inline: "nearest",
      // });
      this.$nextTick(() => {
        if (this.$refs.textBloc) this.$refs.textBloc.enableEditor();
      });
    },
    changeModuleType() {
      const module_types = ["mosaic", "carousel", "files"];
      const curr_module_type = this.publimodule.module_type;
      const curr_index = module_types.findIndex(
        (mt) => mt === curr_module_type
      );
      const next_index = (curr_index + 1) % module_types.length;
      const new_type = module_types[next_index];

      this.updateMeta({ module_type: new_type });
    },
    async duplicateModule() {
      let addtl_meta_to_module = {};
      if (this.page_template === "page_by_page") {
        addtl_meta_to_module.x = (this.publimodule.x || 0) + 10;
        addtl_meta_to_module.y = (this.publimodule.y || 0) + 10;
      }

      const meta_filename = await this.duplicateModuleWithSourceMedias({
        og_module: this.publimodule,
        addtl_meta_to_module,
      });
      this.$emit("duplicate", meta_filename);
    },
    async removeModule() {
      // todo  remove source medias that are part publications
      // todo also empty sharedb path, since $path can be retaken
      //       try {
      //   for (let sm of file.source_medias) {
      //     if (sm.path.includes("/publications/")) {
      //       // this media is specific to publications, lets remove it
      //       await this.$api.deleteItem({
      //         path: sm.path,
      //       });
      //     }
      //   }
      // } catch (err) {
      //   this.$alertify.delay(4000).error(err);
      //   throw err;
      // }
      await this.$api
        .deleteItem({
          path: this.publimodule.$path,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      this.$emit("remove");
    },
  },
};
</script>
<style lang="scss" scoped>
._publicationModule {
  position: relative;
  padding: 0 calc(var(--spacing) * 2);

  &[data-type="shape"] {
    ._content,
    svg {
      overflow: visible;
      stroke-linejoin: arcs;
      stroke-linecap: round;
    }
    svg {
      width: 100%;
      height: 100%;

      rect {
        transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
      }
    }
  }
  ._content {
    width: calc(var(--module-width) * 1%);
    margin-left: calc(var(--module-margin-left) * 1%);
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }
}

._sideOptions {
  position: absolute;
  top: 0;
  height: 100%;
  right: 100%;
  // background: var(--active-color);
  background: rgba(0, 0, 0, 0.01);
  background: var(--c-gris_clair);

  // pointer-events: none;

  // z-index: 100;

  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;

  --side-width: 24px;
  width: var(--side-width);
  border-radius: calc(var(--side-width) / 2);

  opacity: 0.2;

  transition: opacity 0.25s linear;

  ._publicationModule:hover &,
  ._publicationModule:focus-visible & {
    opacity: 1;
  }

  &.is--pageByPage {
    display: none;
    // position: absolute;
    // right: 0;
    // background: transparent;
    // top: 0;
    // height: auto;

    // margin: calc(var(--spacing) / 2);

    // z-index: 10;

    // ._sideBtns {
    //   background: white;
    // }
  }

  > * {
    pointer-events: auto;
  }
}

._sideBtns {
  display: block;
  width: var(--side-width);
  height: var(--side-width);
  padding: 0;
  border-radius: calc(var(--side-width) / 2);
  background: transparent;

  &:hover,
  &:focus {
    background: rgba(0, 0, 0, 0.1);
  }
}

._advanced_menu {
  position: absolute;
  z-index: 1000;
  left: 100%;
  top: 50%;
  transform: translate(0, -50%);

  background: white;

  backdrop-filter: blur(5px);
  background: rgba(231, 231, 231, 0.7);

  padding: calc(var(--spacing) / 2);
  margin: 2px;
  border-radius: 4px;

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);

  // border: 2px solid var(--c-gris);
}

._menu {
  width: 100%;

  padding: calc(var(--spacing) / 2);

  display: flex;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 4);

  &.is--overlaid {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
  }
}

._options {
  position: relative;
}

._buttonRow {
  display: flex;
  // padding: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);
}
</style>
