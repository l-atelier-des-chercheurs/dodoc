<template>
  <div class="">
    <div class="_projectPres">
      <h1>
        {{ project.title }}
      </h1>
      <DateField :title="'date_created'" :date="project.date_created" />
      Ajouter des mots-clés <br />
      Ajouter une image de couverture <br />
    </div>

    <div>
      <h2>1. Collecter</h2>
      <div>bibliothèque de médias</div>
      <div>"capturer"</div>
      <div>"importer"</div>
      <h2>2. Remixer</h2>
      <h2>3. Raconter</h2>
    </div>
  </div>
</template>
<script>
import DateField from "./fields/DateField.vue";
export default {
  props: {
    project: Object,
  },
  components: { DateField },
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
._projetPanes {
  position: relative;
  display: flex;
}
._msg {
  font-style: italic;
  padding: calc(var(--spacing) / 2);
}
</style>
