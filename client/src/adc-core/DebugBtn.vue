<template>
  <div v-if="is_instance_admin">
    <button
      type="button"
      class="u-buttonLink"
      @click="debug_mode = !debug_mode"
    >
      <b-icon icon="bug" />
      debug
    </button>
    <div v-if="debug_mode" class="">
      <pre>{{ content }}</pre>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    content: [String, Object],
  },
  components: {},
  data() {
    return {
      debug_mode: false,
    };
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
