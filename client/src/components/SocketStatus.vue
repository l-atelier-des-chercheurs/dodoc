<template>
  <div
    class="_socketStatus"
    :class="{
      'is--connected': $root.is_connected,
    }"
  >
    Connected as {{ $api.socket.userID }}
    |
    <button
      type="button"
      :disabled="$root.is_connected"
      @click="$api.reconnectSocket"
    >
      connect
    </button>
    |
    <button
      type="button"
      :disabled="!$root.is_connected"
      @click="$api.disconnectSocket"
    >
      disconnect
    </button>
  </div>
</template>
<script>
export default {
  props: {},
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
<style lang="scss" scoped>
._socketStatus {
  padding: var(--padding);
  background: rgba(255, 0, 0, 0.5);

  &.is--connected {
    background: rgba(0, 255, 0, 0.5);
  }
}
</style>
