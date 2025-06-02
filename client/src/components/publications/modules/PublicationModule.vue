<template>
  <div
    class="_publicationModule"
    :data-type="module_type"
    @click="preventClickTraversing"
  >
    <transition name="showOptions" mode="out-in" appear>
      <div
        class="_sideOptions"
        v-if="edit_mode && page_template !== 'page_by_page'"
      >
        <div class="_sideOptions--content">
          <div class="_arrows">
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

          <div class="_options">
            <div class="_advanced_menu">
              <div>
                <select
                  :value="publimodule.module_type"
                  @change="changeModuleType"
                  :disabled="available_module_types.length <= 1"
                >
                  <option
                    v-for="module_type in available_module_types"
                    :key="module_type"
                    :value="module_type"
                  >
                    {{ $t(`module.label.${module_type}`) }}
                  </option>
                </select>
              </div>
              <fieldset class="_buttonRow">
                <button
                  type="button"
                  class="u-button u-button_verysmall u-button_bleuvert"
                  @click="show_instructions_modal = !show_instructions_modal"
                >
                  <b-icon
                    :icon="
                      !show_instructions_modal
                        ? 'info-circle'
                        : 'info-circle-fill'
                    "
                    :class="{
                      'is--active': show_instructions_modal,
                    }"
                  />
                </button>
                <BaseModal2
                  v-if="show_instructions_modal"
                  :title="$t('text_image_layout')"
                  @close="show_instructions_modal = false"
                >
                  <p>
                    {{ $t("width_alignment_grid_only_non_mobile") }}
                  </p>
                </BaseModal2>
                <button
                  v-for="size in [100, 66.6, 50, 33.3]"
                  :key="size"
                  type="button"
                  class="u-button u-button_verysmall u-button_bleuvert _sizes"
                  :class="{
                    'is--active':
                      (!publimodule.size && size === 100) ||
                      publimodule.size === size,
                  }"
                  @click="updateMeta({ size: size })"
                >
                  {{ size }}%
                </button>

                <template v-if="publimodule.size && publimodule.size !== 100">
                  <button
                    v-for="align in ['left', 'center', 'right']"
                    :key="align"
                    type="button"
                    class="u-button u-button_small u-button_bleuvert"
                    :class="{
                      'is--active':
                        (!publimodule.align && align === 'left') ||
                        publimodule.align === align,
                    }"
                    @click="updateMeta({ align: align })"
                  >
                    <b-icon v-if="align === 'left'" icon="align-start" />
                    <b-icon v-if="align === 'center'" icon="align-center" />
                    <b-icon v-if="align === 'right'" icon="align-end" />
                  </button>
                </template>
              </fieldset>
            </div>
            <div class="_carto" v-if="is_associated_to_map">
              <div class="_latlon" v-if="false">
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
              <!-- <div class="u-instructions" v-if="has_coordinates">
                {{ $t("placed_on_map") }}
              </div> -->
              <div class="">
                <button
                  type="button"
                  class="u-button u-button_red u-button_small"
                  @click.stop="repickLocation"
                >
                  <template v-if="!has_coordinates">
                    <b-icon icon="pin-map" />
                    {{ $t("place_on_map") }}
                  </template>
                  <template v-else>
                    <b-icon icon="pin-map-fill" />
                    {{ $t("change_location") }}
                  </template>
                </button>
              </div>
              <div class="" v-if="has_coordinates">
                <SelectField2
                  :value="publimodule.zoom_level"
                  :options="zoom_level_options"
                  :can_edit="can_edit"
                  :hide_validation="true"
                  :size="'small'"
                  @change="
                    updateMeta({
                      zoom_level: $event,
                    })
                  "
                />

                <!-- <select
                  :value="publimodule.zoom_level"
                  :disabled="!can_edit"
                  @change="updateMeta({ zoom_level: $event })"
                >
                  <option
                    v-for="option in zoom_level_options"
                    :key="option.key"
                    :value="option.key"
                    v-text="option.text || option.key"
                  />
                </select> -->
              </div>
              <div class="" v-if="has_coordinates">
                <button type="button" class="u-buttonLink" @click="eraseCoords">
                  <b-icon icon="x-circle" />
                  {{ $t("erase") }}
                </button>
              </div>
            </div>

            <DropDown :show_label="false" :right="true">
              <button
                type="button"
                class="u-buttonLink"
                @click="duplicateModule"
              >
                <b-icon icon="file-plus" />
                {{ $t("duplicate") }}
              </button>

              <button
                type="button"
                class="u-buttonLink"
                @click="$emit('changeSectionForModule')"
              >
                <b-icon icon="arrow-left-right" />
                {{ $t("change_section") }}
              </button>

              <RemoveMenu
                v-if="can_edit"
                :show_button_text="true"
                @remove="removeModule"
              />
            </DropDown>
          </div>

          <div class="_saveBtn">
            <EditBtn
              :btn_type="'check'"
              :label_position="'left'"
              @click="disableEdit"
            />
          </div>
          <div class="_repickNotice" v-if="is_repicking_location">
            <div class="_repickNotice--content">
              <div>
                {{ $t("click_on_map_to_repick_location") }}
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

    <div class="_content" :style="media_styles">
      <div ref="sentinel" />
      <button
        type="button"
        class="u-button _pinButton"
        v-if="is_associated_to_map && has_coordinates"
        ref="pinButton"
        :style="`--pin-color: ${pin_options ? pin_options.color : ''}`"
        :class="{
          'is--active': is_active_on_map,
        }"
        @click.stop="pinButtonClick"
      >
        <!-- v-if="pin_options.pin_preview === 'icon'" -->
        <img :src="pin_options.pin_preview_src" />
        <!-- <img :src="this.$root.publicPath + 'maps/pin.svg'" /> -->
        <!-- <b-icon icon="pin-map-fill" /> -->
        <!-- <span class="_index">
          {{ pin_options.index }}
        </span> -->
      </button>

      <div
        class="_floatingEditBtn"
        v-if="
          can_edit &&
          (page_template !== 'page_by_page' ||
            publimodule.module_type === 'text')
        "
      >
        <span @click.stop="enableEdit" @touchstart.stop="enableEdit">
          <EditBtn v-if="!edit_mode" :label_position="'left'" />
        </span>
      </div>

      <MediasModule
        v-if="['mosaic', 'carousel', 'files'].includes(publimodule.module_type)"
        :publimodule="publimodule"
        :edit_mode="edit_mode"
        :can_edit="can_edit"
        :context="context"
        :page_template="page_template"
        :number_of_max_medias="number_of_max_medias"
        :show_fs_button="show_fs_button"
        @updateMeta="updateMeta"
        @remove="removeModule"
      />
      <!-- // specific to page by page -->
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

      <small v-else>{{ $t("nothing_to_show") }}</small>

      <div class="_captionField" v-if="show_caption">
        <CollaborativeEditor2
          class="_caption"
          :label="
            edit_mode &&
            !publimodule.caption &&
            page_template !== 'page_by_page'
              ? $t('add_caption')
              : undefined
          "
          :field_to_edit="'caption'"
          :content="publimodule.caption"
          :path="publimodule.$path"
          :custom_formats="['bold', 'italic', 'link']"
          :is_collaborative="false"
          :can_edit="page_template !== 'page_by_page' ? can_edit : false"
        />

        <div
          class=""
          v-if="
            edit_mode &&
            first_media &&
            first_media.caption &&
            !publimodule.caption &&
            page_template !== 'page_by_page'
          "
        >
          <div class="u-instructions">
            {{ $t("copy_first_media_caption") }}
          </div>
          <button
            type="button"
            @click="
              updateMeta({
                caption: first_media.caption,
              })
            "
          >
            {{ first_media.caption }}
          </button>
        </div>
      </div>
    </div>

    <div
      class="_selectorIndicator"
      v-if="edit_mode && page_template !== 'page_by_page'"
    />
  </div>
</template>
<script>
import BaseModal2 from "@/adc-core/modals/BaseModal2.vue";
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
      is_repicking_location: false,
      observer: undefined,
      show_instructions_modal: false,
    };
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
    this.$eventHub.$on(
      `publication.story.scrollTo.${this.publimodule.$path}`,
      this.scrollToModule
    );
    this.$eventHub.$on("publication.map.click", this.setRepickLocation);

    this.startIntersectionObserver();
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
    this.$eventHub.$off(
      `publication.story.scrollTo.${this.publimodule.$path}`,
      this.scrollToModule
    );
    this.$eventHub.$off("publication.map.click", this.setRepickLocation);
    this.endIntersectionObserver();
  },
  watch: {
    edit_mode() {
      // if text bloc in text bloc module
      if (this.$refs.textBloc)
        if (this.edit_mode)
          this.$nextTick(() => this.$refs.textBloc.enableEditor());
        else this.$refs.textBloc.disableEditor();
      else {
        // this.$nextTick(() => {
        //   const edit_btn = this.$el.querySelector(
        //     "._collaborativeEditor ._floatingEditBtn ._editBtn"
        //   );
        //   if (edit_btn) edit_btn.click();
        // });
      }
      if (!this.edit_mode) this.is_repicking_location = false;
    },
  },
  computed: {
    is_associated_to_map() {
      return this.$getMapOptions;
    },
    is_active_on_map() {
      if (this.$getMapOptions)
        return this.$getMapOptions().opened_pin_path === this.publimodule.$path;
      return false;
    },
    zoom_level_options() {
      const max = 20;
      return new Array(max).fill(0).map((e, i) => {
        if (i === 0)
          return {
            key: "",
            text: this.$t("dont_zoom"),
          };
        else if (i === 1)
          return {
            key: i,
            text: i + " (" + this.$t("very_far") + ")",
          };
        else if (i === max - 1)
          return {
            key: i,
            text: i + " (" + this.$t("very_close") + ")",
          };
        else
          return {
            key: i,
          };
      });
    },

    available_module_types() {
      // a text module can become something else but not the other way around
      if (this.publimodule.module_type === "text")
        return ["text", "mosaic", "carousel", "files"];
      return ["mosaic", "carousel", "files"];
    },
    pin_options() {
      if (this.$getMapOptions) {
        return this.$getMapOptions().pins_infos.find(
          ({ path }) => path === this.publimodule.$path
        );
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
    show_caption() {
      if (this.module_type === "text") return false;
      if (this.module_type === "shape") return false;
      if (
        this.publimodule.source_medias.length === 1 &&
        this.publimodule.source_medias[0].meta_filename?.startsWith("text-")
      )
        return false;
      if (!this.publimodule.caption && !this.edit_mode) return false;
      return true;
    },

    module_type() {
      return this.getModuleType(this.publimodule.module_type);
    },
    show_fs_button() {
      if (this.page_template === "page_by_page")
        return this.publimodule.show_fs_button === true;
      return true;
    },
    first_media() {
      return this.firstMedia(this.publimodule);
    },
    media_styles() {
      let margin_left = 0;

      if (this.$root.is_mobile_view) return;

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
      this.$eventHub.$emit("publication.map.disableTools");
    },
    showModuleOnMap() {
      this.$eventHub.$emit("publication.map.openPin", this.publimodule.$path);
    },
    pinButtonClick() {
      this.scrollToModule();
    },
    preventClickTraversing(event) {
      // stop click event from bubbling and triggering unselect module
      if (this.edit_mode) event.stopPropagation();
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

      await new Promise((r) => setTimeout(r, 100));
      this.showModuleOnMap();
    },
    async eraseCoords() {
      await this.updateMeta({
        location: {},
      }).catch((err) => {
        this.$alertify.delay(4000).error(err);
        throw err;
      });
    },
    enableEdit() {
      this.$emit("update:module_being_edited", this.publimodule.$path);
    },
    disableEdit() {
      this.$emit("update:module_being_edited", undefined);
    },
    scrollToModule(behavior = "auto") {
      if (this.$el) {
        console.log("scrollToModule " + this.publimodule.$path);
        this.$el.scrollIntoView({
          behavior,
          block: "start",
          inline: "nearest",
        });
      }
    },
    startIntersectionObserver() {
      let callback = (entries, observer) => {
        observer;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // entry.target.classList.add('tracked-element--visible');
            // if (entry.isIntersecting && entry.intersectionRatio === 1) {
            if (
              this.is_associated_to_map &&
              this.has_coordinates &&
              !this.is_active_on_map
            )
              this.showModuleOnMap();
          }
        });
      };
      let top = "-10%";
      try {
        top = window
          .getComputedStyle(this.$el)
          .getPropertyValue("scroll-margin-top");
      } catch (e) {
        e;
      }
      this.observer = new IntersectionObserver(callback, {
        rootMargin: `${top} 0% -80% 0%`,
      });
      this.observer.observe(this.$refs.sentinel);
    },
    endIntersectionObserver() {
      this.observer.unobserve(this.$el);
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
      this.disableEdit();
    },
    async removeModule({ with_content = true } = {}) {
      // todo also empty sharedb path, since $path can be retaken
      if (with_content) {
        try {
          for (let source_media of this.publimodule.source_medias) {
            // do not remove linked medias, only those in this specific folder
            if (
              Object.prototype.hasOwnProperty.call(
                source_media,
                "meta_filename"
              )
            ) {
              const publication_path = this.getParent(this.publimodule.$path);
              const full_source_media = this.getSourceMedia({
                source_media,
                folder_path: publication_path,
              });

              if (full_source_media)
                await this.$api.deleteItem({
                  path: full_source_media.$path,
                });
            }
          }
        } catch (err) {
          this.$alertify.delay(4000).error(err);
          // throw err;
        }
      }

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
  scroll-margin-top: calc(var(--spacing) * 1.5);
  // not sure why 16px ?
  // font-size: 16px;

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
  // &[data-activeonmap] {
  //   background-color: var(--active-color);
  // }
  ._content {
    position: relative;
    width: calc(var(--module-width) * 1%);
    margin-left: calc(var(--module-margin-left) * 1%);
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }
}

._selectorIndicator {
  --highlight-margin: calc(var(--spacing) / -2);

  position: absolute;
  top: 0;
  left: var(--highlight-margin);
  bottom: var(--highlight-margin);
  right: var(--highlight-margin);

  // border: 2px solid var(--c-bleuvert);
  // border-radius: 6px;

  pointer-events: none;
}

._sideOptions {
  position: relative;
  // bottom: 100%;
  // z-index: 1;

  margin-bottom: calc(var(--spacing) / 2);
  width: 100%;

  margin: 0 calc(var(--spacing) / -2) calc(var(--spacing) / 2);
  width: calc(100% + calc(var(--spacing) / 1));

  ._sideOptions--content {
    width: 100%;
    margin: 0 auto;

    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    background: var(--active-color);
    box-shadow: var(--panel-shadows);

    border-radius: 12px;
    gap: calc(var(--spacing) / 2);
    display: flex;
    align-items: center;
  }
}

._arrows {
  flex: 0 0 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-content: space-between;
}

._sideBtns {
  display: block;
  width: var(--side-width);
  height: var(--side-width);
  padding: 0;
  border-radius: 50%;
  background: transparent;

  &:hover,
  &:focus {
    background: rgba(0, 0, 0, 0.1);
  }
}
._options {
  flex: 1 1 auto;
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-items: center;

  justify-content: space-between;

  gap: calc(var(--spacing) / 4);
}
._saveBtn {
  flex: 0 0 auto;
  text-align: right;
}

._advanced_menu,
._carto {
  flex: 0 1 auto;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}

._carto {
  justify-content: flex-end;
}

._buttonRow {
  display: flex;
  flex-flow: row wrap;
  padding: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);
  align-items: center;
  background: transparent;
  border: none;
  --active-color: var(--c-bleuvert_fonce);

  > button {
    padding: calc(var(--spacing) / 4);
  }
}

._sizes.is--active {
}

._floatingEditBtn {
  position: sticky;
  z-index: 1;
  height: 0;
  top: 0;

  > * {
    position: absolute;
    top: 0;
    left: 100%;
    margin: calc(var(--spacing) / 2);
  }
}

._repickNotice {
  position: absolute;
  // z-index: 1;
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
  display: flex;
  background: white;
  padding: calc(var(--spacing) / 2);
}

._carto {
  padding: calc(var(--spacing) / 4);
  border: 2px solid rgba(0, 0, 0, 0.2);
}

._pinButton {
  position: absolute;
  background: transparent;
  top: 0;
  right: 100%;
  width: 30px;
  height: 30px;
  z-index: 1;

  margin: 0 calc(var(--spacing) / 2);

  padding: 0;

  // ._publicationModule[data-type="text"] & {
  //   position: relative;
  //   float: left;
  //   margin-top: calc(var(--spacing) / 4);
  //   margin-right: calc(var(--spacing) / 4);
  // }

  &.is--active {
    background: var(--c-bleuvert);
  }

  img {
    // background: var(--pin-color);
  }

  ._index {
  }
}

._captionField {
  text-align: left;
  margin-top: calc(var(--spacing) / 4);

  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) * 1);

  > ._caption {
    flex: 1 1 auto;
    font-size: var(--sl-font-size-small);
  }
}

.showOptions {
  &-enter-active,
  &-leave-active {
    transition: all 0.2s;
    max-height: 230px;
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    max-height: 0px;
  }
}
</style>
