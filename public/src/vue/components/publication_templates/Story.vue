<template>
  <div
    class="m_publicationview"
    :class="{ 'is--preview': preview_mode, 'is--fullscreen': fullscreen_mode }"
    ref="panel"
    @mousedown.self="$root.settings.current_publication.selected_medias = []"
    @touchstart.self="$root.settings.current_publication.selected_medias = []"
  >
    <ExportVideoPubliModal
      v-if="show_export_modal"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :instructions="$t('export_video_instructions')"
    />

    <div
      class="m_publicationSettings"
      v-if="
        ![
          'export_publication',
          'print_publication',
          'link_publication',
        ].includes($root.state.mode)
      "
    >
      <button
        class="margin-vert-verysmall font-verysmall _preview_button"
        :class="{ 'is--active': !preview_mode }"
        @mousedown.stop.prevent="preview_mode = !preview_mode"
        @touchstart.stop.prevent="preview_mode = !preview_mode"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="144px"
          height="84px"
          viewBox="0 0 144 84"
          style="enable-background: new 0 0 144 84;"
          xml:space="preserve"
        >
          <defs />
          <g>
            <path
              d="M72,0C32.2,0,0,42,0,42s32.2,42,72,42s72-42,72-42S111.8,0,72,0z M72,71.3c-16.5,0-30-13.2-30-29.6
            c0-16.3,13.4-29.6,30-29.6c16.5,0,30,13.3,30,29.6C102,58,88.5,71.3,72,71.3z"
            />
          </g>
        </svg>
      </button>
      <button
        class="margin-vert-verysmall font-verysmall"
        @mousedown.stop.prevent="toggleFullscreen"
        @touchstart.stop.prevent="toggleFullscreen"
      >
        <svg
          version="1.1"
          v-if="!fullscreen_mode"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="133.3px"
          height="133.2px"
          viewBox="0 0 133.3 133.2"
          style="enable-background: new 0 0 133.3 133.2;"
          xml:space="preserve"
        >
          <polygon
            class="st0"
            points="58.7,112.2 58.7,133.2 0,133.2 0,74.5 21,74.5 21,112.2 	"
          />
          <polygon
            class="st0"
            points="112.3,74.5 133.3,74.5 133.3,133.2 74.6,133.2 74.6,112.2 112.3,112.2 	"
          />
          <polygon
            class="st0"
            points="21,58.7 0,58.7 0,0 58.7,0 58.7,21 21,21 	"
          />
          <polygon
            class="st0"
            points="133.3,58.7 112.3,58.7 112.3,21 74.6,21 74.6,0 133.3,0 	"
          />
        </svg>
        <svg
          version="1.1"
          v-if="fullscreen_mode"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="133.3px"
          height="133.2px"
          viewBox="0 0 133.3 133.2"
          style="enable-background: new 0 0 133.3 133.2;"
          xml:space="preserve"
        >
          <polygon
            class="st0"
            points="0,95.5 0,74.5 58.7,74.5 58.7,133.2 37.7,133.2 37.7,95.5 	"
          />
          <polygon
            class="st0"
            points="95.6,133.2 74.6,133.2 74.6,74.5 133.3,74.5 133.3,95.5 95.6,95.5 	"
          />
          <polygon
            class="st0"
            points="37.7,0 58.7,0 58.7,58.7 0,58.7 0,37.7 37.7,37.7 	"
          />
          <polygon
            class="st0"
            points="74.6,0 95.6,0 95.6,37.7 133.3,37.7 133.3,58.7 74.6,58.7 	"
          />
        </svg>
      </button>
    </div>

    <div
      class="m_storyPublication"
      @mousedown.self="$root.settings.current_publication.selected_medias = []"
      @touchstart.self="$root.settings.current_publication.selected_medias = []"
    >
      <div class="m_storyPublication--content">
        <PublicationHeader
          :slugPubliName="slugPubliName"
          :publication="publication"
          :medias="medias_in_order"
          @export="show_export_modal = true"
          @close="$root.closePublication"
        />

        <InsertMediaButton
          v-if="can_edit_publi && !read_only"
          :is_collapsed="
            !(
              !Array.isArray(publication.medias_slugs) ||
              publication.medias_slugs.length === 0
            )
          "
          :slugPubliName="slugPubliName"
          @addMedia="(values) => addMedia({ values, in_position: 'start' })"
          @insertMedias="
            ({ metaFileNames }) =>
              $emit('insertMediasInList', {
                metaFileNames,
                in_position: 'start',
              })
          "
        />

        <transition-group tag="div" name="StoryModules" :duration="700">
          <template v-for="(media, index) in medias_in_order">
            <MediaStory
              :key="media.metaFileName"
              :media="media"
              :media_position="mediaPosition(index)"
              :preview_mode="preview_mode"
              :slugPubliName="slugPubliName"
              :read_only="read_only"
              @removePubliMedia="$emit('removePubliMedia', $event)"
              @changeMediaOrder="$emit('changeMediaOrder', $event)"
            />

            <!-- :is_collapsed="mediaPosition(index) !== 'last'" -->
            <div class="_story_insert_placeholders" :key="`insert_${index}`">
              <InsertMediaButton
                v-if="can_edit_publi && !read_only && !preview_mode"
                :slugPubliName="slugPubliName"
                @addMedia="
                  (values) =>
                    addMedia({ values, right_after_meta: media.metaFileName })
                "
                @insertMedias="
                  ({ metaFileNames }) =>
                    $emit('insertMediasInList', {
                      metaFileNames,
                      right_after_meta: media.metaFileName,
                    })
                "
              />
            </div>
          </template>
        </transition-group>
      </div>
    </div>
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import MediaStory from "../subcomponents/MediaStory.vue";
import InsertMediaButton from "../subcomponents/InsertMediaButton.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    medias_in_order: Array,
    can_edit_publi: Boolean,
    can_see_publi: Boolean,
    read_only: Boolean,
  },
  components: {
    PublicationHeader,
    MediaStory,
    InsertMediaButton,
  },
  data() {
    return {
      show_export_modal: false,
      show_media_options: false,
      preview_mode: false,
      fullscreen_mode: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("publication.addMedia", this.addMedia);
    this.$root.settings.current_publication.accepted_media_type = [
      "image",
      "video",
      "audio",
      "text",
      "stl",
      "document",
      "other",
    ];
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.addMedia", this.addMedia);
    this.$root.settings.current_publication.accepted_media_type = [];
  },
  watch: {},
  computed: {},
  methods: {
    toggleTransition({ position, metaFileName }) {
      console.log(
        `METHODS • VideoPublication: toggleTransition for metaFileName = ${metaFileName} and position = ${position}`
      );
      this.$emit("editPubliMedia", { metaFileName, val });
    },
    addMedia(d) {
      this.$emit("addMedia", d);
    },
    mediaPosition(index) {
      if (index === 0) return "first";
      if (index === this.medias_in_order.length - 1) return "last";
      return "";
    },
    toggleFullscreen() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • PagePublication: toggleFullscreen`);
      }
      const docElem = this.$refs.panel;
      if (this.fullscreen_mode === false) {
        if (!!docElem.requestFullscreen) {
          // W3C API
          docElem.requestFullscreen();
        } else if (!!docElem.mozRequestFullScreen) {
          // Mozilla current API
          docElem.mozRequestFullScreen();
        } else if (!!docElem.webkitRequestFullScreen) {
          // Webkit current API
          docElem.webkitRequestFullScreen();
        } // Maybe other prefixed APIs?
        this.fullscreen_mode = true;
      } else {
        if (!!document.exitFullscreen) {
          // W3C API
          document.exitFullscreen();
        } else if (!!document.mozExitFullscreen) {
          // Mozilla current API
          document.mozExitFullscreen();
        } else if (!!document.webkitExitFullscreen) {
          // Webkit current API
          document.webkitExitFullscreen();
        } // Maybe other prefixed APIs?
        this.fullscreen_mode = false;
      }
    },
  },
};
</script>
<style></style>
