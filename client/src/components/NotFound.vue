<template>
  <div>
    <div>
      <p class="u-spacingBottom u-warning">{{ $t("page_not_found") }}</p>
    </div>
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
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
