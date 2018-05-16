<template>
  <div 
    class="m_publicationview" 
    @scroll="onScroll"
    ref="panel"
  >
    <div class="m_publicationMeta">

      <div class="margin-bottom-small">
        <label>{{ $t('name') }}</label>
        <input class="input-large input-big" type="text" v-model="new_publiname" @change="updatePublicationOption('name')" required :readonly="read_only">
      </div>

      <div class="margin-bottom-small">
        <label>{{ $t('preview') }}</label>
        <input id="preview" type="checkbox" v-model="preview_mode">
      </div>

      <hr>

      <div class="margin-bottom-small">
        <label>{{ $t('header_left') }}</label>
        <input class="input-large" type="text" v-model="new_header_left" @change="updatePublicationOption('header_left')" :readonly="read_only">
      </div>

      <div class="margin-bottom-small">
        <label>{{ $t('header_right') }}</label>
        <input class="input-large" type="text" v-model="new_header_right" @change="updatePublicationOption('header_right')" :readonly="read_only">
      </div>

      <hr>

      <div class="margin-bottom-small">
        <label>{{ $t('width') }}(mm)</label>
        <input type="number" min="1" max="1000" step="1" v-model="new_width" @input="updatePublicationOption('width')">
      </div>

      <div class="margin-bottom-small">
        <label>{{ $t('height') }}(mm)</label>
        <input type="number" min="1" max="1000" step="1" v-model="new_height" @input="updatePublicationOption('height')">
      </div>

      <div class="margin-bottom-small">
        <label>{{ $t('gridstep') }}(mm)</label>
        <input type="number" min="2" max="100" step="1" v-model="new_gridstep" @input="updatePublicationOption('gridstep')">
      </div>

      <hr>

      <div class="margin-bottom-small">
        <label>{{ $t('margin_top') }}(mm)</label>
        <input type="number" min="0" max="100" step="1" v-model="new_margin_top" @input="updatePublicationOption('margin_top')">
      </div>
      <div class="margin-bottom-small">
        <label>{{ $t('margin_bottom') }}(mm)</label>
        <input type="number" min="0" max="100" step="1" v-model="new_margin_bottom" @input="updatePublicationOption('margin_bottom')">
      </div>
      <div class="margin-bottom-small">
        <label>{{ $t('margin_left') }}(mm)</label>
        <input type="number" min="0" max="100" step="1" v-model="new_margin_left" @input="updatePublicationOption('margin_left')">
      </div>
      <div class="margin-bottom-small">
        <label>{{ $t('margin_right') }}(mm)</label>
        <input type="number" min="0" max="100" step="1" v-model="new_margin_right" @input="updatePublicationOption('margin_right')">
      </div>

      <hr>

      <div class="margin-bottom-small">
        <label>{{ $t('zoom') }}</label>
        {{ zoom }}
      </div>

      <button type="button" class="buttonLink" @click="closePublication()">
        Fermer
      </button>
    </div>

    <div class="m_publicationview--pages" ref="pages">
      <div 
        v-for="(page, pageNumber) in pagesWithDefault" 
        class="m_publicationview--pages--page"
        :class="{ 'is--active' : pageNumber === page_currently_active-1 }"
        :key="pageNumber"
        :style="setPageProperties(page)"
      > 
        <div 
          v-if="!preview_mode"
          v-for="(item, index) in [0,1,2,3]"
          class="m_publicationview--pages--page--margins_rule"
          :style="`--margin_left: ${page.margin_left}mm; --margin_right: ${page.margin_right}mm; --margin_top: ${page.margin_top}mm; --margin_bottom: ${page.margin_bottom}mm;`"
          :key="index"
        />
        <div 
          v-if="!preview_mode"
          class="m_publicationview--pages--page--grid"
          :style="`--gridstep: ${page.gridstep}mm; --margin_left: ${page.margin_left}mm; --margin_right: ${page.margin_right}mm; --margin_top: ${page.margin_top}mm; --margin_bottom: ${page.margin_bottom}mm;`"
        />

        <div class="m_publicationview--pages--page--header">
          <div>
            {{ page.header_left }}
          </div>
          <div>
            {{ page.header_right }}
          </div>
        </div>        

        <MediaPublication
          v-for="(media, index) in publication_medias[(pageNumber+1) + '']" 
          :key="media.slugMediaName"
          :page="page"
          :media="media"
          :preview_mode="preview_mode"
          :read_only="read_only"
          :pixelsPerMillimeters="pixelsPerMillimeters"
          @removeMedia="values => { removeMedia(values) }"
          @editPubliMedia="values => { editPubliMedia(values) }"
          @selected="newSelection"
          @unselected="noSelection"
        />
      </div>
    </div>

    <div class="m_publicationFooter">
      <button type="button" class="buttonLink" @click="addPage()">
        {{ $t('add_a_page') }}
      </button>
      <button type="button" class="buttonLink" @click="removeLastPage()">
        {{ $t('remove_this_page') }}
      </button>
      <div 
        ref="mmMeasurer" 
        style="height: 10mm; width: 10mm; left: 100%; position: fixed; top: 100%;"
      />
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
      publication_defaults: {
        'journal': {
          width: 210,
          height: 297,        
          margin_left: 10,
          margin_right: 10,
          margin_top: 20,
          margin_bottom: 20,
          gridstep: 10,
          header_left: '',
          header_right: ''     
        }
      },

      new_publiname: this.publication.name,

      new_width: 0,
      new_height: 0,
      new_gridstep: 0,
      new_margin_left: 0,
      new_margin_top: 0,
      new_margin_right: 0,
      new_margin_bottom: 0,
      new_header_left: '',
      new_header_right: '',

      page_currently_active: 1,
      preview_mode: false,
      zoom: window.innerWidth <= 1024 ? 0.8 : 1,
      pixelsPerMillimeters: 0,
      has_media_selected: false
    }
  },
  created() {
    // when opening a publi, we’ll need to use the medias field to request some actual content
    this.$root.setPublicationZoom(this.zoom);
  },
  mounted() {
    this.$eventHub.$on('publication.addMedia', this.addMedia);
    this.$eventHub.$on('publication.listSpecificMedias', this.updateMediasPubli);
    document.addEventListener('keyup', this.publicationKeyListener);
    this.updateMediasPubli();  
    this.pixelsPerMillimeters = this.$refs.hasOwnProperty('mmMeasurer') ? this.$refs.mmMeasurer.offsetWidth / 10 : 38;
    this.updatePubliOptionsInFields();
  },
  beforeDestroy() {
    this.$eventHub.$off('publication.addMedia', this.addMedia);
    this.$eventHub.$off('publication.listSpecificMedias', this.updateMediasPubli);
    document.removeEventListener('keyup', this.publicationKeyListener);
    window.removeEventListener('mouseup', this.mouseup);
  },

  watch: {
    'publication.medias_list': function() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`WATCH • Publication: publication.medias_list`);
      }
      this.updateMediasPubli();
    },
    'publications_options': {
      handler() {
        if (this.$root.state.dev_mode === 'debug') {
          console.log(`WATCH • Publication: publications_options`);
        }
        this.updatePubliOptionsInFields();
      },
      deep: true
    },
    '$root.store.projects': {
      handler() {
        if (this.$root.state.dev_mode === 'debug') {
          console.log(`WATCH • Publication: $root.store.projects`);
        }
        this.updateMediasPubli();
      },
      deep: true
    },
    'zoom': function() {
      this.$root.setPublicationZoom(this.zoom);
    },
    'publication.name': function() {
      this.new_publiname = this.publication.name
    }

  },
  computed: {
    publications_options() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`COMPUTED • publications_options`);
      }
      // set default values to options
      if(!this.publication.hasOwnProperty('template')) {
        alert('Missing template in publication');
      }
      if(!this.publication_defaults.hasOwnProperty(this.publication.template)) {
        console.log('No defaults for this template. Returning original publication object.');
        return this.publication;
      }

      let publication_options = this.publication_defaults[this.publication.template];
      for (let k of Object.keys(publication_options)) {        
        if(this.publication.hasOwnProperty(k)) {
          publication_options[k] = this.publication[k];
        }
      }

      return publication_options;
    },
    pagesWithDefault() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`COMPUTED • pagesWithDefault`);
      }
      let defaultPages = [];
      // we need to clone this object to prevent it from being changed
      let pagesClone = JSON.parse(JSON.stringify(this.publication.pages));
      for(let page of pagesClone) {
        for(let k of Object.keys(this.publications_options)) {
          const option = this.publications_options[k];
          if(typeof option === "number") {
            if(page.hasOwnProperty(k) && !Number.isNaN(page[k])) {
              page[k] = Number.parseInt(page[k]);
            } else {
              page[k] = option;
            }
          } else 
          if(typeof option === "string") {
            if(page.hasOwnProperty(k) && typeof page[k] === "string") {
              // page[k] = page[k];
            } else {
              page[k] = option;
            }

          } 
        }
        defaultPages.push(page);
      }
      return defaultPages;
    }
  },
  methods: {
    addMedia(slugMediaPath) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: addMedia / slugMediaPath = ${slugMediaPath}`);
      }

      let medias_list = [];
      if(this.publication.hasOwnProperty('medias_list') && typeof this.publication.medias_list === 'object' && this.publication.medias_list.length > 0) {
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
        console.log(`METHODS • Publication: editPubliMedia / args = ${JSON.stringify(arguments, null, 4)}`);
      }

      let medias_list = [];
      if(this.publication.hasOwnProperty('medias_list')) {
        medias_list = this.publication.medias_list.slice();
      }

      // get media
      const m = Object.assign({}, medias_list[reference_index], val);
      
      // remove that media from index
      medias_list.splice(reference_index, 1);

      // and add it to the end of the array
      medias_list.push(m);

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
        this.publication_medias = [];        
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
          console.log(`Missing project in store — not expected : ${slugProjectName}`);
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
          meta.publi_meta = JSON.parse(JSON.stringify(m));
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
      if(this.publication.hasOwnProperty('pages') && this.publication.pages.length > 0) {
        pages = this.publication.pages.slice();
      }
      pages.push({});      

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
    updatePubliOptionsInFields() {
      this.new_width = this.publications_options.width;
      this.new_height = this.publications_options.height;

      this.new_gridstep = this.publications_options.gridstep;
      this.new_margin_left = this.publications_options.margin_left;
      this.new_margin_right = this.publications_options.margin_right;
      this.new_margin_top = this.publications_options.margin_top;
      this.new_margin_bottom = this.publications_options.margin_bottom;
      this.new_header_left = this.publications_options.header_left;
      this.new_header_right = this.publications_options.header_right;
    },
    newSelection(mediaID) {
      this.has_media_selected = true;
      this.$emit('newMediaSelected', mediaID);
    },
    noSelection() {
      this.has_media_selected = false;
    },
    onScroll(event) {
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
    },

    setPageProperties(page) {
      return `
        width: ${Number.parseInt(page.width)}mm; 
        height: ${Number.parseInt(page.height)}mm;
        transform: scale(${this.$root.settings.publi_zoom});
      `;
    },

    publicationKeyListener(evt) {
      switch(evt.key) {
        case 'p':
          this.preview_mode = !this.preview_mode;

      }
    },
    updatePublicationOption(type) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: updateMargin with type = ${type}`);
      }
      this.$root.editFolder({ 
        type: 'publications', 
        slugFolderName: this.slugPubliName, 
        data: { 
          [type]: event.target.value
        } 
      });
    }
  }
}
</script>
<style>

</style>