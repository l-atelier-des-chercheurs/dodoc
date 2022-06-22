<template>
  <div class="_homeView">
    <div class="_homeView--content">
      <h1>PLATEAU</h1>
      <small>{{ $root.app_infos.version }}</small>
      <hr />
      <p>
        Plateau est un outil de documentation pour les projets et workshops
        participatifs.
      </p>
      <p>
        <router-link to="/projects">Afficher les projets</router-link>
      </p>
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

  overflow: auto;

  display: flex;
  align-items: center;
}

._homeView--content {
  max-width: 600px;
  margin: 0 auto;
}

._panesLeft {
}
</style>
