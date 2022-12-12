<template>
  <div class="_authorCard">
    {{ author.name }}
    <small>
      {{ author.$path }}
    </small>
    <br />
    {{ author.role }}
    <br />
    {{ author.email }}
    <br />
    <button type="button" class="u-button" v-if="is_self" @click="removeAuthor">
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
  computed: {
    is_self() {
      if (this.connected_as)
        return this.connected_as.$path === this.author.$path;
      return false;
    },
  },
  methods: {
    async removeAuthor() {
      await this.$api.deleteItem({
        path: this.author.$path,
      });
      await this.$api.logoutFromFolder();
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
