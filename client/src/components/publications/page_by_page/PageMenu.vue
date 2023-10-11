<template>
  <div class="_pageMenu">
    <div class="_pageMenu--pane">
      <button type="button" class="u-buttonLink" @click="$emit('close')">
        <sl-icon name="arrow-left-short" label="" />
        {{ $t("close") }}
      </button>
      <div class="u-spacingBottom _titleRow">
        <div>
          <button
            type="button"
            class="u-button u-button_transparent"
            @click="$emit('prevPage')"
            :disabled="active_page_number <= 0"
          >
            <sl-icon name="arrow-left-circle" />
          </button>
        </div>
        <div>
          <transition name="fade_fast" mode="out-in">
            <b :key="active_page_number"
              >{{ $t("page") }} {{ active_page_number + 1 }}</b
            >
          </transition>
          <transition
            v-if="active_spread_index !== false"
            name="fade_fast"
            mode="out-in"
          >
            <span :key="active_spread_index">
              <template v-if="active_page_number === 0">
                ({{ $t("cover") }})
              </template>
              <template v-else>
                ({{ $t("spread").toLowerCase() }} {{ active_spread_index }})
              </template>
            </span>
          </transition>
        </div>
        <div>
          <button
            type="button"
            class="u-button u-button_transparent"
            @click="$emit('nextPage')"
            :disabled="active_page_number >= pages.length - 1"
          >
            <sl-icon name="arrow-right-circle" />
          </button>
        </div>
      </div>

      <div class="_scale">
        <RangeValueInput
          class="u-spacingBottom"
          :can_toggle="false"
          :label="$t('scale')"
          :value="Math.round(scale * 100)"
          :min="10"
          :max="200"
          :step="1"
          :ticks="[10, 25, 50, 100, 200]"
          :default_value="100"
          :suffix="'%'"
          @save="$emit('update:scale', $event / 100)"
        />
      </div>

      <div class="" v-if="can_edit">
        <ToggleInput
          :content="display_as_public"
          @update:content="$emit('update:display_as_public', $event)"
          :label="$t('preview')"
        />
      </div>
    </div>

    <template v-if="can_edit && !display_as_public">
      <transition name="fade_fast" mode="out-in">
        <div
          v-if="!has_editor_toolbar && !active_module"
          :key="'page_options-' + active_page_number"
        >
          <div class="_pageMenu--pane">
            <div class="u-spacingBottom">
              <DLabel :str="$t('add_on_page')" />
              <ModuleCreator
                :publication_path="publication_path"
                :pre_addtl_meta="new_module_meta"
                :context="'page_by_page'"
                :is_collapsed="false"
                @addModules="enableModuleEdit"
              />
            </div>

            <div class="" v-if="can_edit">
              <ToggledSection
                v-if="can_edit"
                class="u-spacingBottom"
                :label="$t('show_grid')"
                :show_toggle="show_grid"
                @update:show_toggle="$emit('update:show_grid', $event)"
              >
                <RangeValueInput
                  :label="$t('gridstep')"
                  :can_toggle="false"
                  :value="gridstep_in_mm"
                  :min="1"
                  :max="20"
                  :step="1"
                  :ticks="[5, 10, 20, 50]"
                  :default_value="10"
                  :suffix="unit"
                  @save="$emit('update:gridstep_in_mm', $event)"
                />

                <ToggleInput
                  class="u-spacingBottom"
                  :content="snap_to_grid"
                  :label="$t('snap_to_grid')"
                  @update:content="$emit('update:snap_to_grid', $event)"
                />
              </ToggledSection>
            </div>
            <div class="" v-if="can_edit">
              <ColorInput
                class="u-spacingBottom"
                :label="$t('page_color')"
                :value="page_color"
                @save="
                  $emit('updatePageOptions', {
                    page_number: active_page_number,
                    value: { page_color: $event },
                  })
                "
              />

              <ToggleInput
                v-if="has_pagination"
                class="u-spacingBottom"
                :content="hide_pagination"
                :label="$t('hide_pagination')"
                @update:content="
                  $emit('updatePageOptions', {
                    page_number: active_page_number,
                    value: { hide_pagination: $event },
                  })
                "
              />
            </div>
          </div>
          <div class="_pageMenu--pane">
            <DLabel
              :str="$t('list_of_medias') + ' (' + page_modules.length + ')'"
              :instructions="$t('list_of_medias_instr')"
            />
            <div class="u-spacingBottom" v-if="page_modules.length > 0">
              <button
                type="button"
                class="u-buttonLink"
                :disabled="page_modules.length === 0"
                v-if="can_edit"
                @click="show_all_medias = !show_all_medias"
              >
                <sl-icon name="collection" />
                <template v-if="!show_all_medias">
                  {{ $t("show") }}
                </template>
                <template v-else>
                  {{ $t("hide") }}
                </template>
              </button>
            </div>
            <div class="_mediaList" v-if="show_all_medias">
              <div
                v-for="page_module in page_modules"
                :key="page_module.$path"
                @click="setActive(page_module.$path)"
              >
                <MediaContent
                  class="_preview"
                  v-if="firstMedia(page_module)"
                  :file="firstMedia(page_module)"
                  :resolution="50"
                  :context="'preview'"
                />

                <DateDisplay
                  class=""
                  :title="$t('date_uploaded')"
                  :date="page_module.$date_uploaded"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="!has_editor_toolbar && active_module"
          class="_pageMenu--pane"
          :key="'media-' + active_module.$path"
        >
          <DLabel :str="$t('media')" :instructions="$t('active_media_instr')" />

          <MediaContent
            class="_activeModulePreview"
            v-if="active_module.module_type === 'mosaic'"
            :file="firstMedia(active_module)"
            :resolution="50"
            :context="'preview'"
          />
          <span
            v-else-if="active_module.module_type === 'text'"
            class="u-textEllipsis u-textEllipsis_3 _textExtract"
          >
            <CollaborativeEditor2
              ref="textBloc"
              :path="firstMedia(active_module).$path"
              :content="firstMedia(active_module).$content"
              :can_edit="false"
            />
          </span>
          <span v-else>
            {{ $t(active_module.module_type) }}
          </span>

          <div class="u-mediaOptions">
            <MoveToPage
              :pages="pages"
              :current_page_id="pages[active_page_number].id"
              @submit="
                updateMediaPubliMeta({ page_id: $event });
                setActive(false);
              "
            />
            <div class="">
              <button
                type="button"
                class="u-buttonLink"
                @click="duplicateModule"
              >
                <sl-icon name="file-plus" />
                {{ $t("duplicate") }}
              </button>
            </div>
            <div class="">
              <button
                type="button"
                class="u-buttonLink"
                v-if="active_module.locked === true"
                @click="updateMediaPubliMeta({ locked: false })"
              >
                <sl-icon name="unlock" />
                {{ $t("unlock") }}
              </button>
              <button
                type="button"
                class="u-buttonLink"
                v-else
                @click="updateMediaPubliMeta({ locked: true })"
              >
                <sl-icon name="lock" />
                {{ $t("lock") }}
              </button>
            </div>
            <div class="">
              <button
                type="button"
                class="u-buttonLink"
                @click="setActive(false)"
              >
                <sl-icon name="dash-square-dotted" />
                {{ $t("unselect") }}
              </button>
            </div>
            <RemoveMenu
              ref="removeMenu"
              :remove_text="$t('withdraw_from_page')"
              @remove="removeModule"
            />
          </div>

          <div class="u-sameRow">
            <NumberInput
              class="u-spacingBottom"
              :label="$t('position') + '→'"
              :value="active_module.x"
              :suffix="unit"
              @save="updateMediaPubliMeta({ x: $event })"
            />
            <NumberInput
              class="u-spacingBottom"
              :label="$t('position') + '↓'"
              :value="active_module.y"
              :suffix="unit"
              @save="updateMediaPubliMeta({ y: $event })"
            />
          </div>

          <div class="u-sameRow">
            <NumberInput
              class="u-spacingBottom"
              :label="$t('width') + '↔'"
              :value="active_module.width"
              :min="0"
              :suffix="unit"
              @save="updateMediaPubliMeta({ width: $event })"
            />
            <NumberInput
              class="u-spacingBottom"
              :label="$t('height') + '↕'"
              :value="active_module.height"
              :min="0"
              :suffix="unit"
              @save="updateMediaPubliMeta({ height: $event })"
            />
          </div>
          <RangeValueInput
            class="u-spacingBottom"
            :label="$t('angle')"
            :value="active_module.rotation"
            :min="0"
            :max="360"
            :step="1"
            :ticks="[0, 90, 180, 270, 360]"
            :default_value="0"
            :suffix="'°'"
            @save="updateMediaPubliMeta({ rotation: $event })"
          />
          <!-- <RangeValueInput
            v-if="firstMedia(active_module).$type === 'text'"
            class="u-spacingBottom"
            :label="$t('text_size')"
            :value="active_module.text_size"
            :min="1"
            :max="400"
            :step="1"
            :ticks="[1, 100, 200, 300, 400]"
            :default_value="100"
            :suffix="'%'"
            @save="updateMediaPubliMeta({ text_size: $event })"
          /> -->
          <RangeValueInput
            class="u-spacingBottom"
            :label="$t('margins')"
            :value="active_module.margins"
            :min="0"
            :max="50"
            :step="1"
            :default_value="0"
            :suffix="unit"
            @save="
              updateMediaPubliMeta({
                margins: $event,
              })
            "
          />

          <RangeValueInput
            v-if="
              active_module.module_type !== 'ellipsis' &&
              active_module.module_type !== 'text'
            "
            class="u-spacingBottom"
            :label="$t('border_radius')"
            :value="active_module.border_radius"
            :min="0"
            :max="50"
            :step="1"
            :default_value="0"
            :suffix="unit"
            @save="
              updateMediaPubliMeta({
                border_radius: $event,
              })
            "
          />

          <RangeValueInput
            class="u-spacingBottom"
            :label="$t('opacity')"
            :value="Math.round(active_module.opacity * 100)"
            :min="1"
            :max="100"
            :step="1"
            :ticks="[1, 100]"
            :default_value="100"
            :suffix="'%'"
            @save="updateMediaPubliMeta({ opacity: $event / 100 })"
          />

          <ColorInput
            class="u-spacingBottom"
            :label="$t('background_color')"
            :value="active_module.background_color"
            :default_value="is_shape ? 'transparent' : ''"
            @save="updateMediaPubliMeta({ background_color: $event })"
          />

          <RangeValueInput
            class="u-spacingBottom"
            :label="$t('outline_width')"
            :value="active_module.outline_width"
            :min="0"
            :max="20"
            :step="1"
            :ticks="[0, 10, 20]"
            :default_value="0"
            :suffix="unit"
            @save="
              updateMediaPubliMeta({
                outline_width: $event,
              })
            "
          />
          <ColorInput
            v-if="active_module.outline_width > 0"
            class="u-spacingBottom"
            :label="$t('outline_color')"
            :value="active_module.outline_color"
            :default_value="'#000000'"
            @save="updateMediaPubliMeta({ outline_color: $event })"
          />
          <ToggleInput
            v-if="firstMedia(active_module).$type === 'image'"
            class="u-spacingBottom"
            :content="active_module.show_fs_button"
            :label="$t('show_fs_button')"
            @update:content="updateMediaPubliMeta({ show_fs_button: $event })"
          />
          <DepthInput
            :label="$t('z_index')"
            :value="active_module.z_index"
            :page_modules="page_modules"
            @save="updateMediaPubliMeta({ z_index: $event })"
          />
        </div>
      </transition>
      <div
        v-show="has_editor_toolbar"
        class="_pageMenu--pane"
        :key="'text-toolbar-' + active_page_number"
      >
        <div ref="editor_toolbar" class="_editorToolbar" />

        <!-- <RangeValueInput
          class="u-spacingBottom"
          :label="$t('text_size')"
          :value="active_module.text_size"
          :min="1"
          :max="400"
          :step="1"
          :ticks="[1, 100, 200, 300, 400]"
          :default_value="100"
          :suffix="'%'"
          @save="updateMediaPubliMeta({ text_size: $event })"
        /> -->
      </div>
    </template>
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import DepthInput from "@/components/publications/page_by_page/DepthInput.vue";
import MoveToPage from "@/components/publications/page_by_page/MoveToPage.vue";

// const throttle = (fn, wait) => {
//   let throttled = false;
//   return function (...args) {
//     if (!throttled) {
//       fn.apply(this, args);
//       throttled = true;
//       setTimeout(() => {
//         throttled = false;
//       }, wait);
//     }
//   };
// };
export default {
  props: {
    can_edit: Boolean,
    pages: Array,
    active_page_number: Number,
    active_spread_index: [Boolean, Number],
    scale: Number,
    show_grid: Boolean,
    snap_to_grid: Boolean,
    gridstep_in_mm: Number,
    layout_mode: {
      type: String,
      default: "print",
    },
    page_color: String,
    pagination: [Boolean, Object],
    publication_path: String,
    page_modules: Array,
    page_opened_id: String,
    active_module: [Boolean, Object],
    display_as_public: Boolean,
  },
  components: {
    DepthInput,
    ModuleCreator,
    MoveToPage,
  },
  data() {
    return {
      show_page_options: false,
      show_all_medias: false,
      has_editor_toolbar: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on(`module.text_editing_enabled`, this.displayToolbar);
    this.$eventHub.$on(`module.text_editing_disabled`, this.removeToolbar);
    this.$eventHub.$on(`module.open_remove_modal`, this.openRemoveModal);
  },
  beforeDestroy() {
    this.$eventHub.$off(`module.moveToolbar`, this.displayToolbar);
    this.$eventHub.$off(`module.text_editing_disabled`, this.removeToolbar);
    this.$eventHub.$off(`module.open_remove_modal`, this.openRemoveModal);
  },
  watch: {},
  computed: {
    module_meta_filename() {
      if (!this.active_module) return "";
      return this.active_module.$path.substring(
        this.active_module.$path.lastIndexOf("/") + 1
      );
    },
    is_shape() {
      return (
        this.active_module &&
        ["ellipsis", "line", "arrow", "rectangle"].includes(
          this.active_module.module_type
        )
      );
    },
    unit() {
      if (this.layout_mode === "screen") return "px";
      else return "mm";
    },

    has_pagination() {
      return (
        this.active_page_number - this.pagination.pagination_start_on_page >= 0
      );
    },
    hide_pagination() {
      return this.pages[this.active_page_number].hide_pagination === true;
    },
    new_module_meta() {
      const z_index =
        Math.max(...this.page_modules.map((pm) => pm.z_index || 0)) + 1;

      let x = this.$root.default_new_module_left;
      let y = this.$root.default_new_module_top;

      if (this.gridstep_in_mm) {
        // todo : round to gridstep
      }

      return {
        page_id: this.page_opened_id,
        x,
        y,
        width: this.$root.default_new_module_width,
        height: this.$root.default_new_module_height,
        rotation: 0,
        margins: 0,
        opacity: 1,
        outline_width: 0,
        z_index,
      };
    },
  },
  methods: {
    displayToolbar(node) {
      this.has_editor_toolbar = true;
      this.$nextTick(() => {
        if (this.$refs.editor_toolbar) this.$refs.editor_toolbar.append(node);
      });

      // this.$nextTick(() => {
      // });
    },
    removeToolbar() {
      // if (this.$refs.editor_toolbar) this.$refs.editor_toolbar.innerHTML = "";
      this.has_editor_toolbar = false;
    },
    openRemoveModal() {
      this.$refs.removeMenu.show_confirm_delete = true;
    },
    enableModuleEdit({ meta_filenames }) {
      // get last
      const meta_filename = meta_filenames.at(-1);
      setTimeout(() => {
        this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
        this.$eventHub.$emit(`module.panTo.${meta_filename}`);
      }, 150);
    },
    changeModulePage() {
      this.$eventHub.$emit(`module.move.${this.module_meta_filename}`);
    },
    duplicateModule() {
      this.$eventHub.$emit(`module.duplicate.${this.module_meta_filename}`);
    },
    removeModule() {
      this.$eventHub.$emit(`module.remove.${this.module_meta_filename}`);
      this.$eventHub.$emit(`module.setActive`, false);
    },
    setActive(path) {
      this.$eventHub.$emit(`module.setActive`, path);
      if (path)
        this.$nextTick(() => {
          const meta_filename = this.getFilename(path);
          this.$eventHub.$emit(`module.panTo.${meta_filename}`);
        });
    },
    async updateMediaPubliMeta(val) {
      if (!this.active_module) return;

      await this.$api
        .updateMeta({
          path: this.active_module.$path,
          new_meta: val,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
._pageMenu {
  margin: 2px;
  margin: calc(var(--spacing) / 4);
  background: var(--panel-color);
  border: var(--panel-borders);
  box-shadow: var(--panel-shadows);
  border-radius: var(--panel-radius);
  text-align: left;
}
._pageMenu--pane {
  padding: calc(var(--spacing) / 2) 0;
  margin: 0 calc(var(--spacing) / 2);

  &:not(:first-child) {
    margin-top: calc(var(--spacing) / 2);
    border-top: 1px solid var(--active-color);
  }
}

// ::v-deep ._moduleCreator {
//   margin: 0;
// }
._activeModulePreview {
  overflow: hidden;
  margin: 0 auto;
  background: var(--c-noir);
  width: 100%;
  height: 50px;

  display: flex;
  justify-content: center;
}

._mediaList {
  font-size: var(--sl-font-size-x-small);
  padding: 0;

  > * {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: calc(var(--spacing) / 2);
    cursor: pointer;

    &:hover {
      background: var(--c-gris_clair);
    }

    &:not(:last-child) {
      border-bottom: 2px solid var(--c-gris);
    }

    ._preview {
      position: relative;
      width: 50px;
      height: 50px;
      flex: 0 0 50px;

      ::v-deep img {
        width: 100%;
        height: 100%;
        position: absolute;
        object-fit: contain;
      }
    }
  }
}

._scale {
  // position: absolute;
  // bottom: 0;
  // left: 0;
  // width: 100%;
}
._textExtract {
  ::v-deep {
    .ql-editor {
      padding-bottom: 0;
    }
  }
}

._titleRow {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;

  button {
    font-size: var(--sl-font-size-large);
  }
}
</style>
