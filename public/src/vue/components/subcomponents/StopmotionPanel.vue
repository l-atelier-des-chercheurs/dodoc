<template>
  <div class="m_stopmotionpanel">
    <div class="m_stopmotionpanel--medias">
      <MediaContent
        v-for="media in medias"
        :key="media.metaFilename"
        :context="'edit'"
        :slugFolderName="stopmotiondata.slugFolderName"
        :media="media"
        :subfolder="'_stopmotions/'"
      />
    </div>
    <div class="m_stopmotionpanel--buttons">
      <button type="button" class="buttonLink" @click="assembleStopmotionMedias">
        ASSEMBLER
      </button>
    </div>
  </div>
</template>
<script>
import MediaContent from './MediaContent.vue';

export default {
  props: {
    stopmotiondata: Object
    slugProjectName: String
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
    assembleStopmotionMedias: function() {
      this.$eventHub.$on('socketio.media_created_or_updated', this.newMediaCaptured);
      debugger;
      this.$root.createMedia({
        slugFolderName: this.current_stopmotion,
        type: 'projects',
        rawData: imageData,
        additionalMeta: {
          type: 'stopmotion'          
        }
      });
    }
  }
}
</script>
<style>

</style>