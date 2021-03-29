<template>
  <div class="m_dodoc" :class="{ 'is--wide': $root.screen_is_wide }">
    <SystemBar v-if="$root.settings.enable_system_bar" :withTitleBar="true" />

    <TopBar
      :has_back_button="$root.do_navigation.view !== 'ListView'"
      :slugProjectName="$root.do_navigation.current_slugProjectName"
      :project="$root.current_project"
    />

    <div class="m_activitiesPanel">
      <splitpanes
        watch-slots
        @resize="resize"
        @resized="resized"
        @splitter-click="splitterClicked"
        :data-docpane_isopen="$root.settings.show_publi_panel === true"
        :data-chatpane_isopen="$root.settings.show_chat_panel === true"
      >
        <pane
          class="splitter-pane"
          ref="doPane"
          min-size="0"
          :size="panels_width.doPane"
        >
          <div
            class="m_activitiesPanel--do"
            :class="{ 'is--large': activitiesPanel_is_large }"
          >
            <div
              style="
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
              "
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
                  :slugProjectName="$root.do_navigation.current_slugProjectName"
                  :project="$root.current_project"
                  :read_only="!$root.state.connected"
                />
              </transition>

              <transition name="CaptureView" :duration="500">
                <CaptureView
                  v-if="$root.do_navigation.view === 'CaptureView'"
                  :slugFolderName="$root.do_navigation.current_slugProjectName"
                  :type="`projects`"
                  :read_only="!$root.state.connected"
                />
              </transition>
            </div>
          </div>
        </pane>
        <pane class="splitter-pane" ref="docPane" :size="panels_width.docPane">
          <div
            class="m_activitiesPanel--doc"
            :class="{
              'is--open': $root.settings.show_publi_panel,
              'is--large': publiPanel_is_large,
            }"
          >
            <div style="position: relative; height: 100%; overflow: hidden">
              <transition name="ListView" :duration="500">
                <Publications
                  v-if="$root.settings.show_publi_panel"
                  :publications="Object.values($root.store.publications)"
                  :read_only="!$root.state.connected"
                />
              </transition>
              <transition
                name="ProjectView"
                :duration="500"
                v-if="$root.settings.current_publication.slug !== false"
              >
                <Publication
                  :key="$root.settings.current_publication.slug"
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
          <!-- <button
            type="button"
            class="button-nostyle bg-rouge _close_button"
            @click="closeChat"
          >
            <img src="/images/i_close_sansfond.svg" draggable="false" />
          </button> -->
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
        $root.store.projects[$root.media_modal.current_slugProjectName].medias[
          $root.media_modal.current_metaFileName
        ]
      "
      @close="$root.closeMedia()"
      :read_only="!$root.state.connected"
    />
    <CreateQRModal
      v-if="$root.qr_modal"
      :read_only="!$root.state.connected"
      :type="$root.qr_modal.type"
      :slugFolderName="$root.qr_modal.slugFolderName"
      @close="$root.qr_modal = false"
    />
  </div>
</template>
<script>
import SystemBar from "./SystemBar.vue";
import TopBar from "./TopBar.vue";
import ListView from "./ListView.vue";
import Chats from "./Chats.vue";
import ProjectView from "./ProjectView.vue";
import CaptureView from "./components/capture/CaptureView.vue";
import EditMedia from "./components/modals/EditMedia.vue";
import CreateQRModal from "./components/modals/CreateQRModal.vue";
import Publications from "./Publications.vue";
import Publication from "./Publication.vue";
import { Splitpanes, Pane } from "splitpanes";

import MediaContent from "./components/subcomponents/MediaContent.vue";

export default {
  props: {},
  components: {
    SystemBar,
    TopBar,
    ListView,
    Chats,
    ProjectView,
    CaptureView,
    EditMedia,
    CreateQRModal,
    Publications,
    Publication,
    Splitpanes,
    Pane,

    MediaContent,
  },
  data() {
    return {
      panels_width: {
        doPane: 100,
        docPane: 0,
        chatPane: 0,
      },
    };
  },
  created() {
    // this.$eventHub.$on("socketio.chats.media_listed", this.newChatPosted);
    this.$eventHub.$on("resizePanels", this.resize);

    if (this.$root.state.local_options.force_login) {
      // this.panels_width.chatPane = 30;
      // this.panels_width.doPane = 70;
    }
  },
  mounted() {},
  beforeDestroy() {
    // this.$eventHub.$off("socketio.chats.media_listed", this.newChatPosted);
    this.$eventHub.$off("resizePanels", this.resize);
  },
  watch: {
    panels_width: {
      handler() {
        if (
          this.panels_width.docPane > 0.01 &&
          !this.$root.settings.show_publi_panel
        ) {
          this.$root.openPubliPanel();
        } else if (
          this.panels_width.docPane <= 0.01 &&
          this.$root.settings.show_publi_panel
        ) {
          this.$root.closePubliPanel();
        }

        if (
          this.panels_width.chatPane > 0.01 &&
          !this.$root.settings.show_chat_panel
        ) {
          this.$root.openChatPanel();
        } else if (
          this.panels_width.chatPane <= 0.01 &&
          this.$root.settings.show_chat_panel
        ) {
          this.$root.closeChatPanel();
        }
      },
      deep: true,
    },
  },
  computed: {
    activitiesPanel_is_large() {
      if (
        (this.panels_width.doPane / 100) * this.$root.settings.windowWidth <
        850
      )
        return false;

      if (this.$root.settings.windowHeight < 650) return false;

      return true;
    },
    publiPanel_is_large() {
      if (
        (this.panels_width.docPane / 100) * this.$root.settings.windowWidth <
        850
      )
        return false;

      if (this.$root.settings.windowHeight < 650) return false;

      return true;
    },
  },
  methods: {
    resize($event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • App: splitpanes resize`);

      this.panels_width.doPane = $event[0].size;
      this.panels_width.docPane = $event[1].size;
      this.panels_width.chatPane = $event[2].size;
    },
    resized($event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • App: splitpanes resized`);

      this.resize();

      if (this.panels_width.docPane >= 95) {
        this.panels_width.docPane = 100;
        this.panels_width.doPane = 0;
        this.panels_width.chatPane = 0;
      }
      this.$eventHub.$emit(`activity_panels_resized`);
    },
    splitterClicked(e) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • App: splitpanes splitterClicked with e.index = ${e.index}`
        );

      if (e.index === 1) {
        if (this.panels_width.docPane <= 0.01) {
          if (this.panels_width.chatPane <= 0.01) this.panels_width.doPane = 50;
          else {
            this.panels_width.chatPane = 25;
            this.panels_width.doPane = 25;
          }
          this.panels_width.docPane = 50;
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
    closeChat() {
      this.panels_width.chatPane = 0;
      this.$root.closeChatPanel();
    },
    newChatPosted(m) {
      // const chatroom =
      const type = Object.keys(m)[0];
      const content = Object.values(m)[0];

      const chat_name = Object.values(content)[0].name;

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log(
          this.$t("notifications.new_chat_posted_in") +
            "<b>" +
            chat_name +
            "</b>"
        );
    },
  },
};
</script>
<style lang="scss" scoped>
._close_button {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10000;
  margin: 0;
  padding: 0;
  img {
    width: 1.5em;
    height: 1.5em;
  }
}
</style>
