<template>
  <div class="_stopmotionModule">
    <div class="_mediaContainer" :style="{ '--aspectRatio': imposed_ratio }">
      <MediaContent :file="first_media" />
    </div>
    <!-- <div class="_index">{{ index + 1 }}</div> -->
    <div class="_selectPosition">
      <button
        type="button"
        class="u-button u-button_icon"
        :disabled="module_position === 'alone' || module_position === 'first'"
        @click="$emit('moveUp')"
      >
        <b-icon icon="chevron-left" />
      </button>
      <select
        :value="index + 1"
        size="small"
        @change="
          $emit('moveTo', {
            path: makemodule.$path,
            new_position: +$event.target.value - 1,
          })
        "
      >
        <option v-for="i in number_of_modules" :key="i" :value="i">
          {{ i }}
        </option>
      </select>

      <button
        type="button"
        class="u-button u-button_icon"
        :disabled="module_position === 'alone' || module_position === 'last'"
        @click="$emit('moveDown')"
      >
        <b-icon icon="chevron-right" />
      </button>
    </div>

    <div class="_options">
      <DropDown :right="true">
        <button type="button" class="u-buttonLink" @click="removeModule">
          <b-icon icon="trash" />
          {{ $t("remove") }}
        </button>
      </DropDown>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    index: Number,
    makemodule: Object,
    number_of_modules: Number,
    imposed_ratio: Number,
    module_position: String,
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
    first_media() {
      return this.firstMedia(this.makemodule);
    },
  },
  methods: {
    async removeModule() {
      await this.$api
        .deleteItem({
          path: this.makemodule.$path,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      this.$emit("remove", this.makemodule.$path);
    },
  },
};
</script>
<style lang="scss" scoped>
._stopmotionModule {
  position: relative;
  background-color: white;
  padding: calc(var(--spacing) / 4);
  border-radius: 4px;
}

._index {
  position: absolute;
  top: calc(var(--spacing) / 2);
  left: calc(var(--spacing) / 2);
  font-size: 0.8rem;
  font-weight: 600;
  background-color: var(--c-noir);
  color: white;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: 2px;
}

._mediaContainer {
  position: relative;

  ::v-deep ._mediaContent {
    width: 100%;

    aspect-ratio: calc(1 / var(--aspectRatio, 1 / 1));
    border-radius: 3px;
    min-height: 80px;
    min-width: 80px;

    ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}

._selectPosition {
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  padding: calc(var(--spacing) / 2);
  pointer-events: none;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) / 2);

  button,
  select {
    pointer-events: all;
  }

  select {
    width: 8ch;
  }
}

._options {
  position: absolute;
  top: 0;
  right: 0;
  padding-top: calc(var(--spacing) / 4);
  padding-right: calc(var(--spacing) / 4);
}
</style>
