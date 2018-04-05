<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :typeOfModal="'Capture'"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('capture') }}</span> <i>{{ folder.name }}</i>
    </template>

    <template slot="sidebar">
    </template>    

    <template slot="preview">
      <CaptureContent
        :folder="folder"
      >
      </CaptureContent>
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import CaptureContent from './capture/CaptureContent.vue';

export default {
  props: {
    folder: Object
  },
  components: {
    Modal,
    CaptureContent
  },  
  created() {
  },
  mounted() {
    // this.startCameraFeed();
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
  },
}
</script>
<style>

</style>