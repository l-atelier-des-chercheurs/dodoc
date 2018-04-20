<template>
  <div id="app">

    <SystemBar
      v-if="$root.settings.enable_system_bar"
      :withTitleBar="true"
    >
    </SystemBar>

    <TopBar
      :has_back_button="$root.settings.view !== 'ListView'"
      :slugProjectName="current_slugProjectName"
    >
    </TopBar>

    <div class="m_activitiesPanel">
      <!-- <pre>{{ $root.store }}</pre> -->
      <!-- <pre>{{ $root.store }}</pre> -->
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
            v-if="$root.settings.view === 'ProjectView' && currentProject.hasOwnProperty('name')"
            :slugProjectName="current_slugProjectName"
            :project="currentProject"
            :read_only="!$root.state.connected"
          />
        </transition>

        <transition name="CaptureView" :duration="500">
          <CaptureView
            v-if="$root.settings.view === 'CaptureView'"
            :slugProjectName="current_slugProjectName"
            :project="currentProject"
          />
        </transition>
      </div>
      <div class="m_activitiesPanel--doc" v-if="$root.settings.show_publi_panel">
        <button type="button">
          Créer une publication
        </button>
        // modale de création de publications

        // liste des publications

      </div>
    </div>

    <button
      class="publiButton"
      @click="$root.togglePubliPanel"
      :key="'openPubli'"
    >
      <img src="/images/i_publi.svg" width="48" height="48" />
      <span class="margin-small">
        {{ $t('publication') }}
      </span>
    </button>

    <portal-target name="modal_container" />

  </div>
</template>

<script>
import SystemBar from './SystemBar.vue';
import TopBar from './TopBar.vue';
import ListView from './ListView.vue';
import ProjectView from './ProjectView.vue';
import CaptureView from './CaptureView.vue';

export default {
  name: 'app',
  components: {
    SystemBar,
    TopBar,
    ListView,
    ProjectView,
    CaptureView
  },
  props: {
    current_slugProjectName: String,
    currentProject: Object
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
