<template>
  <div class="margin-medium">
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
      <button type="button" @click="current_slugPublicationName = publication.slugFolderName">
        {{ publication.name }}
      </button>
    </div>

    <hr>

    <Publication
      v-if="!!current_slugPublicationName"
      :slugFolderName="current_slugPublicationName"
      :publication="publications[current_slugPublicationName]"
      :read_only="!$root.state.connected"
      @close="current_slugPublicationName = false"
    />
  </div>
</template>
<script>
import Publication from './components/Publication.vue';

export default {
  props: {
    publications: {
      type: Object,
      default: {}
    }
  },
  components: {
    Publication
  },
  data() {
    return {
      current_slugPublicationName: false
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
      let name = this.$refs.publiName.value !== '' ? this.$refs.publiName.value : 'Publication sans nom';

      let publidata = {
        name
      }
      this.$root.createFolder({ type: 'publications', data: publidata });      
    }
  }
}
</script>
<style>

</style>