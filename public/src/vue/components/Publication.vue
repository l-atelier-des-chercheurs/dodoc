<template>
  <div class="m_publication">
    <button type="button" @click="closePublication()">
      Fermer
    </button>
    <div>
      <ul>
      <li v-for="(media, index) in publication_medias" :key="index">
        <button type="button" class="buttonLink" @click="removeMedia(index)">supprimer</button>
        <MediaContent
          :context="'full'"
          :slugMediaName="media.slugMediaName"
          :slugProjectName="media.slugProjectName"
          :media="media"
          :read_only="read_only"
          v-model="media.content"
        >
        </MediaContent>
      </li>
      </ul>
    </div>
  </div>
</template>
<script>
import MediaContent from './subcomponents/MediaContent.vue';

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    read_only: Boolean
  },
  components: {
    MediaContent
  },
  data() {
    return {
      publication_medias: {}
    }
  },
  created() {
    // when opening a publi, we’ll need to use the medias field to request some actual content
  },
  mounted() {
    this.$eventHub.$on('publication.addMedia', this.addMedia);
    this.$eventHub.$on('publication.listSpecificMedias', this.updateMediasPubli);
    this.updateMediasPubli();  
  },
  beforeDestroy() {
    this.$eventHub.$off('publication.addMedia', this.addMedia);
    this.$eventHub.$off('publication.listSpecificMedias', this.updateMediasPubli);
  },

  watch: {
    'publication.medias_list': function() {
      this.updateMediasPubli();
    }
  },
  computed: {
  },
  methods: {
    addMedia(slugMediaPath) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: addMedia / slugMediaPath = ${slugMediaPath}`);
      }

      let medias_list = [];
      if(this.publication.hasOwnProperty('medias_list')) {
        medias_list = this.publication.medias_list.slice();
      }
      medias_list.push({
        filename: slugMediaPath,
        page: 1
      });

      this.$root.editFolder({ 
        type: 'publications', 
        slugFolderName: this.slugPubliName, 
        data: { medias_list } 
      });
    },

    removeMedia(index) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: removeMedia / index = ${index}`);
      }

      let medias_list = [];
      if(this.publication.hasOwnProperty('medias_list')) {
        medias_list = this.publication.medias_list.slice();
      }
      medias_list.splice(index, 1);

      this.$root.editFolder({ 
        type: 'publications', 
        slugFolderName: this.slugPubliName, 
        data: { medias_list } 
      });
    },

    closePublication() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: closePublication`);
      }
      this.$root.closePublication();
    },
    updateMediasPubli() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: updateMediasPubli`);
      }
      
      // get list of publications items
      let fullyFormedMedias = [];
      let missingMedias = [];

      this.publication.medias_list.forEach(m => {
        // for each, get slugFolderName and slugMediaName
        if(!m.filename.includes('/')) {
          return;
        }

        const slugProjectName = m.filename.split('/')[0];
        const slugMediaName = m.filename.split('/')[1];

        // find in store if slugFolderName exists
        if(!this.$root.store.projects.hasOwnProperty(slugProjectName)) {
          console.err(`Missing project in store — not expected`);
          return;
        }

        // find in store if slugMediaName exists
        const project_medias = this.$root.store.projects[slugProjectName].medias;
        if(!project_medias.hasOwnProperty(slugMediaName)) {
          console.log(`Some medias missing from client`);
          missingMedias.push({ slugFolderName: slugProjectName, slugMediaName });
        } else {
          let meta = project_medias[slugMediaName];
          meta.slugProjectName = slugProjectName;
          fullyFormedMedias.push(meta);
          return;
        }
      });

      // send list of medias to get
      if(missingMedias.length > 0) {
        this.$root.listSpecificMedias(missingMedias);
      }

      this.publication_medias = fullyFormedMedias;  
      
    }

  }
}
</script>
<style>

</style>