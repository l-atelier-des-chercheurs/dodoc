<template>
  <div class="_pageMenu">
    <div>
      <transition name="fade_fast" mode="out-in">
        <b :key="page_number">{{ $t("page") }} {{ page_number + 1 }}</b>
      </transition>
      <transition
        v-if="active_spread_index !== false"
        name="fade_fast"
        mode="out-in"
      >
        <span :key="active_spread_index">
          <template v-if="page_number === 0"> ({{ $t("cover") }}) </template>
          <template v-else>
            ({{ $t("spread").toLowerCase() }} {{ active_spread_index }})
          </template>
        </span>
      </transition>
    </div>

    <br />

    <RangeValueInput
      class="u-spacingBottom"
      :label="$t('zoom')"
      :value="Math.round(zoom * 100)"
      :min="25"
      :max="100"
      :step="1"
      :ticks="[25, 50, 75, 100]"
      :default_value="100"
      :suffix="'%'"
      @save="$emit('update:zoom', $event / 100)"
    />

    <div :key="'page-' + page_number" v-if="can_edit">
      <div v-if="!has_editor_toolbar && !active_module">
        <fieldset class="u-spacingBottom">
          <legend class="u-label">{{ $t("page_options") }}</legend>

          <div class="">
            <ModuleCreator
              :publication_path="publication_path"
              :addtl_meta="new_module_meta"
              :is_collapsed="false"
              @addModule="enableModuleEdit"
            />
            <br />
          </div>

          <div class="" v-if="can_edit">
            <ToggleInput
              class="u-spacingBottom"
              :content="show_grid"
              :label="$t('show_grid')"
              @update:content="$emit('update:show_grid', $event)"
            />

            <div v-if="show_grid && can_edit">
              <RangeValueInput
                :label="$t('gridstep')"
                :value="gridstep_in_cm"
                :min="0.1"
                :max="2"
                :step="0.1"
                :ticks="[0.1, 0.5, 1, 1.5, 2]"
                :default_value="1"
                :suffix="'cm'"
                @save="$emit('update:gridstep_in_cm', $event)"
              />

              <ToggleInput
                class="u-spacingBottom"
                :content="snap_to_grid"
                :label="$t('snap_to_grid')"
                @update:content="$emit('update:snap_to_grid', $event)"
              />
            </div>
          </div>
          <div class="" v-if="can_edit">
            <ColorInput
              :label="$t('page_color')"
              :value="page_color"
              @save="
                $emit('updatePageOptions', {
                  page_number,
                  value: { page_color: $event },
                })
              "
            />
          </div>
        </fieldset>

        <div>
          <button
            type="button"
            class="u-buttonLink"
            :disabled="page_modules.length === 0"
            v-if="can_edit"
            @click="show_all_medias = !show_all_medias"
          >
            <sl-icon name="collection" />
            {{ $t("list_of_medias") }}
          </button>
        </div>

        <fieldset v-if="show_all_medias" class="_mediaList">
          <div
            v-for="page_module in page_modules"
            :key="page_module.$path"
            @click="setActive(page_module.$path)"
          >
            <MediaContent
              class="_preview"
              :file="firstMedia(page_module)"
              :resolution="180"
              :context="'preview'"
            />

            <DateField
              class=""
              :title="$t('date_uploaded')"
              :date="page_module.$date_uploaded"
            />
          </div>
        </fieldset>
      </div>
      <div v-else-if="!has_editor_toolbar && active_module">
        <fieldset :key="active_module.$path">
          <legend class="u-label">{{ $t("media") }}</legend>

          <MediaContent
            class="_activeModulePreview"
            :file="firstMedia(active_module)"
            :resolution="180"
            :context="'preview'"
          />

          <div class="u-mediaOptions">
            <RemoveMenu :remove_text="$t('remove')" @remove="removeModule" />

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
          </div>

          <div class="u-sameRow">
            <NumberInput
              class="u-spacingBottom"
              :label="$t('position') + '↔'"
              :value="active_module.x"
              :suffix="'cm'"
              @save="updateMediaPubliMeta({ x: $event })"
            />
            <NumberInput
              class="u-spacingBottom"
              :label="$t('position') + '↕'"
              :value="active_module.y"
              :suffix="'cm'"
              @save="updateMediaPubliMeta({ y: $event })"
            />
          </div>

          <div class="u-sameRow">
            <NumberInput
              class="u-spacingBottom"
              :label="$t('width')"
              :value="active_module.width"
              :min="0"
              :suffix="'cm'"
              @save="updateMediaPubliMeta({ width: $event })"
            />
            <NumberInput
              class="u-spacingBottom"
              :label="$t('height')"
              :value="active_module.height"
              :min="0"
              :suffix="'cm'"
              @save="updateMediaPubliMeta({ height: $event })"
            />
          </div>
          <RangeValueInput
            class="u-spacingBottom"
            :label="$t('rotate')"
            :value="active_module.rotation"
            :min="0"
            :max="360"
            :step="1"
            :ticks="[0, 90, 180, 270, 360]"
            :default_value="0"
            :suffix="'°'"
            @save="updateMediaPubliMeta({ rotation: $event })"
          />
          <RangeValueInput
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
          />
          <RangeValueInput
            class="u-spacingBottom"
            :label="$t('margins')"
            :value="active_module.margins"
            :min="0"
            :max="5"
            :step="0.1"
            :default_value="0"
            :suffix="'cm'"
            @save="updateMediaPubliMeta({ margins: $event })"
          />
          <RangeValueInput
            class="u-spacingBottom"
            :label="$t('opacity')"
            :value="Math.round(active_module.opacity * 100)"
            :min="0"
            :max="100"
            :step="1"
            :ticks="[0, 100]"
            :default_value="100"
            :suffix="'%'"
            @save="updateMediaPubliMeta({ opacity: $event / 100 })"
          />
          <ColorInput
            class="u-spacingBottom"
            :label="$t('background_color')"
            :value="active_module.background_color"
            :default_value="{ label_untranslated: 'none_f', value: '' }"
            @save="updateMediaPubliMeta({ background_color: $event })"
          />

          <RangeValueInput
            class="u-spacingBottom"
            :label="$t('outline_width')"
            :value="active_module.outline_width"
            :min="0"
            :max="2"
            :step="0.1"
            :ticks="[0, 1, 2]"
            :default_value="0"
            :suffix="'cm'"
            @save="updateMediaPubliMeta({ outline_width: $event })"
          />
          <ColorInput
            v-if="active_module.outline_width > 0"
            class="u-spacingBottom"
            :label="$t('outline_color')"
            :value="active_module.outline_color"
            :default_value="{ label_untranslated: 'black', value: '#000000' }"
            @save="updateMediaPubliMeta({ outline_color: $event })"
          />
        </fieldset>
      </div>
      <div v-show="has_editor_toolbar">
        <div ref="editor_toolbar" class="_editorToolbar" />

        <RangeValueInput
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
        />
      </div>
    </div>
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";

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
    page_number: Number,
    active_spread_index: [Boolean, Number],
    zoom: Number,
    show_grid: Boolean,
    snap_to_grid: Boolean,
    gridstep_in_cm: Number,
    page_color: String,
    publication_path: String,
    page_modules: Array,
    page_opened_id: String,
    active_module: [Boolean, Object],
  },
  components: {
    ModuleCreator,
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
  },
  beforeDestroy() {
    this.$eventHub.$off(`module.moveToolbar`, this.displayToolbar);
    this.$eventHub.$off(`module.text_editing_disabled`, this.removeToolbar);
  },
  watch: {},
  computed: {
    module_meta_filename() {
      return this.active_module.$path.substring(
        this.active_module.$path.lastIndexOf("/") + 1
      );
    },
    new_module_meta() {
      return {
        page_id: this.page_opened_id,
        x: this.gridstep_in_cm,
        y: this.gridstep_in_cm,
        width: 5,
        height: 5,
      };
    },
  },
  methods: {
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
    displayToolbar(node) {
      this.has_editor_toolbar = true;
      this.$refs.editor_toolbar.append(node);
      // this.$nextTick(() => {
      // });
    },
    removeToolbar() {
      // if (this.$refs.editor_toolbar) this.$refs.editor_toolbar.innerHTML = "";
      this.has_editor_toolbar = false;
    },
    enableModuleEdit({ meta_filename }) {
      setTimeout(() => {
        this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
      }, 150);
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
  padding: calc(var(--spacing) / 2);
  // margin: 0 calc(var(--spacing) / 1);

  background: var(--panel-color);
  border: var(--panel-borders);
  box-shadow: var(--panel-shadows);
  border-radius: var(--panel-radius);

  text-align: left;

  ::v-deep ._moduleCreator {
    margin: 0;
  }
}
._activeModulePreview {
  width: 50px;
  height: auto;
  overflow: hidden;
  margin: 0 auto;
  background: var(--c-gris_clair);
  width: 100%;
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
</style>
