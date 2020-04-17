<template>
  <div class="m_clientsList" v-if="uniqueClients.length">
    <button
      type="button"
      class="m_clientsList--indicator"
      @click="showClientList = !showClientList"
      :content="$t('other_users_connected')"
      v-tippy="{
        placement: 'bottom',
        delay: [600, 0],
      }"
    >
      <span>{{ uniqueClients.length }}</span>
    </button>
    <div class="m_clientsList--list" v-if="showClientList">
      <button
        type="button"
        class="m_clientsList--list--close"
        @click="showClientList = false"
      >
        ×
      </button>

      <label>{{ $t("other_users") }}</label>
      <br />
      <span
        class="m_clientsList--list--client"
        :key="client.id"
        v-for="client in uniqueClients"
      >
        <template v-if="client.data.hasOwnProperty('author')">{{
          client.data.author.name
        }}</template>
        <template v-else>{{ $t("anonymous") }}</template>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      showClientList: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    uniqueClients() {
      return this.$root.state.clients.filter((client) => {
        if (client.id === this.$root.$socketio.socket.id.substring(0, 4))
          return false;

        if (
          this.$root.state.local_options.force_login &&
          !client.data.hasOwnProperty("author")
        )
          return false;

        return true;
      });
    },
  },
  methods: {},
};
</script>
<style></style>
