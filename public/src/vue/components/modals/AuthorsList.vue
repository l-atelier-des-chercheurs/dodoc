<template>
  <Modal
    @close="$emit('close')"
    :typeOfModal="'LargeAndScroll'"
    >
    <template slot="header">
      <span class="">Liste des auteurs</span>
    </template>

    <template slot="preview">
      <div class="">        
        <transition-group 
          tag="div" 
          class="m_authorsList"
          name="list-complete"        
        >
          
          <div 
            class="m_authorsList--createAuthor"
            :key="'createAuthor'"
          >
            <button type="button" 
              @click="openCreateAuthorPanel = true"
              v-if="openCreateAuthorPanel == false"
            >
              Créer un auteur
            </button>

            <CreateAuthor
              v-else
              @close="openCreateAuthorPanel = false"
              :read_only="read_only"
            />
          </div>

          <button type="button" 
            v-if="typeof authors === 'object'"
            v-for="(author, slug) in sortedAuthors" 
            :key="author.name" 
            class="m_authorsList--author"
            :class="{ 'is--selected' : author.name === $root.settings.current_author.name }"
            @click="setAuthor(author)"
          >
            <img 
              v-if="!!author.preview"
              width="100" height="100"
              :src="urlToPortrait(slug, author.preview)" >
            <span>{{ author.name }}</span>
            <button type="button" class="buttonLink" @click.stop="unsetAuthor()" v-if="author.name === $root.settings.current_author.name">
              {{ $t('unselect') }}
            </button>
            <button type="button" class="buttonLink" @click.stop="removeAuthor(author)">
              {{ $t('remove') }}
            </button>
          </button>

        </transition-group>
      </div>
    </template>    
  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import ImageSelect from './../subcomponents/ImageSelect.vue';
import CreateAuthor from './../subcomponents/CreateAuthor.vue';

export default {
  props: {
    authors: {
      type: Object,
      default: {}
    }
  },
  components: {
    Modal,
    CreateAuthor
  },
  data() {
    return {
      
      openCreateAuthorPanel: false
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
    sortedAuthors: function() {
      return this.authors;
    }
  },
  methods: {
    removeAuthor(author) {
      if (window.confirm(this.$t('sureToRemoveAuthor'))) {
        this.$root.removeFolder({ 
          type: 'authors', 
          slugFolderName: author.slugFolderName
        });
      }
    },

    setAuthor(name) {
      this.$root.setAuthor(name);
      this.$emit('close');
    },
    unsetAuthor() {
      this.$root.unsetAuthor();
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