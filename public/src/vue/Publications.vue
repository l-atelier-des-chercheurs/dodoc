<template>
  <div class="m_publicationsview">
    <div class="m_publicationsview--create">
      <div class="m_metaField">
        <div class="div">
          Créer une publication
        </div>
        <div>
          <input type="text" placeholder="nom" ref="publiName">
          <button type="button" @click="createPublication">
            Valider
          </button>
        </div>
      </div>
    </div>
    
    <hr>
    
    <div class="margin-medium">
      <div>
        Liste des publications
      </div>
      <div 
        v-if="typeof publications === 'object'"
        class="m_publicationMeta"
        v-for="publication in publications"
        @click="openPublication(publication.slugFolderName)"
        :key="publication.slugFolderName"
      >
        <div class="m_metaField">
          <div class="">
            {{ publication.name }}
          </div>
          <div>
            Ouvrir
          </div>
        </div>
        <div class="m_metaField">
          <div class="">
            Nombre de médias
          </div>
          <div>
            {{ typeof publication.medias_list === 'object' ? publication.medias_list.length : '' }}
          </div>
        </div>

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
          width: 210,
          height: 297,
          xMargin: 10,
          yMargin: 20,
          grid: 20
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