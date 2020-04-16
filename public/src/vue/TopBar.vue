<template>
  <div class="m_topbar" :class="{ 'is--collapsable': !$root.screen_is_wide }">
    <div class="m_topbar--left">
      <div class="m_topbar--left--logo">
        <transition name="BackButton" :duration="500">
          <button
            v-if="has_back_button"
            class="backButton text-ellipsis"
            type="button"
            @click="goBack()"
          >
            ‹
            <span class="backButton--text">{{ $t("back") }}</span>
          </button>
        </transition>
        <img
          :content="`do•doc version ${$root.state.appVersion}`"
          src="/images/i_logo.svg"
          @click="goHomeOrReload()"
          draggable="false"
          v-tippy="{
            placement: 'bottom',
            delay: [1000, 0],
          }"
        />
      </div>

      <div class="m_topbar--left--breadcrumb">
        <!-- <button type="button"
          @click="$root.closeProject"        
        >
          <span>
            {{ $t('projects') }}
          </span>
        </button>-->

        <button
          type="button"
          v-if="project.hasOwnProperty('name')"
          @click="$root.do_navigation.view = 'ProjectView'"
          :disabled="$root.do_navigation.view === 'ProjectView'"
          :content="$t('back_to_project')"
          v-tippy="{
            placement: 'bottom',
            delay: [600, 0],
          }"
        >
          <span>{{ project.name }}</span>
        </button>

        <button
          type="button"
          v-if="
            project.hasOwnProperty('name') &&
            $root.do_navigation.view === 'CaptureView'
          "
        >
          <span>Capture</span>
        </button>

        <!-- <button type="button"
          v-if="project.hasOwnProperty('name') && $root.media_modal.open"
        >
          <span>
            {{ $t('media') }}
          </span>
        </button>-->
      </div>

      <button
        type="button"
        class="m_topbar--left--menuButton"
        v-if="!$root.screen_is_wide"
        @click="toggleMenu()"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="20px"
          height="20px"
          viewBox="0 0 90 90"
          style="enable-background: new 0 0 90 90;"
          xml:space="preserve"
        >
          <rect class="st0" width="108.2" height="21" />
          <rect y="36.5" class="st0" width="108.2" height="21" />
          <rect y="73" class="st0" width="108.2" height="21" />
        </svg>
      </button>
    </div>

    <div v-if="show_advanced_options" class="m_topbar--center">
      <div class="m_topbar--center--authors">
        <button
          type="button"
          class="m_topbar--center--authors--currentAuthor"
          @click="$root.showAuthorsListModal = true"
          :content="$t('login')"
          v-tippy="{
            placement: 'bottom',
            delay: [600, 0],
          }"
        >
          <template v-if="$root.current_author">
            <div
              class="m_topbar--center--authors--portrait"
              v-if="
                $root.current_author.hasOwnProperty('preview') &&
                $root.current_author.preview.length !== ''
              "
            >
              <img
                :src="
                  urlToPortrait(
                    $root.current_author.slugFolderName,
                    $root.current_author.preview
                  )
                "
                width="100"
                height="100"
                draggable="false"
              />
            </div>
            <div class="m_topbar--center--authors--name">
              {{ $root.current_author.name }}
            </div>
          </template>
          <template v-else>
            <div class="font-medium">({{ $t("authors") }})</div>
          </template>
        </button>

        <Clients />
      </div>
    </div>

    <div v-if="show_advanced_options" class="m_topbar--right">
      <div class="m_topbar--right--pictos">
        <button
          type="button"
          @click="showQRModal = !showQRModal"
          :content="$t('share_access')"
          v-tippy="{
            placement: 'bottom-end',
            delay: [600, 0],
          }"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px"
            y="0px"
            width="20px"
            height="20px"
            viewBox="0 0 90 90"
            style="enable-background: new 0 0 90 90;"
            xml:space="preserve"
          >
            <path
              d="M48,0v42h42V0H48z M84,36H54V6h30V36z M13,77h16V61H13V77z M0,90h42V48H0V90z M6,54h30v30H6V54z M63,48H48v13h15V48z M69,54
              h8v7h-8v12h-8v-8h-9v8h5v9h-9v8h21v-8h13v-9h-5v-8h13V48H69V54z M0,42h42V0H0V42z M6,6h30v30H6V6z M90,90v-8h-8v8H90z M13,29h16V13
              H13V29z M77,13H61v16h16V13z"
            />
          </svg>
        </button>

        <QRCode
          v-if="showQRModal"
          :slugProjectName="slugProjectName"
          @close="showQRModal = false"
        />

        <a
          class="js--openInBrowser"
          target="_blank"
          href="https://latelier-des-chercheurs.fr/docs/manuel-dodoc"
          :content="$t('help')"
          v-tippy="{
            placement: 'bottom',
            delay: [600, 0],
          }"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px"
            y="0px"
            width="12px"
            height="20.3px"
            viewBox="0 0 12 20.3"
            style="enable-background: new 0 0 12 20.3;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M9.4,0.6c0.9,0.4,1.5,1,2,1.7C11.8,3,12,3.7,12,4.6c0,0.8-0.1,1.4-0.4,1.9s-0.6,1-1,1.3
              c-0.4,0.3-0.9,0.7-1.5,1.1c-0.8,0.5-1.3,1-1.7,1.4C7.1,10.8,7,11.3,7,12v1H3.6v-1.1c0-0.8,0.1-1.6,0.4-2.2c0.3-0.6,0.6-1.1,1-1.4
              C5.4,8,5.8,7.6,6.4,7.2c0.6-0.4,1.1-0.8,1.4-1.1c0.3-0.3,0.4-0.7,0.4-1.2c0-0.6-0.2-1.1-0.6-1.4C7.2,3,6.6,2.9,5.9,2.9
              c-1.3,0-2.5,0.6-3.6,1.9L0,2.9C1.6,1,3.7,0,6.2,0C7.5,0,8.5,0.2,9.4,0.6z M7,16.4c0.5,0.4,0.7,1,0.7,1.6c0,0.6-0.2,1.2-0.7,1.6
              c-0.5,0.5-1,0.7-1.6,0.7c-0.6,0-1.1-0.2-1.6-0.7c-0.4-0.5-0.7-1-0.7-1.6c0-0.6,0.2-1.2,0.6-1.6c0.4-0.4,1-0.7,1.6-0.7
              S6.5,16,7,16.4z"
            />
          </svg>
        </a>

        <button
          type="button"
          @click="showSettingsModal = !showSettingsModal"
          :content="$t('settings')"
          v-tippy="{
            placement: 'bottom-end',
            delay: [600, 0],
          }"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="90px"
            height="90px"
            viewBox="0 0 90 90"
            style="enable-background: new 0 0 90 90;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M79.8,49.3v-9c0-1,0.6-1.9,1.4-2.3l8.7-4.5l-1.8-5.2l-9.9,1.4c-1,0.2-2-0.3-2.6-1.1l-5.4-7.3
	c-0.6-0.8-0.7-1.8-0.2-2.7l4.3-8.6l-4.7-3.2l-6.9,6.8C62,14.3,61,14.5,60,14.2l-8.9-2.7c-1-0.3-1.7-1.1-1.9-2.2L47.5,0h-5.7
	l-1.6,9.4c-0.1,1-0.9,1.8-1.8,2.2l-8.9,2.8c-1,0.3-2,0.1-2.7-0.6l-7-6.6l-4.6,3.3l4.4,8.5c0.5,0.9,0.4,1.9-0.2,2.7L14,29
	c-0.6,0.8-1.6,1.2-2.6,1.1l-9.7-1.3L0,34l8.7,4.3c0.9,0.5,1.5,1.4,1.5,2.4v9c0,1-0.6,1.9-1.4,2.3l-8.6,4.5l1.8,5.3l9.8-1.4
	c1-0.1,2,0.3,2.6,1.1l5.4,7.3c0.6,0.8,0.7,1.8,0.2,2.7L15.7,80l4.6,3.2l6.9-6.8c0.7-0.7,1.8-0.9,2.7-0.6l8.9,2.7
	c1,0.3,1.7,1.1,1.9,2.1l1.7,9.4h5.7l1.6-9.4c0.1-1,0.9-1.8,1.8-2.2l8.9-2.8c1-0.3,2-0.1,2.7,0.6l7,6.6l4.6-3.3L70.4,71
	c-0.5-0.9-0.4-1.9,0.2-2.7L76,61c0.6-0.8,1.6-1.2,2.6-1.1l9.7,1.3L90,56l-8.7-4.3C80.4,51.2,79.8,50.3,79.8,49.3z M45,63.4
	c-10.5,0-19-8.3-19-18.4c0-10.2,8.5-18.4,19-18.4S64,34.8,64,45C64,55.2,55.5,63.4,45,63.4z"
            />
          </svg>
        </button>

        <SettingsModal
          v-if="showSettingsModal"
          @close="showSettingsModal = false"
        />

        <!-- <button type="button">
          <svg version="1.1"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px" y="0px" width="18.4px" height="18.1px" viewBox="0 0 18.4 18.1" style="enable-background:new 0 0 18.4 18.1;"
            xml:space="preserve">
            <path class="st0" d="M11.9,0c1.4,1.4,2.2,3.4,2.2,5.5c0,4.4-3.5,7.9-7.9,7.9c-2.5,0-4.8-1.2-6.2-3.1c0.7,4.4,4.5,7.8,9.1,7.8
              c5.1,0,9.3-4.1,9.3-9.3C18.4,4.7,15.7,1.2,11.9,0z"/>
          </svg>
        </button>-->
      </div>
    </div>
    <div class="m_topbar--status" v-if="!$root.state.connected">
      {{ $t("notifications.connection_lost") }}
      {{ $t("notifications.contents_wont_be_editable") }}
    </div>
  </div>
</template>
<script>
import QRCode from "./components/modals/QRCode.vue";
import SettingsModal from "./components/modals/SettingsModal.vue";
import Clients from "./components/Clients.vue";

export default {
  props: ["has_back_button", "slugProjectName", "authors", "project"],
  components: {
    QRCode,
    SettingsModal,
    Clients,
  },
  data() {
    return {
      showQRModal: false,
      showSettingsModal: false,
      show_menu: false,
    };
  },
  created() {},
  mounted() {
    this.menuVisibility();
  },
  beforeDestroy() {},
  watch: {
    "$root.settings.windowWidth": function () {
      this.menuVisibility();
    },
  },
  computed: {
    show_advanced_options() {
      return (
        this.$root.screen_is_wide ||
        (!this.$root.screen_is_wide && this.show_menu)
      );
    },
  },
  methods: {
    menuVisibility() {},
    goBack() {
      this.$root.navigation_back();
    },
    goHomeOrReload() {
      if (this.$root.do_navigation.view !== "ListView") {
        this.$root.closeProject();
      } else {
        window.location.reload();
      }
    },
    toggleMenu() {
      this.show_menu = !this.show_menu;
    },
    urlToPortrait(slug, preview) {
      if (!preview) return "";
      let pathToSmallestThumb = preview.filter((m) => m.size === 180)[0].path;
      return pathToSmallestThumb;
    },
  },
};
</script>
