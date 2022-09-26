<template>
  <div class="_homeView">
    <div class="_homeView--content">
      <img :src="`${$root.publicPath}i_logo.svg`" class="" />
      <small>{{ $root.app_infos.version }}</small>
      <p>Plate-forme de documentation pour fablab à l'école.</p>
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
