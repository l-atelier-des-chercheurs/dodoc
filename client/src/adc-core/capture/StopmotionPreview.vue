<template>
  <div>
    <div class="_preview" v-if="stopmotion">
      <DateField :date="stopmotion.$date_created" />
      <DateField :date="stopmotion.$date_modified" />

      <div class="_images">
        <div v-for="image in images" :key="image.$path">
          <MediaContent :file="image" :resolution="240" />
        </div>
      </div>

      <button
        type="button"
        class="u-button u-button_bleumarine"
        @click="$emit('load')"
      >
        {{ $t("load") }}
      </button>
    </div>
    <hr />
  </div>
</template>
<script>
export default {
  props: {
    stopmotion_path: String,
  },
  components: {},
  data() {
    return {
      stopmotion: undefined,
      fetch_stopmotion_error: undefined,
    };
  },
  created() {},
  async mounted() {
    const stopmotion = await this.$api
      .getFolder({
        path: this.stopmotion_path,
      })
      .catch((err) => {
        this.fetch_stopmotion_error = err.response;
      });
    this.stopmotion = stopmotion;
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    images() {
      if (this.stopmotion?.images_list && this.stopmotion?.$files?.length > 0) {
        const medias = this.stopmotion.images_list.reduce(
          (acc, meta_filename) => {
            const m = this.stopmotion.$files.find((f) =>
              f.$path.endsWith(meta_filename)
            );
            if (m) acc.push(m);
            return acc;
          },
          []
        );
        return medias;
      }
      return [];
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._preview {
}

._images {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  overflow-x: auto;
  overflow-y: hidden;

  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;

  > * {
    flex: 0 0 100px;
  }
}
</style>
