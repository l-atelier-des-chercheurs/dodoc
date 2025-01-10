<template>
  <div class="_notFound">
    <h2>{{ $t("page_not_found") }}</h2>
    <router-link :to="'/'" class="u-buttonLink">
      {{ $t("go_home") }}
    </router-link>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
  },
  created() {
    this.$api.updateSelfPath("404");
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._notFound {
  width: 100%;
  min-height: 60vh;
  margin: 0 auto;
  max-width: var(--max-column-width);
  padding: calc(var(--spacing) * 1);

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}
</style>
