<template>
  <div class="m_publicationMeta">
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
          {{ $t('edit') }}
        </button>     

        <EditPublication
          v-if="show_edit_publication"
          :publication="publication"
          :slugPubliName="slugPubliName"
          @close="show_edit_publication = false"
        />

        <button type="button" class="buttonLink" @click="$emit('export')"
          :disabled="Object.values(publication.medias).length === 0"
        >
          {{ $t('export') }}
        </button>     

        <button type="button" class="buttonLink" @click="removePublication">
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
    publication: Object
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