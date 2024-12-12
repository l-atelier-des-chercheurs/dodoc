<template>
  <div>
    <SlickList
      class="_reorderedList"
      axis="x"
      :value="local_items"
      :useDragHandle="true"
      @input="updateOrder($event)"
    >
      <SlickItem
        v-for="(item, index) of local_items"
        :key="item.$path"
        :index="index"
        class="_reorderedList--item"
      >
        <span v-handle class="_dragHandle" v-if="can_edit && change_order" />
        <button
          type="button"
          class="u-linkList"
          :class="{
            'is--active': isActive(item.$path),
            'is--redorderable': change_order,
          }"
          @click="
            !isActive(item.$path) ? $emit('openItem', item.$path) : undefined
          "
        >
          <span>
            <slot :item="item" :index="index" />
          </span>
        </button>
      </SlickItem>
      &nbsp;
      <div class="_reorderedList--item">
        <EditBtn
          v-if="can_edit"
          :btn_type="'add'"
          @click="$emit('createItem')"
        />
      </div>
      &nbsp;
      <div
        class="_reorderedList--item"
        v-if="can_edit && local_items.length > 1"
      >
        <EditBtn
          :btn_type="'order'"
          :is_unfolded="change_order"
          @click="change_order = !change_order"
        />
        <b-icon
          v-if="save_status === 'saving'"
          :key="save_status"
          icon="stopwatch"
        />
        <b-icon
          v-else-if="save_status === 'saved'"
          :key="save_status"
          icon="check"
        />
      </div>
      <div class="_reorderedList--item"></div>
    </SlickList>
  </div>
</template>
<script>
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    field_name: String,
    store_type: String,
    items: Array,
    path: String,
    show_index: Boolean,
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
      local_items: undefined,
      change_order: false,
      save_status: undefined,
    };
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

      this.save_status = "saving";

      await this.$api.updateMeta({
        path: this.path,
        new_meta: {
          [this.field_name]: sections_list,
        },
      });
      this.save_status = "saved";

      setTimeout(() => {
        this.save_status = undefined;
      }, 500);
    },
  },
};
</script>
<style lang="scss">
._reorderedList {
  position: relative;
  display: flex;
  flex-flow: row wrap;
  pointer-events: none;

  margin: 0 calc(var(--spacing) / -2);
}

._reorderedList--item {
  position: relative;

  display: inline-flex;
  flex-flow: row nowrap;
  align-items: center;

  pointer-events: auto;

  background: white;

  border-radius: 4px;

  &:has(._dragHandle:hover) {
    z-index: 1;
    background: var(--c-gris);
    box-shadow: var(--panel-shadows);
  }

  // only target item dragged
  body > & {
    z-index: 10000;

    ._dragHandle {
      // background: var(--c-noir);
      border-color: var(--c-noir);
      // color: white;
    }
  }

  // color: black;
  // background: blue;
}
._dragHandle {
  position: absolute;
  cursor: grab;
  padding: calc(var(--spacing) / 4);

  background: transparent;
  // color: var(--c-noir);
  // border-radius: 2px;

  // margin-right: -1em;
  width: 100%;
  height: 100%;
  height: 2em;

  border-radius: 1em;
  border: 2px solid var(--c-gris);

  // background: var(--c-gris_clair);

  &:hover,
  &:focus-visible {
    border-color: var(--c-noir);
    // background: var(--c-noir);
    // color: white;
  }
}
</style>
