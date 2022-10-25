<template>
  <div>
    <div class="_msg u-instructions u-padding-small">
      Créez ici des publications : journal du projet, tutoriel, livret, etc.
      <br />
      Elles contiendront du texte et des éléments que vous avez collecté.
    </div>
    <button type="button">Nouvelle publication</button>
    <select name="Type de bloc" id="cars">
      <option value="volvo">Page à page</option>
      <option value="mercedes">Journal</option>
      <option value="saab">Tutoriel</option>
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
