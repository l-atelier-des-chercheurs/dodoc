<template>
  <div class="_spacePresentation">
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
  width: 300px;
  height: 300px;
}
</style>
