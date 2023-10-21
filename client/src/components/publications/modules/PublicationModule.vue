<template>
  <div class="_publicationModule" :data-type="module_type">
    <!-- @mouseleave.self="show_advanced_menu = false" -->
    <transition name="fade_fast" mode="out-in">
      <div
        class="_sideOptions"
        v-if="edit_mode && page_template !== 'page_by_page'"
      >
        <div class="_sideOptions--content">
          <div class="_options">
            <div class="">
              <button
                v-if="$listeners.hasOwnProperty('moveUp')"
                :disabled="
                  module_position === 'first' || module_position === 'alone'
                "
                type="button"
                class="u-button _sideBtns _moveBefore"
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
              <button
                v-if="$listeners.hasOwnProperty('moveDown')"
                type="button"
                :disabled="
                  module_position === 'last' || module_position === 'alone'
                "
                class="u-button _sideBtns _moveAfter"
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
            </div>
            <div class="_advanced_menu">
              <div>
                <template v-if="publimodule.module_type === 'text'">
                  {{ $t(`module.label.text`) }}
                </template>
                <select
                  v-else
                  :value="publimodule.module_type"
                  @change="changeModuleType"
                >
                  <option
                    v-for="module_type in ['mosaic', 'carousel', 'files']"
                    :key="module_type"
                    :value="module_type"
                  >
                    {{ $t(`module.label.${module_type}`) }}
                  </option>
                </select>
              </div>

              <!-- <sl-button
            variant="default"
            size="small"
            pill
            @click="changeModuleType"
          >
            {{ $t(`module.label.${publimodule.module_type}`) }}
          </sl-button> -->
              <div class="_buttonRow" v-if="false">
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
          <div class="_carto" v-if="is_asociated_to_map">
            <div class="_latlon">
              <div v-if="has_coordinates" class="u-sameRow">
                <div class="">
                  <DLabel :str="$t('latitude')" />
                  {{ publimodule.location.latitude }}°
                </div>
                <div class="">
                  <DLabel :str="$t('longitude')" />
                  {{ publimodule.location.longitude }}°
                </div>
              </div>
              <div v-else>
                {{ $t("no_coordinates") }}
              </div>
            </div>

            <button
              type="button"
              class="u-button u-button_red"
              @click.stop="repickLocation"
            >
              <b-icon icon="pin-map-fill" />
              <template v-if="!has_coordinates">
                {{ $t("place_on_map") }}
              </template>
              <template v-else>
                {{ $t("change_location") }}
              </template>
            </button>
          </div>
          <div class="">
            <EditBtn
              :btn_type="'check'"
              :label_position="'left'"
              @click="disableEdit"
            />
          </div>

          <div class="_repickNotice" v-if="is_repicking_location">
            <div class="_repickNotice--content">
              <div>
                {{ $t("click_on_map_to_repick_location_for_media") }}
              </div>
              <button
                type="button"
                class="u-buttonLink"
                @click="is_repicking_location = false"
              >
                {{ $t("cancel") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="is_asociated_to_map && has_coordinates">
      <button
        type="button"
        class="u-button u-button_bleuvert"
        @click.stop="showModuleOnMap"
      >
        <b-icon icon="pin-map-fill" />
        {{ pin_index }}
      </button>
    </div>

    <div class="_content" :style="media_styles">
      <div class="_floatingEditBtn" v-if="can_edit">
        <EditBtn
          v-if="!edit_mode"
          :label_position="'left'"
          @click="enableEdit"
        />
      </div>

      <MediasModule
        v-if="['mosaic', 'carousel', 'files'].includes(publimodule.module_type)"
        :publimodule="publimodule"
        :can_edit="edit_mode"
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
        :can_edit="edit_mode"
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

    <div class="_selectorIndicator" v-if="edit_mode" />
  </div>
</template>
<script>
import MediasModule from "@/components/publications/modules/MediasModule.vue";

export default {
  props: {
    publimodule: Object,
    module_position: String,
    module_being_edited: String,
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
    can_edit: Boolean,
  },
  components: {
    MediasModule,
  },
  inject: {
    $getMapOptions: {
      default: false,
    },
  },

  data() {
    return {
      show_advanced_menu: false,
      is_repicking_location: false,
    };
  },
  i18n: {
    messages: {
      fr: {
        no_coordinates: "Aucunes coordonnées disponibles",
        position_on_map: "Position sur la carte",
        place_on_map: "Positionner sur la carte",
        show_on_map: "Afficher sur la carte",
        change_location: "Changer la position",
        remove_pin: "Supprimer cette épingle",
        click_on_map_to_repick_location_for_media:
          "Cliquez sur la carte pour sélectionner une nouvelle position pour le média",
      },
    },
  },
  created() {},
  mounted() {
    this.$eventHub.$on(
      `module.enable_edit.${this.module_meta_filename}`,
      this.enableEdit
    );
    this.$eventHub.$on(
      `module.duplicate.${this.module_meta_filename}`,
      this.duplicateModule
    );
    this.$eventHub.$on(
      `module.remove.${this.module_meta_filename}`,
      this.removeModule
    );
    this.$eventHub.$on("publication.map.click", this.setRepickLocation);
    this.$eventHub.$on(
      `module.show.${this.module_meta_filename}`,
      this.scrollToModule
    );
  },
  beforeDestroy() {
    this.$eventHub.$off(
      `module.enable_edit.${this.module_meta_filename}`,
      this.enableEdit
    );
    this.$eventHub.$off(
      `module.duplicate.${this.module_meta_filename}`,
      this.duplicateModule
    );
    this.$eventHub.$off(
      `module.remove.${this.module_meta_filename}`,
      this.removeModule
    );
    this.$eventHub.$off("publication.map.click", this.setRepickLocation);
    this.$eventHub.$off(
      `module.show.${this.module_meta_filename}`,
      this.scrollToModule
    );
  },
  watch: {
    edit_mode() {
      debugger;
      if (this.$refs.textBloc)
        if (this.edit_mode)
          this.$nextTick(() => this.$refs.textBloc.enableEditor());
        else this.$refs.textBloc.disableEditor();

      if (!this.edit_mode) this.is_repicking_location = false;
    },
    is_active: {
      handler() {
        if (this.is_active) this.scrollToModule();
      },
      immediate: true,
    },
  },
  computed: {
    is_asociated_to_map() {
      return this.$getMapOptions;
    },
    is_active() {
      if (this.$getMapOptions)
        return this.$getMapOptions().opened_pin_path === this.publimodule.$path;
      return false;
    },
    pin_index() {
      if (this.$getMapOptions) {
        const current_pin = this.$getMapOptions().pins_infos.find(
          ({ path }) => path === this.publimodule.$path
        );
        if (current_pin) return current_pin.index;
      }
      return false;
    },
    has_coordinates() {
      return (
        this.publimodule.location?.latitude &&
        this.publimodule.location?.longitude
      );
    },

    edit_mode() {
      return this.module_being_edited === this.publimodule.$path;
    },
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
    repickLocation() {
      this.is_repicking_location = true;
    },
    showModuleOnMap() {
      this.$eventHub.$emit("publication.map.openPin", this.publimodule.$path);
    },
    async setRepickLocation({ longitude, latitude }) {
      if (!this.is_repicking_location) return;

      await this.updateMeta({
        location: {
          longitude,
          latitude,
        },
      }).catch((err) => {
        this.$alertify.delay(4000).error(err);
        throw err;
      });
      this.is_repicking_location = false;
    },
    enableEdit() {
      this.$emit("update:module_being_edited", this.publimodule.$path);
    },
    disableEdit() {
      this.$emit("update:module_being_edited", undefined);
    },
    scrollToModule() {
      this.$el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    },
    changeModuleType(event) {
      // const module_types = ["mosaic", "carousel", "files"];
      // const curr_module_type = this.publimodule.module_type;
      // const curr_index = module_types.findIndex(
      //   (mt) => mt === curr_module_type
      // );
      // const next_index = (curr_index + 1) % module_types.length;
      // const new_type = module_types[next_index];

      const new_type = event.target.value;

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
  // padding: 0 calc(var(--spacing) * 2);

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

._selectorIndicator {
  --highlight-margin: calc(var(--spacing) / -2);

  position: absolute;
  top: var(--highlight-margin);
  left: var(--highlight-margin);
  bottom: var(--highlight-margin);
  right: var(--highlight-margin);

  border: 2px solid var(--c-bleuvert);
  border-radius: 6px;
  pointer-events: none;
}

._sideOptions {
  // position: absolute;
  // top: 0;
  // height: 100%;
  // right: 100%;
  // z-index: 10000;
  // background: var(--active-color);
  // background: rgba(0, 0, 0, 0.01);

  position: absolute;
  bottom: 100%;
  z-index: 1000;
  padding: calc(var(--spacing) / 4);
  margin-bottom: calc(var(--spacing) / 2);
  border-radius: 16px;
  width: 100%;

  // pointer-events: none;

  // z-index: 100;
  transition: opacity 0.25s linear;

  &.is--pageByPage {
    display: none;
  }

  ._sideOptions--content {
    // max-width: 320px;
    width: 100%;
    margin: 0 auto;
    // background: var(--c-gris_clair);
    // border: 2px solid var(--c-gris);
    padding: calc(var(--spacing) / 4);
    // background: var(--panel-color);
    background: var(--active-color);
    // background: white;

    border: 2px solid var(--active-color);
    box-shadow: var(--panel-shadows);

    border-radius: 2px;

    display: flex;
    flex-flow: row wrap;
    gap: calc(var(--spacing) / 2);
    align-items: center;
    justify-content: space-between;

    > * {
      // background: white;
    }
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
  // position: absolute;
  // z-index: 1000;
  // left: 100%;
  // top: 50%;
  // transform: translate(0, -50%);

  // backdrop-filter: blur(5px);
  // background: rgba(255, 255, 255, 0.7);

  padding: calc(var(--spacing) / 2);
  // margin: 2px;
  // border-radius: 4px;

  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);

  select {
    // background-color: white;
  }

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
  display: flex;
  flex-flow: row nowrap;
}

._buttonRow {
  display: flex;
  // padding: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);
}

._floatingEditBtn {
  position: sticky;
  z-index: 101;
  height: 0;

  > * {
    position: absolute;
    top: 0;
    right: 0;
    margin: calc(var(--spacing) / 4);
  }
}

._repickNotice {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  backdrop-filter: blur(5px);
  background: rgba(231, 231, 231, 0.7);

  padding: calc(var(--spacing) / 2);

  display: flex;
  flex-flow: column nowrap;
}
._repickNotice--content {
  background: white;
  padding: calc(var(--spacing) / 2);
}
</style>
