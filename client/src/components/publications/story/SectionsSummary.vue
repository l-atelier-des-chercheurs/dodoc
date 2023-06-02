<template>
  <div class="_sectionsSummary">
    <DetailsPane
      ref="details"
      :header="$t('summary')"
      :icon="'card-list'"
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
          <span v-handle class="u-dragHandle" v-if="can_edit">
            <sl-icon name="grip-vertical" label="Déplacer" />
          </span>
          <span class="_clickZone" @click="openSection(section.$path)">
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
    </DetailsPane>
  </div>
</template>
<script>
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    sections: Array,
    opened_section: [Boolean, Object],
    can_edit: Boolean,
  },
  components: {
    SlickItem,
    SlickList,
  },
  directives: { handle: HandleDirective },
  data() {
    return {};
  },
  created() {},
  mounted() {
    this.$eventHub.$on(`sections.open_summary`, this.openSummary);
  },
  beforeDestroy() {
    this.$eventHub.$off(`sections.open_summary`, this.openSummary);
  },
  watch: {},
  computed: {},
  methods: {
    openSummary() {
      this.$refs.details.$el.open = true;
    },
    closeSummary() {
      this.$refs.details.$el.open = false;
    },
    openSection(path) {
      // jarring jump in section
      // setTimeout(() => {
      //   this.closeSummary();
      // }, 500);
      this.$emit("openSection", path);
    },
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
      background: var(--c-bleumarine);
      color: white;
    }
  }
  // color: black;
  // background: blue;
}
</style>
