<template>
  <div>
    <pre>{{ publication }}</pre>
    <button type="button" @click="closePublication()">
      Fermer
    </button>
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
    }
  },
  created() {
    // when opening a publi, we’ll need to use the medias field to request some actual content


  },
  mounted() {
    this.$eventHub.$on('publication.addMedia', this.addMedia);
  },
  beforeDestroy() {
    this.$eventHub.$off('publication.addMedia', this.addMedia);
  },

  watch: {
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
    closePublication() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: closePublication`);
      }
      this.$root.closePublication();
    }
  }
}
</script>
<style>

</style>