<template>
  <div class="_pageMenu">
    <div class="_pageMenu--pane">
      <button type="button" class="u-buttonLink" @click="$emit('close')">
        <b-icon icon="grid-fill" />
        <template v-if="!is_spread">{{ $t("list_of_pages") }}</template>
        <template v-else>{{ $t("list_of_spreads") }}</template>
      </button>
      <div class="_titleRow">
        <button
          type="button"
          class="u-button u-button_transparent u-button_icon"
          @click="$emit('prevPage')"
          :disabled="active_page_number <= 0"
        >
          <b-icon icon="arrow-left-square" />
        </button>
        <div class="_name">
          <transition name="slideupFade" mode="out-in">
            <div :key="active_page_number">
              <b>{{ $t("page") }} {{ active_page_number + 1 }}</b>
            </div>
          </transition>
          <transition name="slideupFade" mode="out-in">
            <span
              v-if="active_spread_index !== false"
              :key="active_spread_index"
            >
              <template v-if="active_spread_index === 0">
                ({{ $t("cover") }})
              </template>
              <template v-else>
                ({{ $t("spread").toLowerCase() }} {{ active_spread_index + 1 }})
              </template>
            </span>
          </transition>
        </div>
        <button
          type="button"
          class="u-button u-button_transparent u-button_icon"
          @click="$emit('nextPage')"
          :disabled="is_last_page"
        >
          <b-icon icon="arrow-right-square" />
        </button>
      </div>

      <div v-if="is_last_page" class="u-spacingBottom">
        <div class="u-instructions">
          {{ $t("last_page_reached") }}
        </div>

        <button
          type="button"
          class="u-button u-button_bleuvert u-button_small"
          @click="createPageAndOpen"
        >
          <b-icon icon="plus-square" />
          {{ $t("create_page") }}
        </button>
        <!-- <EditBtn
          :btn_type="'create_page'"
          :is_unfolded="true"
          :label_position="'left'"
          :key="'createPage' + index"
          @click="createPageAndOpen"
        /> -->

        <hr />
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

      <div class="u-displayAsPublic" v-if="can_edit">
        <ToggleInput
          :content="display_as_public"
          @update:content="$emit('update:display_as_public', $event)"
          :label="$t('preview')"
        />
      </div>
    </div>

    <template v-if="can_edit && !display_as_public">
      <div
        class="_pageMenu--pane"
        :key="active_page_number"
        v-show="!has_editor_toolbar && !active_module"
      >
        <div class="">
          <DLabel :str="$t('add_on_page')" />
          <ModuleCreator
            :publication_path="publication_path"
            :pre_addtl_meta="new_module_meta"
            :context="'page_by_page'"
            :start_collapsed="false"
            :enable_clipboard_paste="true"
            @addModules="enableModuleEdit"
          />
        </div>

        <template v-if="can_edit && !active_module">
          <div class="u-spacingBottom" />
          <div class="">
            <ToggledSection
              v-if="can_edit"
              class="u-spacingBottom"
              :label="$t('show_grid')"
              :show_toggle="show_grid"
              @update:show_toggle="$emit('update:show_grid', $event)"
            >
              <RadioCheckboxInput
                :value="grid_z_index"
                :options="[
                  {
                    label: $t('over'),
                    key: 'over',
                  },
                  {
                    label: $t('under'),
                    key: 'under',
                  },
                ]"
                :can_edit="true"
                @update:value="$emit('update:grid_z_index', $event)"
              />
              <div class="u-spacingBottom" />
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
              <div class="u-spacingBottom" />
              <ToggleInput
                class="u-spacingBottom"
                :content="snap_to_grid"
                :label="$t('snap_to_grid')"
                @update:content="$emit('update:snap_to_grid', $event)"
              />
            </ToggledSection>
          </div>
          <div class="">
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

            <DLabel :str="$t('format,margins,pagination')" />
            <div class="">
              <button
                type="button"
                class="u-button"
                @click="$eventHub.$emit('publication.settings.toggle')"
              >
                <b-icon
                  icon="gear"
                  slot="prefix"
                  :aria-label="$t('settings')"
                />
                {{ $t("settings") }}
              </button>
            </div>

            <template v-if="has_pagination">
              <div class="u-spacingBottom" />
              <ToggleInput
                class=""
                :content="hide_pagination"
                :label="$t('hide_pagination')"
                @update:content="
                  $emit('updatePageOptions', {
                    page_number: active_page_number,
                    value: { hide_pagination: $event },
                  })
                "
              />
            </template>
          </div>
        </template>
      </div>
      <div class="_pageMenu--pane" v-if="!has_editor_toolbar && !active_module">
        <DetailsPane
          :header="$t('on_this_page')"
          :icon="'images'"
          :has_items="page_modules.length"
          :is_open_initially="false"
          :can_be_toggled="true"
        >
          <div class="_mediaList">
            <div
              v-for="page_module in page_modules"
              :key="page_module.$path"
              class="u-sameRow"
              @click="setActive(page_module.$path)"
            >
              <template
                v-if="getModuleType(page_module.module_type) === 'shape'"
              >
                {{ $t(page_module.module_type) }}
              </template>
              <MediaContent
                v-else-if="firstMedia(page_module)"
                class="_preview"
                :file="firstMedia(page_module)"
                :resolution="50"
                :context="'preview'"
              />
              <template v-else> – </template>
            </div>

            <!-- <DateDisplay
                class=""
                :title="$t('date_uploaded')"
                :date="page_module.$date_uploaded"
              /> -->
          </div>
        </DetailsPane>
      </div>

      <div
        v-if="!has_editor_toolbar && active_module"
        class="_pageMenu--pane"
        :key="'media-' + active_module.$path"
      >
        <DLabel :str="$t('media')" :instructions="$t('active_media_instr')" />

        <MediaContent
          class="_activeModulePreview"
          v-if="
            active_module.module_type === 'mosaic' && active_module_first_media
          "
          :file="active_module_first_media"
          :resolution="50"
          :context="'preview'"
        />
        <span
          v-else-if="
            active_module.module_type === 'text' && active_module_first_media
          "
          class="u-textEllipsis u-textEllipsis_3 _textExtract"
        >
          <CollaborativeEditor3
            ref="textBloc"
            :path="active_module_first_media.$path"
            :content="active_module_first_media.$content"
            :can_edit="false"
          />
        </span>
        <span v-else>
          {{ $t(active_module.module_type) }}
        </span>

        <div class="u-spacingBottom" />

        <div class="u-mediaOptions">
          <!-- <div>
            <button
              type="button"
              class="u-buttonLink"
              @click="
                $eventHub.$emit(
                  'publication.openModal',
                  active_module_first_media.$path
                )
              "
            >
              <b-icon icon="pencil" />
              {{ $t("edit_source") }}
            </button>
          </div> -->

          <div>
            <button
              type="button"
              class="u-buttonLink"
              @click="show_move_to_page_modal = true"
            >
              <b-icon icon="arrow-left-right" />
              {{ $t("move_to_page") }}
            </button>
          </div>
          <SelectPage
            v-if="show_move_to_page_modal"
            :pages="pages"
            :current_page_id="active_page.id"
            @submit="moveToAnotherPage"
            @close="show_move_to_page_modal = false"
          />

          <div class="">
            <button type="button" class="u-buttonLink" @click="duplicateModule">
              <b-icon icon="file-plus" />
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
              <b-icon icon="unlock" />
              {{ $t("unlock") }}
            </button>
            <button
              type="button"
              class="u-buttonLink"
              v-else
              @click="updateMediaPubliMeta({ locked: true })"
            >
              <b-icon icon="lock" />
              {{ $t("lock") }}
            </button>
          </div>
          <div class="">
            <button
              type="button"
              class="u-buttonLink"
              @click="setActive(false)"
            >
              <b-icon icon="dash-square-dotted" />
              {{ $t("unselect") }}
            </button>
          </div>
          <RemoveMenu
            ref="removeMenu"
            :modal_title="$t('withdraw_from_page')"
            @remove="removeModule"
          />
        </div>

        <div class="u-spacingBottom" />

        <template v-if="show_caption">
          <TitleField
            :label="!active_module.caption ? $t('add_caption') : $t('caption')"
            :field_name="'caption'"
            :input_type="'editor'"
            :custom_formats="['bold', 'italic', 'link', 'emoji']"
            :content="active_module.caption"
            :path="active_module.$path"
            :maxlength="640"
            :can_edit="can_edit"
          />

          <div class="u-spacingBottom" />

          <div
            class=""
            v-if="
              active_module_first_media &&
              active_module_first_media.caption &&
              !active_module.caption
            "
          >
            <div class="u-instructions">
              {{ $t("copy_first_media_caption") }}
            </div>
            <button
              type="button"
              class="u-buttonLink _firstMediaCaption"
              @click="
                updateMediaPubliMeta({
                  caption: active_module_first_media.caption,
                })
              "
            >
              {{ active_module_first_media.caption }}
            </button>
          </div>

          <div class="u-spacingBottom" />
        </template>

        <div>
          <DLabel :str="$t('on_click')" />
          <div>
            <template
              v-if="
                active_module.on_click &&
                active_module.on_click.type === 'url' &&
                active_module.on_click.url
              "
            >
              {{ $t("open_webpage") }}
              <br />
              <b>{{ active_module.on_click.url }}</b>
            </template>
            <template
              v-else-if="
                active_module.on_click &&
                active_module.on_click.type === 'page' &&
                active_module.on_click.page_id
              "
            >
              {{ $t("navigate_to_page") }}
              <br />
              <b>{{ getPageNumberFromId(active_module.on_click.page_id) }}</b>
            </template>
            <template v-else>
              {{ $t("do_nothing") }}
            </template>
            <EditBtn
              :label_position="'left'"
              @click="show_edit_link_modal = true"
            />
          </div>
          <LinkToPageOrURL
            v-if="show_edit_link_modal"
            :path="active_module.$path"
            :on_click="active_module.on_click"
            :pages="pages"
            :current_page_id="active_page.id"
            @save="updateMediaPubliMeta"
            @close="show_edit_link_modal = false"
          />
        </div>

        <div class="u-spacingBottom" />
        <div class="u-sameRow">
          <NumberInput
            :label="$t('position') + ' →'"
            :value="active_module.x"
            :suffix="unit"
            @save="updateMediaPubliMeta({ x: $event })"
          />
          <NumberInput
            :label="$t('position') + ' ↓'"
            :value="active_module.y"
            :suffix="unit"
            @save="updateMediaPubliMeta({ y: $event })"
          />
        </div>

        <div class="u-sameRow">
          <NumberInput
            :label="$t('width') + ' ↔'"
            :value="active_module.width"
            :min="0"
            :suffix="unit"
            @save="updateMediaPubliMeta({ width: $event })"
          />
          <NumberInput
            :label="$t('height') + ' ↕'"
            :value="active_module.height"
            :min="0"
            :suffix="unit"
            @save="updateMediaPubliMeta({ height: $event })"
          />
        </div>
        <div class="_setSizeBtn">
          <button
            type="button"
            class="u-button_icon"
            :title="$t('real_size')"
            v-if="/* layout_mode === 'screen' && */ first_media_ratio"
            @click="setSize('real_size')"
          >
            <b-icon
              icon="slash-square-fill"
              rotate="90"
              :aria-label="$t('real_size')"
            />
          </button>
          <button type="button" class="u-button_icon" @click="setSize('full')">
            <b-icon icon="square-fill" :aria-label="$t('full_page')" />
          </button>
          <button
            type="button"
            class="u-button_icon"
            @click="setSize('half_left')"
          >
            <b-icon icon="square-half" />
          </button>
          <button
            type="button"
            class="u-button_icon"
            @click="setSize('half_right')"
          >
            <b-icon icon="square-half" rotate="180" />
          </button>
          <button
            type="button"
            class="u-button_icon"
            @click="setSize('half_top')"
          >
            <b-icon icon="square-half" rotate="90" />
          </button>
          <button
            type="button"
            class="u-button_icon"
            @click="setSize('half_bottom')"
          >
            <b-icon icon="square-half" rotate="270" />
          </button>
        </div>

        <div class="u-spacingBottom" />

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
          v-if="active_module.module_type !== 'ellipsis'"
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
          :label="$t('drop_shadow')"
          :value="
            active_module.drop_shadow
              ? active_module.drop_shadow * 100
              : undefined
          "
          :min="0"
          :max="100"
          :step="1"
          :ticks="[0, 25, 50, 75, 100]"
          :default_value="0"
          :suffix="'%'"
          @save="updateMediaPubliMeta({ drop_shadow: $event / 100 })"
        />

        <RangeValueInput
          class="u-spacingBottom"
          :label="$t('opacity')"
          :value="Math.round(active_module.opacity * 100)"
          :min="1"
          :max="100"
          :step="1"
          :ticks="[1, 25, 50, 75, 100]"
          :default_value="100"
          :suffix="'%'"
          @save="updateMediaPubliMeta({ opacity: $event / 100 })"
        />

        <ColorInput
          class="u-spacingBottom"
          :label="$t('background_color')"
          :value="active_module.background_color"
          :allow_transparent="true"
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
          :ticks="[0, 5, 10, 15, 20]"
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
          :allow_transparent="true"
          :default_value="'#000000'"
          @save="updateMediaPubliMeta({ outline_color: $event })"
        />
        <ToggleInput
          v-if="
            active_module_first_media &&
            active_module_first_media.$type === 'image'
          "
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
      <div
        v-show="has_editor_toolbar"
        class="_pageMenu--pane"
        :key="'text-toolbar-' + active_page_number"
      >
        <div ref="editor_toolbar" class="_editorToolbar" />
        <div ref="editor_tooltip" class="_editorToolbar" />

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
import SelectPage from "@/components/publications/page_by_page/SelectPage.vue";
import LinkToPageOrURL from "@/components/publications/page_by_page/LinkToPageOrURL.vue";
import ImportFileZone from "@/adc-core/ui/ImportFileZone.vue";

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
    is_spread: Boolean,
    page_width: Number,
    page_height: Number,
    scale: Number,
    show_grid: Boolean,
    snap_to_grid: Boolean,
    grid_z_index: String,
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
    SelectPage,
    LinkToPageOrURL,
    ImportFileZone,
  },
  data() {
    return {
      show_page_options: false,
      show_move_to_page_modal: false,
      show_edit_link_modal: false,
      show_all_medias: false,
      has_editor_toolbar: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on(
      `module.text_editing_enabled`,
      this.displayToolbarAndToolTip
    );
    this.$eventHub.$on(`module.text_editing_disabled`, this.removeToolbar);
    this.$eventHub.$on(`module.open_remove_modal`, this.openRemoveModal);
  },
  beforeDestroy() {
    this.$eventHub.$off(
      `module.text_editing_enabled`,
      this.displayToolbarAndToolTip
    );
    this.$eventHub.$off(`module.text_editing_disabled`, this.removeToolbar);
    this.$eventHub.$off(`module.open_remove_modal`, this.openRemoveModal);
  },
  watch: {},
  computed: {
    is_last_page() {
      return this.active_page_number === this.pages.length - 1;
    },
    module_meta_filename() {
      if (!this.active_module) return "";
      return this.active_module.$path.substring(
        this.active_module.$path.lastIndexOf("/") + 1
      );
    },
    active_module_first_media() {
      return this.firstMedia(this.active_module);
    },
    first_media_ratio() {
      return this.active_module_first_media?.$infos?.ratio;
    },
    is_shape() {
      return this.getModuleType(this.active_module.module_type) === "shape";
    },
    unit() {
      if (this.layout_mode === "screen") return "px";
      else return "mm";
    },
    magnification() {
      if (this.layout_mode === "screen") return 1;
      return this.$root.page_magnification;
    },
    show_caption() {
      if (this.active_module.module_type === "text") return false;
      if (this.is_shape) return false;
      return true;
    },

    has_pagination() {
      return (
        this.active_page_number - this.pagination.pagination_start_on_page >= 0
      );
    },
    active_page() {
      return this.pages[this.active_page_number];
    },
    hide_pagination() {
      return this.pages[this.active_page_number].hide_pagination === true;
    },
    new_module_meta() {
      const z_index =
        Math.max(...this.page_modules.map((pm) => pm.z_index || 0)) + 1;

      let x = this.$root.default_new_module_left;
      let y = this.$root.default_new_module_top;

      if (this.$root.set_new_module_offset_left)
        x =
          (this.$root.set_new_module_offset_left + this.$root.zoom_offset) /
          this.magnification;
      if (this.$root.set_new_module_offset_top)
        y =
          (this.$root.set_new_module_offset_top + this.$root.zoom_offset) /
          this.magnification;

      const width =
        Math.max(
          this.$root.default_new_module_width,
          this.$root.default_new_module_width / this.scale
        ) / this.magnification;
      const height =
        Math.max(
          this.$root.default_new_module_height,
          this.$root.default_new_module_height / this.scale
        ) / this.magnification;

      if (this.gridstep_in_mm) {
        // todo : round to gridstep
      }

      return {
        page_id: this.page_opened_id,
        x,
        y,
        width,
        height,
        rotation: 0,
        margins: 0,
        opacity: 1,
        outline_width: 0,
        z_index,
      };
    },
  },
  methods: {
    createPageAndOpen() {
      this.$emit("createPage");
      setTimeout(() => {
        this.$emit("nextPage");
      }, 500);
    },
    moveToAnotherPage($event) {
      this.show_move_to_page_modal = false;
      this.updateMediaPubliMeta({ page_id: $event });
      this.setActive(false);
    },
    displayToolbarAndToolTip({ $toolbar, $tooltip }) {
      this.has_editor_toolbar = true;
      this.$nextTick(() => {
        if (this.$refs.editor_toolbar)
          this.$refs.editor_toolbar.append($toolbar);
        if (this.$refs.editor_tooltip)
          this.$refs.editor_tooltip.append($tooltip);
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
    getPageNumberFromId(page_id) {
      return this.pages.findIndex((p) => p.id === page_id) + 1;
    },
    enableModuleEdit({ meta_filenames }) {
      // get last
      const meta_filename = meta_filenames.at(-1);
      setTimeout(() => {
        this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
        this.$eventHub.$emit(`module.panTo.${meta_filename}`);
      }, 150);
    },
    async setSize(type) {
      if (type === "real_size") {
        const height = this.active_module.width * this.first_media_ratio;
        await this.updateMediaPubliMeta({
          height,
        });
      } else if (type === "full")
        await this.updateMediaPubliMeta({
          width: this.page_width,
          height: this.page_height,
          x: 0,
          y: 0,
          rotation: 0,
        });
      else if (type === "half_left")
        await this.updateMediaPubliMeta({
          width: this.page_width / 2,
          height: this.page_height,
          x: 0,
          y: 0,
          rotation: 0,
        });
      else if (type === "half_right")
        await this.updateMediaPubliMeta({
          width: this.page_width / 2,
          height: this.page_height,
          x: this.page_width / 2,
          y: 0,
          rotation: 0,
        });
      else if (type === "half_top")
        await this.updateMediaPubliMeta({
          width: this.page_width,
          height: this.page_height / 2,
          x: 0,
          y: 0,
          rotation: 0,
        });
      else if (type === "half_bottom")
        await this.updateMediaPubliMeta({
          width: this.page_width,
          height: this.page_height / 2,
          x: 0,
          y: this.page_height / 2,
          rotation: 0,
        });
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
  background: white;
  text-align: left;
}
._pageMenu--pane {
  padding: calc(var(--spacing) / 1);

  &:not(:first-child) {
    margin-top: calc(var(--spacing) / 2);
    border-top: 2px solid var(--c-gris_clair);
  }
}

// ::v-deep ._moduleCreator {
//   margin: 0;
// }
._activeModulePreview {
  overflow: hidden;
  margin: 0 auto;
  background: var(--c-gris);
  width: 100%;
  height: 50px;

  display: flex;
  justify-content: center;
}

._mediaList {
  font-size: var(--sl-font-size-small);
  padding: 0;

  > * {
    display: flex;
    flex-flow: row nowrap;

    height: 40px;
    overflow: hidden;
    gap: calc(var(--spacing) / 2);
    padding: calc(var(--spacing) / 2);
    cursor: pointer;

    &:hover {
      background: var(--c-gris_clair);
    }

    &:not(:last-child) {
      border-bottom: 2px solid var(--c-gris_clair);
    }

    ._preview {
      position: relative;
      width: 40px;
      aspect-ratio: 1;
      flex: 0 0 40px;

      ::v-deep ._mediaContent--image {
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

  margin: calc(var(--spacing) / 2) calc(var(--spacing) / -2);

  ._name {
    display: flex;
    gap: calc(var(--spacing) / 2);
  }

  button {
    font-size: var(--sl-font-size-medium);
  }
}

._firstMediaCaption {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}

._createPageBtn {
  display: flex;
  justify-content: flex-end;
}

._setSizeBtn {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  color: var(--c-gris_fonce);
}
</style>
