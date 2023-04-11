<template>
  <sl-card class="u-card _publicationPreview">
    <!-- <img :src="`${$root.publicPath}${image_name}`" class="" /> -->
    <div class="u-instructions">
      à venir : image d’aperçu prise directement sur le contenu de la
      publication, générée automatiquement
      <button type="button" v-if="can_edit" @click="generatePreview">
        {{ $t("generate_preview") }}
      </button>
    </div>

    <br />

    <header class="" @click="$emit('open')">
      <h2>
        {{ publication.title }}
      </h2>
      <small v-if="publication.template" v-html="$t(publication.template)" />
    </header>
    <div class="">
      <!-- <button
        type="button"
        class="u-button u-button_red"
        @click="$emit('open')"
      >
        ouvrir&nbsp;
        <sl-icon name="arrow-up-right" />
      </button> -->
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
  methods: {
    async removePublication() {
      await this.$api.deleteItem({ path: this.publication.$path });
    },
    async generatePreview() {
      await this.$api.generatePreviewForPublication({
        path: this.publication.$path,
        size: {
          width: this.publication.page_width,
          height: this.publication.page_height,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._publicationPreview header {
  cursor: pointer;
}
</style>
