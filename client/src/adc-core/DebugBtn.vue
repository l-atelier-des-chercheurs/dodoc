<template>
  <div>
    <button type="button" class="u-button" @click="debug_mode = !debug_mode">
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
