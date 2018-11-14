<template>
  <div 
    class="m_publicationview" 
    :class="{ 'is--preview' : preview_mode }"
    @scroll="onScroll"
    ref="panel"
  >
    <div class="m_publicationMeta">
      <div class="m_publicationMeta--topbar">
        <button type="button" class=""
          v-if="$root.state.mode !== 'export_publication'"        
          @click="closePublication()"
        >
          ←
        </button>

        <div class="m_publicationMeta--topbar--title">
          {{ publication.name }}
        </div>

        <template 
          v-if="$root.state.mode !== 'export_publication'"
        >
          <!-- <div class="margin-small">
            <input id="settings" type="checkbox" v-model="advanced_options" />
            <label for="settings">{{ $t('settings') }}</label>
          </div> -->

          <button type="button" class="buttonLink" @click="showExportModal = true">
            {{ $t('export') }}
          </button>     

          <!-- <ExportModal
            v-if="showExportModal"
            @close="showExportModal = false"
            :slugPubliName="slugPubliName"
          >
          </ExportModal> -->

          <button type="button" class="buttonLink" @click="removePublication">
            {{ $t('remove') }}
          </button>     
        </template>

      </div>
    </div>
  </div>
</template>
<script>


export default {
  props: {
    slugPubliName: String,
    publication: Object,
    read_only: Boolean
  },
  components: {
  },
  data() {
    return {
      showExportModal: false,
      publication_medias: []
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
    closePublication() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: closePublication`);
      }
      this.$root.closePublication();
    },
    removePublication() {
      if (window.confirm(this.$t('sureToRemovePubli'))) {
        if (this.$root.state.dev_mode === 'debug') {
          console.log(`METHODS • Publication: removePublication`);
        }
        this.$root.removeFolder({ 
          type: 'publications', 
          slugFolderName: this.slugPubliName, 
        });
        
        this.closePublication();
      }
    },
    updateMediasPubli() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: updateMediasPubli`);
      }


      if(!this.publication.hasOwnProperty('medias') || Object.keys(this.publication.medias).length === 0) {
        this.publication_medias = [];        
        return;
      }
      
      // get list of publications items
      let publi_medias = {};
      let missingMedias = [];

      Object.keys(this.publication.medias).map(metaFileName => {

        const _media = this.publication.medias[metaFileName];

        // for each, get slugFolderName and metaFileName
        if(!_media.hasOwnProperty('slugProjectName') || !_media.hasOwnProperty('metaFileName')) {
          return;
        }

        const slugProjectName = _media.slugProjectName;
        const slugMediaName = _media.slugMediaName;

        // find in store if slugFolderName exists
        if(!this.$root.store.projects.hasOwnProperty(slugProjectName)) {
          console.error(`Missing project in store — not expected : ${slugProjectName}`);
          console.error(`Medias from project was probably added to the publication before it was removed altogether.`)
          return;
        }

        // find in store if metaFileName exists
        const project_medias = this.$root.store.projects[slugProjectName].medias;
        if(!project_medias.hasOwnProperty(slugMediaName)) {
          console.log(`Some medias missing from client`);
          missingMedias.push({ slugFolderName: slugProjectName, metaFileName: slugMediaName });
        } else {
          let meta = JSON.parse(JSON.stringify(project_medias[slugMediaName]));

          if(meta.hasOwnProperty('_isAbsent') && meta._isAbsent) {
            console.error(`Missing media in store — not expected : ${slugProjectName} / ${slugMediaName}`);
            console.error(`Media was probably added to the publication before it was removed.`);
            return;
          }

          meta.slugProjectName = slugProjectName;
          meta.publi_meta = JSON.parse(JSON.stringify(_media));
            
          publi_medias.push(meta);
          return;
        }
      });

      console.log(`Finished building media list. Missing medias: ${missingMedias.length}`);

      // send list of medias to get
      if(missingMedias.length > 0) {
        this.$root.listSpecificMedias({
          type: 'projects',
          medias_list: missingMedias
        });
      }

      this.publication_medias = publi_medias;        
    },
    onScroll(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: onScroll`);
      }

      if(!this.$refs.hasOwnProperty('pages') || this.$refs.pages.children.length === 0) {
        return;
      }

      const currentScroll = event.target.scrollTop;
      const middleOfScreen = this.$refs.panel.offsetHeight / 2;
      let pages = this.$refs.pages.children;

      let index = 0;
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