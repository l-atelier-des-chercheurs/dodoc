<template>
  <div class="_openChapter">
    <div class="_leftPanel">
      <div class="_topButtons">
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          {{ $t("close") }}
        </button>
        <RemoveMenu @remove="$emit('remove')" />
      </div>
      <template v-if="chapter._main_text">
        <CollaborativeEditor3
          :content="chapter._main_text.$content"
          :path="chapter._main_text.$path"
          :edit_on_mounted="true"
          :save_format="'raw'"
          :custom_formats="[]"
          :can_edit="can_edit"
        />
      </template>
    </div>
    <div class="_rightPanel">
      <div class="_viewMode">
        <select v-model="view_mode" size="small">
          <option value="book">{{ $t("book") }}</option>
          <option value="html">{{ $t("website") }}</option>
        </select>
      </div>
      <div class="_viewer">
        <ViewContent
          :content="chapter._main_text.$content"
          :view_mode="view_mode"
        />
      </div>
    </div>
  </div>
</template>
<script>
import ViewContent from "@/components/publications/markdown/ViewContent.vue";

export default {
  props: {
    chapter: Object,
    can_edit: Boolean,
  },
  components: {
    ViewContent,
  },
  data() {
    return {
      view_mode: "book",
    };
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

  display: flex;
  flex-direction: row nowrap;

  > * {
    flex: 1 1 0;
  }
}

._leftPanel {
  height: 100%;
  overflow: auto;
  // background-color: #000;
  border-right: 2px solid var(--c-gris);
  background-color: var(--c-gris);
}

._topButtons {
  display: flex;
  flex-direction: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2) 0;
}

._rightPanel {
  position: relative;
  overflow: auto;
  height: 100%;
  background-color: white;
}

._viewMode {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  margin: 0 auto;
  padding: calc(var(--spacing) / 2);
  pointer-events: none;

  select {
    max-width: 20ch;
    pointer-events: all;
  }
}

._viewer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
