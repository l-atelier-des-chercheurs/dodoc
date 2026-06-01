<template>
  <div>
    <div class="_reorderedList">
      <div
        v-for="(item, index) of local_items"
        :key="item.$path"
        :index="index"
        class="_reorderedList--item"
      >
        <button
          type="button"
          class="u-linkList"
          :class="{
            'is--active': isActive(item.$path),
          }"
          @click="
            !isActive(item.$path) ? $emit('openItem', item.$path) : undefined
          "
        >
          <span>
            <slot :item="item" :index="index" />
          </span>
        </button>
      </div>
      <template v-if="can_edit">
        <EditBtn :btn_type="'add'" @click="$emit('createItem')" />
        <EditBtn
          :btn_type="'order'"
          @click="show_change_order_modal = !show_change_order_modal"
        />
      </template>
    </div>

    <BaseModal2
      v-if="show_change_order_modal"
      :title="$t('change_order')"
      @close="show_change_order_modal = false"
    >
      <div>
        <SlickList
          class="_reorderableList"
          axis="y"
          :value="local_items"
          @input="updateOrder($event)"
        >
          <SlickItem
            v-for="(item, index) of local_items"
            class="_reorderableList--item"
            :key="item.$path"
            :index="index"
          >
            <button type="button" class="u-button u-button_icon _dragHandle">
              <b-icon v-handle icon="grip-vertical" :label="$t('move')" />
            </button>
            <span>
              <slot :item="item" :index="index" />
            </span>
          </SlickItem>
        </SlickList>
        <div></div>
      </div>
      <template #footer>
        <div />
        <button
          type="button"
          class="u-button"
          @click="show_change_order_modal = false"
          :disabled="save_status === 'saving'"
        >
          <b-icon
            v-if="save_status === 'saving'"
            key="saving"
            icon="arrow-repeat"
            animation="spin"
          />
          <b-icon v-else icon="check" />

          {{ $t("close") }}
        </button>
      </template>
    </BaseModal2>
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
      show_change_order_modal: false,
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
      await new Promise((r) => setTimeout(r, 150));

      this.save_status = undefined;
    },
  },
};
</script>
<style lang="scss">
._reorderedList {
  position: relative;
  display: flex;
  flex-flow: row wrap;

  margin: 0 calc(var(--spacing) / -2);
}

._reorderedList--item {
  position: relative;

  display: inline-flex;
  flex-flow: row nowrap;
  align-items: center;

  background: white;
}

._reorderableList {
  position: relative;
}
._reorderableList--item {
  background: transparent;
  z-index: 10000;
  min-height: 2em;
  background: white;

  background: var(--c-gris_clair);
  border-radius: var(--input-border-radius);
  margin-bottom: calc(var(--spacing) / 4);

  user-select: none;
  // border: 1px solid var(--c-gris);
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  cursor: grab;

  &:hover {
    color: var(--active-color);
  }

  &:hover ._dragHandle {
    z-index: 1;
    color: var(--active-color);
  }
}
</style>
