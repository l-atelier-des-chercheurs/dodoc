<template>
  <Modal
    ref="modal"
    @close="$emit('close')"
    @submit="sendMedia"
    :typeOfModal="'LargeAndNoScrollWithButtons'"
    :read_only="read_only"
  >
    <template slot="header">
      <span class="">
        {{ $t('validate_media') }}        
      </span>
    </template>

    <template slot="sidebar">
      <div class="m_modal--metaOptions--media">  
        <img 
          v-if="media.type === 'image'" 
          :src="media.rawData"
        />
        <video 
          v-else-if="media.type === 'video'" 
          :src="media.rawData"
          controls
        />
      </div>

      <div class="m_modal--metaOptions--fav">
        <div class="margin-bottom-small">
          <span class="switch switch-xs">
            <input type="checkbox" class="switch" id="favswitch" v-model="fav">
            <label for="favswitch">{{ $t('fav') }}</label>
          </span>
        </div>
      </div>
    </template>    

    <template slot="buttons">
      <template slot="cancel_button">
          {{ $t('cancel') }}
      </template>
      <template slot="submit_button">
        <template v-if="sending"> 
          <span class="loader loader-xs" />
        </template>
        {{ $t('save') }}
      </template>
    </template>    

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';

export default {
  props: {
    media: Object,
    slugProjectName: String,
    read_only: Boolean
  },
  components: {
    Modal
  },
  data() {
    return {
      fav: false,
      sending: false
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
    sendMedia: function() {
      console.log('METHODS • ValidateMedia: sendMedia');
      this.$eventHub.$on('socketio.media_created_or_updated', this.newMediaSent);
      this.$root.createMedia({
        slugFolderName: this.slugProjectName,
        type: 'projects',
        rawData: this.media.rawData,
        additionalMeta: {
          type: this.media.type,
          fav: this.fav
        }
      });
      this.sending = true;
    },
    newMediaSent: function() {
      console.log('METHODS • ValidateMedia: newMediaSent');
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t('notifications.media_was_sent'));
      this.$emit('close');
      this.sending = false;
    }
  }
}
</script>
<style>

</style>