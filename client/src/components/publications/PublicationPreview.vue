<template>
  <sl-card class="u-card">
    <img :src="`${$root.publicPath}${image_name}`" class="" />
    <header class="">
      {{ title }}<br />
      <small v-html="type"></small>
    </header>

    <div class="_projectInfos--open" v-if="context === 'list'">
      <router-link
        :to="{ path: '/' + project.$path }"
        class="u-button u-button_red"
      >
        ouvrir&nbsp;
        <sl-icon name="arrow-up-right" />
      </router-link>
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
