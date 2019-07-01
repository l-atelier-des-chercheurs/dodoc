<template>
  <div class="m_clientsList" v-if="uniqueClients.length > 1">
    <button 
      type="button" 
      class="m_clientsList--indicator" 
      @click="showClientList = !showClientList"
      :title="$t('other_users_connected')"
      v-tippy='{ 
        placement : "bottom",
        delay: [600, 0]
      }'                  
    >
      <span>{{ uniqueClients.length - 1 }}</span>
    </button>
    <div class="m_clientsList--list" v-if="showClientList">
      <button type="button" class="m_clientsList--list--close" @click="showClientList = false">
        ×
      </button>

      <label>{{ $t('other_users') }}</label>
      <br>
      <span 
        class="m_clientsList--list--client"
        :key="client.id"
        v-for="client in uniqueClients"
        v-if="client.id !== $root.$socketio.socket.id"
      >
        <template v-if="client.data.hasOwnProperty('author')">
          {{ client.data.author.name }}
        </template>
        <template v-else>        
          {{ $t('anonymous')}}
        </template>
      </span>
    </div>
  </div>
</template>
<script>


export default {
  props: {
  },
  components: {
  },
  data() {
    return {
      showClientList: false
    }
  },
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },
  watch: {
  },
  computed: {
    uniqueClients() {
      return this.$root.state.clients;
    }
  },
  methods: {
  }
}
</script>
<style>

</style>