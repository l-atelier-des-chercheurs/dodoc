<template>
  <Modal
    @close="$emit('close')"
    :typeOfModal="'AuthorsList'"
    >
    <template slot="header">
      <span class="text-cap"> Liste des auteurs</span>
    </template>

    <template slot="preview">
      {{ $root.settings.current_author }}
      <hr>
      <div v-for="author in $root.store.authorsList.list" :key="author.name">
        <button type="button" @click="setAuthor(author.name)">
          {{ author.name }}
        </button>
      </div>        
    </template>    
  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';

export default {
  props: {
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
    setAuthor(name) {
      this.$root.setAuthor(name);
    }
  }
}
</script>
<style>

</style>