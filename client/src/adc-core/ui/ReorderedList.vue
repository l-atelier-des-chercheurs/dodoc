<template>
  <div>
    <div class="_changeOrderBtn">
      <button
        v-if="can_edit && local_items.length > 1"
        type="button"
        class="u-buttonLink"
        :class="{
          'is--active': change_order,
        }"
        @click="change_order = !change_order"
      >
        <b-icon icon="arrow-down-up" />
        {{ $t("change_order") }}
      </button>
    </div>
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
        <span v-handle class="_dragHandle" v-if="can_edit && change_order">
          <b-icon icon="grip-vertical" :label="$t('move')" />
          <transition name="fade_fast" mode="out-in">
            <span v-if="show_index" :key="index" class="_index">
              {{ index + 1 }}
            </span>
          </transition>
        </span>
        <span v-else-if="show_index" class="_index">
          {{ index + 1 }}
        </span>
        <span
          class="_clickZone"
          v-if="$listeners.openItem"
          @click="$emit('openItem', item.$path)"
        >
          <slot :item="item" :index="index" />
        </span>
        <span v-else class="_noClickZone">
          <slot :item="item" :index="index" />
        </span>
      </SlickItem>
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
      is_saving_changes: false,
      local_items: undefined,
      change_order: false,
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

._reorderedList--item {
  position: relative;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  padding: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 2);

  background: white;

  border-radius: 4px;

  ._clickZone {
    width: 100%;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      text-decoration: none;
      // background: var(--c-gris_clair);
    }
  }

  ._noClickZone {
    width: 100%;
  }

  &.is--active {
    background: var(--c-gris_fonce);
    color: white;

    ._title {
    }
  }

  &:has(._dragHandle:hover) {
    z-index: 1;
    background: var(--c-gris);
    box-shadow: var(--panel-shadows);
  }

  // only target item dragged
  body > & {
    z-index: 10000;

    ._dragHandle {
      background: var(--c-noir);
      color: white;
    }
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

  background: var(--c-gris_clair);

  &:hover,
  &:focus-visible {
    background: var(--c-noir);
    color: white;
  }
}
._index {
  font-size: var(--sl-font-size-small);
  font-weight: bold;
  font-family: "Fira Code";
}
._changeOrderBtn {
  text-align: right;
}
</style>