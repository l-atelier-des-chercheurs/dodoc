<template>
  <div class="m_clientsList">
    <label>Autres utilisateurs ({{ clients.length - 1 }})</label>
    <template v-if="client.id !== $root.$socketio.socket.id">
      <div 
        class="m_clientsList--client"
        :key="client.id"
        v-for="client in clients"
      >
        <template v-if="client.data.hasOwnProperty('author')">
          {{ client.data.author.name }}
        </template>
        <template v-else>        
          anonyme
        </template>
      </div>
    </template>
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