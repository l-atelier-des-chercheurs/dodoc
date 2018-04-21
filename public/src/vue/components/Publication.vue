<template>
  <div class="m_publication">
    <button type="button" @click="closePublication()">
      Fermer
    </button>


    <div class="m_publication--pages">
      <div 
        v-for="(page, pageNumber) in publication.pages" 
        class="m_publication--pages--page"
        :class="`m_publication--pages--page_format-${page.format}`"
        :key="pageNumber"
      >
        <div 
          v-for="(media, mediaIndex) in publication_medias[(pageNumber+1) + '']" 
          :key="mediaIndex"
          class="m_publication--pages--page--media"
          :style="mediaStyle(mediaIndex)"
        >
          <MediaContent
            :context="'full'"
            :slugMediaName="media.slugMediaName"
            :slugProjectName="media.slugProjectName"
            :media="media"
            :read_only="read_only"
            v-model="media.content"
          />
        </div>
      </div>
    </div>

    <button type="button" @click="addPage()">
      Ajouter une page
    </button>
    <button type="button" @click="removeLastPage()">
      Supprimer une page
    </button>
  </div>
</template>
<script>
import MediaContent from './subcomponents/MediaContent.vue';
import _ from 'underscore';

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

      if(!this.publication.hasOwnProperty('medias_list') || this.publication.medias_list.length === 0) {
        return;
      }
      
      // get list of publications items
      let medias_paginated = {};
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
          meta.publi_meta = m;

          let expected_page = m.hasOwnProperty('page') ? Number.parseInt(m.page) : this.publication.pages.length - 1;
          if(!medias_paginated.hasOwnProperty(expected_page)) {
            medias_paginated[expected_page] = [];
          }
          medias_paginated[expected_page].push(meta);
          return;
        }
      });

      // send list of medias to get
      if(missingMedias.length > 0) {
        this.$root.listSpecificMedias(missingMedias);
      }

      this.publication_medias = medias_paginated;        
    },
    addPage() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: addPage`);
      }

      let pages = [];
      if(this.publication.hasOwnProperty('pages')) {
        pages = this.publication.pages.slice();
      }
      pages.push({ 
        template: 'journal',
        format: 'A4'
      });      

      this.$root.editFolder({ 
        type: 'publications', 
        slugFolderName: this.slugPubliName, 
        data: { pages } 
      });
    },
    removeLastPage() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: removeLastPage`);
      }

      let pages = [];
      if(this.publication.hasOwnProperty('pages')) {
        pages = this.publication.pages.slice();
      }
      pages.pop();      

      this.$root.editFolder({ 
        type: 'publications', 
        slugFolderName: this.slugPubliName, 
        data: { pages } 
      });
    },
    mediaStyle(index) {
      return `left: ${index * 40}px; top: ${index * 40}px`;
    }

  }
}
</script>
<style>

</style>