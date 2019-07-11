<template>
  <div class="m_publicationMeta">
    <div class="label padding-verysmall"
      v-if="$root.state.mode !== 'export_publication'"        
    >
      {{ $t(publication.template) }}
    </div>

    <div class="m_publicationMeta--topbar">

      <div>
        <button type="button" class="m_publicationMeta--topbar--backbutton"
          v-if="$root.state.mode !== 'export_publication'"        
          @click="closePublication()"
          :title="$t('back_to_project')"
          v-tippy='{ 
            placement : "bottom",
            delay: [600, 0]
          }'
        >
          ‹
        </button>

        <div class="m_publicationMeta--topbar--title" :title="slugPubliName">
          {{ publication.name }}
        </div>

      </div>
      <div
        v-if="$root.state.mode !== 'export_publication'"
      >

        <button type="button" class="buttonLink" @click="show_edit_publication = true">
          <svg version="1.1" class="inline-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100.7px"
            height="101px" viewBox="0 0 100.7 101" style="enable-background:new 0 0 100.7 101;" xml:space="preserve">
            <path class="st0" d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
              L19.1,91.5z"/>
          </svg>
          {{ $t('edit') }}
        </button>     

        <EditPublication
          v-if="show_edit_publication"
          :publication="publication"
          :slugPubliName="slugPubliName"
          @close="show_edit_publication = false"
        />

        <button type="button" class="buttonLink" @click="$emit('export')"
          :class="{ 'is--disabled' : export_button_is_disabled }"
        >
          {{ $t('export') }}
        </button>     

        <button type="button" class="buttonLink" @click="removePublication">
          <svg version="1.1" class="inline-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="91.6px"
            height="95px" viewBox="0 0 91.6 95" style="enable-background:new 0 0 91.6 95;" xml:space="preserve">
            <path class="st0" d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"/>
          </svg>
          {{ $t('remove') }}
        </button>     
      </div>
    </div>
  </div>
</template>
<script>
import EditPublication from '../modals/EditPublication.vue';
export default {
  props: {
    slugPubliName: String,
    publication: Object,
    publication_medias: Array,
    number_of_medias_required: {
      type: Number,
      default: -1
    }
  },
  components: {
    EditPublication
  },
  data() {
    return {
      show_edit_publication: false
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
    export_button_is_disabled() {
      if(Object.values(this.publication_medias).length < 1) return true;

      if(
        this.number_of_medias_required !== -1
        && Object.values(this.publication_medias).length !== this.number_of_medias_required
      ) 
        return true;

      return false;
    }
  },
  methods: {
    closePublication() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: closePublication`);
      }
      this.$root.closePublication();
    },
    removePublication() {
      this.$alertify
        .okBtn(this.$t('yes'))
        .cancelBtn(this.$t('cancel'))        
        .confirm(this.$t('sureToRemovePubli'), 
        () => {
          if (this.$root.state.dev_mode === 'debug') {
            console.log(`METHODS • Publication: removePublication`);
          }
          this.$root.removeFolder({ 
            type: 'publications', 
            slugFolderName: this.slugPubliName, 
          });          
          this.closePublication();
        },
        () => {
        });                    
    },
  }
}
</script>
<style>

</style>