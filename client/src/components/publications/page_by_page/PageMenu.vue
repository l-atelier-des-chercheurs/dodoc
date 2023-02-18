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

    <!-- either show
    1. page options and media list

    2. media informations

    3. text editor toolbar -->
    <div :key="page_number">
      <div
        v-if="has_editor_toolbar"
        ref="editor_toolbar"
        class="_editorToolbar"
      />

      <template v-else>
        <br />
        <div class="">
          <div class="" v-if="can_edit">
            <ModuleCreator
              :publication_path="publication_path"
              :page_id="page_opened_id"
              :is_collapsed="false"
              @addModule="enableModuleEdit"
            />
            <br />
          </div>

          <div class="">
            <label class="u-label">{{ $t("zoom") }} ({{ zoom }})</label>
            <input
              type="range"
              @input="$emit('update:zoom', +$event.target.value)"
              min="0.1"
              max="1"
              :value="zoom"
              step="0.1"
            />
          </div>

          <template v-if="can_edit">
            <br />
            <div>
              <button
                type="button"
                class="u-buttonLink"
                @click="show_page_options = !show_page_options"
              >
                <sl-icon name="sliders" />
                {{ $t("page_options") }}
              </button>
            </div>
            <br />

            <template v-if="show_page_options">
              <fieldset>
                <legend class="u-label">{{ $t("page_options") }}</legend>

                <div class="" v-if="can_edit">
                  <ToggleInput
                    :content="show_grid"
                    :label="$t('show_grid')"
                    @update:content="$emit('update:show_grid', $event)"
                  />
                  <br />

                  <div v-if="show_grid && can_edit">
                    <div class="">
                      <label class="u-label">
                        {{ $t("gridstep") }} ({{ gridstep_in_cm }})
                      </label>
                      <input
                        type="range"
                        @input="
                          $emit('update:gridstep_in_cm', +$event.target.value)
                        "
                        min="0.1"
                        max="4"
                        step=".1"
                        :value="gridstep_in_cm"
                      />
                      <br />
                    </div>
                    <div>
                      <ToggleInput
                        :content="snap_to_grid"
                        :label="$t('snap_to_grid')"
                        @update:content="$emit('update:snap_to_grid', $event)"
                      />
                      <br />
                    </div>
                  </div>
                </div>
                <div class="" v-if="can_edit">
                  <label class="u-label">
                    {{ $t("page_color") }}
                  </label>
                  <input
                    type="color"
                    :value="page_color"
                    @input="
                      $emit('updatePageOptions', {
                        page_number,
                        value: { page_color: $event.target.value },
                      })
                    "
                    :novalue="page_color === ''"
                  />
                </div>
              </fieldset>
              <br />
            </template>

            <transition name="fade_fast" mode="out-in">
              <div v-if="!active_module">
                <div>
                  <button
                    type="button"
                    class="u-buttonLink"
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

              <fieldset v-else :key="active_module.$path">
                <legend class="u-label">{{ $t("media") }}</legend>

                <MediaContent
                  class="_activeModulePreview"
                  :file="firstMedia(active_module)"
                  :resolution="180"
                  :context="'preview'"
                />

                <div class="u-mediaOptions">
                  <RemoveMenu
                    :remove_text="$t('remove')"
                    @remove="removeModule"
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
                </div>

                <br />
                <NumberInput
                  :label="$t('position') + '↔'"
                  :value="active_module.x"
                  :min="0"
                  @save="updateMediaPubliMeta({ x: $event })"
                />
                <br />
                <NumberInput
                  :label="$t('position') + '↕'"
                  :value="active_module.y"
                  :min="0"
                  @save="updateMediaPubliMeta({ y: $event })"
                />
                <br />
                <NumberInput
                  :label="$t('width')"
                  :value="active_module.width"
                  :min="0"
                  @save="updateMediaPubliMeta({ width: $event })"
                />
                <br />
                <NumberInput
                  :label="$t('height')"
                  :value="active_module.height"
                  :min="0"
                  @save="updateMediaPubliMeta({ height: $event })"
                />
              </fieldset>
            </transition>
          </template>
        </div>
      </template>
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
      this.$nextTick(() => {
        this.$refs.editor_toolbar.appendChild(node);
      });
    },
    removeToolbar() {
      if (this.$refs.editor_toolbar) this.$refs.editor_toolbar.innerHTML = "";
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
  padding: calc(var(--spacing) / 1);
  margin: 0;

  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

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

  > * {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: calc(var(--spacing) / 2);

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
