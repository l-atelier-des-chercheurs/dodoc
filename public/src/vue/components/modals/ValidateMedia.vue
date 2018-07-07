<template>
  <div class="m_validateMedia">

    <div class="m_modal--metaOptions--fav">
      <div class="margin-bottom-small">
        <span class="switch switch-xs">
          <input type="checkbox" class="switch" id="favswitch" v-model="fav">
          <label for="favswitch">{{ $t('fav') }}</label>
        </span>
      </div>
    </div>

    <button
      type="button"
      class="button button-bg_rounded bg-orange"
    >
      <img src="/images/i_clear.svg"/>
      <span class="text-cap font-verysmall">
        {{ $t('cancel') }}
      </span>
    </button>

    <button
      type="button"
      :disabled="read_only"
      class="button button-bg_rounded bg-bleuvert"
    >
      <img src="/images/i_enregistre.svg"/>
      <span class="text-cap font-verysmall">
        <template v-if="sending"> 
          <span class="loader loader-xs" />
        </template>
        {{ $t('save') }}
      </span>
    </button>

  </div>
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
        rawData: this.media_to_validate.rawData,
        additionalMeta: {
          type: this.media_to_validate.type,
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