<template>
  <div class="_mediaPublication" :style="media_styles">
    <sl-dropdown
      v-if="$api.is_logged_in"
      class="_dropdown"
      placement="bottom-end"
      distance="4"
    >
      <sl-button slot="trigger" circle caret size="small" />
      <sl-menu>
        <sl-menu-item
          :disabled="!publication_file.size || publication_file.size === 100"
          @click="updateMeta({ size: 100 })"
        >
          100%
        </sl-menu-item>
        <sl-menu-item
          :disabled="publication_file.size === 66.6"
          @click="updateMeta({ size: 66.6 })"
        >
          2/3
        </sl-menu-item>
        <sl-menu-item
          :disabled="publication_file.size === 33.3"
          @click="updateMeta({ size: 33.3 })"
        >
          1/3
        </sl-menu-item>

        <sl-menu-item
          :disabled="
            !publication_file.align || publication_file.align === 'left'
          "
          @click="updateMeta({ align: 'left' })"
        >
          <sl-icon name="align-start" />
        </sl-menu-item>
        <sl-menu-item
          :disabled="publication_file.align === 'center'"
          @click="updateMeta({ align: 'center' })"
        >
          <sl-icon name="align-center" />
        </sl-menu-item>
        <sl-menu-item
          :disabled="publication_file.align === 'right'"
          @click="updateMeta({ align: 'right' })"
        >
          <sl-icon name="align-end" />
        </sl-menu-item>

        <sl-menu-item @click="$emit('moveUp')">
          {{ $t("move_up") }}
          <sl-icon name="arrow-up-square" />
        </sl-menu-item>
        <sl-menu-item @click="$emit('moveDown')">
          {{ $t("move_down") }}
          <sl-icon name="arrow-down-square" />
        </sl-menu-item>
        <sl-menu-item @click="$emit('remove')">
          {{ $t("remove") }}
        </sl-menu-item>
      </sl-menu>
    </sl-dropdown>
    <MediaContent
      v-if="source_file"
      :file="source_file"
      :resolution="1600"
      :context="'full'"
    />
    <CollaborativeEditor2
      v-else-if="publication_file.$type === 'text'"
      :path="publication_file.$path"
      :content="publication_file.$content"
      :scrollingContainer="$el"
      :line_selected="false"
      :can_edit="$api.is_logged_in"
      @lineClicked="$emit('lineClicked', $event)"
    />
  </div>
</template>
<script>
import CollaborativeEditor2 from "@/adc-core/fields/collaborative-editor/CollaborativeEditor2.vue";

export default {
  props: {
    publication_file: Object,
  },
  components: {
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
    source_file() {
      const source_media_path = this.publication_file.path_to_source_media;
      if (!source_media_path) return false;

      return this.getSourceMedia({ source_media_path });
    },
    media_styles() {
      let margin_left = 0;
      if (this.publication_file.align === "center")
        if (this.publication_file.size === 66.6) margin_left = 16.6;
        else if (this.publication_file.size === 33.3) margin_left = 33.3;
      if (this.publication_file.align === "right")
        if (this.publication_file.size === 66.6) margin_left = 33.3;
        else if (this.publication_file.size === 33.3) margin_left = 66.6;

      // const margins =
      //   this.publication_file.align === "center"
      //     ? { "margin-left": "auto", "margin-right": "auto" }
      //     : this.publication_file.align === "end"
      //     ? { "margin-left": "auto", "margin-right": "0" }
      //     : "";

      return {
        "--media-width": this.publication_file.size || 100,
        "--margin-left": margin_left,
      };
    },
  },
  methods: {
    async updateMeta(new_meta) {
      await this.$api
        .updateMeta({
          path: this.publication_file.$path,
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
._mediaPublication {
  position: relative;
  // float: left;
  width: calc(var(--media-width) * 1%);
  margin-left: calc(var(--margin-left) * 1%);
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  min-height: calc(var(--spacing) * 3);
}

._dropdown {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  margin: calc(var(--spacing) / 2);
}
</style>
