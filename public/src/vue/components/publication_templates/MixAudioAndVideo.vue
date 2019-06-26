<template>
  <div 
    class="m_publicationview" 
    :class="{ 'is--preview' : preview_mode }"
    ref="panel"
  >
    <PublicationHeader 
      :slugPubliName="slugPubliName"
      :publication="publication"
      :publication_medias="publication_medias"
      :number_of_medias_required="number_of_medias_required"
      @export="show_export_modal = true"
    />

    <ExportVideoPubliModal
      v-if="show_export_modal"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
      :instructions="$t('export_audio_video_mix_instructions')"
    />

    <div class="m_mixAudioAndImagePublication">
      <div class="margin-medium" v-if="publication_medias.length === 0">
        <p>
          <small v-html="$t('add_sound_video_file')" />
        </p>
      </div>

      <transition-group name="slideFromTop" :duration="300" tag="div">
        <div
          class="m_mixAudioAndImagePublication--media"
          v-for="media in publication_medias" 
          :key="media.publi_meta.metaFileName"
        >
          <MediaMontagePublication
            :media="media"
            :read_only="read_only"
            @removePubliMedia="values => { removePubliMedia(values) }"
            @editPubliMedia="values => { editPubliMedia(values) }"
          />
        </div>
      </transition-group>

    </div>
  </div>
</template>
<script>
import PublicationHeader from '../subcomponents/PublicationHeader.vue';
import MediaMontagePublication from '../subcomponents/MediaMontagePublication.vue';
import ExportVideoPubliModal from '../modals/ExportVideoPubliModal.vue';

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    read_only: Boolean
  },
  components: {
    PublicationHeader,
    MediaMontagePublication,
    ExportVideoPubliModal
  },
  data() {
    return {
      show_export_modal: false,
      publication_medias: [],
      medias_slugs_in_order: [],
      accepted_media_type: ['audio', 'video'],
      number_of_medias_required: 2
    }
  },
  created() {
  },
  mounted() {
    this.$root.settings.current_publication.accepted_media_type = this.accepted_media_type;

    this.$eventHub.$on('publication.addMedia', this.addMedia);
    this.$eventHub.$on('socketio.projects.listSpecificMedias', this.updateMediasPubli);
    
    if(this.publication.hasOwnProperty('medias_slugs') && this.publication.medias_slugs.length > 0) {
      this.medias_slugs_in_order = this.publication.medias_slugs;
    }
    
    this.updateMediasPubli();  
          
  },
  beforeDestroy() {
    this.$eventHub.$off('publication.addMedia', this.addMedia);
    this.$eventHub.$off('socketio.projects.listSpecificMedias', this.updateMediasPubli);
  },
  watch: {
    'publication.medias': function() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`WATCH • Publication: publication.medias`);
      }
      this.updateMediasPubli();
            
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
    'publication.medias_slugs': function() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`WATCH • Publication: publication.medias_slugs`);
      }

      this.medias_slugs_in_order = typeof this.publication.medias_slugs === "object" ? this.publication.medias_slugs : [];
      this.updateMediasPubli();
            
    }
  },
  computed: {
  },
  methods: {
    addMedia({ slugProjectName, metaFileName }) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: addMedia with 
        slugProjectName = ${slugProjectName} and metaFileName = ${metaFileName}`);
      }

      const desired_filename = metaFileName;

      this.$eventHub.$on('socketio.media_created_or_updated', d => {
        this.$eventHub.$off('socketio.media_created_or_updated');

        this.medias_slugs_in_order.push({
          slugMediaName: d.metaFileName
        });

        this.$root.editFolder({ 
          type: 'publications', 
          slugFolderName: this.slugPubliName, 
          data: { 
            medias_slugs: this.medias_slugs_in_order
          }
        });
      });

      this.$root.createMedia({ 
        slugFolderName: this.slugPubliName, 
        type: 'publications', 
        additionalMeta: {
          slugProjectName,
          desired_filename,
          slugMediaName: metaFileName
        }
      });

    },
    removePubliMedia({ slugMediaName }) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: removeMedia / slugMediaName = ${slugMediaName}`);
      }

      this.$root.removeMedia({
        type: 'publications',
        slugFolderName: this.slugPubliName, 
        slugMediaName
      });

      if(this.medias_slugs_in_order.length > 0) {
        this.medias_slugs_in_order = this.medias_slugs_in_order.filter(m => m.slugMediaName !== slugMediaName);        
      }

      this.$root.editFolder({ 
        type: 'publications', 
        slugFolderName: this.slugPubliName, 
        data: { 
          medias_slugs: this.medias_slugs_in_order
        }
      });
    },
    updateMediasPubli() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: updateMediasPubli`);
      }

      this.$root.settings.current_publication.accepted_media_type = this.accepted_media_type;

      if(!this.publication.hasOwnProperty('medias') || Object.keys(this.publication.medias).length === 0) {
        this.publication_medias = [];        
        return;
      }
      
      // get list of publications items
      let publi_medias = [];
      let missingMedias = [];


      if(this.medias_slugs_in_order.length === 0) {
        this.publication_medias = [];
        
        return;
      }

      this.medias_slugs_in_order.map(item => {
        const metaFileName = item.slugMediaName;

        if(!this.publication.medias.hasOwnProperty(metaFileName)) {
          // error : a media referenced in medias_slugs is not in this.publication.medias
          return;
        }

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


      const types_of_medias = publi_medias.map(m => m.type);
      this.$root.settings.current_publication.accepted_media_type = this.accepted_media_type.filter(t => !types_of_medias.includes(t));

      this.publication_medias = publi_medias;        
    }
  }
}
</script>
<style>

</style>