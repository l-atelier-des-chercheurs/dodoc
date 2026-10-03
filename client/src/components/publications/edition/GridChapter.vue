<template>
  <div class="_gridChapter">
    <div class="_gridItems">
      <GridItem
        v-for="area in sorted_grid_areas"
        :key="area.id"
        :area="area"
        :chapter="chapter"
        :publication="publication"
        :has_text_overflow="
          chainHasTextOverflow({ area_id: area.id, chapter })
        "
      />
    </div>
  </div>
</template>

<script>
import GridItem from "./GridItem.vue";
import EditionTextOverflow from "@/mixins/EditionTextOverflow.js";

export default {
  mixins: [EditionTextOverflow],
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
  mounted() {
    this.$eventHub.$on(
      "edition.scrollToGridContent",
      this.onScrollToGridContent
    );
  },
  beforeDestroy() {
    this.$eventHub.$off(
      "edition.scrollToGridContent",
      this.onScrollToGridContent
    );
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
  methods: {
    onScrollToGridContent({ chapter_path, area_id }) {
      if (chapter_path !== this.chapter.$path || !area_id) return;
      const target = this.$el.querySelector(
        `[data-grid-content-area-id="${area_id}"]`
      );
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("_gridItem--scrollHighlight");
      setTimeout(() => {
        target.classList.remove("_gridItem--scrollHighlight");
      }, 1200);
    },
  },
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

::v-deep ._gridItem--scrollHighlight {
  outline: 2px solid var(--c-bleuvert);
  outline-offset: 2px;
}
</style>
