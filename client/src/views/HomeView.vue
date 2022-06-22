<template>
  <div class="">
    Aller aux <router-link to="/projects">projets</router-link>
    Hello ! Hello
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
