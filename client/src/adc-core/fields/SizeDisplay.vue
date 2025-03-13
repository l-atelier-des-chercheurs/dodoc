<template>
  <div class="u-metaField">
    <DLabel :str="$t('size')" />
    <div>
      {{ formatBytes(size) }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    size: Number,
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
<style lang="scss"></style>
