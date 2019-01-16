<template>
  <div class="m_clientsList">
    <label>Autres utilisateurs ({{ clients.length - 1 }})</label>
    <div 
      class="m_clientsList--client"
      :key="client.id"
      v-for="client in clients"
      v-if="client.id !== $root.$socketio.socket.id"
    >
      <template v-if="client.data.hasOwnProperty('author')">
        {{ client.data.author.name }}
      </template>
      <template v-else>        
        anonyme
      </template>
    </div>
  </div>
</template>
<script>


export default {
  props: {
    clients: Array
  },
  components: {
  },
  data() {
    return {
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
  },
  methods: {
  }
}
</script>
<style>

</style>