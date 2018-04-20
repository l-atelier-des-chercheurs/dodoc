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
      <button type="button" @click="openPublication(publication.slugFolderName)">
        {{ publication.name }}
      </button>
    </div>

    <hr>

    <Publication
      v-if="!!current_slugFolderName"
      :slugFolderName="current_slugFolderName"
      :publication="publications[current_slugFolderName]"
      :read_only="!$root.state.connected"
      @close="current_slugFolderName = false"
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
      current_slugFolderName: false
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
    openPublication(slugFolderName) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • Publications: openPublication');
      }
      this.current_slugFolderName = slugFolderName;

      // ask for a copy of media inside this publication
      // this.$socketio.listMedias({ slugFolderName: slugProjectName });

    },
  }
}
</script>
<style>

</style>