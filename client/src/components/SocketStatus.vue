<template>
  <div
    class="_socketStatus"
    :class="{
      'is--connected': $root.is_connected,
    }"
  >
    <div class="_socketStatus--content">
      <small>Connecté :{{ $api.socket.userID }}</small>
      <!-- 
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
      | -->
      <br />
      <span class="">
        <input
          type="checkbox"
          id="debug_mode"
          name="debug_mode"
          v-model="$api.debug_mode"
        />
        <label for="debug_mode">debugger</label>
      </span>
      <span class="">
        <input
          type="checkbox"
          id="loggedin"
          name="loggedin"
          v-model="$api.is_logged_in"
        />
        <label for="loggedin">identifié</label>
      </span>
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
  // position: absolute;
  // z-index: 1500;
  // top: 0;
  // width: 100%;
  pointer-events: none;

  // margin: calc(var(--spacing) / 2) 0;

  ._socketStatus--content {
    pointer-events: auto;
    margin: 0 auto;
    // max-width: 50ch;
    background: var(--c-rouge);
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    border-radius: 8px;
  }
  &.is--connected {
    ._socketStatus--content {
      // background: var(--c-vert);
    }
  }
}
</style>
