<template>
  <div>
    <div class="_pinned" v-if="pinned_folders.length > 0 || can_edit">
      <div class="">
        <DLabel :str="$t('pinned')" />
        <div
          v-if="pinned_folders.length === 0 && can_edit"
          class="u-instructions"
        >
          {{ $t("click_to_pin") }}
        </div>
      </div>

      <transition-group tag="section" class="_list" name="projectsList" appear>
        <div
          v-for="(folder, index) in pinned_folders"
          :key="folder.$path"
          class="_item"
        >
          <slot :item="folder" />
          <div class="_pinSpace" v-if="can_edit">
            <button
              type="button"
              class="u-button u-button_icon"
              :disabled="
                ['alone', 'first'].includes(positionInPinned(folder.$path))
              "
              @click="movePin(index, -1)"
            >
              <b-icon
                icon="arrow-left-circle-fill"
                :aria-label="$t('move_left')"
              />
            </button>
            <button
              type="button"
              class="u-button u-button_icon"
              @click="removeFromPins(folder.$path)"
            >
              <b-icon icon="pin-fill" :aria-label="$t('unpin')" />
            </button>
            <button
              type="button"
              class="u-button u-button_icon"
              :disabled="
                ['alone', 'last'].includes(positionInPinned(folder.$path))
              "
              @click="movePin(index, +1)"
            >
              <b-icon
                icon="arrow-right-circle-fill"
                :aria-label="$t('move_right')"
              />
            </button>
          </div>
          <div class="_pinSpace _pinSpace_indicator" v-else>
            <b-icon icon="pin-fill" :aria-label="$t('pinned')" />
          </div>
        </div>
      </transition-group>
    </div>

    <transition-group
      tag="section"
      class="_nonpinned _list"
      name="projectsList"
      appear
    >
      <div
        v-for="folder in non_pinned_folders"
        :key="folder.$path"
        class="_item"
      >
        <slot :item="folder" />
        <div class="_pinSpace" v-if="can_edit">
          <button
            type="button"
            class="u-button u-button_icon"
            @click="addSpaceToPins(folder.$path)"
          >
            <b-icon icon="pin" :aria-label="$t('pin')" />
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script>
export default {
  props: {
    field_name: String,
    content: {
      type: Array,
      default: () => [],
    },
    path: String,
    folders: Array,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    list_of_pins_paths() {
      if (this.content.length === 0) return [];
      return this.content;
    },
    non_pinned_folders() {
      return this.folders.filter(
        (s) => !this.list_of_pins_paths.includes(s.$path)
      );
    },
    pinned_folders() {
      return this.list_of_pins_paths.reduce((acc, pp) => {
        const s = this.folders.find((sp) => sp.$path === pp);
        if (s) acc.push(s);
        return acc;
      }, []);
    },
  },
  methods: {
    async addSpaceToPins(path) {
      let pins_paths = this.list_of_pins_paths.slice();
      pins_paths.push(path);
      this.updateList({ pins_paths });
    },
    movePin(index, dir) {
      let pins_paths = this.list_of_pins_paths.slice();
      pins_paths.move(index, index + dir);
      this.updateList({ pins_paths });
    },
    positionInPinned(path) {
      if (this.pinned_folders.length === 1) return "alone";
      const index = this.pinned_folders.findIndex((ps) => ps.$path === path);
      if (index === 0) return "first";
      if (index === this.pinned_folders.length - 1) return "last";
      return "none";
    },
    removeFromPins(path) {
      let pins_paths = this.list_of_pins_paths.slice();
      pins_paths = pins_paths.filter((sp) => sp !== path);
      this.updateList({ pins_paths });
    },
    async updateList({ pins_paths }) {
      await this.$api.updateMeta({
        path: this.path,
        new_meta: {
          [this.field_name]: pins_paths,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._pinned {
  background: var(--c-pinnedBg);
  padding: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 2);
  border-radius: 14px;
}
._nonpinned {
  padding: 0 calc(var(--spacing) / 1);
}

._item {
  position: relative;
}

._pinSpace {
  position: absolute;
  top: 0;
  left: 0;
  margin: calc(var(--spacing) / 1);

  z-index: 100;
  color: var(--c-orange);

  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);

  > button {
    display: block;
    pointer-events: auto;
  }
}

._pinSpace_indicator {
  pointer-events: none;
}

._list {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 1);
  align-items: stretch;
  grid-template-columns: repeat(
    auto-fill,
    minmax(var(--item-width, 320px), 1fr)
  );
}
</style>
