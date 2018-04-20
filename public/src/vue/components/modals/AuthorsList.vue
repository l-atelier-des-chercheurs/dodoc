<template>
  <Modal
    @close="$emit('close')"
    :typeOfModal="'LargeAndScroll'"
    >
    <template slot="header">
      <span class="">Liste des auteurs</span>
    </template>

    <template slot="preview">
      <div  class="">
        <div class="m_authorsList">
          <div v-for="(author, slug) in authors" :key="author.name" class="">
            <button type="button" class="button-allwide" @click="setAuthor(author)"
              :class="{ 'is--selected' : author.name === $root.settings.current_author.name }"
            >
              <img :src="urlToPortrait(slug, author.preview)" width="100" height="100">
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
  props: ['authors'],
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
    urlToPortrait(slug, filename) {
      if(filename === undefined) {
        return '';
      }
      return `${this.$root.state.authorsFolder}/${slug}/${filename}`;
    }
  }
}
</script>
<style>

</style>