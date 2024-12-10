<template>
  <div class="u-card2 _stopmotionModule">
    <div class="_mediaContainer">
      <MediaContent :file="first_media" />
    </div>
    <!-- <div class="_index">{{ index + 1 }}</div> -->
    <div class="_selectPosition">
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

      this.$emit("remove");
    },
  },
};
</script>
<style lang="scss" scoped>
._stopmotionModule {
  position: relative;
  background-color: white;
  // padding: calc(var(--spacing) / 2);
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

    aspect-ratio: 1/1;
    border-radius: 3px;

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
  justify-content: center;

  select {
    width: 5ch;
    pointer-events: all;
  }
}

._options {
  position: absolute;
  top: 0;
  right: 0;
  padding-right: calc(var(--spacing) / 2);
}
</style>
