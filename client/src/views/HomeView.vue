<template>
  <div class="_homeView">
    <div class="">
      <h1>PLATEAU</h1>
      <hr />
      Plateau est un outil de documentation pour les projets et workshops
      participatifs.
    </div>

    <div>
      Aller aux <router-link to="/projects">projets</router-link>
      <strong><i>Hello</i></strong> ! Hello
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  components: {},
};
</script>
<style lang="scss">
._homeView {
  background: var(--c-vert);
  padding: var(--spacing);

  height: 100vh;
  max-height: -webkit-fill-available;
}

._panesLeft {
}
</style>
