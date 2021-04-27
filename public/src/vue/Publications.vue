<template>
  <div class="m_publicationsview">
    <!-- <div class="m_actionbar"> -->
    <CreatePublication
      v-if="showCreatePublicationModal"
      :default_name="create_publi_default_name"
      :default_template="createPubliTemplateKey"
      @close="showCreatePublicationModal = false"
      :read_only="read_only"
    />
    <!-- <div class="_topMenu"> -->
    <div class="_publiLabel">
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
      <!-- <div class="m_actionbar--text"> -->
      <label class="">
        {{ $t("cooking_pot") }}&nbsp;: {{ $t("cooking_pot_instructions") }}
      </label>
      <!-- </div> -->
      <!-- </div> -->
    </div>

    <div class="m_sideBySideSwitches">
      <label for="publi_mode_templates">
        <input
          type="radio"
          id="publi_mode_templates"
          value="templates"
          v-model="current_mode"
        />
        {{ $t("create_new_recipe") }}
      </label>
      <label for="publi_mode_list">
        <input
          type="radio"
          id="publi_mode_list"
          value="list"
          v-model="current_mode"
        />
        {{ $t("show_recipes") }}
      </label>
    </div>
    <!-- </div> -->

    <!-- liste des recettes -->
    <div class="m_recipes" v-if="current_mode === 'templates'">
      <!-- pour chaque recette -->
      <div
        class="m_recipes--type"
        v-for="recipe_type in recipe_types"
        :key="recipe_type.key"
      >
        <div class="c-blanc font-folder_title padding-vert-small">
          {{ $t(recipe_type.label) }}
        </div>
        <div class="m_recipes--type--grid">
          <div
            v-for="recipe in recipe_type.recipes"
            :key="recipe.key"
            class="m_recipe"
          >
            <div class="m_recipe--icon" v-html="recipe.icon"></div>

            <div class="m_recipe--text">
              <h2 class>{{ $t(recipe.key) }}</h2>
              <button
                v-if="recipe.instructions"
                type="button"
                class="buttonLink c-noir margin-none"
                :class="{
                  'is--active': recipe.show_instructions,
                }"
                @click="recipe.show_instructions = !recipe.show_instructions"
              >
                {{ $t("more_informations") }}
              </button>

              <p class="margin-vert-small" v-if="false">
                <span
                  v-html="$t(recipe.summary)"
                  class="margin-vert-verysmall"
                />
                <br />
              </p>
              <template v-if="recipe.show_instructions">
                <hr />
                <p>
                  <span v-html="$t(recipe.instructions)" />
                </p>
              </template>
            </div>
            <div class="m_recipe--buttons">
              <button
                class="barButton barButton_createPubli"
                type="button"
                @click="openCreatePublicationModal(recipe.key)"
                :disabled="read_only"
              >
                <span>{{ $t("create") }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="current_mode === 'list'">
      <div class="m_actionbar">
        <div>
          <div class="m_actionbar--text">
            <template v-if="publications.length > 0">
              <div>
                {{ $t("showing") }}
                <span
                  :class="{
                    'c-rouge bg-blanc':
                      sorted_publications.length !== publications.length,
                  }"
                >
                  <template
                    v-if="sorted_publications.length === publications.length"
                  >
                    {{ sorted_publications.length }}
                    {{ $t("recipes") }}
                  </template>
                  <template v-else>
                    &nbsp;
                    {{ sorted_publications.length }}
                    {{ $t("recipes_of") }}
                    {{ Object.keys(publications).length }}
                  </template>
                </span>
                <template
                  v-if="
                    $root.allKeywords.length > 0 || $root.all_authors.length > 0
                  "
                >
                  —
                  <button
                    type="button"
                    class="button-nostyle text-uc button-triangle"
                    :class="{ 'is--active': show_filters }"
                    @click="show_filters = !show_filters"
                  >
                    {{ $t("filters") }}
                  </button>
                  <button
                    type="button"
                    class="button-nostyle text-uc padding-sides-verysmall bg-transparent"
                    v-if="has_filters_enabled"
                    @click="removeAllFilters"
                  >
                    {{ $t("remove_filters") }}
                  </button>
                </template>
                <TagsAndAuthorFilters
                  v-if="show_filters"
                  :allKeywords="publis_keywords"
                  :allAuthors="publis_authors"
                  :allProjects="projects_with_recipes_linked"
                  :keywordFilter="$root.settings.publication_filter.keyword"
                  :authorFilter="$root.settings.publication_filter.author"
                  :projectFilter="$root.settings.publication_filter.project"
                  @setKeywordFilter="
                    toggleFilter({ type: 'keyword', value: $event })
                  "
                  @setAuthorFilter="
                    toggleFilter({ type: 'author', value: $event })
                  "
                  @setProjectFilter="
                    toggleFilter({ type: 'project', value: $event })
                  "
                />
              </div>
              <div class="m_searchProject">
                <button
                  type="button"
                  class="button-nostyle text-uc button-triangle"
                  :class="{
                    'is--active ':
                      show_search ||
                      $root.settings.publication_filter.name.length > 0,
                  }"
                  @click="
                    show_search = !show_search;
                    debounce_search_publication_name = '';
                  "
                >
                  <svg
                    class="inline-svg"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    width="96.2px"
                    height="96.2px"
                    viewBox="0 0 96.2 96.2"
                    style="margin-bottom: -2px"
                    xml:space="preserve"
                  >
                    <path
                      fill="currentColor"
                      class="st0"
                      d="M10.3,59.9c11.7,11.7,29.5,13.4,43,5.2l9.7,9.7l21.3,21.3l11.9-11.9L74.9,63l-9.7-9.7c8.2-13.5,6.4-31.3-5.2-43 C46.2-3.4,24-3.4,10.3,10.3C-3.4,24-3.4,46.2,10.3,59.9z M50.8,19.5c8.6,8.6,8.6,22.6,0,31.3c-8.6,8.6-22.6,8.6-31.3,0 c-8.6-8.6-8.6-22.6,0-31.3C28.1,10.8,42.1,10.8,50.8,19.5z"
                    />
                  </svg>
                  {{ $t("search") }}
                </button>

                <div
                  v-if="
                    show_search || debounce_search_publication_name.length > 0
                  "
                  class="rounded small-width"
                >
                  <div>{{ $t("recipe_name_to_find") }}</div>

                  <div class="input-group">
                    <input
                      type="text"
                      class
                      v-model="debounce_search_publication_name"
                    />
                    <span
                      class="input-addon"
                      v-if="debounce_search_publication_name.length > 0"
                    >
                      <button
                        type="button"
                        :disabled="
                          debounce_search_publication_name.length === 0
                        "
                        @click="debounce_search_publication_name = ''"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div
          class="flex-wrap flex-horizontally-centered flex-vertically-centered"
        >
          <div class="m_displayMyContent" v-if="$root.current_author">
            <span class="font-small">{{ $t("show") }}</span>
            <select v-model="show_only_my_content" class="select-s">
              <option :value="true">
                {{ $t("only_my_recipes").toLowerCase() }}
              </option>
              <option :value="false">
                {{ $t("all_recipes").toLowerCase() }}
              </option>
            </select>
          </div>

          <!-- <div class="m_publiFilter">
            <label>{{ $t("show_recipes_for_project_first") }}</label>
            <select v-model="slugProjectName_to_filter">
              <option key="'all'" value>
                ** {{ $t("all_projects").toLowerCase() }} **
              </option>
              <option
                v-for="project in $root.projects_that_are_accessible"
                :key="project.slugFolderName"
                :value="project.slugFolderName"
                :disabled="
                  recipesForThisProject(project.slugFolderName).length === 0
                "
              >
                {{ project.name }} ({{
                  recipesForThisProject(project.slugFolderName).length
                }})
              </option>
            </select>
          </div> -->
        </div>
      </div>

      <div class="_filterRecipeByTemplate">
        <template v-for="{ key, label, recipes } in recipe_types">
          <!-- {{ $t(label) }} -->
          <button
            type="button"
            v-for="{ key, icon, label } in recipes"
            :key="key"
            class="bg-bleuvert _filterRecipeByTemplate--recipe"
            :content="$t(key)"
            v-tippy="{
              placement: 'bottom',
              delay: [600, 0],
            }"
            :class="{
              'is--active': $root.settings.publication_filter.template === key,
            }"
            @click="toggleFilter({ type: 'template', value: key })"
          >
            <div class="_filterRecipeByTemplate--recipe--icon" v-html="icon" />
            <label
              class="padding-verysmall margin-none c-blanc"
              v-if="$root.settings.publication_filter.template === key"
              >{{ $t(key) }}</label
            >
            <!-- <small class="_filterRecipeByTemplate--recipe--text">{{
              recipesWithTemplate(key).length
            }}</small> -->
          </button>
        </template>
      </div>

      <div
        class="switch switch-xs margin-sides-medium"
        v-if="$root.do_navigation.current_slugProjectName"
      >
        <input
          class="switch"
          id="showOnlyProject"
          type="checkbox"
          v-model="$root.settings.publication_filter.project"
          :true-value="$root.do_navigation.current_slugProjectName"
          false-value=""
        />
        <label for="showOnlyProject" class="c-blanc"
          >{{ $t("show_only_recipes_for_project") }}
          {{ $root.current_project.name }}</label
        >
      </div>

      <div class="m_mealList">
        <table v-if="sorted_publications.length > 0">
          <thead>
            <tr>
              <th colspan="1">
                <label>{{ $t("name") }}</label>
              </th>
              <th colspan="1">
                <label>{{ $t("type") }}</label>
              </th>
              <!-- <th colspan="1">
                <label>{{ $t("model") }}</label>
              </th> -->
              <th colspan="1">
                <label>{{ $t("authors") }}</label>
              </th>
              <!-- <th colspan="1">
              <label>{{ $t("number_of_medias") }}</label>
            </th>
            <th colspan="1">
              <label>{{ $t("attached_to_project") }}</label>
            </th> -->
              <th colspan="1">
                <label>{{ $t("action") }}</label>
              </th>
            </tr>
          </thead>
          <!-- <tbody> -->
          <template v-for="publication in organized_recipes">
            <PublicationRow
              :key="publication.slugFolderName"
              class="m_mealList--publis"
              :class="{
                'was--justOpened':
                  last_publication_opened === publication.slugFolderName,
              }"
              :publication="publication"
              :recipe_types="recipe_types"
              @toggleReplies="toggleReplies($event, publication.slugFolderName)"
            />
            <template v-if="show_replies_for === publication.slugFolderName">
              <tr
                :key="'replies_label_' + publication.slugFolderName"
                class="bg-gris_tresclair"
              >
                <td colspan="6">
                  <div
                    class="flex-wrap flex-space-between flex-vertically-centered"
                  >
                    <button
                      type="button"
                      class=""
                      style="
                        flex-grow: 0;
                        margin-right: calc(var(--spacing) / 2);
                      "
                      @click="show_replies_for = false"
                    >
                      {{ $t("retour") }}
                    </button>
                    <small v-html="$t('replies_to') + ' ' + publication.name" />
                  </div>
                </td>
              </tr>
              <PublicationRow
                v-for="reply in publication._replies"
                :key="
                  'replies_' + publication.slugFolderName + reply.slugFolderName
                "
                class="m_mealList--reply"
                :publication="reply"
                :recipe_types="recipe_types"
              />
            </template>
          </template>
        </table>
        <div
          class="_removeFilters"
          v-if="
            publications.length > 0 &&
            sorted_publications.length !== publications.length
          "
        >
          <button
            type="button"
            class="buttonLink c-blanc"
            @click="removeAllFilters"
          >
            {{ $t("remove_filters_and_show_all") }}
          </button>
        </div>
      </div>

      <!-- <div class="m_publicationItems">
      <div
        v-if="typeof publications === 'object'"
        class="m_publicationItems--item"
        v-for="publication in publications"
        :key="publication.slugFolderName"
      >
        <h2
          class="m_publicationItems--item--title"
          @click="openPublication(publication.slugFolderName)"
        >
          {{ publication.name }}
        </h2>
        <div>
          <div class="m_metaField">
            <div>
              {{ $t("template") }}
            </div>
            <div>
              {{ $t(publication.template) }}
            </div>
          </div>
          <div class="m_metaField">
            <div>
              {{ $t("number_of_pages") }}
            </div>
            <div>
              <template v-if="!!publication.pages">
                {{ Object.keys(publication.pages).length }}
              </template>
              <template v-else> 0 </template>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="button-redthin"
          @click="openPublication(publication.slugFolderName)"
        >
          <span class="">
            {{ $t("open") }}
          </span>
        </button>
      </div>
    </div> -->
    </div>
  </div>
</template>
<script>
import CreatePublication from "./components/modals/CreatePublication.vue";
import PublicationRow from "./components/PublicationRow.vue";
import TagsAndAuthorFilters from "./components/subcomponents/TagsAndAuthorFilters.vue";
import debounce from "debounce";

export default {
  props: {
    publications: {
      type: Array,
      default: () => [],
    },
    read_only: Boolean,
  },
  components: {
    CreatePublication,
    PublicationRow,
    TagsAndAuthorFilters,
  },
  data() {
    return {
      showCreatePublicationModal: false,
      createPubliTemplateKey: false,

      show_replies_for: false,

      slugProjectName_to_filter: !!this.$root.do_navigation
        .current_slugProjectName
        ? this.$root.do_navigation.current_slugProjectName
        : "",

      show_only_my_content: false,
      show_search: false,
      show_filters: false,
      current_mode: "templates",

      currentSort: {
        field: "date_created",
        type: "date",
        order: "descending",
      },

      last_publication_opened: false,

      debounce_search_publication_name: this.$root.settings.publication_filter
        .name,
      debounce_search_publication_name_function: undefined,

      recipe_types: [
        {
          key: "document",
          label: "make_a_document",
          recipes: [
            {
              key: "page_by_page",
              summary: "page_by_page_summary",
              show_instructions: false,
              instructions: "page_by_page_instructions",
              icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
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
          `,
            },
            {
              key: "story",
              summary: "story_summary",
              show_instructions: false,
              instructions: "story_instructions",

              icon: `
<!-- Generator: Adobe Illustrator 25.2.1, SVG Export Plug-In  -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="201px"
	 height="201px" viewBox="0 0 201 201" style="overflow:visible;enable-background:new 0 0 201 201;" xml:space="preserve">
	<g id="Calque_6_2_">
		<g>
			<rect x="35.7" y="8.8" class="st1" width="129.6" height="183.4" style="fill: #fff;" />
		</g>
	</g>
	<rect x="64.9" y="46.8" width="71.2" height="53.6" style="fill:none;stroke:#353535;stroke-width:1.917;stroke-miterlimit:10;" />
	<rect x="64.9" y="145.2" width="71.2" height="39.8" style="fill:none;stroke:#353535;stroke-width:1.917;stroke-miterlimit:10;" />
	<rect x="65" y="108" width="71.1" height="5" style="fill:#353535;" />
	<rect x="65" y="124.5" class="st3" width="71.1" height="5"  style="fill:#353535;"/>
	<rect x="65" y="116.2" class="st3" width="71.1" height="5" style="fill:#353535;"/>
	<rect x="65" y="132.7" class="st3" width="71.1" height="5" style="fill:#353535;"/>
	<rect x="64.9" y="25.9" class="st3" width="71.1" height="5" style="fill:#353535;"/>
	<rect x="64.9" y="17.6" class="st3" width="71.1" height="5" style="fill:#353535;"/>
	<rect x="64.9" y="34.1" class="st3" width="71.1" height="5" style="fill:#353535;"/>

</svg>
          `,
            },
            //             {
            //               key: "drawing_pad",
            //               summary: "drawing_pad_summary",
            //               show_instructions: false,
            //               instructions: "drawing_pad_instructions",

            //               icon: `
            // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
            //   <title>Fichier 1</title>
            //   <g id="Calque_2" data-name="Calque 2">
            //     <g id="Calque_6" data-name="Calque 6">
            //       <rect x="13.92" y="35.39" width="173.15" height="129.86" style="fill: #fff"/>
            //       <rect x="26.17" y="45.02" width="37.98" height="48.24" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.16121px"/>
            //       <rect x="127.82" y="81.05" width="37.98" height="48.24" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.16121px"/>
            //       <circle cx="36.99" cy="81.05" r="5.95" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.16121px"/>
            //       <g>
            //         <path d="M69.78,69.42c41.68,0,5.66,33.94,50.44,35.13" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.16121px"/>
            //         <polygon points="115.83 108.09 119.58 104.51 116 100.76 119.11 100.83 122.69 104.58 118.94 108.16 115.83 108.09" style="fill: #353535"/>
            //       </g>
            //       <polygon points="77.64 108.18 107.23 137.81 48.02 137.81 77.64 108.18" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.16121px"/>
            //       <rect width="201" height="201" style="fill: none"/>
            //     </g>
            //   </g>
            // </svg>

            //           `,
            //             },
          ],
        },
        {
          key: "video",
          label: "make_a_video",
          recipes: [
            {
              key: "video_assemblage",
              summary: "video_assemblage_summary",
              show_instructions: false,
              instructions: "video_assemblage_instructions",

              icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
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
          `,
            },
            {
              key: "video_effects",
              summary: "video_effects_summary",
              show_instructions: false,
              instructions: "video_effects_instructions",

              icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
  <g id="Calque_6" data-name="Calque 6">
    <rect y="0.53" width="201" height="201" style="fill: none"/>
    <g>
      <g>
        <rect x="107.44" y="30.53" width="63.54" height="72" style="fill: #fff"/>
        <rect x="111.93" y="35.12" width="53.94" height="43.04" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.16121px"/>
        <rect x="111.07" y="83.75" width="31.66" height="4.99" style="fill: #353535"/>
        <rect x="111.07" y="91.03" width="23.67" height="4.99" style="fill: #353535"/>
        <path d="M132.94,65.19c-.7.45-1.27.14-1.27-.69V48.79c0-.83.57-1.14,1.27-.69l11.92,7.72a.91.91,0,0,1,0,1.65Z" style="fill: #353535"/>
      </g>
      <g>
        <path d="M79.06,120.65,66.93,132.77,27.07,172.64l5.46,5.46,52-52Z"/>
        <path d="M79.15,116.75a1.29,1.29,0,0,0,1.29-1.28v-9a1.29,1.29,0,0,0-2.58,0v9A1.29,1.29,0,0,0,79.15,116.75Z"/>
        <path d="M79.15,134.8a1.29,1.29,0,0,0-1.29,1.29v9a1.29,1.29,0,1,0,2.58,0v-9A1.29,1.29,0,0,0,79.15,134.8Z"/>
        <path d="M98.48,124.49h-9a1.29,1.29,0,0,0,0,2.58h9a1.29,1.29,0,0,0,0-2.58Z"/>
        <path d="M59.81,127.07h9a1.29,1.29,0,0,0,0-2.58h-9a1.29,1.29,0,0,0,0,2.58Z"/>
        <path d="M86.88,119.33a1.35,1.35,0,0,0,.92-.37l6.38-6.38a1.29,1.29,0,1,0-1.82-1.82L86,117.14a1.28,1.28,0,0,0,.9,2.19Z"/>
        <path d="M87.8,132.59A1.29,1.29,0,0,0,86,134.41l6.38,6.38a1.26,1.26,0,0,0,.91.38,1.31,1.31,0,0,0,.92-.38,1.29,1.29,0,0,0,0-1.82Z"/>
        <path d="M70.51,119a1.26,1.26,0,0,0,.92.37,1.34,1.34,0,0,0,.91-.37,1.27,1.27,0,0,0,0-1.82L66,110.76a1.28,1.28,0,0,0-1.81,1.82Z"/>
      </g>
    </g>
    <rect x="23.93" y="153.7" width="52.51" height="2.57" transform="translate(-94.89 80.88) rotate(-45)" style="fill: #fff"/>
    <rect x="68.62" y="128.62" width="13.29" height="2.57" transform="translate(-69.81 91.27) rotate(-45)" style="fill: #fff"/>
    <rect width="201" height="201" style="fill: none"/>
  </g>
</svg>
          `,
            },
            {
              key: "stopmotion_animation",
              summary: "stopmotion_animation_summary",
              show_instructions: false,
              instructions: "stopmotion_animation_instructions",

              icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
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
          `,
            },
            {
              key: "mix_audio_and_video",
              summary: "mix_audio_and_video_summary",
              show_instructions: false,
              instructions: "mix_audio_and_video_instructions",

              icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
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
          `,
            },
            {
              key: "mix_audio_and_image",
              summary: "mix_audio_and_image_summary",
              show_instructions: false,
              instructions: "mix_audio_and_image_instructions",

              icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
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
          `,
            },
            // {
            //   key: "carreau",
            //   summary: "carreau_summary",
            //   show_instructions: false,
            //   instructions: "carreau_instructions",
            //   show_all_recipes: false,
            //   icon: `

            //   `
            // }
          ],
        },
      ],
    };
  },

  created() {},
  mounted() {
    if (
      this.$root.settings.publication_filter.keyword !== "" ||
      this.$root.settings.publication_filter.author !== "" ||
      this.$root.settings.publication_filter.name !== "" ||
      this.$root.settings.publication_filter.project !== ""
    ) {
      this.current_mode = "list";
    }
  },
  beforeDestroy() {},

  watch: {
    "$root.do_navigation.current_slugProjectName": function () {
      // if (!!this.$root.do_navigation.current_slugProjectName)
      // this.show_filters = true;
      this.toggleFilter({
        type: "project",
        value: !!this.$root.do_navigation.current_slugProjectName
          ? this.$root.do_navigation.current_slugProjectName
          : "",
      });
    },
    "$root.settings.current_publication.slug": function () {
      if (this.$root.settings.current_publication.slug)
        this.last_publication_opened = this.$root.settings.current_publication.slug;
    },
    show_filters: function () {
      if (!this.show_filters) {
        // this.removeAllFilters();
        // this.$root.settings.publication_filter.keyword = "";
        // this.$root.settings.publication_filter.author = "";
        // this.$root.settings.publication_filter.name = "";
        // this.$root.settings.publication_filter.project = "";
        // this.debounce_search_publication_name = "";
      }
    },
    debounce_search_publication_name: function () {
      if (this.debounce_search_publication_name_function)
        clearTimeout(this.debounce_search_publication_name_function);
      this.debounce_search_publication_name_function = setTimeout(() => {
        this.$root.settings.publication_filter.name = this.debounce_search_publication_name;
      }, 340);
    },
  },
  computed: {
    publis_keywords: function () {
      return this.$root.getAllKeywordsFrom(this.publications);
    },
    publis_authors: function () {
      return this.$root.getAllAuthorsFrom(this.publications);
    },
    has_filters_enabled() {
      return (
        this.$root.settings.publication_filter.keyword !== "" ||
        this.$root.settings.publication_filter.author !== "" ||
        this.$root.settings.publication_filter.name !== "" ||
        this.$root.settings.publication_filter.project !== "" ||
        this.$root.settings.publication_filter.template !== "" ||
        this.debounce_search_publication_name !== "" ||
        this.show_only_my_content !== false
      );
    },
    create_publi_default_name() {
      let number_of_recipes =
        this.allRecipesOfThisTemplate(this.createPubliTemplateKey).length + 1;

      let name =
        this.$t(this.createPubliTemplateKey) + " Nº" + number_of_recipes;

      while (
        this.allRecipesOfThisTemplate(this.createPubliTemplateKey).some(
          (r) => r.name === name
        )
      ) {
        number_of_recipes++;
        name = this.$t(this.createPubliTemplateKey) + " Nº" + number_of_recipes;
      }

      return name;
    },
    sorted_publications() {
      let sortable = [];

      if (!this.publications || this.publications.length === 0) return [];

      for (const publication of this.publications) {
        let orderBy;

        if (this.currentSort.type === "date") {
          orderBy = +this.$moment(
            publication[this.currentSort.field],
            "YYYY-MM-DD HH:mm:ss"
          );
        } else if (this.currentSort.type === "alph") {
          orderBy = publication[this.currentSort.field];
        }

        if (this.$root.settings.publication_filter.name !== "") {
          if (
            !publication.name
              .toLowerCase()
              .includes(
                this.$root.settings.publication_filter.name.toLowerCase()
              )
          )
            continue;
        }

        if (this.$root.settings.publication_filter.template !== "") {
          if (
            !publication.template ||
            publication.template !==
              this.$root.settings.publication_filter.template
          )
            continue;
        }

        if (this.$root.settings.publication_filter.project !== "") {
          if (
            !publication.attached_to_project ||
            publication.attached_to_project !==
              this.$root.settings.publication_filter.project
          ) {
            continue;
          }
        }

        if (this.show_only_my_content && this.$root.current_author) {
          if (
            !publication.hasOwnProperty("authors") ||
            !Array.isArray(publication.authors) ||
            !publication.authors.some(
              (k) =>
                k.slugFolderName === this.$root.current_author.slugFolderName
            )
          ) {
            continue;
          }
        }
        if (
          !this.$root.settings.publication_filter.keyword &&
          !this.$root.settings.publication_filter.author
        ) {
          sortable.push({ publication, orderBy });
          continue;
        }

        if (
          !!this.$root.settings.publication_filter.keyword &&
          !!this.$root.settings.publication_filter.author
        ) {
          if (
            publication.hasOwnProperty("keywords") &&
            typeof publication.keywords === "object" &&
            publication.keywords.some(
              (k) => k.title === this.$root.settings.publication_filter.keyword
            )
          ) {
            if (
              publication.hasOwnProperty("authors") &&
              typeof publication.authors === "object" &&
              publication.authors.some(
                (k) =>
                  k.slugFolderName ===
                  this.$root.settings.publication_filter.author
              )
            ) {
              sortable.push({ publication, orderBy });
            }
          }
          continue;
        }
        // if a publication keyword filter is set
        if (!!this.$root.settings.publication_filter.keyword) {
          // only add to sorted array if publication has this keyword
          if (
            publication.hasOwnProperty("keywords") &&
            typeof publication.keywords === "object" &&
            publication.keywords.some(
              (k) => k.title === this.$root.settings.publication_filter.keyword
            )
          ) {
            sortable.push({ publication, orderBy });
          }
          continue;
        }

        if (!!this.$root.settings.publication_filter.author) {
          // only add to sorted array if publication has this keyword
          if (
            publication.hasOwnProperty("authors") &&
            typeof publication.authors === "object" &&
            publication.authors.some(
              (k) =>
                k.slugFolderName ===
                this.$root.settings.publication_filter.author
            )
          ) {
            sortable.push({ publication, orderBy });
          }
          continue;
        }
      }

      let _sorted_publications = sortable.sort(function (a, b) {
        let valA = a.orderBy;
        let valB = b.orderBy;
        if (typeof a.orderBy === "string" && typeof b.orderBy === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) {
          return -1;
        }
        if (valA > valB) {
          return 1;
        }
        return 0;
      });

      if (this.currentSort.order === "descending") {
        _sorted_publications.reverse();
      }
      _sorted_publications = _sorted_publications.map((sp) => sp.publication);
      return _sorted_publications;
    },
    organized_recipes() {
      const recipes = this.sorted_publications;

      let recipes_with_models = recipes
        // display replies in list
        // .filter((r) => !r.follows_model)
        .map((r) => {
          if (r.is_model) {
            const recipes_following_this_model = recipes.filter(
              (_r) => _r.follows_model && _r.follows_model === r.slugFolderName
            );
            if (recipes_following_this_model.length > 0) {
              r._replies = recipes_following_this_model;
            }
          }
          return r;
        });

      if (this.show_replies_for)
        recipes_with_models = recipes_with_models.filter(
          (r) => r.slugFolderName === this.show_replies_for
        );

      return recipes_with_models;
    },
    projects_with_recipes_linked() {
      return this.$root.all_projects.filter((p) => {
        const _linked_recipes = this.recipesForThisProject(p.slugFolderName);
        return _linked_recipes && _linked_recipes.length > 0;
      });
    },
  },
  methods: {
    recipesForThisProject(slugProjectName) {
      if (!this.publications || this.publications.length === 0) return [];

      return this.publications.filter(
        (r) => r.attached_to_project === slugProjectName
      );
    },
    removeAllFilters() {
      this.$root.settings.publication_filter.keyword = "";
      this.$root.settings.publication_filter.author = "";
      this.$root.settings.publication_filter.name = "";
      this.$root.settings.publication_filter.project = "";
      this.$root.settings.publication_filter.template = "";
      this.debounce_search_publication_name = "";
      this.show_only_my_content = false;
    },
    recipesWithTemplate(template_key) {
      // if (!this.publications || this.publications.length === 0) return [];
      return this.sorted_publications.filter(
        (r) => r.template === template_key
      );
    },
    toggleReplies($event, slugFolderName) {
      if ($event) this.show_replies_for = slugFolderName;
      else this.show_replies_for = false;
    },
    allRecipesOfThisTemplate(template_key) {
      const filtered_recipes = this.sorted_publications.filter(
        (r) => r.template === template_key
      );

      let sorted_recipes = this.$_.sortBy(filtered_recipes, "date_created");
      sorted_recipes = sorted_recipes.reverse();
      return sorted_recipes;
    },
    toggleFilter({ type, value }) {
      this.$root.settings.publication_filter[type] =
        this.$root.settings.publication_filter[type] === value ? "" : value;
    },

    openCreatePublicationModal(recipe_key) {
      this.showCreatePublicationModal = true;
      this.createPubliTemplateKey = recipe_key;
    },
  },
};
</script>
<style lang="scss" scoped>
._topMenu {
  position: relative;
  margin: calc(var(--spacing) / 2);
  margin-right: calc(var(--spacing) / 4);
  margin-bottom: 0;
}

.m_actionbar {
  border-bottom: none;
}
.m_displayMyContent {
  margin: calc(var(--spacing) / 4);
}

._publiLabel {
  // background-color: white;
  color: white;
  margin: calc(var(--spacing) / 2);
  margin-left: calc(var(--spacing) / 1);
  margin-right: calc(var(--spacing) / 1);
  // padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);

  label {
    display: block;
    margin: 0;
    color: inherit;
  }
}

.button-triangle {
  position: relative;

  &.is--active {
    // color: white;
    // color: var(--c-rouge_clair);
    // text-shadow: 0px 0px 2px var(--c-rouge_clair);
    // -webkit-text-stroke: 0.5px var(--c-rouge_clair);

    &::before {
      content: "";
      position: absolute;
      z-index: -1;
      left: calc(var(--spacing) / -6);
      right: calc(var(--spacing) / -8);
      // width: 100%;
      top: calc(var(--spacing) / 4);
      bottom: calc(var(--spacing) / 4);

      background: white;
    }
  }
}

.m_sideBySideSwitches {
  position: sticky;
  top: 0;
  z-index: 100;
  border: none;
  background-color: white;

  label {
    // color: white;
  }

  > * {
    padding-left: calc(var(--spacing) / 1);
    padding-right: calc(var(--spacing) / 1);
    // padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    // border-top: 2px solid var(--c-gris-clair);
    // border-bottom: 0;
  }
}

._removeFilters {
  border: 2px dashed var(--c-bleuvert);
  background-color: var(--c-bleuvert_fonce);
  text-align: center;
  // background-color: var(--c-bleuvert_fonce);

  table + & {
    border-top: none;
  }

  button {
  }
}

._filterRecipeByTemplate {
  display: flex;
  flex-flow: row wrap;
  margin-top: calc(var(--spacing) / 4);
  margin-left: calc(var(--spacing) / 1);
  margin-right: calc(var(--spacing) / 4);
  // margin-bottom: calc(var(--spacing) / -4);
}
._filterRecipeByTemplate--recipe {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  margin: 0;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 4px;
  margin-right: calc(var(--spacing) / 4);
  margin-bottom: calc(var(--spacing) / 4);

  &:hover {
    border: 2px solid var(--c-noir);
    background-color: var(--c-bleuvert);
  }

  &.is--active {
    background-color: var(--c-noir);
  }
}
._filterRecipeByTemplate--recipe--icon {
  // padding: calc(var(--spacing) / 4);
  // padding: 0 calc(var(--spacing) / 16);

  // svg {
  //   width: 2em;
  //   height: 2em;
  // }
}
._filterRecipeByTemplate--recipe--text {
  color: white;
  font-weight: bold;
  padding: 0 calc(var(--spacing) / 8);
}
</style>
<style lang="scss">
._filterRecipeByTemplate--recipe--icon svg {
  width: 2em;
  height: 2em;
}
</style>
