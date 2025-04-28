<template>
  <div class="_accueil">
    <div class="_accueil--content">
      <h1>Accueil</h1>
      <p>
        Nunc dapibus lectus nisi, vitae hendrerit purus ornare at. Phasellus
        laoreet pretium est, ac egestas nisl. Pellentesque eleifend augue et
        finibus scelerisque. Fusce maximus hendrerit dui. Morbi in dignissim
        risus, a eleifend libero. Phasellus in nisi velit. Quisque nec nulla vel
        diam tempor interdum sed sed magna. Integer viverra risus ut nisi
        pellentesque blandit. Nulla sagittis varius pretium. Phasellus vel
        ornare dolor. Maecenas eu urna id justo sollicitudin sodales sit amet
        iaculis velit. Vivamus mollis sapien vel augue rhoncus vestibulum.
        Aliquam erat volutpat. Donec ut felis ligula.
      </p>
      <hr />
      <p>
        <small>{{ $t("version") }} {{ $root.app_infos.version }}</small>
      </p>
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
._accueil--content {
  padding: calc(var(--spacing) * 4);
  max-width: 1000px;
  margin: 0 auto;
}
</style>
