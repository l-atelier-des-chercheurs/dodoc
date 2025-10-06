<template>
  <div class="u-card2 _preview" v-if="stopmotion">
    <div class="_topRow">
      <DateDisplay
        :title="$t('date_created')"
        :date="stopmotion.$date_created"
      />
      <DateDisplay
        :title="$t('date_modified')"
        :date="stopmotion.$date_modified"
      />
    </div>

    <div class="_images">
      <label class="u-label">
        {{ $tc("x_images", images.length, { count: images.length }) }}
      </label>
      <div class="_imagesCont">
        <div v-for="image in images" :key="image.$path">
          <MediaContent :file="image" :resolution="240" />
        </div>
      </div>
    </div>

    <div class="_btns">
      <RemoveMenu @remove="$emit('remove')" />
      <button
        type="button"
        class="u-button u-button_bleumarine"
        @click="$emit('load')"
      >
        {{ $t("resume") }}
      </button>
    </div>
  </div>
</template>
<script>
import RemoveMenu from "../fields/RemoveMenu.vue";
export default {
  props: {
    stopmotion_path: String,
  },
  components: { RemoveMenu },
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
        const medias = this.stopmotion.images_list.reduce((acc, item) => {
          const meta = item.m || item;
          const m = this.stopmotion.$files.find((f) =>
            f.$path.endsWith("/" + meta)
          );
          if (m && !acc.find((m2) => m2.$path === m.$path)) acc.push(m);
          return acc;
        }, []);
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
  padding: calc(var(--spacing) / 1);
  // background: var(--c-gris);
  background: white;
  border-radius: 6px;
  margin: 0 0 calc(var(--spacing) / 1) 0;

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
}

._topRow {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;

  gap: calc(var(--spacing) / 2);
}

._imagesCont {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  background: var(--c-gris);
  padding: 2px;
  gap: 2px;
  border-radius: 4px;

  overflow-x: auto;
  overflow-y: hidden;

  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;

  > * {
    flex: 0 0 80px;
    border-radius: 4px;
    overflow: hidden;
  }
}

._btns {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}
</style>
