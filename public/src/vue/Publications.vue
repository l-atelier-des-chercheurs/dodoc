<template>
  <div class="m_publicationsview">

    <div class="m_actionbar">
      <!-- <div class="m_actionbar--buttonBar">
        <button 
          class="barButton barButton_createPubli"
          type="button"  
          @click="showCreatePublicationModal = true"
          :disabled="read_only" 
        >
          <span>    
              {{ $t('create_a_publication') }}
          </span>
        </button>

        <CreatePublication
          v-if="showCreatePublicationModal"
          @close="showCreatePublicationModal = false"
          :read_only="read_only"
        />
      </div> -->
      <div class="m_actionbar--text">
        {{ $t('cooking_pot') }}: {{ $t('cooking_pot_instructions')}}
      </div>
    </div>   

    <!-- liste des recettes -->
    <div class="m_recipes">
      <!-- pour chaque recette -->
      <div class="m_recipes--recipe"
        v-for="recipe in recipes"
        :key="recipe.key"
      >
        <label>{{ $t(recipe.key) }}</label>

        <br>

        <button 
          class="barButton barButton_createPubli"
          type="button"  
          @click="createAndOpenPublication(recipe.key)"
          :disabled="read_only" 
        >
          <span>    
              {{ $t('create') }}
          </span>
        </button>

        <div class="m_recipes--recipe--mealList"
          v-if="recipe_of_this_template(recipe.key).length > 0"
        >
          <label>Créations précédentes</label>
          
          <button type="button"
            class="m_recipes--recipe--mealList--meal"
            v-for="publication in recipe_of_this_template(recipe.key)"
            :key="publication.slugFolderName"
            @click="openPublication(publication.slugFolderName)"
          >
            <h2 class="m_recipes--recipe--mealList--mealTitle">
              {{ publication.name }}
            </h2>
            {{ $root.formatDateToHuman(publication.date_created) }}
          </button>
        </div>

      </div>
      

    </div>


    


    <!-- <div class="m_publicationItems">
      <div 
        v-if="typeof publications === 'object'"
        class="m_publicationItems--item"
        v-for="publication in publications"
        :key="publication.slugFolderName"
      >
        <h2 class="m_publicationItems--item--title"
          @click="openPublication(publication.slugFolderName)"
        >
          {{ publication.name }}
        </h2>
        <div>
          <div class="m_metaField">
            <div>
              {{ $t('template') }}
            </div>
            <div>
              {{ $t(publication.template) }}
            </div>
          </div>
          <div class="m_metaField">
            <div>
              {{ $t('number_of_pages') }}
            </div>
            <div>
              <template v-if="!!publication.pages">
                {{ Object.keys(publication.pages).length }}
              </template>
              <template v-else>
                0
              </template>
            </div>
          </div>
        </div>

        <button 
          type="button" 
          class="button-redthin" 
          @click="openPublication(publication.slugFolderName)"
        >
          <span class="">
            {{ $t('open') }}
          </span>
        </button>

      </div>
    </div> -->
  </div>
</template>
<script>
import CreatePublication from './components/modals/CreatePublication.vue';


export default {
  props: ['publications', 'read_only'],
  components: {
    CreatePublication
  },
  data() {
    return {
      showCreatePublicationModal: false,

      recipes: [
        {
          key: 'page_by_page',
        },
        {
          key: 'video_assemblage'
        },
        {
          key: 'stopmotion_animation'
        },
        {
          key: 'drawing_pad'
        },
      ]
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
    openPublication(slugPubliName) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publications: openPublication / slugPubliName = ${slugPubliName}`);
      }
      this.$root.openPublication(slugPubliName);
    },
    recipe_of_this_template(template_key) {
      const filtered_recipes = Object.values(this.publications).filter(r => r.template === template_key);
      const sorted_recipes = this.$_.sortBy(filtered_recipes, 'date_created');
      return sorted_recipes.reverse();
    },
    createAndOpenPublication(template) {
      const name = this.$t('untitled');
      const slugFolderName = template;

      let publication_data = {
        name,
        slugFolderName,
        template,
        authors: this.$root.settings.current_author.hasOwnProperty('name') ? [{ name: this.$root.settings.current_author.name }] : [],
      };

      if(template === 'page_by_page') {
        publication_data.pages = [{
          id: +new Date() + '_' + (Math.random().toString(36) + '00000000000000000').slice(2, 3)
        }];
      }

      this.$eventHub.$on('socketio.folder_created_or_updated', (fdata) => {
        if(fdata.id === this.$root.justCreatedFolderID) {
          this.$eventHub.$off('socketio.folder_created_or_updated');
          this.openPublication(fdata.slugFolderName);
        }
      });

      this.$root.createFolder({ 
        type: 'publications', 
        data: publication_data
      });


    }
  }
}
</script>
<style>

</style>