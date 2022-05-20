<template>
  <div class="">
    <NextZoning />
    <TestAPI />
  </div>
</template>

<script>
// @ is an alias to /src
import NextZoning from "@/components/NextZoning.vue";
import TestAPI from "@/components/TestAPI.vue";

export default {
  name: "HomeView",
  components: {
    NextZoning,
    TestAPI,
  },
};
</script>
