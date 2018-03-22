<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('capture') }}</span> <i>{{ folder.name }}</i>
    </template>

    <template slot="sidebar">
      
    </template>    

    <template slot="preview">
      Hello !
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';

export default {
  props: {
    folder: Object
  },
  components: {
    Modal
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