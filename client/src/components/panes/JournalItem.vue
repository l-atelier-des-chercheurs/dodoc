<template>
  <div class="_journalItem">
    <div class="_backToList" @click="$emit('close')">
      <sl-button @click.stop="$emit('close')" size="small">
        <sl-icon slot="prefix" name="arrow-left" />
        {{ $t("back") }}
      </sl-button>
    </div>
    <div class="_journalItem--content">
      <div class="_entryTitle">
        {{ file.title }}
      </div>
      <sl-tree>
        <sl-tree-item>
          Informations
          <sl-tree-item>
            Date de création
            <sl-tree-item>
              <DateField
                :date="file.date_uploaded"
                :show_detail_initially="true"
              />
            </sl-tree-item>
          </sl-tree-item>
          <sl-tree-item>
            Date de dernière modification
            <sl-tree-item>
              <DateField
                :date="file.date_modified"
                :show_detail_initially="true"
              />
            </sl-tree-item>
          </sl-tree-item>
          <sl-tree-item>
            Supprimer cette entrée
            <sl-tree-item>
              <sl-button @click="removeText" size="small">Confirmer</sl-button>
            </sl-tree-item>
          </sl-tree-item>
        </sl-tree-item>
      </sl-tree>
      <br />
      <CollaborativeEditor2
        :folder_type="'projects'"
        :folder_slug="project_slug"
        :file="file"
        :scrollingContainer="$el"
        :line_selected="line_selected"
        @lineClicked="$emit('lineClicked', $event)"
      />
    </div>
  </div>
</template>
<script>
import CollaborativeEditor2 from "@/adc-core/fields/collaborative-editor/CollaborativeEditor2.vue";

export default {
  props: {
    file: Object,
    project_slug: String,
    line_selected: [Boolean, Number],
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
  computed: {},
  methods: {
    async removeText() {
      await this.$api.deleteFile({
        folder_type: "projects",
        folder_slug: this.project_slug,
        meta_slug: this.file.slug,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._entryTitle {
  font-size: var(--sl-font-size-x-large);
  padding: calc(var(--spacing) / 1);
}

._journalItem {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: auto;

  display: flex;
  flex-flow: column nowrap;

  ._backToList {
    width: 100%;
    background: transparent;
    text-align: center;
    padding: calc(var(--spacing) / 2);
  }

  ._journalItem--content {
    pointer-events: auto;
    background: white;
    flex: 1 1 100%;
  }
}

sl-details::part(summary) {
  font-size: 120%;
}
sl-details::part(base) {
  border-color: black;
  border-width: 0;
  border-radius: 0;
}
sl-details::part(content) {
  overflow: initial;
  padding: 0;
  padding-bottom: var(--sl-spacing-small);
}

._editor {
  // padding: var(--spacing) 0;
  // max-width: 120ch;
}
</style>
