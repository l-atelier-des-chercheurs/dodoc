<template>
  <div id="app" :class="{ 'is--wide': $root.screen_is_wide }">
    <template v-if="$root.store.request.display === 'standalone'">
      <div class="m_standaloneMedia">
        <MediaContent
          class
          :context="'full'"
          :autoplay="true"
          :slugFolderName="$root.store.request.slugProjectName"
          :media="$root.requested_media"
          v-model="$root.requested_media.content"
        />
      </div>
    </template>
    <template
      v-else-if="$root.state.mode === 'live' && !$root.state.authentificated"
    >
      <SessionPassword
        v-if="$root.showSessionPasswordModal"
        @close="$root.showSessionPasswordModal = false"
        :read_only="!$root.state.connected"
      />
    </template>
    <template
      v-else-if="
        $root.state.mode === 'live' &&
          $root.store.request.display !== 'standalone'
      "
    >
      <SystemBar v-if="$root.settings.enable_system_bar" :withTitleBar="true" />

      <TopBar
        :has_back_button="$root.do_navigation.view !== 'ListView'"
        :slugProjectName="$root.do_navigation.current_slugProjectName"
        :project="$root.currentProject"
      />

      {{ panels_width }}

      <div class="m_activitiesPanel">
        <splitpanes
          watch-slots
          @resized="resized()"
          @splitter-click="splitterClicked($event)"
        >
          <pane
            class="splitter-pane"
            ref="doPane"
            min-size="5"
            :size="panels_width.doPane"
          >
            <div
              class="m_activitiesPanel--do"
              :class="{ 'is--large': activitiesPanel_is_large }"
            >
              <div
                style="position: relative; width: 100%; height: 100%; overflow: hidden"
              >
                <!-- v-show="$root.do_navigation.view === 'ListView'" -->
                <transition name="ListView" :duration="500">
                  <ListView
                    v-show="$root.do_navigation.view === 'ListView'"
                    :presentationMD="$root.store.presentationMD"
                    :read_only="!$root.state.connected"
                    :projects="$root.store.projects"
                  />
                </transition>
                <transition name="ProjectView" :duration="500">
                  <ProjectView
                    v-if="
                      ['ProjectView', 'CaptureView'].includes(
                        $root.do_navigation.view
                      )
                    "
                    :slugProjectName="
                      $root.do_navigation.current_slugProjectName
                    "
                    :project="$root.currentProject"
                    :read_only="!$root.state.connected"
                  />
                </transition>

                <transition name="CaptureView" :duration="500">
                  <CaptureView
                    v-if="$root.do_navigation.view === 'CaptureView'"
                    :slugProjectName="
                      $root.do_navigation.current_slugProjectName
                    "
                    :project="$root.currentProject"
                    :read_only="!$root.state.connected"
                  />
                </transition>
              </div>
            </div>
          </pane>
          <pane
            class="splitter-pane"
            ref="docPane"
            :size="panels_width.docPane"
          >
            <div
              class="m_activitiesPanel--doc"
              :class="{ 'is--open': $root.settings.show_publi_panel }"
            >
              <!-- <button
                v-if="$root.screen_is_wide"
                class="publiButton"
                :content="$t('mix_medias')"
                v-tippy="{
                  placement: 'left',
                  delay: [600, 0]
                }"
                :class="{
                  'is--open': $root.settings.show_publi_panel,
                  'is--allthewaytotheleft': activity_panel_percent === 0
                }"
                @mousedown.stop.prevent="dragPubliPanel($event, 'mouse')"
                @touchstart.stop.prevent="dragPubliPanel($event, 'touch')"
                :key="'openPubli'"
              >
                <img
                  src="/images/i_marmite.svg"
                  width="48"
                  height="48"
                  draggable="false"
                />
                <span class="margin-small">{{ $t("publication") }}</span>
              </button> -->

              <div style="position: relative; height: 100%; overflow: hidden">
                <transition name="ListView" :duration="500">
                  <Publications
                    v-if="$root.settings.show_publi_panel"
                    :publications="$root.store.publications"
                    :read_only="!$root.state.connected"
                  />
                </transition>
                <transition
                  name="ProjectView"
                  :duration="500"
                  v-if="$root.settings.current_publication.slug !== false"
                >
                  <PagePublication
                    v-if="
                      $root.settings.current_publication.slug !== false &&
                        $root.store.publications[
                          $root.settings.current_publication.slug
                        ].template === 'page_by_page'
                    "
                    :slugPubliName="$root.settings.current_publication.slug"
                    :publication="
                      $root.store.publications[
                        $root.settings.current_publication.slug
                      ]
                    "
                    :read_only="!$root.state.connected"
                  />
                  <Carreau
                    v-if="
                      $root.settings.current_publication.slug !== false &&
                        $root.store.publications[
                          $root.settings.current_publication.slug
                        ].template === 'carreau'
                    "
                    :slugPubliName="$root.settings.current_publication.slug"
                    :publication="
                      $root.store.publications[
                        $root.settings.current_publication.slug
                      ]
                    "
                    :read_only="!$root.state.connected"
                  />
                  <VideoPublication
                    v-else-if="
                      $root.settings.current_publication.slug !== false &&
                        $root.store.publications[
                          $root.settings.current_publication.slug
                        ].template === 'video_assemblage'
                    "
                    :slugPubliName="$root.settings.current_publication.slug"
                    :publication="
                      $root.store.publications[
                        $root.settings.current_publication.slug
                      ]
                    "
                    :read_only="!$root.state.connected"
                  />
                  <VideoEffects
                    v-else-if="
                      $root.settings.current_publication.slug !== false &&
                        $root.store.publications[
                          $root.settings.current_publication.slug
                        ].template === 'video_effects'
                    "
                    :slugPubliName="$root.settings.current_publication.slug"
                    :publication="
                      $root.store.publications[
                        $root.settings.current_publication.slug
                      ]
                    "
                    :read_only="!$root.state.connected"
                  />
                  <DrawingPad
                    v-else-if="
                      $root.settings.current_publication.slug !== false &&
                        $root.store.publications[
                          $root.settings.current_publication.slug
                        ].template === 'drawing_pad'
                    "
                    :slugPubliName="$root.settings.current_publication.slug"
                    :publication="
                      $root.store.publications[
                        $root.settings.current_publication.slug
                      ]
                    "
                    :read_only="!$root.state.connected"
                  />
                  <StopmotionAnimation
                    v-else-if="
                      $root.settings.current_publication.slug !== false &&
                        $root.store.publications[
                          $root.settings.current_publication.slug
                        ].template === 'stopmotion_animation'
                    "
                    :slugPubliName="$root.settings.current_publication.slug"
                    :publication="
                      $root.store.publications[
                        $root.settings.current_publication.slug
                      ]
                    "
                    :read_only="!$root.state.connected"
                  />
                  <MixAudioAndVideo
                    v-else-if="
                      $root.settings.current_publication.slug !== false &&
                        $root.store.publications[
                          $root.settings.current_publication.slug
                        ].template === 'mix_audio_and_video'
                    "
                    :slugPubliName="$root.settings.current_publication.slug"
                    :publication="
                      $root.store.publications[
                        $root.settings.current_publication.slug
                      ]
                    "
                    :read_only="!$root.state.connected"
                  />
                  <MixAudioAndImage
                    v-else-if="
                      $root.settings.current_publication.slug !== false &&
                        $root.store.publications[
                          $root.settings.current_publication.slug
                        ].template === 'mix_audio_and_image'
                    "
                    :slugPubliName="$root.settings.current_publication.slug"
                    :publication="
                      $root.store.publications[
                        $root.settings.current_publication.slug
                      ]
                    "
                    :read_only="!$root.state.connected"
                  />
                </transition>
              </div>
            </div>
          </pane>
          <pane
            class="splitter-pane"
            ref="chatPane"
            :size="panels_width.chatPane"
          >
            <div
              class="m_activitiesPanel--chat"
              :class="{ 'is--open': $root.settings.show_chat_panel }"
            >
              <transition name="ListView" :duration="500">
                <Chats
                  v-if="$root.settings.show_chat_panel"
                  :read_only="!$root.state.connected"
                  :chats="$root.store.chats"
                />
              </transition>
            </div>
          </pane>
        </splitpanes>
      </div>
      <EditMedia
        v-if="$root.media_modal.open"
        :key="
          $root.media_modal.current_slugProjectName +
            $root.media_modal.current_metaFileName
        "
        :slugMediaName="$root.media_modal.current_metaFileName"
        :slugProjectName="$root.media_modal.current_slugProjectName"
        :media="
          $root.store.projects[$root.media_modal.current_slugProjectName]
            .medias[$root.media_modal.current_metaFileName]
        "
        @close="$root.closeMedia()"
        :read_only="!$root.state.connected"
      />
      <AuthorsList
        v-if="
          $root.showAuthorsListModal ||
            ($root.state.force_login && !$root.settings.current_author)
        "
        :authors="$root.store.authors"
        :prevent_close="
          $root.state.force_login && !$root.settings.current_author
        "
        @close="$root.showAuthorsListModal = false"
      />
    </template>
    <template
      v-else-if="
        [
          'export_publication',
          'print_publication',
          'link_publication'
        ].includes($root.state.mode)
      "
    >
      <template v-if="$root.current_publication">
        <PagePublication
          v-if="$root.current_publication.template === 'page_by_page'"
          :slugPubliName="$root.current_publication.slugFolderName"
          :publication="$root.current_publication"
          :read_only="!$root.state.connected"
        />
        <DrawingPad
          v-else-if="$root.current_publication.template === 'drawing_pad'"
          :slugPubliName="$root.current_publication.slugFolderName"
          :publication="$root.current_publication"
          :read_only="!$root.state.connected"
        />
      </template>
    </template>

    <portal-target name="modal_container" />
  </div>
</template>

<script>
import SystemBar from "./SystemBar.vue";
import TopBar from "./TopBar.vue";
import ListView from "./ListView.vue";
import Chats from "./Chats.vue";
import ProjectView from "./ProjectView.vue";
import CaptureView from "./CaptureView.vue";
import EditMedia from "./components/modals/EditMedia.vue";
import AuthorsList from "./components/modals/AuthorsList.vue";
import SessionPassword from "./components/modals/SessionPassword.vue";

import MediaContent from "./components/subcomponents/MediaContent.vue";
import Publications from "./Publications.vue";

import PagePublication from "./components/publication_templates/PagePublication.vue";
import Carreau from "./components/publication_templates/Carreau.vue";
import VideoPublication from "./components/publication_templates/VideoPublication.vue";
import DrawingPad from "./components/publication_templates/DrawingPad.vue";
import VideoEffects from "./components/publication_templates/VideoEffects.vue";
import StopmotionAnimation from "./components/publication_templates/StopmotionAnimation.vue";
import MixAudioAndVideo from "./components/publication_templates/MixAudioAndVideo.vue";
import MixAudioAndImage from "./components/publication_templates/MixAudioAndImage.vue";

import { Splitpanes, Pane } from "splitpanes";

export default {
  name: "app",
  components: {
    SystemBar,
    TopBar,
    ListView,
    Chats,
    ProjectView,
    CaptureView,
    EditMedia,
    AuthorsList,
    SessionPassword,
    Publications,
    PagePublication,
    Carreau,
    VideoPublication,
    DrawingPad,
    VideoEffects,
    StopmotionAnimation,
    MixAudioAndVideo,
    MixAudioAndImage,
    Splitpanes,
    Pane,

    MediaContent
  },
  props: {},
  data() {
    return {
      minPercent: 0,
      split: "vertical",
      drag_offset: 0,
      hasMoved: false,
      height: null,
      percent: 100,
      type: "width",
      resizeType: "left",

      panels_width: {
        doPane: 100,
        docPane: 0,
        chatPane: 0
      }
    };
  },
  watch: {
    panels_width: {
      handler() {
        if (
          this.panels_width.docPane > 0 &&
          !this.$root.settings.show_publi_panel
        ) {
          this.$root.openPubliPanel();
        } else if (
          this.panels_width.docPane === 0 &&
          this.$root.settings.show_publi_panel
        ) {
          this.$root.closePubliPanel();
        }

        if (
          this.panels_width.chatPane > 0 &&
          !this.$root.settings.show_chat_panel
        ) {
          this.$root.openChatPanel();
        } else if (
          this.panels_width.chatPane === 0 &&
          this.$root.settings.show_chat_panel
        ) {
          this.$root.closeChatPanel();
        }
      },
      deep: true
    }
  },
  created() {},
  computed: {
    activitiesPanel_is_large() {
      if ((this.percent / 100) * this.$root.settings.windowWidth < 850) {
        return false;
      }
      if (this.$root.settings.windowHeight < 650) {
        return false;
      }
      return true;
    }
  },
  methods: {
    resized() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • App: splitpanes resized`);

      this.$eventHub.$emit(`activity_panels_resized`);

      // this.updatePanelsSize();
    },
    splitterClicked(e) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • App: splitpanes splitterClicked with e.index = ${e.index}`
        );

      if (e.index === 1) {
        if (this.panels_width.docPane <= 0.01) {
          if (this.panels_width.chatPane <= 0.01) this.panels_width.doPane = 70;
          else {
            this.panels_width.chatPane = 35;
            this.panels_width.doPane = 35;
          }
          this.panels_width.docPane = 30;
        } else {
          if (this.panels_width.chatPane <= 0.01)
            this.panels_width.doPane = 100;
          else
            this.panels_width.doPane =
              this.panels_width.docPane + this.panels_width.doPane;
          this.panels_width.docPane = 0.01;
        }
      } else if (e.index === 2) {
        if (this.panels_width.chatPane <= 0.01) {
          if (this.panels_width.docPane <= 0.01) this.panels_width.doPane = 70;
          else {
            this.panels_width.docPane = 35;
            this.panels_width.doPane = 35;
          }
          this.panels_width.chatPane = 30;
        } else {
          this.panels_width.doPane =
            this.panels_width.chatPane + this.panels_width.doPane;
          this.panels_width.chatPane = 0.01;
        }
      }
    },
    updatePanelsSize() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • App: updatePanelsSize`);

      Object.entries(this.$refs).map(([key, $el]) => {
        const _width = parseInt($el.style.width);
        this.panels_width[key] = _width;
      });
    }
  }
};
</script>

<style lang="less" src="style.less"></style>
