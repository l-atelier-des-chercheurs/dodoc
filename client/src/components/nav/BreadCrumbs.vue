<template>
  <nav class="">
    <ol class="_list">
      <li>
        <router-link to="/" class="">Accueil</router-link>
      </li>
      <li><span class="">/</span></li>
      <li>
        <router-link to="/projects" class="">Projets</router-link>
      </li>
      <!-- <li><span class="">/</span></li>
      <li>
        <router-link to="/" class=""> Projet </router-link>
      </li> -->
    </ol>
  </nav>
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
._list {
  list-style: none;
  display: flex;
  gap: calc(var(--spacing) / 2);
}
</style>
