<template>
  <SlickList
    class="_reorderedList"
    axis="y"
    :value="local_items"
    @input="updateOrder($event)"
    :useDragHandle="true"
  >
    <SlickItem
      v-for="(item, index) of local_items"
      :key="item.$path"
      :index="index"
      class="_reorderedList--item"
      :class="{
        'is--active': isActive(item.$path),
      }"
    >
      <span v-handle class="_dragHandle" v-if="can_edit">
        <b-icon icon="grip-vertical" :label="$t('move')" />
        <transition name="fade_fast" mode="out-in">
          <span :key="index">
            {{ index + 1 }}
          </span>
        </transition>
      </span>
      <span v-else>
        {{ index + 1 }}
      </span>
      <span class="_clickZone" @click="$emit('openItem', item.$path)">
        <slot :item="item" :index="index" />
      </span>
    </SlickItem>
  </SlickList>
</template>
<script>
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    field_name: String,
    store_type: String,
    items: Array,
    path: String,
    active_item_path: String,
    active_item_meta: String,
    can_edit: Boolean,
  },
  components: {
    SlickItem,
    SlickList,
  },
  directives: { handle: HandleDirective },
  data() {
    return {
      is_saving_changes: false,
      local_items: undefined,
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    items: {
      handler() {
        this.local_items = this.items;
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {},
  methods: {
    isActive(path) {
      return (
        (this.active_item_path && this.active_item_path === path) ||
        (this.active_item_meta &&
          this.active_item_meta === this.getFilename(path))
      );
    },

    getMetaFilenames(items) {
      return items.map((i) => {
        if (this.store_type === "plain_array") {
          return this.getFilename(i.$path);
        } else {
          return {
            meta_filename: this.getFilename(i.$path),
          };
        }
      });
    },
    async updateOrder(items) {
      this.local_items = items;

      const previous_sections_list = this.getMetaFilenames(this.items);
      const sections_list = this.getMetaFilenames(items);

      if (
        JSON.stringify(sections_list) === JSON.stringify(previous_sections_list)
      )
        return "no_update_necessary";

      this.is_saving_changes = true;

      await this.$api.updateMeta({
        path: this.path,
        new_meta: {
          [this.field_name]: sections_list,
        },
      });
      this.is_saving_changes = false;
    },
  },
};
</script>
<style lang="scss">
._reorderedList {
  position: relative;
}

// only target item dragged
body > ._reorderedList--item {
  z-index: 10000;
}

._reorderedList--item {
  position: relative;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  padding: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);

  ._clickZone {
    // text-decoration: underline;
    // text-underline-offset: 0.2em;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      // background: var(--c-gris_clair);
    }
  }

  &.is--active {
    background: var(--c-bleumarine);
    color: white;
    ._title {
    }
  }

  &:has(._dragHandle:hover) {
    background: var(--c-gris);
  }

  // color: black;
  // background: blue;
}
._dragHandle {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  padding: calc(var(--spacing) / 4);
  background: white;
  color: var(--c-noir);
  border-radius: 2px;

  width: 2em;
  height: 2em;

  font-size: var(--sl-font-size-small);
  font-weight: bold;
  font-family: "Fira Code";
  background: var(--c-bleuvert_clair);

  &:hover,
  &:focus-visible {
    background: var(--c-noir);
    color: white;
  }
}
</style>
