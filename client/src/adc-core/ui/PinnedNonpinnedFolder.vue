<template>
  <div>
    <div class="_pinned" v-if="pinned_folders.length > 0 || can_edit">
      <div class="">
        <DLabel :str="label" />

        <transition name="pagechange" mode="out-in">
          <div
            v-if="pinned_folders.length === 0 && can_edit"
            class="u-instructions"
          >
            {{ $t("click_to_pin") }}
          </div>
          <transition-group
            v-else
            tag="section"
            class="_list _list_pinned"
            :class="{
              'is--mobileView': $root.is_mobile_view,
            }"
            name="listComplete"
            appear
          >
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
        </transition>
      </div>
    </div>

    <transition-group
      tag="section"
      class="_nonpinned _list"
      :class="{
        'is--mobileView': $root.is_mobile_view,
      }"
      name="listComplete"
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
    label: String,
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
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    list_of_pins_metas() {
      if (this.content.length === 0) return [];
      return this.content.filter((c) =>
        this.folders.some((f) => this.getFilename(f.$path) === c)
      );
    },
    pinned_folders() {
      return this.list_of_pins_metas.reduce((acc, pm) => {
        const s = this.folders.find((sp) => this.getFilename(sp.$path) === pm);
        if (s) acc.push(s);
        return acc;
      }, []);
    },
    non_pinned_folders() {
      return this.folders.filter(
        (f) => !this.list_of_pins_metas.includes(this.getFilename(f.$path))
      );
    },
  },
  methods: {
    async addSpaceToPins(path) {
      let pins_metas = this.list_of_pins_metas.slice();
      pins_metas.push(this.getFilename(path));
      this.updateList({ pins_metas });
    },
    movePin(index, dir) {
      let pins_metas = this.list_of_pins_metas.slice();
      pins_metas.move(index, index + dir);
      this.updateList({ pins_metas });
    },
    positionInPinned(path) {
      if (this.pinned_folders.length === 1) return "alone";
      const index = this.pinned_folders.findIndex((ps) => ps.$path === path);
      if (index === 0) return "first";
      if (index === this.pinned_folders.length - 1) return "last";
      return "none";
    },
    removeFromPins(path) {
      let pins_metas = this.list_of_pins_metas.slice();
      pins_metas = pins_metas.filter((sp) => sp !== this.getFilename(path));
      this.updateList({ pins_metas });
    },
    async updateList({ pins_metas }) {
      await this.$api.updateMeta({
        path: this.path,
        new_meta: {
          [this.field_name]: pins_metas,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._pinned {
  padding: 0;
  margin: calc(var(--spacing) / 1) 0;
}
._nonpinned {
  padding: 0;
  margin: calc(var(--spacing) / 1) 0;
}

._item {
  position: relative;
  z-index: 1;
}

._pinSpace {
  position: absolute;
  top: 0;
  left: 0;
  margin: calc(var(--spacing) / 2);

  z-index: 100;
  color: var(--c-orange);

  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 8);

  > button {
    display: block;
    pointer-events: auto;
  }

  svg {
    // filter: drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.3));
  }
}

._pinSpace_indicator {
  pointer-events: none;
}

._list {
  display: grid;
  // width: 100%;
  grid-auto-rows: max-content;
  grid-gap: var(--item-gap, calc(var(--spacing) / 1));
  align-items: stretch;
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(100%, var(--item-width, 320px)), 1fr)
  );

  &.is--mobileView {
    display: block;
  }
}
._list_pinned {
  // border-radius: 3px;
  background-image: radial-gradient(rgba(51, 51, 51, 0.1) 2px, transparent 2px);
  background-size: calc(var(--spacing)) calc(var(--spacing));

  padding: calc(var(--spacing) / 1);
  margin: 0 calc(var(--spacing) / -1);
}
</style>
