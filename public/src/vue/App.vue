<template>
  <div id="app">

    <SystemBar
      v-if="$root.settings.enable_system_bar"
      :withTitleBar="true"
    >
    </SystemBar>

    <TopBar
      :has_back_button="$root.settings.view !== 'ListView'"
      :slugProjectName="$root.settings.current_slugProjectName"
      :project="$root.currentProject"
      :authors="$root.store.authors"
    >
    </TopBar>

    <div class="m_activitiesPanel">
      <div class="m_activitiesPanel--do">
        <!-- v-show="$root.settings.view === 'ListView'" -->
        <transition name="ListView" :duration="500">
          <ListView
            v-if="$root.settings.view === 'ListView'"
            :presentationMD="$root.store.presentationMD"
            :read_only="!$root.state.connected"
            :projects="$root.store.projects"
          />
        </transition>
        <transition name="ProjectView" :duration="500">
          <ProjectView
            v-if="$root.settings.view === 'ProjectView' && $root.currentProject.hasOwnProperty('name')"
            :slugProjectName="$root.settings.current_slugProjectName"
            :project="$root.currentProject"
            :read_only="!$root.state.connected"
          />
        </transition>

        <transition name="CaptureView" :duration="500">
          <CaptureView
            v-if="$root.settings.view === 'CaptureView'"
            :slugProjectName="$root.settings.current_slugProjectName"
            :project="$root.currentProject"
          />
        </transition>
      </div>
      <div class="m_activitiesPanel--doc"
        :class="{ 'is--open' : $root.settings.show_publi_panel }"
      >
        <transition name="ListView" :duration="500">
          <Publications
            v-if="$root.settings.show_publi_panel && !$root.settings.current_slugPubliName"
            :publications="$root.store.publications"
            :read_only="!$root.state.connected"
          />
        </transition>
        <transition name="ProjectView" :duration="500">
          <Publication
            v-if="$root.settings.current_slugPubliName !== false"
            :slugPubliName="$root.settings.current_slugPubliName"
            :publication="$root.store.publications[$root.settings.current_slugPubliName]"
            :read_only="!$root.state.connected"
          />
        </transition>
      </div>
    </div>

    <button
      class="publiButton"
      :class="{ 'is--open' : $root.settings.show_publi_panel }"
      @click="$root.togglePubliPanel"
      :key="'openPubli'"
    >
      <!-- v-if="$root.settings.view !== 'CaptureView'" -->
      <img src="/images/i_publi.svg" width="48" height="48" />
      <span class="margin-small">
        {{ $t('publication') }}
      </span>
    </button>

    <EditMedia
      v-if="$root.settings.showMediaModalFor !== false"
      :slugMediaName="$root.settings.showMediaModalFor.slugMediaName"
      :slugProjectName="$root.settings.showMediaModalFor.slugProjectName"
      :media="$root.store.projects[$root.settings.showMediaModalFor.slugProjectName].medias[$root.settings.showMediaModalFor.slugMediaName]"
      @close="$root.settings.showMediaModalFor = false"
      :read_only="!$root.state.connected"
    >
    </EditMedia>        
    
    <portal-target name="modal_container" />

  </div>
</template>

<script>
import SystemBar from './SystemBar.vue';
import TopBar from './TopBar.vue';
import ListView from './ListView.vue';
import ProjectView from './ProjectView.vue';
import CaptureView from './CaptureView.vue';
import Publications from './Publications.vue';
import Publication from './components/Publication.vue';
import EditMedia from './components/modals/EditMedia.vue';

export default {
  name: 'app',
  components: {
    SystemBar,
    TopBar,
    ListView,
    ProjectView,
    CaptureView,
    Publications,
    Publication,
    EditMedia
  },
  props: {
  },
  data() {
    return {
    };
  },
  created() { 
  },
  computed: {
  },
  watch: {
  },
  methods: {
  }
};
</script>

<style lang="less" src="style.less"></style>
