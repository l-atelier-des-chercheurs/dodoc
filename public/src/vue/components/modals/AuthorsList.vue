<template>
  <Modal
    @close="$emit('close')"
    :typeOfModal="'AuthorsList'"
    >
    <template slot="header">
      <span class="text-cap"> Liste des auteurs</span>
    </template>

    <template slot="preview">
      <div  class="margin-medium">
        Liste des auteurs

        <div v-for="author in $root.store.authorsList" :key="author.name" class="margin-vert-small">
          <button type="button" class="button-inline bg-noir button-allwide c-blanc" @click="setAuthor(author.name)"
            :class="{ 'bg-rouge' : author.name === $root.settings.current_author }"
          >
            <img :src="urlToPortrait(author.portrait)">
            {{ author.name }}
          </button>
        </div>        
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
      this.$emit('close');
    },
    urlToPortrait(filename) {
      return `${this.$root.state.authorsFolder}/${filename}`;
    }
  }
}
</script>
<style>

</style>