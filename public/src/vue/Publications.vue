<template>
  <div class="m_publicationsview">
    <div class="m_actionbar">
      <div class="m_actionbar--buttonBar">
        <!-- <button 
          class="barButton barButton_createPubli"
          type="button"  
          @click="showCreatePublicationModal = true"
          :disabled="read_only" 
        >
          <span>    
              {{ $t('create_a_publication') }}
          </span>
        </button>-->

        <CreatePublication
          v-if="showCreatePublicationModal"
          :default_name="createPubliDefaultName"
          :default_template="createPubliTemplateKey"
          @close="showCreatePublicationModal = false"
          :read_only="read_only"
        />
      </div>
      <div class="m_actionbar--text">{{ $t('cooking_pot') }}: {{ $t('cooking_pot_instructions')}}</div>
    </div>

    <!-- liste des recettes -->
    <div class="m_recipes">
      <!-- pour chaque recette -->
      <div class="m_recipes--recipe" v-for="recipe in recipes" :key="recipe.key">
        <div class="m_recipes--recipe--icon" v-html="recipe.icon"></div>
        <div class="m_recipes--recipe--text">
          <h2 class>{{ $t(recipe.key) }}</h2>
          <p class="margin-vert-small">
            <span v-html="$t(recipe.summary)" class="margin-vert-verysmall" />
            <br />
            <button
              v-if="!recipe.show_instructions && recipe.instructions"
              type="button"
              class="buttonLink margin-left-none padding-left-none"
              @click="recipe.show_instructions = !recipe.show_instructions"
            >+ {{ $t('more_informations')}}</button>
          </p>
          <template v-if="recipe.show_instructions">
            <hr />
            <p>
              <span v-html="$t(recipe.instructions)" />
            </p>
          </template>
          <button
            class="barButton barButton_createPubli"
            type="button"
            @click="openCreatePublicationModal(recipe.key)"
            :disabled="read_only"
          >
            <span>{{ $t('create') }}</span>
          </button>
        </div>

        <div
          class="m_recipes--recipe--mealList"
          v-if="recipe_of_this_template(recipe.key).length > 0"
        >
          <table>
            <thead>
              <tr>
                <th colspan="2">
                  <label>{{ $t('previous_creations') }}</label>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="m_recipes--recipe--mealList--meal"
                v-for="publication in recipe_of_this_template(recipe.key)"
                :key="publication.slugFolderName"
                @click="openPublication(publication.slugFolderName)"
              >
                <td>{{ publication.name }}</td>
                <td width="150px">
                  <small>{{ $root.formatDateToHuman(publication.date_created) }}</small>
                </td>
              </tr>

              <tr
                v-if="!recipe.show_all_recipes && all_recipes_of_this_template(recipe.key).length > 3"
                @click="recipe.show_all_recipes = true"
                class="m_recipes--recipe--mealList--meal"
              >
                <td colspan="2">
                  <button type="button" class="buttonLink margin-none">{{ $t('show_all') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
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
    </div>-->
  </div>
</template>
<script>
import CreatePublication from "./components/modals/CreatePublication.vue";

export default {
  props: ["publications", "read_only"],
  components: {
    CreatePublication
  },
  data() {
    return {
      showCreatePublicationModal: false,
      createPubliTemplateKey: false,

      recipes: [
        {
          key: "page_by_page",
          summary: "page_by_page_summary",
          show_instructions: false,
          instructions: "page_by_page_instructions",
          show_all_recipes: false,
          icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
  <title>recipe_icon_page</title>
  <g id="Calque_6" data-name="Calque 6">
    <g>
      <rect x="35.68" y="8.83" width="129.64" height="183.35" style="fill: #fff"/>
      <rect x="46.15" y="31.82" width="39.07" height="27.55" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.0944702326735385px"/>
      <rect x="118.95" y="68.62" width="35.9" height="53.44" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.9170289512680598px"/>
      <rect x="46.15" y="68.62" width="63.37" height="53.44" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.161211202864444px"/>
      <rect x="73.36" y="136.54" width="54.27" height="4.99" style="fill: #353535"/>
      <rect x="73.36" y="153.02" width="54.27" height="4.99" style="fill: #353535"/>
      <rect x="73.36" y="144.78" width="54.27" height="4.99" style="fill: #353535"/>
      <rect x="73.36" y="161.26" width="54.27" height="4.99" style="fill: #353535"/>
      <line x1="46.15" y1="22.57" x2="154.85" y2="22.57" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.8953584524134504px"/>
    </g>
  </g>
</svg>
          `
        },
        {
          key: "video_assemblage",
          summary: "video_assemblage_summary",
          show_instructions: false,
          instructions: "video_assemblage_instructions",
          show_all_recipes: false,
          icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
  <title>recipe_icon_montage</title>
  <g id="Calque_6" data-name="Calque 6">
    <g>
      <g>
        <rect x="68.73" y="12.93" width="63.54" height="72" style="fill: #fff"/>
        <rect x="73.23" y="17.52" width="53.94" height="43.04" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.161211202864444px"/>
        <rect x="72.36" y="66.15" width="31.66" height="4.99" style="fill: #353535"/>
        <rect x="72.36" y="73.43" width="23.67" height="4.99" style="fill: #353535"/>
        <path d="M94.24,47.59c-.7.45-1.28.14-1.28-.69V31.19c0-.83.58-1.14,1.28-.69l11.92,7.72a.91.91,0,0,1,0,1.65Z" style="fill: #353535"/>
      </g>
      <g>
        <rect x="68.73" y="114.16" width="63.54" height="72" style="fill: #fff"/>
        <rect x="73.23" y="118.76" width="53.94" height="43.04" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.161211202864444px"/>
        <rect x="72.36" y="167.38" width="31.66" height="4.99" style="fill: #353535"/>
        <rect x="72.36" y="174.66" width="23.67" height="4.99" style="fill: #353535"/>
        <path d="M94.24,148.82c-.7.46-1.28.14-1.28-.69v-15.7c0-.84.58-1.15,1.28-.7l11.92,7.72a.91.91,0,0,1,0,1.65Z" style="fill: #353535"/>
      </g>
      <path d="M101.87,98.27h4.24v2.54h-4.24v4.33H99.11v-4.33H94.89V98.27h4.22V94h2.76Z" style="fill: #fff"/>
    </g>
  </g>
</svg>
          `
        },
        {
          key: "stopmotion_animation",
          summary: "stopmotion_animation_summary",
          show_instructions: false,
          instructions: "stopmotion_animation_instructions",
          show_all_recipes: false,
          icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
  <title>recipe_icon_stopmotion</title>
  <g id="Calque_6" data-name="Calque 6">
    <g>
      <g>
        <g>
          <g>
            <rect x="25.5" y="9.92" width="50" height="46.04" style="fill: #fff"/>
            <rect x="29.04" y="13.24" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
          </g>
          <text transform="translate(46.15 33.42)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">1</text>
        </g>
        <g>
          <g>
            <rect x="75.5" y="9.92" width="50" height="46.04" style="fill: #fff"/>
            <rect x="79.04" y="13.24" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
          </g>
          <text transform="translate(96.15 33.42)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">2</text>
        </g>
        <g>
          <g>
            <rect x="125.5" y="9.92" width="50" height="46.04" style="fill: #fff"/>
            <rect x="129.04" y="13.24" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
          </g>
          <text transform="translate(146.15 33.42)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">3</text>
        </g>
      </g>
      <g>
        <g>
          <g>
            <rect x="25.5" y="77.48" width="50" height="46.04" style="fill: #fff"/>
            <rect x="29.04" y="80.81" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
          </g>
          <text transform="translate(46.15 100.99)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">5</text>
        </g>
        <g>
          <g>
            <rect x="75.5" y="77.48" width="50" height="46.04" style="fill: #fff"/>
            <rect x="79.04" y="80.81" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
          </g>
          <text transform="translate(96.15 100.99)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">6</text>
        </g>
        <g>
          <g>
            <rect x="125.5" y="77.48" width="50" height="46.04" style="fill: #fff"/>
            <rect x="129.04" y="80.81" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
          </g>
          <text transform="translate(146.15 100.99)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">7</text>
        </g>
      </g>
      <g>
        <g>
          <g>
            <rect x="25.5" y="145.05" width="50" height="46.04" style="fill: #fff"/>
            <rect x="29.04" y="148.38" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
          </g>
          <text transform="translate(46.15 168.55)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">9</text>
        </g>
        <g>
          <g>
            <rect x="75.5" y="145.05" width="50" height="46.04" style="fill: #fff"/>
            <rect x="79.04" y="148.38" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
          </g>
          <text transform="translate(91.81 168.55)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">10</text>
        </g>
      </g>
    </g>
  </g>
</svg>
          `
        },
        {
          key: "mix_audio_and_video",
          summary: "mix_audio_and_video_summary",
          show_instructions: false,
          instructions: "mix_audio_and_video_instructions",
          show_all_recipes: false,
          icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
  <title>recipe_icon_video_sound</title>
  <g id="Calque_6" data-name="Calque 6">
    <g>
      <g>
        <rect x="68.88" y="30.28" width="63.54" height="72" style="fill: #fff"/>
        <rect x="73.38" y="34.87" width="53.94" height="43.04" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.161211202864444px"/>
        <rect x="72.52" y="83.5" width="31.66" height="4.99" style="fill: #353535"/>
        <rect x="72.52" y="90.78" width="23.67" height="4.99" style="fill: #353535"/>
        <path d="M94.39,64.94c-.7.45-1.28.14-1.28-.69V48.54c0-.83.58-1.14,1.28-.69l11.92,7.72a.91.91,0,0,1,0,1.65Z" style="fill: #353535"/>
      </g>
      <g>
        <rect x="68.58" y="134.72" width="63.54" height="36" style="fill: #fff"/>
        <rect x="72.21" y="153.34" width="31.66" height="4.99" style="fill: #353535"/>
        <rect x="72.21" y="160.62" width="23.67" height="4.99" style="fill: #353535"/>
        <g>
          <line x1="73.38" y1="143.52" x2="127.32" y2="143.52" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.161211202864444px"/>
          <g>
            <path d="M94.69,151c-.28.18-.51.06-.51-.28V137c0-.34.23-.46.51-.28l10.56,6.84a.36.36,0,0,1,0,.66Z" style="fill: #353535"/>
            <path d="M94.69,151c-.28.18-.51.06-.51-.28V137c0-.34.23-.46.51-.28l10.56,6.84a.36.36,0,0,1,0,.66Z" style="fill: none;stroke: #fff;stroke-miterlimit: 10;stroke-width: 2px"/>
          </g>
          <circle cx="74.38" cy="143.52" r="2.58" style="fill: #353535"/>
          <circle cx="126.32" cy="143.52" r="2.58" style="fill: #353535"/>
        </g>
      </g>
      <path d="M102,117.63h4.24v2.54H102v4.32H99.27v-4.32H95v-2.54h4.23V113.3H102Z" style="fill: #fff"/>
    </g>
  </g>
</svg>
          `
        },
        {
          key: "mix_audio_and_image",
          summary: "mix_audio_and_image_summary",
          show_instructions: false,
          instructions: "mix_audio_and_image_instructions",
          show_all_recipes: false,
          icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
  <title>recipe_icon_image_sound</title>
  <g id="Calque_6" data-name="Calque 6">
    <g>
      <g>
        <rect x="68.88" y="30.28" width="63.54" height="62" style="fill: #fff"/>
        <rect x="73.38" y="34.87" width="53.94" height="43.04" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.16121120286444px"/>
      </g>
      <g>
        <rect x="68.58" y="124.72" width="63.54" height="36" style="fill: #fff"/>
        <rect x="72.21" y="143.34" width="31.66" height="4.99" style="fill: #353535"/>
        <rect x="72.21" y="150.62" width="23.67" height="4.99" style="fill: #353535"/>
        <g>
          <line x1="73.38" y1="133.52" x2="127.32" y2="133.52" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.16121120286444px"/>
          <g>
            <path d="M94.69,141c-.28.18-.51.06-.51-.28V127c0-.34.23-.46.51-.28l10.56,6.84a.36.36,0,0,1,0,.66Z" style="fill: #353535"/>
            <path d="M94.69,141c-.28.18-.51.06-.51-.28V127c0-.34.23-.46.51-.28l10.56,6.84a.36.36,0,0,1,0,.66Z" style="fill: none;stroke: #fff;stroke-miterlimit: 10;stroke-width: 2px"/>
          </g>
          <circle cx="74.38" cy="133.52" r="2.58" style="fill: #353535"/>
          <circle cx="126.32" cy="133.52" r="2.58" style="fill: #353535"/>
        </g>
      </g>
      <path d="M102,107.63h4.24v2.54H102v4.32H99.27v-4.32H95v-2.54h4.23V103.3H102Z" style="fill: #fff"/>
    </g>
  </g>
</svg>          
          `
        },
        {
          key: "carreau",
          summary: "carreau_summary",
          show_instructions: false,
          instructions: "carreau_instructions",
          show_all_recipes: false,
          icon: `

          `
        }
      ]
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},

  watch: {},
  computed: {
    createPubliDefaultName() {
      const number_of_recipes =
        this.all_recipes_of_this_template(this.createPubliTemplateKey).length +
        1;
      return this.$t(this.createPubliTemplateKey) + " Nº" + number_of_recipes;
    }
  },
  methods: {
    openPublication(slugPubliName) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • Publications: openPublication / slugPubliName = ${slugPubliName}`
        );
      }
      this.$root.openPublication(slugPubliName);
    },
    all_recipes_of_this_template(template_key) {
      const filtered_recipes = Object.values(this.publications).filter(
        r => r.template === template_key
      );
      let sorted_recipes = this.$_.sortBy(filtered_recipes, "date_created");
      sorted_recipes = sorted_recipes.reverse();
      return sorted_recipes;
    },
    recipe_of_this_template(template_key) {
      if (!this.recipes.find(r => r.key === template_key).show_all_recipes) {
        return this.all_recipes_of_this_template(template_key).slice(0, 3);
      }
      return this.all_recipes_of_this_template(template_key);
    },
    openCreatePublicationModal(recipe_key) {
      this.showCreatePublicationModal = true;
      this.createPubliTemplateKey = recipe_key;
    },
    createAndOpenPublication(template) {
      const name = this.$t("untitled");
      const slugFolderName = template;

      let publication_data = {
        name,
        slugFolderName,
        template,
        authors: this.$root.settings.current_author.hasOwnProperty("name")
          ? [{ name: this.$root.settings.current_author.name }]
          : []
      };

      if (template === "page_by_page") {
        publication_data.pages = [
          {
            id:
              +new Date() +
              "_" +
              (Math.random().toString(36) + "00000000000000000").slice(2, 3)
          }
        ];
        publication_data.width = 210;
        publication_data.height = 297;
      }

      this.$eventHub.$on("socketio.folder_created_or_updated", fdata => {
        if (fdata.id === this.$root.justCreatedFolderID) {
          this.$eventHub.$off("socketio.folder_created_or_updated");
          this.openPublication(fdata.slugFolderName);
        }
      });

      this.$root.createFolder({
        type: "publications",
        data: publication_data
      });
    }
  }
};
</script>
<style>
</style>