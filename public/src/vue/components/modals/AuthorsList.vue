<template>
  <Modal
    ref="modal"
    @close="$emit('close')"
    :typeOfModal="'LargeAndScroll'"
  >
    <template slot="header">
      <span class="">
        {{ $t('authors_list') }}        
      </span>
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
              class="m_authorsList--createAuthor--createButton"
            >
              {{ $t('create_an_author') }}
            </button>

            <CreateAuthor
              v-else
              @close="openCreateAuthorPanel = false"
              :read_only="read_only"
            />
          </div>

          <div type="button" 
            v-if="Object.keys(sortedAuthors).length > 0"
            v-for="author in sortedAuthors" 
            :key="author.name" 
            class="m_authorsList--author"
            :class="{ 'is--selected' : author.name === $root.settings.current_author.name }"
            @click="setAuthor(author)"
          >
            <img 
              v-if="!!author.preview"
              width="100" height="100"
              :src="urlToPortrait(author.slugFolderName, author.preview)" >
            <div class="m_authorsList--author--name">{{ author.name }}</div>
            <button type="button" class="buttonLink" @click.stop="setAuthor(author)" v-if="author.name !== $root.settings.current_author.name">
              {{ $t('select') }}
            </button>
            <button type="button" class="buttonLink" @click.stop="unsetAuthor()" v-if="author.name === $root.settings.current_author.name">
              {{ $t('unselect') }}
            </button>
            <button type="button" class="buttonLink" @click.stop="removeAuthor(author)">
              {{ $t('remove') }}
            </button>
          </div>

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
      return Object.values(this.authors).sort((a, b) => a.name.localeCompare(b.name));
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
      this.$refs.modal.closeModal()
    },
    unsetAuthor() {
      this.$root.unsetAuthor();
    },
    urlToPortrait(slug, filename) {
      if(filename === undefined) {
        return '';
      }
      return `/${this.$root.state.authorsFolder}/${slug}/${filename}`;
    }
  }
}
</script>
<style>

</style>