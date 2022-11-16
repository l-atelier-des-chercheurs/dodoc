<template>
  <div>
    <small>
      <DateField :date="article.date_uploaded" />
    </small>
    <h2>
      {{ article.title }}
    </h2>
    <sl-tree>
      <sl-tree-item>
        Informations
        <sl-tree-item>
          Date de création
          <sl-tree-item>
            <DateField
              :date="article.date_uploaded"
              :show_detail_initially="true"
            />
          </sl-tree-item>
        </sl-tree-item>
        <sl-tree-item>
          Date de dernière modification
          <sl-tree-item>
            <DateField
              :date="article.date_modified"
              :show_detail_initially="true"
            />
          </sl-tree-item>
        </sl-tree-item>
        <sl-tree-item>
          Supprimer cette entrée
          <sl-tree-item>
            <sl-button @click="removeArticle" size="small">Confirmer</sl-button>
          </sl-tree-item>
        </sl-tree-item>
      </sl-tree-item>
    </sl-tree>

    <div v-html="article.text" />
    <CollaborativeEditor2
      :file="article"
      :scrollingContainer="$el"
      :line_selected="line_selected"
      @lineClicked="$emit('lineClicked', $event)"
    />
  </div>
</template>
<script>
import CollaborativeEditor2 from "@/adc-core/fields/collaborative-editor/CollaborativeEditor2.vue";

export default {
  props: {
    article: Object,
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
    async removeArticle() {
      await this.$api.deleteFile({
        path: this.article.$path,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
