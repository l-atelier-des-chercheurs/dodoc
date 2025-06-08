<template>
  <div class="_accueil">
    <div class="_accueil--content">
      <h1>Accueil</h1>
      <p>Pour contribuer --> <a href="/import">Importer</a></p>
      <p>Pour consulter --> <a href="/consult">Consulter</a></p>
      <p>Pour partager --> <a href="/share">Partager</a></p>
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
  created() {
    // this.$router.push("/import");
  },
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
