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
    <div class="" :key="page_number">
      <div class="" v-if="can_edit">
        <ModuleCreator
          :publication_path="publication_path"
          :page_id="page_opened_id"
          :is_collapsed="false"
          @addModule="enableModuleEdit"
        />
      </div>

      <br />

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

      <button
        type="button"
        class="u-buttonLink"
        @click="show_page_options = !show_page_options"
      >
        <sl-icon name="sliders" />
        {{ $t("show_page_options") }}
      </button>

      <fieldset v-if="show_page_options">
        <legend class="u-label">{{ $t("page_options") }}</legend>

        <div class="" v-if="can_edit">
          <label class="u-label">
            {{ $t("gridstep") }} ({{ gridstep_in_cm }})
          </label>
          <input
            type="range"
            @input="$emit('update:gridstep_in_cm', +$event.target.value)"
            min="0.1"
            max="4"
            step=".1"
          />

          <br />
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

      <transition name="fade_fast" mode="out-in">
        <fieldset v-if="active_module" :key="active_module.$path">
          <legend class="u-label">{{ $t("media") }}</legend>

          <MediaContent
            class="_activeModulePreview"
            :file="first_source_media"
            :resolution="180"
            :context="'preview'"
          />

          <RemoveMenu :remove_text="$t('remove')" @remove="removeModule" />
          <button type="button" class="u-buttonLink" @click="duplicateModule">
            <sl-icon name="file-plus" />
            {{ $t("duplicate") }}
          </button>

          {{ $t("lock") }}
          {{ $t("unlock") }}

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
    gridstep_in_cm: Number,
    page_color: String,
    publication_path: String,
    page_opened_id: String,
    active_module: [Boolean, Object],
  },
  components: {
    ModuleCreator,
  },
  data() {
    return {
      show_page_options: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    first_source_media() {
      if (!this.active_module) return false;
      try {
        const media_path = this.active_module.source_medias[0].path;
        return this.getSourceMedia({
          source_media_path: media_path,
        });
      } catch (err) {
        return false;
      }
    },
    module_meta_filename() {
      return this.active_module.$path.substring(
        this.active_module.$path.lastIndexOf("/") + 1
      );
    },
  },
  methods: {
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
  padding: calc(var(--spacing) * 1);
  margin: 0 calc(var(--spacing) * 1);

  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

  text-align: left;
}
._activeModulePreview {
  width: 50px;
  height: auto;
  overflow: hidden;
  margin: 0 auto;
  background: var(--c-noir);
  width: 100%;
}
</style>
