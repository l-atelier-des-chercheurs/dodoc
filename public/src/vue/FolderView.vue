<template>
  <div>
    <button @click.prevent="$root.closeFolder()">
      Close
    </button>
    <Folder
      :slugFolderName="slugFolderName"
      :folder="folder"
      :read_only="read_only"
    >
    </Folder>
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