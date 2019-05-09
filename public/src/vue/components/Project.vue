<template>
  <div class="m_project"
    :class="{ 'is--not_authorized_to_admin' : !can_access_folder }"
  >
    <div class="m_project--presentation"
    >
      <div v-if="previewURL" class="m_project--presentation--vignette">
        <img
          :src="previewURL" class=""
          draggable="false"
        />
      </div>
      
      <div class="m_project--presentation--text">
        <h2 
          class="m_project--presentation--text--title"
          :title="slugProjectName"
        >
          {{ project.name }}
        </h2>

        <div class="m_project--presentation--text--infos">
          <div class="m_keywordField">
            <span 
              v-for="keyword in project.keywords" 
              :key="keyword.title"
              :class="['tagcolorid_' + parseInt(keyword.title, 36)%2, { 'is--active' : $root.settings.project_filter.keyword === keyword.title }]"
            >
              {{ keyword.title }}
            </span>
          </div>
          <div class="m_metaField" v-if="!!project.authors">
            <div>
              {{ $t('author') }}
            </div>
            <div class="m_authorField">
              <span v-if="typeof project.authors === 'string'">
                {{ project.authors }}
              </span>
              <span v-else-if="typeof project.authors === 'object'"
                v-for="author in project.authors"
                :key="author.name"
                class="is--active"
              >
                {{ author.name }}
              </span>
            </div>
          </div>
          <div class="m_metaField">
            <div>
              {{ $t('created') }}
            </div>
            <div>
              {{ $root.formatDateToHuman(project.date_created) }}
            </div>
          </div>
          <div class="m_metaField">
            <div>
              {{ $t('edited') }}
            </div>
            <div>
              {{ $root.formatDateToHuman(project.date_modified) }}
            </div>
          </div>
          <div class="m_metaField" v-if="project.password === 'has_pass' && context !== 'full'">
            <label>{{ $t('protected_by_pass') }}</label>

            <button v-if="!can_access_folder" type="button" class="buttonLink" :readonly="read_only" @click="showInputPasswordField = !showInputPasswordField">
              {{ $t('password_required_to_open') }}
            </button>
            <div v-if="showInputPasswordField && !can_access_folder" 
              class="margin-bottom-small input-group"
            >
              <input type="password" ref="passwordField" @keydown.enter.prevent="submitPassword" autofocus placeholder="…">
              <button type="button" class="button bg-bleuvert" @click="submitPassword">Valider</button>
            </div>
          </div>

          <div v-if="can_access_folder && project_password && context === 'full'" class="m_metaField">
            <label class="cursor-pointer" :readonly="read_only" @click="showCurrentPassword = !showCurrentPassword">
              {{ $t('show_password') }}
            </label>

            <div v-if="showCurrentPassword && can_access_folder">
              {{ project_password }}
            </div>
          </div>

        </div>
      </div>

      <div 
        class="m_project--presentation--buttons"
      >
        <button 
          v-if="can_access_folder && context !== 'full'"
          type="button" 
          class="m_project--presentation--buttons--openButton"
          :title="$t('open')"
          @click="$root.openProject(slugProjectName)"
        >
          <span class="">
            {{ $t('open') }}
          </span>
        </button>
        <button v-if="can_access_folder && context === 'full'" type="button" class="buttonLink" @click="showEditProjectModal = true" :disabled="read_only">
          <svg version="1.1" class="inline-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100.7px"
            height="101px" viewBox="0 0 100.7 101" style="enable-background:new 0 0 100.7 101;" xml:space="preserve">
            <path class="st0" d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
              L19.1,91.5z"/>
          </svg>
          {{ $t('edit') }}
        </button>

        <button v-if="can_access_folder && context === 'full'" type="button" class="buttonLink" @click="removeProject()" :disabled="read_only">
          <svg version="1.1" class="inline-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="91.6px"
            height="95px" viewBox="0 0 91.6 95" style="enable-background:new 0 0 91.6 95;" xml:space="preserve">
            <path class="st0" d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"/>
          </svg>
          {{ $t('remove') }}
        </button>

      </div>
      <EditProject
        v-if="showEditProjectModal"
        :project="project"
        :slugProjectName="slugProjectName"
        @close="showEditProjectModal = false"
        :read_only="read_only"
      />
    </div>

    <!-- <div class="m_project--description"
      v-if="context === 'full'"
    >
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
      </p>
    </div> -->

    <!-- <div class="m_project--favMedias"
      v-if="context === 'full'"
    >
      <div class="sectionTitle_small margin-sides-small margin-bottom-small">
        {{ $t('favorite_medias') }}
        <svg version="1.1"
          class="inline-svg"
          xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px" y="0px" width="78.5px" height="106.4px" viewBox="0 0 78.5 106.4" style="enable-background:new 0 0 78.5 106.4;"
          xml:space="preserve">
          <polygon class="st0" points="60.4,29.7 78.5,7.3 78.5,7.3 12.7,7.3 12.7,52 78.5,52 78.5,52 	"/>
          <polygon class="st0" points="9.6,106.4 0,106.4 0,2 9.6,0 "/>
        </svg>
      </div>

      <div class="m_project--favMedias--list">
        <MediaCard
          v-if="favMedias !== undefined"
          v-for="media in favMedias"
          :key="media.slugMediaName"
          :media="media"
          :metaFileName="media.metaFileName"
          :slugProjectName="slugProjectName"
          :preview_size="360"
        >
        </MediaCard>
      </div>
    </div> -->

    <MediaLibrary
      v-if="context === 'full'"
      :slugProjectName="slugProjectName"
      :project="project"
      :read_only="read_only"
    >
    </MediaLibrary>
  </div>
</template>
<script>
import EditProject from './modals/EditProject.vue';
import MediaLibrary from './MediaLibrary.vue';
import MediaCard from './subcomponents/MediaCard.vue';

export default {
  props: {
    project: Object,
    slugProjectName: String,
    read_only: Boolean,
    index: Number,
    context: String
  },
  components: {
    EditProject,
    MediaLibrary,
    MediaCard
  },
  data() {
    return {
      debugProjectContent: false,
      showEditProjectModal: false,
      showInputPasswordField: false,
      showCurrentPassword: false
    };
  },
  watch: {
  },
  mounted() {
  },
  beforeDestroy() {
  },
  computed: {
    previewURL() {
      if(!this.project.hasOwnProperty('preview') || this.project.preview === '') {
        return false;
      }
      const thumb = this.project.preview.filter(p => p.size === 640);
      if(thumb.length > 0) { return `${thumb[0].path}` }
      return false;
    },
    can_access_folder() {
      return this.$root.canAccessFolder({
        type: 'projects', 
        slugFolderName: this.slugProjectName
      })
    },
    project_password() {
      const projects_password = this.$auth.getAdminAccess();
      if(projects_password.hasOwnProperty('projects') && projects_password['projects'].hasOwnProperty(this.slugProjectName)) {
        return projects_password['projects'][this.slugProjectName];
      }
      return false;
    }
  },
  methods: {
    openProject() {
      if(context !== 'full') {
        this.$root.openProject(this.slugProjectName);
      }

    },
    closeProject() {
      this.$root.closeProject();
    },
    removeProject() {
      this.$alertify
        .okBtn(this.$t('yes'))
        .cancelBtn(this.$t('cancel'))        
        .confirm(this.$t('sureToRemoveProject'), 
        () => {
          this.$root.removeFolder({ 
            type: 'projects', 
            slugFolderName: this.slugProjectName
          });
          this.closeProject();
        },
        () => {
        });              
    },
    submitPassword() {
      console.log('METHODS • Project: submitPassword');
      
      this.$auth.updateAdminAccess({
        "projects": {
          [this.slugProjectName]: this.$refs.passwordField.value
        }
      });
      this.$socketio.sendAuth();
    }
  },
};
</script>
<style scoped>

</style>