<template>
  <sl-card class="u-card">
    <!-- <img :src="`${$root.publicPath}${image_name}`" class="" /> -->
    <header class="">
      {{ publication.title }}<br />
      <small v-if="publication.type" v-html="publication.type" />
    </header>
    <div class="">
      <button
        type="button"
        class="u-button u-button_red"
        @click="$emit('open')"
      >
        ouvrir&nbsp;
        <sl-icon name="arrow-up-right" />
      </button>
    </div>

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
