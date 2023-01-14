<template>
  <a :download="filename" :href="fileURL" target="_blank" class="u-buttonLink">
    <sl-icon name="file-earmark-arrow-down" />
    {{ $t("download") }}
  </a>
</template>
<script>
export default {
  props: {
    filename: String,
    fileURL: String,
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
