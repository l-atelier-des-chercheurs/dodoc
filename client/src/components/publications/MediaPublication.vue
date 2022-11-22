<template>
  <div
    class="_mediaPublication"
    :style="`--media-width: ${publication_file.size};`"
  >
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
        <sl-menu-item @click="$emit('resize', 100)"> 100% </sl-menu-item>
        <sl-menu-item @click="$emit('resize', 50)"> 50% </sl-menu-item>
        <sl-menu-item @click="$emit('resize', 33)"> 33% </sl-menu-item>
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
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._mediaPublication {
  position: relative;
  width: calc(var(--media-width) * 1%);
}

._dropdown {
  position: absolute;
  top: 0;
  right: 0;
  margin: calc(var(--spacing) / 4);
}
</style>
