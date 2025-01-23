<template>
  <div class="_openChapter">
    <div class="_leftPanel">
      <button type="button" class="u-buttonLink" @click="$emit('close')">
        {{ $t("close") }}
      </button>
      <RemoveMenu @remove="$emit('remove')" />
      <CollaborativeEditor3
        :content="chapter._main_text.$content"
        :path="chapter._main_text.$path"
        :edit_on_mounted="true"
        :save_format="'raw'"
        :can_edit="can_edit"
      />
    </div>
    <div class="_rightPanel">
      <!-- <CollaborativeEditor2 :content="chapter.$content" :can_edit="false" /> -->
    </div>
  </div>
</template>
<script>
export default {
  props: {
    chapter: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._openChapter {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--c-gris_clair);
  background-color: red;

  display: flex;
  flex-direction: row nowrap;

  > * {
    flex: 1 1 0;
  }
}

._leftPanel {
  height: 100%;
  background-color: var(--c-noir);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
}
</style>
