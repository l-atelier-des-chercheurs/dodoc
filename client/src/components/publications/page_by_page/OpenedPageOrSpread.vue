<template>
  <div
    class="_openedPage"
    :class="{
      'is--editable': can_edit,
    }"
  >
    <transition name="fade_fast" mode="out-in">
      <div v-if="!is_spread" :key="'page-' + page_opened_id">
        <SinglePage
          :context="'full'"
          :page_number="page_opened_index"
          :publication_path="publication_path"
          :page_modules="getModulesForPage(page_opened_id)"
          :page_id="page_opened_id"
          :page_width="page_width"
          :page_height="page_height"
          :can_edit="can_edit"
          @close="$emit('togglePage', false)"
        />
        <div class="_navBar">
          <div>
            <button
              type="button"
              @click="prevPage"
              :disabled="page_opened_index === 0"
              v-if="page_opened_index !== 0"
            >
              <sl-icon name="arrow-left" />
              <SinglePage
                :context="'list'"
                :initial_zoom="0.1"
                :page_modules="getModulesForPage(previous_page_id)"
                :page_width="page_width"
                :page_height="page_height"
                :can_edit="false"
              />
            </button>
          </div>
          <div>
            <button
              type="button"
              @click="nextPage"
              v-if="page_opened_index < pages.length - 1"
              :disabled="page_opened_index === pages.length - 1"
            >
              <sl-icon name="arrow-right" />
              <SinglePage
                :context="'list'"
                :initial_zoom="0.1"
                :page_modules="getModulesForPage(next_page_id)"
                :page_width="page_width"
                :page_height="page_height"
                :can_edit="false"
              />
            </button>
          </div>
        </div>
      </div>
      <div v-else>SPREAD</div>
    </transition>
  </div>
</template>
<script>
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";

export default {
  props: {
    page_opened_id: String,
    publication: Object,
    pages: Array,
    spreads: Array,
    modules: Array,
    page_width: Number,
    page_height: Number,
    can_edit: Boolean,
    is_spread: Boolean,
  },
  components: {
    SinglePage,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    page_opened_index() {
      return this.pages.findIndex((p) => p.id === this.page_opened_id);
    },
    previous_page_id() {
      return this.pages[this.page_opened_index - 1].id;
    },
    next_page_id() {
      return this.pages[this.page_opened_index + 1].id;
    },
  },
  methods: {
    getModulesForPage(id) {
      return this.modules.filter((f) => f.page_id === id) || [];
    },
    prevPage() {
      const new_index = this.page_opened_index - 1;
      this.$emit("togglePage", this.pages[new_index].id);
    },
    nextPage() {
      const new_index = this.page_opened_index + 1;
      this.$emit("togglePage", this.pages[new_index].id);
    },
  },
};
</script>
<style lang="scss" scoped>
._openedPage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;

  text-align: center;
  overflow: auto;

  padding: calc(var(--spacing) * 1);
  background: var(--c-bodybg);

  &.is--editable {
    background: var(--color-publish);
  }
}
._navBar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: auto;
  width: 100%;

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  pointer-events: none;

  > * {
    pointer-events: auto;
    // width: 50px;
  }
}
</style>
