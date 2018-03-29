<template>
  <div class="m_folderview">
    <Folder
      :slugFolderName="slugFolderName"
      :folder="folder"
      :read_only="read_only"
      :context="'full'"
    >
    </Folder>
    <button @click.prevent="$root.closeFolder()">
      Close
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