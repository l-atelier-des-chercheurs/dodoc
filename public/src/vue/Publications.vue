<template>
  <div class="m_publicationsview">
    <div class="margin-medium">
      <input type="text" placeholder="nom" ref="publiName">
      <button type="button" @click="createPublication">
        Créer une publication
      </button>
    </div>
    
    <hr>
    
    <div class="margin-medium">
      <div>
        Liste des publications
      </div>
      <div 
        v-if="typeof publications === 'object'"
        v-for="publication in publications" :key="publication.name"
      >
        <button type="button" @click="openPublication(publication.slugFolderName)">
          {{ publication.name }}
        </button>
      </div>
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
        name,
        pages: [{
          template: 'journal',
          format: 'A4'          
        }]
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