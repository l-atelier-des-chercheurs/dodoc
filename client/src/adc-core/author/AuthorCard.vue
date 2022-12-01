<template>
  <div class="_authorCard">
    {{ author.name }}
    <br />
    {{ author.email }}
    <br />
    <button type="button" class="u-button" @click="removeAuthor">
      {{ $t("remove") }}
    </button>
  </div>
</template>
<script>
export default {
  props: {
    author: Object,
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
  methods: {
    async removeAuthor() {
      await this.$api.deleteItem({
        path: this.author.$path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._authorCard {
  background: var(--c-gris);
  padding: calc(var(--spacing) / 2);
}
</style>
