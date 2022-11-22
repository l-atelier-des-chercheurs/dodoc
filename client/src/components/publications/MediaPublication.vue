<template>
  <div class="_mediaPublication" :style="media_styles">
    <sl-dropdown
      v-if="$api.is_logged_in"
      class="_dropdown"
      placement="bottom-end"
      distance="4"
    >
      <sl-button slot="trigger" caret>
        <!-- <sl-icon name="x-circle" /> -->
        <!-- {{ $t("edit") }} -->
      </sl-button>
      <sl-menu>
        <sl-menu-item
          :disabled="!publication_file.size || publication_file.size === 100"
          @click="updateMeta({ size: 100 })"
        >
          100%
        </sl-menu-item>
        <sl-menu-item
          :disabled="publication_file.size === 50"
          @click="updateMeta({ size: 50 })"
        >
          50%
        </sl-menu-item>
        <sl-menu-item
          :disabled="publication_file.size === 33"
          @click="updateMeta({ size: 33 })"
        >
          33%
        </sl-menu-item>

        <sl-menu-item
          :disabled="
            !publication_file.align || publication_file.align === 'start'
          "
          @click="updateMeta({ align: 'start' })"
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
          :disabled="publication_file.align === 'end'"
          @click="updateMeta({ align: 'end' })"
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
  </div>
</template>
<script>
export default {
  props: {
    publication_file: Object,
  },
  components: {},
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
      return this.getSourceMedia({ source_media_path });
    },
    media_styles() {
      const margins =
        this.publication_file.align === "center"
          ? { "margin-left": "auto", "margin-right": "auto" }
          : this.publication_file.align === "end"
          ? { "margin-left": "auto", "margin-right": "0" }
          : "";

      return Object.assign({}, margins, {
        "--media-width": this.publication_file.size || 100,
      });
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
  width: calc(var(--media-width) * 1%);

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

._dropdown {
  position: absolute;
  top: 0;
  right: 0;
  margin: calc(var(--spacing) / 4);
}
</style>
