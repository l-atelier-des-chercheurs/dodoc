<template>
  <div class="m_addcreationtoproject">
    <div class="">
      <label v-html="$t('add_to_project')" />
      <div class="flex-nowrap">
        <select v-model="upload_to_folder">
          <option 
            v-for="project in all_projects" 
            :key="project.slugFolderName"
            :value="project.slugFolderName"
          >
            {{ project.name }}
          </option>        
        </select>
        <button type="button" 
          @click="addTempMediaToFolder()"
          :disabled="upload_to_folder === ''"
          v-html="$t('send')"
          class="bg-bleuvert button-thin"
        />
      </div>
    </div>    
  </div>
</template>
<script>


export default {
  props: {
    media_filename: String
  },
  components: {
  },
  data() {
    return {
      upload_to_folder: ''
    }
  },
  
  created() {
  },
  mounted() {
    if(this.$root.do_navigation.current_slugProjectName) {
      this.upload_to_folder = this.$root.do_navigation.current_slugProjectName;
    } else {
      this.upload_to_folder = Object.keys(this.all_projects)[0];
    }
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
    all_projects() {
      return this.$root.store.projects;
    }
  },
  methods: {
    addTempMediaToFolder() {
      this.$socketio.addTempMediaToFolder({
        from: {
          media_filename: this.media_filename,
          type: 'publications'
        },
        to: {
          slugFolderName: this.upload_to_folder,
          type: 'projects'
        }
      });
    }
  }
}
</script>
<style>

</style>