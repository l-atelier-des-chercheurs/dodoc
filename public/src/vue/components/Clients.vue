<template>
  <div class="m_clientsList">
    <label>Autres utilisateurs</label>
    <div 
      class="m_clientsList--client"
      :key="client.id"
      v-for="client in clients"
      v-if="client.id !== $root.$socketio.socket.id"
    >
      <template v-if="client.data.hasOwnProperty('author')">
        {{ client.data.author.name }}
      </template>
      <tempalte v-else>        
        anonyme
      </tempalte>
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