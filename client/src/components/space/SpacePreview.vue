<template>
  <div class="_spacePresentation">
    <img
      src="https://latelier-des-chercheurs.fr/thumbs/ateliers/chepa-le-journal-pour-tou-te-s/cover-1280x800-q60.jpg"
      class="_cover"
    />

    <div class="_text">
      <h2>
        {{ space.title }}
      </h2>

      <router-link
        class="u-button u-button_bleuvert"
        :to="{ path: createURLFromPath(space.$path) }"
      >
        {{ $t("open") }}
      </router-link>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    space: Object,
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
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._spacePresentation {
  width: 100%;
  aspect-ratio: 3/2;
}

._cover {
  display: block;
  width: 100%;
  aspect-ratio: 3/2;
}
._text {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  padding: calc(var(--spacing) / 2);
}
</style>
