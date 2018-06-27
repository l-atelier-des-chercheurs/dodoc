<template>
  <div class="m_topbar">
    <div class="m_topbar--left" >
      <div class="m_topbar--left--logo" >
        <transition name="BackButton" :duration="500">
          <button class="backButton text-ellipsis" type="button" v-if="has_back_button" @click="goBack()">
            ‹ {{ $t('back') }}
          </button>
        </transition>
        <img src="/images/i_logo.svg" @click="goHome()" />
      </div>

      <div 
        class="m_topbar--left--breadcrumb" 
      >
        <button type="button"
          @click="$root.closeProject"        
        >
          <span>
            {{ $t('projects') }}
          </span>
        </button>
        
        <button type="button"
          v-if="project.hasOwnProperty('name')" 
          @click="$root.do_navigation.view = 'ProjectView'"
        >
          <span>
            {{ project.name }}
          </span>
        </button>

        <button type="button" 
          v-if="project.hasOwnProperty('name') && $root.do_navigation.view === 'CaptureView'"
        >
          <span>
            Capture
          </span>
        </button>

        <button type="button"
          v-if="project.hasOwnProperty('name') && $root.do_navigation.view === 'MediaView'"
        >
          <span>
            {{ $t('media') }}
          </span>
        </button>
      </div>
    </div>

    <div class="m_topbar--center">
      <div class="m_topbar--center--authors">
        <button type="button" @click="showAuthorsListModal = true">
          <template v-if="!!$root.settings.current_author">
            <div class="m_topbar--center--authors--portrait"
              v-if="$root.settings.current_author.preview !== ''"
            >
              <img :src="urlToPortrait($root.settings.current_author.slugFolderName, $root.settings.current_author.preview)" width="100" height="100"
              >              
            </div>
            <div class="m_topbar--center--authors--name">
              {{ $root.settings.current_author.name }}
            </div>
          </template>
          <template v-else>
            <div class="font-medium">
              ({{ $t('authors') }})
            </div>
          </template>
        </button>

        <AuthorsList
          v-if="showAuthorsListModal"
          :authors="authors"
          @close="showAuthorsListModal = false"
        >
        </AuthorsList>
      </div>
    </div>

    <div class="m_topbar--right">

      <div class="m_topbar--right--pictos">

        <button type="button" @click="$root.switchLang()">
          {{ this.$root.lang.current }}
        </button>

        <button type="button" @click="showQRModal = !showQRModal">
          <svg version="1.1"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px" y="0px" width="20px" height="20px" viewBox="0 0 90 90" style="enable-background:new 0 0 90 90;" xml:space="preserve">
            <path d="M48,0v42h42V0H48z M84,36H54V6h30V36z M13,77h16V61H13V77z M0,90h42V48H0V90z M6,54h30v30H6V54z M63,48H48v13h15V48z M69,54
              h8v7h-8v12h-8v-8h-9v8h5v9h-9v8h21v-8h13v-9h-5v-8h13V48H69V54z M0,42h42V0H0V42z M6,6h30v30H6V6z M90,90v-8h-8v8H90z M13,29h16V13
              H13V29z M77,13H61v16h16V13z"/>
          </svg>
        </button>

        <QRCode
          v-if="showQRModal"
          :slugProjectName="slugProjectName"
          @close="showQRModal = false"
        >
        </QRCode>

        <a class="js--openInBrowser" target="_blank" href="https://latelier-des-chercheurs.fr/docs/manuel-dodoc">
          <svg version="1.1"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px" y="0px" width="12px" height="20.3px" viewBox="0 0 12 20.3" style="enable-background:new 0 0 12 20.3;"
            xml:space="preserve">
            <path class="st0" d="M9.4,0.6c0.9,0.4,1.5,1,2,1.7C11.8,3,12,3.7,12,4.6c0,0.8-0.1,1.4-0.4,1.9s-0.6,1-1,1.3
              c-0.4,0.3-0.9,0.7-1.5,1.1c-0.8,0.5-1.3,1-1.7,1.4C7.1,10.8,7,11.3,7,12v1H3.6v-1.1c0-0.8,0.1-1.6,0.4-2.2c0.3-0.6,0.6-1.1,1-1.4
              C5.4,8,5.8,7.6,6.4,7.2c0.6-0.4,1.1-0.8,1.4-1.1c0.3-0.3,0.4-0.7,0.4-1.2c0-0.6-0.2-1.1-0.6-1.4C7.2,3,6.6,2.9,5.9,2.9
              c-1.3,0-2.5,0.6-3.6,1.9L0,2.9C1.6,1,3.7,0,6.2,0C7.5,0,8.5,0.2,9.4,0.6z M7,16.4c0.5,0.4,0.7,1,0.7,1.6c0,0.6-0.2,1.2-0.7,1.6
              c-0.5,0.5-1,0.7-1.6,0.7c-0.6,0-1.1-0.2-1.6-0.7c-0.4-0.5-0.7-1-0.7-1.6c0-0.6,0.2-1.2,0.6-1.6c0.4-0.4,1-0.7,1.6-0.7
              S6.5,16,7,16.4z"/>
          </svg>
        </a>

        <!-- <button type="button">
          <svg version="1.1"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px" y="0px" width="18.4px" height="18.1px" viewBox="0 0 18.4 18.1" style="enable-background:new 0 0 18.4 18.1;"
            xml:space="preserve">
            <path class="st0" d="M11.9,0c1.4,1.4,2.2,3.4,2.2,5.5c0,4.4-3.5,7.9-7.9,7.9c-2.5,0-4.8-1.2-6.2-3.1c0.7,4.4,4.5,7.8,9.1,7.8
              c5.1,0,9.3-4.1,9.3-9.3C18.4,4.7,15.7,1.2,11.9,0z"/>
          </svg>
        </button> -->
        
        <button type="button" @click="$root.toggleSearchSidebar"
          :class="{ 'is--active' : $root.settings.show_search_sidebar }"
        >
          <svg version="1.1"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px" y="0px" width="19.2px" height="19.2px" viewBox="0 0 19.2 19.2" style="enable-background:new 0 0 19.2 19.2;"
            xml:space="preserve">
            <path class="st0" d="M2.2,13.1c2.5,2.5,6.6,2.7,9.6,0.9l5.2,5.2l2.1-2.2L14,11.8c1.8-2.9,1.6-7-0.9-9.6c-3-3-7.8-3-10.8,0
                C-0.7,5.2-0.7,10.1,2.2,13.1z M11,4.2c1.9,1.9,1.9,4.9,0,6.8s-4.9,1.9-6.8,0c-1.9-1.9-1.9-4.9,0-6.8S9.2,2.4,11,4.2z"/>
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>
<script>
import QRCode from './components/modals/QRCode.vue';
import AuthorsList from './components/modals/AuthorsList.vue';

export default {
  props: [ 'has_back_button', 'slugProjectName', 'authors', 'project' ],
  components: {
    QRCode,
    AuthorsList
  },
  data() {
    return {
      showQRModal: false,
      showAuthorsListModal: false
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
    goBack() {
      this.$root.navigation_back();
    },
    goHome() {
      this.$root.closeProject();
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