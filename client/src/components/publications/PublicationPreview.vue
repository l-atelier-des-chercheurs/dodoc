<template>
  <sl-card class="u-card">
    <img :src="`${$root.publicPath}${image_name}`" class="" />
    <header class="">
      {{ title }}<br />
      <small>{{ type }}</small>
    </header>

    <!-- {{ publication.title }} -->
    <!-- <button type="button" @click="removePublication">Supprimer</button> -->
  </sl-card>
</template>
<script>
export default {
  props: {
    title: String,
    type: String,
    image_name: String,
    publication: Object,
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
    async removePublication() {
      await this.$api.deleteFolder({ path: this.publication.$path });
    },
  },
};
</script>
<style lang="scss" scoped></style>
