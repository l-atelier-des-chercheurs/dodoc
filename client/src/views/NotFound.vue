<template>
  <div class="_notFound">
    <NotFound />
  </div>
</template>
<script>
import NotFound from "@/components/NotFound.vue";
export default {
  props: {},
  components: {
    NotFound,
  },
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
