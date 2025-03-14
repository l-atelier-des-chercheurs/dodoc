<template>
  <div class="mainContent _pageNav">
    <div class="_navMenu">
      <!-- <router-link to="/">{{ $t("home") }}</router-link> -->
      <router-link to="/chutier">{{ $t("chutier") }}</router-link>
      <router-link to="/archives">{{ $t("archives") }}</router-link>
      <router-link to="/collections">{{ $t("collections") }}</router-link>
      <span class="emptySetHeight">&nbsp;</span>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
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
._navMenu {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: calc(var(--spacing) * 2);
  margin-top: calc(var(--spacing) * 4);
  margin-bottom: calc(var(--spacing) * 2);
  line-height: 1;

  a {
    display: block;
    text-decoration: none;
    font-size: 2rem;
    transition: all 1s cubic-bezier(0.19, 1, 0.22, 1);

    &:hover,
    &:focus-visible {
      font-style: italic;
    }

    &.router-link-active {
      font-style: italic;
      font-weight: bold;
      font-size: 6rem;
    }
  }

  span.emptySetHeight {
    font-size: 6rem;
  }
}
</style>
