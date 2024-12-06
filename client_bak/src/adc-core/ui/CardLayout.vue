<template>
  <div>
    <slot />
  </div>
</template>
<script>
export default {
  props: {
    header: String,
    icon: String,
    has_items: undefined,
    is_open_initially: Boolean,
    can_be_toggled: { type: Boolean, default: true },
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
