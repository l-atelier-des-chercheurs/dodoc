<template>
  <div class="_publicationModule" :style="media_styles">
    <div class="_menu">
      <sl-dropdown
        v-if="$api.is_logged_in"
        class="_dropdown"
        placement="bottom-end"
        distance="4"
      >
        <sl-button slot="trigger" circle caret size="small" />
        <sl-menu>
          <sl-menu-item
            :disabled="!publimodule.size || publimodule.size === 100"
            @click="updateMeta({ size: 100 })"
          >
            100%
          </sl-menu-item>
          <sl-menu-item
            :disabled="publimodule.size === 66.6"
            @click="updateMeta({ size: 66.6 })"
          >
            66%
          </sl-menu-item>
          <sl-menu-item
            :disabled="publimodule.size === 33.3"
            @click="updateMeta({ size: 33.3 })"
          >
            33%
          </sl-menu-item>

          <sl-menu-item
            :disabled="!publimodule.align || publimodule.align === 'left'"
            @click="updateMeta({ align: 'left' })"
          >
            <sl-icon name="align-start" />
          </sl-menu-item>
          <sl-menu-item
            :disabled="publimodule.align === 'center'"
            @click="updateMeta({ align: 'center' })"
          >
            <sl-icon name="align-center" />
          </sl-menu-item>
          <sl-menu-item
            :disabled="publimodule.align === 'right'"
            @click="updateMeta({ align: 'right' })"
          >
            <sl-icon name="align-end" />
          </sl-menu-item>

          <sl-menu-item
            :disabled="position === 'first'"
            @click="$emit('moveUp')"
          >
            {{ $t("move_up") }}
            <sl-icon name="arrow-up-square" />
          </sl-menu-item>
          <sl-menu-item
            :disabled="position === 'last'"
            @click="$emit('moveDown')"
          >
            {{ $t("move_down") }}
            <sl-icon name="arrow-down-square" />
          </sl-menu-item>
          <sl-menu-item @click="$emit('remove')">
            {{ $t("remove") }}
          </sl-menu-item>
        </sl-menu>
      </sl-dropdown>
    </div>
    <ModuleMosaic
      v-if="publimodule.module_type === 'mosaic'"
      :publimodule="publimodule"
      :medias="source_medias"
      @updateMeta="updateMeta"
    />
    <ModuleCarousel
      v-else-if="publimodule.module_type === 'carousel'"
      :publimodule="publimodule"
      :medias="source_medias"
    />
    <CollaborativeEditor2
      v-else-if="publimodule.module_type === 'text'"
      :path="source_medias[0].$path"
      :content="source_medias[0].$content"
      :scrollingContainer="$el"
      :line_selected="false"
      :can_edit="$api.is_logged_in"
      @lineClicked="$emit('lineClicked', $event)"
    />
  </div>
</template>
<script>
import ModuleMosaic from "@/components/publications/modules/ModuleMosaic.vue";
import ModuleCarousel from "@/components/publications/modules/ModuleCarousel.vue";
import CollaborativeEditor2 from "@/adc-core/fields/collaborative-editor/CollaborativeEditor2.vue";

// a module is a block for a publication, listed in publication.modules_list

export default {
  props: {
    publimodule: Object,
    position: String,
  },
  components: {
    ModuleMosaic,
    ModuleCarousel,
    CollaborativeEditor2,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    source_medias() {
      if (!this.publimodule.source_medias) return [];
      return this.publimodule.source_medias.map((path) =>
        this.getSourceMedia({ source_media_path: path })
      );
    },
    media_styles() {
      let margin_left = 0;
      if (this.publimodule.align === "center")
        if (this.publimodule.size === 66.6) margin_left = 16.6;
        else if (this.publimodule.size === 33.3) margin_left = 33.3;
      if (this.publimodule.align === "right")
        if (this.publimodule.size === 66.6) margin_left = 33.3;
        else if (this.publimodule.size === 33.3) margin_left = 66.6;

      // const margins =
      //   this.publimodule.align === "center"
      //     ? { "margin-left": "auto", "margin-right": "auto" }
      //     : this.publimodule.align === "end"
      //     ? { "margin-left": "auto", "margin-right": "0" }
      //     : "";

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
  // float: left;
  width: calc(var(--module-width) * 1%);
  margin-left: calc(var(--module-margin-left) * 1%);
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  min-height: calc(var(--spacing) * 3);
}

._menu {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  margin: calc(var(--spacing) / 2);
}
</style>
