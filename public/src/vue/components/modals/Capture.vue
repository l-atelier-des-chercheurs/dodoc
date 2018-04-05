<template>
  <Modal
    @close="closeModal()"
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
        :slugFolderName="slugFolderName"
        ref="CaptureContent"
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
    folder: Object,
    slugFolderName: String
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
  methods: {
    closeModal() {
      this.$emit('close');
    }
  }
}
</script>
<style>

</style>