<template>
  <div class="m_publications">
    <div class="margin-medium">
      <input type="text" placeholder="nom" ref="publiName">
      <button type="button" @click="createPublication">
        Créer une publication
      </button>
    </div>
    
    <hr>
    
    <div>
      Liste des publications
    </div>
    <div v-for="publication in publications" :key="publication.name">
      <button type="button" @click="openPublication(publication.slugFolderName)">
        {{ publication.name }}
      </button>
    </div>
  </div>
</template>
<script>

export default {
  props: ['publications'],
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
    createPublication() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • Publications: createPublication');
      }
      let name = this.$refs.publiName.value !== '' ? this.$refs.publiName.value : 'Publication sans nom';

      let publidata = {
        name
      }
      this.$root.createFolder({ type: 'publications', data: publidata });      
    },
    openPublication(slugPubliName) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publications: openPublication / slugPubliName = ${slugPubliName}`);
      }
      this.$root.openPublication(slugPubliName);
    },
  }
}
</script>
<style>

</style>