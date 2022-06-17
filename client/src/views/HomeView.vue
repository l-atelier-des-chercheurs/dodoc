<template>
  <div class="">
    <NextZoning />

    <router-link to="/projects">Les projets</router-link>
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
