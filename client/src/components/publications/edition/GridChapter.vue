<template>
  <div class="_gridChapter">
    <div class="_gridItems">
      <GridItem
        v-for="area in sorted_grid_areas"
        :key="area.id"
        :area="area"
        :chapter="chapter"
        :publication="publication"
      />
    </div>
  </div>
</template>

<script>
import GridItem from "./GridItem.vue";

export default {
  props: {
    chapter: Object,
    publication: Object,
  },
  components: {
    GridItem,
  },
  data() {
    return {};
  },
  computed: {
    sorted_grid_areas() {
      const grid_areas = this.chapter.grid_areas;
      if (!grid_areas || (Array.isArray(grid_areas) && grid_areas.length === 0))
        return [];

      return grid_areas
        .filter((area) => area.id.length === 1)
        .sort((a, b) => a.id.localeCompare(b.id))
        .reduce((acc, area) => {
          const number_of_areas_in_chain = grid_areas.filter((a) =>
            a.id.startsWith(area.id)
          ).length;
          acc.push({
            ...area,
            number_of_areas_in_chain,
          });
          return acc;
        }, []);
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
._gridChapter {
  padding-bottom: calc(var(--spacing) * 1);
}

._gridItems {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) * 1);
}
</style>
