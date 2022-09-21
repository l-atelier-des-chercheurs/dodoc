<template>
  <div
    class="_socketStatus"
    :class="{
      'is--connected': $root.is_connected,
    }"
  >
    <div class="_socketStatus--content">
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
  position: absolute;
  z-index: 1500;
  bottom: 0;
  width: 100%;
  pointer-events: none;

  margin: calc(var(--spacing) / 2) 0;

  ._socketStatus--content {
    pointer-events: auto;
    margin: 0 auto;
    max-width: 50ch;
    background: var(--c-rouge);
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    border-radius: 8px;
  }
  &.is--connected {
    ._socketStatus--content {
      background: var(--c-vert);
    }
  }
}
</style>
