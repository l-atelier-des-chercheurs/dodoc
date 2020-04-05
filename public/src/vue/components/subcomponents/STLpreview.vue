<template>
  <div>
    <iframe :src="url_to_previewer" />
  </div>
</template>
<script>
export default {
  props: {
    mediaURL: String
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    url_to_previewer() {
      return `/libs/stl/show_stl.html?mediaURL=${this.mediaURL}`;
    }
  },
  methods: {}
};
</script>
<style lang="scss"></style>
