<template>
  <div class="m_publicationview" @scroll="onScroll"
    ref="panel"
  >
    <div class="margin-medium">
      {{ slugPubliName }}
      <h2>
        {{ publication.name }}
      </h2>

      <button type="button" class="buttonLink" @click="closePublication()">
        Fermer
      </button>
    </div>


    <div class="m_publicationview--pages" ref="pages">
      <div 
        v-for="(page, pageNumber) in publication.pages" 
        class="m_publicationview--pages--page"
        :class="[`m_publicationview--pages--page_format-${page.format}`, { 'is--active' : pageNumber === page_currently_active-1 }]"
        :key="pageNumber"
      >
        <MediaPublication
          v-for="(media, mediaIndex) in publication_medias[(pageNumber+1) + '']" 
          :key="mediaIndex"
          :media="media"
          :read_only="read_only"
          @removeMedia="values => { removeMedia(values) }"
          @editPubliMedia="values => { editPubliMedia(values) }"
        />
      </div>
    </div>

    <div class="margin-medium">
      <button type="button" class="buttonLink" @click="addPage()">
        Ajouter une page
      </button>
      <button type="button" class="buttonLink" @click="removeLastPage()">
        Supprimer une page
      </button>
    </div>
  </div>
</template>
<script>
import MediaPublication from './subcomponents/MediaPublication.vue';
import _ from 'underscore';

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    read_only: Boolean
  },
  components: {
    MediaPublication
  },
  data() {
    return {
      publication_medias: {},
      page_currently_active: 1
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
    window.removeEventListener('mouseup', this.mouseup);
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

      const lastPageNumber = this.publication.pages.length + 1;
      let addToPage = lastPageNumber;
      if(this.page_currently_active > 0 && this.page_currently_active < lastPageNumber) {
        addToPage = this.page_currently_active;
      }

      medias_list.push({
        filename: slugMediaPath,
        page: addToPage
      });

      this.$root.editFolder({ 
        type: 'publications', 
        slugFolderName: this.slugPubliName, 
        data: { medias_list } 
      });
    },
    removeMedia({ reference_index }) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: removeMedia / reference_index = ${reference_index}`);
      }

      let medias_list = [];
      if(this.publication.hasOwnProperty('medias_list')) {
        medias_list = this.publication.medias_list.slice();
      }
      medias_list.splice(reference_index, 1);

      this.$root.editFolder({ 
        type: 'publications', 
        slugFolderName: this.slugPubliName, 
        data: { medias_list } 
      });
    },
  
    // function to update property of a media inside medias_list
    editPubliMedia({ reference_index, val }) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: removeMedia / reference_index = ${JSON.stringify(arguments, null, 4)}`);
      }

      let medias_list = [];
      if(this.publication.hasOwnProperty('medias_list')) {
        medias_list = this.publication.medias_list.slice();
      }
      medias_list[reference_index] = Object.assign({}, medias_list[reference_index], val);

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

      let medias_list = this.publication.medias_list.slice();

      medias_list.forEach((m, index) => {
        // for each, get slugFolderName and slugMediaName
        if(!m.hasOwnProperty('filename') || !m.filename.includes('/')) {
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
          
          let meta = JSON.parse(JSON.stringify(project_medias[slugMediaName]));
          meta.slugProjectName = slugProjectName;
          meta.publi_meta = m;
          meta.publi_meta.reference_index = index;

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

    onScroll() {
      if (this.$root.state.dev_mode === 'debug') {
        // console.log(`METHODS • Publication: onScroll`);
      }

      if(!this.$refs.hasOwnProperty('pages') || this.$refs.pages.children.length === 0) {
        return;
      }

      const currentScroll = event.target.scrollTop;
      const middleOfScreen = this.$refs.panel.offsetHeight / 2;
      let pages = this.$refs.pages.children;

      let index = 1;
      for(let page of pages) {
        if(page.offsetTop + page.offsetHeight > currentScroll + middleOfScreen) {
          break;
        }
        index++;
      }

      this.page_currently_active = index;
    }

  }
}
</script>
<style>

</style>