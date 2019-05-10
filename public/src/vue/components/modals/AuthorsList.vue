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

          <template v-if="Object.keys(sortedAuthors).length > 0">
            <button type="button" 
              v-for="author in sortedAuthors" 
              :key="author.slugFolderName" 
              class="m_authorsList--author"
              :class="{ 'is--selected' : author.name === $root.settings.current_author.name }"
              @click="setAuthor(author)"
            >
              <button type="button" class="buttonLink m_authorsList--author--removeButton" @click.stop="removeAuthor(author)">
                <svg version="1.1" class="inline-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="91.6px"
                  height="95px" viewBox="0 0 91.6 95" style="enable-background:new 0 0 91.6 95;" xml:space="preserve">
                  <path class="st0" d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
                  l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"/>
                </svg>
                <span class="" style="display: none">
                  {{ $t('remove') }}
                </span>
              </button>

              <img 
                v-if="!!author.preview"
                width="100" height="100"
                :src="urlToPortrait(author.slugFolderName, author.preview)"
                draggable="false"  
              >
              <div class="m_authorsList--author--name">{{ author.name }}</div>
              <!-- <button type="button" class="buttonLink" @click.stop="setAuthor(author)" v-if="author.name !== $root.settings.current_author.name">
                {{ $t('select') }}
              </button> -->
              <button type="button" class="buttonLink" @click.stop="unsetAuthor()" v-if="author.name === $root.settings.current_author.name">
                {{ $t('unselect') }}
              </button>
            </button>
          </template>

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
    this.$socketio.listFolders({ type: 'authors' });
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
      this.$alertify
        .okBtn(this.$t('yes'))
        .cancelBtn(this.$t('cancel'))        
        .confirm(this.$t('sureToRemoveAuthor'), 
        () => {
          this.$root.removeFolder({ 
            type: 'authors', 
            slugFolderName: author.slugFolderName
          });
        },
        () => {
        });              
    },
    setAuthor(name) {
      this.$root.setAuthor(name);
      this.$refs.modal.closeModal()
    },
    unsetAuthor() {
      this.$root.unsetAuthor();
    },
    urlToPortrait(slug, preview) {
      if(!preview) return '';
      let pathToSmallestThumb = preview.filter(m => m.size === 180)[0].path;
      return pathToSmallestThumb;
    }
  }
}
</script>
<style>

</style>