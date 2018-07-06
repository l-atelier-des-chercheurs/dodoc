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
        {{ $t('create') }}
      </button>
    </div>
  </div>
</template>
<script>
import MediaContent from './MediaContent.vue';

export default {
  props: {
    stopmotiondata: Object,
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
        return Object.values(this.stopmotiondata.medias);
      } else {
        return [];
      }
    }
  },
  methods: {
    assembleStopmotionMedias: function() {
      console.log('METHODS • StopmotionPanel: assembleStopmotionMedias');
      this.$eventHub.$on('socketio.media_created_or_updated', this.newMediaCaptured);
      this.$root.createMedia({
        slugFolderName: this.slugProjectName,
        type: 'projects',
        rawData: this.medias,
        additionalMeta: {
          type: 'stopmotion',
          slugStopmotionName: this.stopmotiondata.slugFolderName ,
          frameRate: 4   
        }
      });
    }
  }
}
</script>
<style>

</style>