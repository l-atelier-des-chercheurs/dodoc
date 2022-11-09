<template>
  <div>
    <div class="_msg u-instructions u-padding-small">
      Créez ici des publications : journal du projet, tutoriel, livret, etc.
      <br />
      Elles contiendront du texte et des éléments que vous avez collecté.
    </div>
    <button type="button">Nouvelle publication</button>
    <select name="Type de bloc" id="cars">
      <option value="page">Page à page</option>
      <option value="journal">Journal</option>
      <option value="tutorial">Tutoriel</option>
      <option value="presentation">Présentation par page</option>
      <option value="carreau">carreau.js</option>
    </select>
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
._msg {
  padding: calc(var(--spacing) * 2);
}
</style>
