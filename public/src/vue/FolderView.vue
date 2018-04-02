<template>
  <div class="m_folderview">
    <div class="">
      <Folder
        :slugFolderName="slugFolderName"
        :folder="folder"
        :read_only="read_only"
        :context="'full'"
      >
      </Folder>
    </div>
    <button @click.prevent="$root.closeFolder()">
      Fermer
    </button>
  </div>
</template>
<script>
import Folder from './components/Folder.vue';

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    read_only: Boolean
  },
  components: {
    Folder
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
  }
}
</script>
<style>

</style>