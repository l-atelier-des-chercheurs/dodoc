<template>
  <div class="m_stopmotionpanel">
    <MediaContent
      v-for="media in medias"
      :key="mediaURL"
      :context="'edit'"
      :slugFolderName="stopmotiondata.slugFolderName"
      :media="media"
      :subfolder="'_stopmotions/'"
    >
    </MediaContent>          

  </div>
</template>
<script>
import MediaContent from './MediaContent.vue';

export default {
  props: {
    stopmotiondata: Object
  },
  components: {
    MediaContent
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
    medias: function() {
      if(this.stopmotiondata.hasOwnProperty('medias')) {
        return this.stopmotiondata.medias;
      } else {
        return [];
      }
    }
  },
  methods: {
  }
}
</script>
<style>

</style>