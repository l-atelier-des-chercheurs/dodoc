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
    slugProjectName: String,
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
    // when Opening a publi, we’ll need to use the medias field to request some actual content

    
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
  }
}
</script>
<style>

</style>