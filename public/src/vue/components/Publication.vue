<template>
  <div>
    {{ publication }}
    <button type="button" @click="$emit('close')">
      Fermer
    </button>
  </div>
</template>
<script>


export default {
  props: {
    slugFolderName: String,
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
    addMedia(slugMediaName) {
      let publidata = this.publication;

      publidata.medias_list.push({
        filename: slugMediaName,
        page: 1
      });

      this.$root.editFolder({ 
        type: 'publications', 
        slugFolderName: this.slugFolderName, 
        data: publidata 
      });
    }
  }
}
</script>
<style>

</style>