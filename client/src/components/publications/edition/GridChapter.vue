<template>
  <div class="_gridChapter">
    <!-- Première étape : choisir le nbre de colonnes et rangées. Ici un
    diagramme colonne/ligne du contenu (voir https://cssgridgenerator.io/)
    En-dessous > chaque zone correspond à une cellule, dans laquelle on peut
    mettre un média ou un texte markdown (faisant référence à des médias).
 -->

    <div class="_gridAreas">
      <div class="_gridInputs">
        <NumberInput
          :label="$t('column_count')"
          :value="chapter.column_count || 1"
          :suffix="$t('columns')"
          :size="'medium'"
          :min="1"
          :max="12"
          @save="updateChapter({ column_count: $event })"
        />
        <NumberInput
          :label="$t('row_count')"
          :value="chapter.row_count || 1"
          :suffix="$t('rows')"
          :size="'medium'"
          :min="1"
          :max="12"
          @save="updateChapter({ row_count: $event })"
        />
      </div>

      <GridAreas :chapter="chapter" />
    </div>

    <hr />

    <div class="_gridItems">
      <GridItem
        v-for="area in chapter.grid_areas"
        :key="area.id"
        :area="area"
        :area_text_meta="getAreaTextMeta(area)"
        @createText="createText"
      />
    </div>
  </div>
</template>

<script>
import GridAreas from "./GridAreas.vue";
import GridItem from "./GridItem.vue";

export default {
  props: {
    chapter: Object,
    publication: Object,
  },
  components: {
    GridAreas,
    GridItem,
  },
  data() {
    return {};
  },
  computed: {},
  methods: {
    updateChapter(new_meta) {
      this.$api.updateMeta({
        path: this.chapter.$path,
        new_meta,
      });
    },
    async createText(areaId) {
      const filename = areaId + "_text.md";
      const { meta_filename } = await this.$api.uploadText({
        path: this.publication.$path,
        filename,
        content: "",
        additional_meta: {
          content_type: "markdown",
          grid_area_id: areaId,
        },
      });
    },
    getAreaTextMeta(area) {
      return this.publication.$files.find((f) => f.grid_area_id === area.id);
    },
  },
};
</script>

<style lang="scss" scoped>
._gridChapter {
  padding-bottom: calc(var(--spacing) * 1);
}
._gridInputs {
  display: flex;
  gap: calc(var(--spacing) * 1);
  margin-bottom: calc(var(--spacing) * 1);

  > * {
    flex: 1 1 0;
  }
}

._gridItems {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) * 1);
}
</style>
