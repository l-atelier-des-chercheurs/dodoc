<template>
  <div class="_publicationModule">
    <div class="_sideOptions" v-if="can_edit">
      <button
        type="button"
        class="_sideBtns _moveBefore"
        :disabled="module_position === 'first' || module_position === 'alone'"
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
          <sl-button variant="default" size="small" pill>
            {{ $t(`module.label.${publimodule.module_type}`) }}
          </sl-button>

          <div class="_buttonRow">
            <button
              type="button"
              class="u-button"
              :disabled="!publimodule.size || publimodule.size === 100"
              @click="updateMeta({ size: 100 })"
            >
              100%
            </button>
            <button
              type="button"
              class="u-button"
              :disabled="publimodule.size === 66.6"
              @click="updateMeta({ size: 66.6 })"
            >
              66%
            </button>
            <button
              type="button"
              class="u-button"
              :disabled="publimodule.size === 33.3"
              @click="updateMeta({ size: 33.3 })"
            >
              33%
            </button>
          </div>

          <div class="_buttonRow">
            <button
              type="button"
              class="u-button"
              :disabled="!publimodule.align || publimodule.align === 'left'"
              @click="updateMeta({ align: 'left' })"
            >
              <sl-icon name="align-start" />
            </button>
            <button
              type="button"
              class="u-button"
              :disabled="publimodule.align === 'center'"
              @click="updateMeta({ align: 'center' })"
            >
              <sl-icon name="align-center" />
            </button>
            <button
              type="button"
              class="u-button"
              :disabled="publimodule.align === 'right'"
              @click="updateMeta({ align: 'right' })"
            >
              <sl-icon name="align-end" />
            </button>
          </div>

          <div class="_buttonRow">
            <button type="button" class="u-button" disabled>
              {{ $t("duplicate") }}
            </button>
            <button type="button" class="u-button" @click="$emit('remove')">
              {{ $t("remove") }}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="_sideBtns _moveAfter"
        :disabled="module_position === 'last' || module_position === 'alone'"
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

    <div class="_content" :style="media_styles">
      <ModuleSingle
        v-if="publimodule.module_type === 'single'"
        :publimodule="publimodule"
        :can_edit="can_edit"
        @updateMeta="updateMeta"
      />
      <ModuleMosaic
        v-else-if="publimodule.module_type === 'mosaic'"
        :publimodule="publimodule"
        :can_edit="can_edit"
        @updateMeta="updateMeta"
      />
      <ModuleCarousel
        v-else-if="publimodule.module_type === 'carousel'"
        :publimodule="publimodule"
        :can_edit="can_edit"
      />
      <CollaborativeEditor2
        v-else-if="publimodule.module_type === 'text' && first_media"
        :path="first_media.$path"
        :content="first_media.$content"
        :scrollingContainer="$el"
        :line_selected="false"
        :can_edit="can_edit"
        @lineClicked="$emit('lineClicked', $event)"
      />
      <small v-else>Nothing to display</small>
    </div>
  </div>
</template>
<script>
import ModuleSingle from "@/components/publications/modules/ModuleSingle.vue";
import ModuleMosaic from "@/components/publications/modules/ModuleMosaic.vue";
import ModuleCarousel from "@/components/publications/modules/ModuleCarousel.vue";
import CollaborativeEditor2 from "@/adc-core/fields/collaborative-editor/CollaborativeEditor2.vue";

// a module is a block for a publication, listed in publication.modules_list

export default {
  props: {
    publimodule: Object,
    module_position: String,
    can_edit: Boolean,
  },
  components: {
    ModuleSingle,
    ModuleMosaic,
    ModuleCarousel,
    CollaborativeEditor2,
  },
  data() {
    return {
      show_advanced_menu: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    first_media() {
      if (
        !this.publimodule.source_medias ||
        this.publimodule.source_medias.length === 0
      )
        return false;
      const { path } = this.publimodule.source_medias[0];
      if (path) return this.getSourceMedia({ source_media_path: path });
      return false;
    },
    media_styles() {
      let margin_left = 0;
      if (this.publimodule.align === "center")
        if (this.publimodule.size === 66.6) margin_left = 16.6;
        else if (this.publimodule.size === 33.3) margin_left = 33.3;
      if (this.publimodule.align === "right")
        if (this.publimodule.size === 66.6) margin_left = 33.3;
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
  },
};
</script>
<style lang="scss" scoped>
._publicationModule {
  position: relative;
  padding: 0 calc(var(--spacing) * 1);

  ._content {
    min-height: calc(24px * 3);
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
  background: var(--c-bleuvert_fonce);

  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;

  --side-width: 24px;
  width: var(--side-width);
  border-radius: calc(var(--side-width) / 2);
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
    background: var(--c-bleuvert_clair);
  }
}

._advanced_menu {
  position: absolute;
  z-index: 10;
  left: 100%;
  top: 50%;
  transform: translate(0, -50%);

  background: white;
  background: var(--c-bleuvert_fonce);
  padding: calc(var(--spacing) / 2);

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
