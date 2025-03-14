<template>
  <div class="mainContent">
    <MyChutier class="_myContent--chutier" :shared_folder_path="false" />
  </div>
</template>
<script>
import PageNav from "@/components/PageNav.vue";
import MyChutier from "@/components/MyChutier.vue";

export default {
  props: {},
  components: {
    PageNav,
    MyChutier,
  },
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
<style lang="scss" scoped></style>
