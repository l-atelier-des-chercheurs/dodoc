<template>
  <div>
    ModuleCarousel
    <div v-for="media in medias" :key="media.$path">
      <MediaContent
        v-if="media"
        :file="media"
        :resolution="1600"
        :context="'full'"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    publimodule: Object,
    medias: Array,
  },
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
<style lang="scss" scoped></style>
