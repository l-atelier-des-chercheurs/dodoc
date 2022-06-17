<template>
  <div class="">
    <sl-breadcrumb>
      <sl-breadcrumb-item>Accueil</sl-breadcrumb-item>
    </sl-breadcrumb>
    Aller aux <router-link to="/projects">projets</router-link>
    <NextZoning />
  </div>
</template>

<script>
// @ is an alias to /src
import NextZoning from "@/components/NextZoning.vue";

export default {
  components: {
    NextZoning,
  },
};
</script>
