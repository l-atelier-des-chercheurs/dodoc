<template>
  <div class="m_publicationMeta">
    <div class="m_publicationMeta--topbar">
      <button type="button" class=""
        v-if="$root.state.mode !== 'export_publication'"        
        @click="closePublication()"
      >
        ←
      </button>

      <div class="m_publicationMeta--topbar--title" :title="slugPubliName">
        {{ publication.name }}
      </div>

      <template
        v-if="$root.state.mode !== 'export_publication'"
      >
        <button type="button" class="buttonLink" @click="$emit('export')"
          :disabled="Object.values(publication.medias).length === 0"
        >
          {{ $t('export') }}
        </button>     

        <button type="button" class="buttonLink" @click="removePublication">
          {{ $t('remove') }}
        </button>     
      </template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    slugPubliName: String,
    publication: Object
  },
  components: {
  },
  data() {
    return {
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