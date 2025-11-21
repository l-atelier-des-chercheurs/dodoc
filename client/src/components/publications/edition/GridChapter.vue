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
          :value="chapter.column_count || 6"
          :suffix="$t('columns')"
          :size="'medium'"
          :min="1"
          :max="12"
          @save="updateChapter({ column_count: $event })"
        />
        <NumberInput
          :label="$t('row_count')"
          :value="chapter.row_count || 6"
          :suffix="$t('rows')"
          :size="'medium'"
          :min="1"
          :max="12"
          @save="updateChapter({ row_count: $event })"
        />
      </div>

      <GridAreas :chapter="chapter" @deleteArea="deleteArea" />
    </div>

    <hr />

    <div class="_gridItems">
      <GridItem
        v-for="area in sorted_grid_areas"
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
  computed: {
    sorted_grid_areas() {
      return this.chapter.grid_areas.sort((a, b) => a.id.localeCompare(b.id));
    },
  },
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
    async deleteArea(areaId) {
      // Find and delete associated text file if it exists
      const text_meta = this.getAreaTextMeta({ id: areaId });

      if (text_meta) {
        try {
          await this.$api.deleteItem({
            path: text_meta.$path,
          });
        } catch (error) {
          console.error("Error deleting text block:", error);
        }
      }

      // Remove area from grid_areas
      const grid_areas = this.chapter.grid_areas.filter(
        (area) => area.id !== areaId
      );
      this.updateChapter({ grid_areas });
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
