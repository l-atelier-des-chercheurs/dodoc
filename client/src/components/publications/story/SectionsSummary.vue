<template>
  <div class="_sectionsSummary">
    <ProjectCard
      :header="$t('summary')"
      :icon="'file-earmark-arrow-down'"
      :has_items="sections.length > 0 ? sections.length : false"
      :is_open_initially="sections.length === 0"
    >
      <SlickList
        class="_list"
        axis="y"
        :value="sections"
        @input="$emit('updateOrder', $event)"
        :useDragHandle="true"
      >
        <SlickItem
          v-for="(section, index) of sections"
          :key="section.$path"
          :index="index"
          class="_summaryItem"
          :class="{
            'is--active': isActive(section.$path),
          }"
        >
          <span v-handle class="_dragHandle" v-if="can_edit">
            <sl-icon name="grip-vertical" label="Déplacer" />
          </span>
          <span class="_clickZone" @click="$emit('openSection', section.$path)">
            <h4 class="_title">
              <span v-if="section.section_title">
                {{ section.section_title }}
              </span>
              <span v-else v-html="'<i>' + $t('untitled') + '</i>'" />
            </h4>
          </span>
          <!-- <small>
            ({{ section.modules_list ? section.modules_list.length : 0 }})
          </small> -->
        </SlickItem>
      </SlickList>
      <template v-if="can_edit">
        <template v-if="sections.length > 0">
          <hr />
        </template>
        <button
          type="button"
          class="u-buttonLink"
          @click="$emit('createSection')"
        >
          {{ $t("create_section") }}
        </button>
      </template>
    </ProjectCard>
  </div>
</template>
<script>
import ProjectCard from "@/components/ProjectCard.vue";
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    sections: Array,
    opened_section: [Boolean, Object],
    can_edit: Boolean,
  },
  components: {
    ProjectCard,
    SlickItem,
    SlickList,
  },
  directives: { handle: HandleDirective },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    isActive(path) {
      return this.opened_section && path === this.opened_section.$path;
    },
  },
};
</script>
<style lang="scss" scoped>
._sectionsSummary {
  max-width: 60ch;
  width: 100%;
  margin: calc(var(--spacing) / 1) auto;
}
._dragHandle {
  display: flex;
  cursor: grab;
  padding: calc(var(--spacing) / 4);
  background: var(--c-gris);
  color: black;
  border-radius: 2px;

  &:hover,
  &:focus-visible {
    background: transparent;
  }
}

._list {
  color: black;
}
</style>
<style lang="scss">
// slickitem
._summaryItem {
  z-index: 10000;

  display: flex;
  flex-flow: row wrap;
  align-items: center;

  padding: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);

  ._clickZone {
    text-decoration: underline;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: var(--c-gris_clair);
    }
  }

  ._title {
    padding: calc(var(--spacing) / 8) calc(var(--spacing) / 4);
    border-radius: 2px;
  }

  &.is--active {
    ._title {
      background: var(--c-orange);
    }
  }
  // color: black;
  // background: blue;
}
</style>
