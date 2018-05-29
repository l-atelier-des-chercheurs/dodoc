<template>
  <div id="app">

    <template 
      v-if="$root.state.mode === 'live'"
    >    

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
        <div 
          :style="{ cursor, userSelect}" 
          class="vue-splitter-container clearfix" 
          @mouseup="onMouseUp" 
          @mousemove="onMouseMove"
        >
          <pane 
            class="splitter-pane splitter-paneL" 
            :class="{ 'is--dragged' : is_dragged }"
            :split="split" :style="{ [type]: percent+'%'}">
            <div 
              class="m_activitiesPanel--do"
            >
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

          </pane>

          <resizer 
            :class="{ 'is--dragged' : is_dragged }"
            :className="className" 
            :style="{ [resizeType]: percent+'%'}" 
            :split="split" 
            @mousedown.native="onMouseDown" 
            @click.native="onClick">
          </resizer>

          <pane 
            class="splitter-pane splitter-paneR" 
            :class="{ 'is--dragged' : is_dragged }"
            :split="split" 
            :style="{ [type]: 100-percent+'%'}">
            <div 
              class="m_activitiesPanel--doc"
              :class="{ 'is--open' : $root.settings.show_publi_panel }"
            >
              <button
                class="publiButton"
                :class="{ 'is--open' : $root.settings.show_publi_panel }"
                @click="stopDragtogglePubli"
                @mousedown="onMouseDown" 
                @mouseup.stop
                :key="'openPubli'"
              >
                <!-- v-if="$root.settings.view !== 'CaptureView'" -->
                <img src="/images/i_publi.svg" width="48" height="48" />
                <span class="margin-small">
                  {{ $t('publication') }}
                </span>
              </button>

              <div style="position: relative; height: 100%; overflow: hidden">
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
          </pane>
        
        </div>
      </div>

      <EditMedia
        v-if="$root.settings.showMediaModalFor !== false"
        :slugMediaName="$root.settings.showMediaModalFor.slugMediaName"
        :slugProjectName="$root.settings.showMediaModalFor.slugProjectName"
        :media="$root.store.projects[$root.settings.showMediaModalFor.slugProjectName].medias[$root.settings.showMediaModalFor.slugMediaName]"
        @close="$root.settings.showMediaModalFor = false"
        :read_only="!$root.state.connected"
      >
      </EditMedia>      

    </template>  
    <template 
      v-else-if="$root.state.mode === 'export_publication'"
    >    
      <Publication
        v-if="$root.settings.current_slugPubliName !== false"
        :slugPubliName="$root.settings.current_slugPubliName"
        :publication="$root.store.publications[$root.settings.current_slugPubliName]"
        :read_only="!$root.state.connected"
      />
    </template>    
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

import Resizer from './components/splitpane/Resizer.vue'
import Pane from './components/splitpane/Pane.vue'

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
    EditMedia,
    Resizer, 
    Pane
  },
  props: {
  },
  data() {
    return {
      minPercent: 0,
      split: 'vertical',
      is_dragged: false,
      hasMoved: false,
      height: null,
      percent: this.$root.state.mode === 'export_publication' ? 0:100,
      type: 'width',
      resizeType: 'left'
    };
  },
  watch: {
  },
  created() { 
  },
  computed: {
    userSelect() {
      return this.is_dragged ? 'none' : ''
    },
    cursor() {
      return this.is_dragged ? 'col-resize' : ''
    }
  },
  methods: {
    stopDragtogglePubli() {
      this.is_dragged = false;
      if(!this.$root.settings.show_publi_panel) {
        this.percent = 50;
        this.$root.openPubliPanel();
      } else {
        this.percent = 100;
        this.$root.closePubliPanel();
      }
    },
    onClick() {
      // if (!this.hasMoved) {
      //   this.$root.togglePubliPanel();
        // this.percent = 50
        // this.$emit('resize')
      // }
    },
    onMouseDown() {
      this.is_dragged = true
      this.hasMoved = false
    },
    onMouseUp() {
      this.is_dragged = false;

      if(this.percent >= 90) {
        this.percent = 100;
        this.$root.closePubliPanel();
        return;
      } 
      
      if(this.$root.settings.show_publi_panel === false) {
        this.$root.openPubliPanel();
      }      
      if(this.percent <= 10) {
        this.percent = 0;
      }
    },
    onMouseMove(e) {
      if (e.buttons === 0 || e.which === 0) {
        this.is_dragged = false
      }

      if (this.is_dragged) {
        let offset = 0
        let target = e.currentTarget
        if (this.split === 'vertical') {
          while (target) {
            offset += target.offsetLeft
            target = target.offsetParent
          }
        } else {
          while (target) {
            offset += target.offsetTop
            target = target.offsetParent
          }
        }

        const currentPage = this.split === 'vertical' ? e.pageX : e.pageY
        const targetOffset = this.split === 'vertical' ? e.currentTarget.offsetWidth : e.currentTarget.offsetHeight
        const percent = Math.floor(((currentPage - offset) / targetOffset) * 10000) / 100

        if (percent > this.minPercent && percent < 100 - this.minPercent) {
          this.percent = percent
        }

        this.$emit('resize')
        this.hasMoved = true
      }
    }
  }
};
</script>

<style lang="less" src="style.less"></style>

<style scoped>
.clearfix:after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}

.vue-splitter-container {
  height: 100%;
  position: relative;
  overflow: hidden;
}

</style>