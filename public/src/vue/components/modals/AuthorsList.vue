<template>
  <Modal
    @close="$emit('close')"
    :typeOfModal="'AuthorsList'"
    >
    <template slot="header">
      <span class="text-cap"> Liste des auteurs</span>
    </template>

    <template slot="preview">
      <div  class="">
        <div class="margin-medium">
          Liste des auteurs
        </div>

        <div class="m_authorsList">
          <div v-for="author in $root.store.authorsList" :key="author.name" class="">
            <button type="button" class="button-allwide" @click="setAuthor(author)"
              :class="{ 'is--selected' : author.name === $root.settings.current_author.name }"
            >
              <img :src="urlToPortrait(author.portrait)" width="100" height="100">
              <span>{{ author.name }}</span>
            </button>
          </div>        
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