<template>
  <div
    class="m_publicationview"
    :class="{ 'is--preview': preview_mode, 'is--fullscreen': fullscreen_mode }"
    ref="panel"
    @mousedown.self="$root.settings.current_publication.selected_medias = []"
    @touchstart.self="$root.settings.current_publication.selected_medias = []"
  >
    <ExportPagePubli
      v-if="show_export_modal"
      :publication="publication"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
    />

    <PublicationDisplayButtons
      :preview_mode="preview_mode"
      :fullscreen_mode="fullscreen_mode"
      @togglePreviewMode="$emit('togglePreviewMode')"
      @toggleFullScreen="toggleFullscreen"
    />

    <div
      class="m_storyPublication"
      ref="publi"
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

        <div class="_story_insert_placeholders">
          <InsertMediaButton
            v-if="can_edit_publi && !read_only && !preview_mode"
            :is_collapsed="
              !(
                !Array.isArray(publication.medias_slugs) ||
                publication.medias_slugs.length === 0
              )
            "
            :is_currently_active="(index_currently_visible === 0)"
            :slugPubliName="slugPubliName"
            :publi_is_model="publication.is_model"
            :read_only="read_only"
            @addMedia="(values) => addMedia({ values, in_position: 'start' })"
            @insertMedias="
              ({ metaFileNames }) =>
                $emit('insertMediasInList', {
                  metaFileNames,
                  in_position: 'start',
                })
            "
          />
        </div>

        <transition-group tag="div" name="StoryModules" appear :duration="700">
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
            <div
              class="_story_insert_placeholders"
              :key="`insert_${media.metaFileName}`"
            >
              <InsertMediaButton
                v-if="can_edit_publi && !read_only && !preview_mode"
                :slugPubliName="slugPubliName"
                :is_currently_active="(index_currently_visible === index + 1)"
                :publi_is_model="publication.is_model"
                :read_only="read_only"
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
import PublicationDisplayButtons from "../subcomponents/PublicationDisplayButtons.vue";
import ExportPagePubli from "../modals/ExportPagePubli.vue";
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
    preview_mode: Boolean,
  },
  components: {
    PublicationHeader,
    PublicationDisplayButtons,
    ExportPagePubli,
    MediaStory,
    InsertMediaButton,
  },
  data() {
    return {
      show_export_modal: false,
      show_media_options: false,
      fullscreen_mode: false,
      current_scroll: 0,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("publication.addMedia", this.addMediaAtIndex);
    this.$root.settings.current_publication.accepted_media_type = [
      "image",
      "video",
      "audio",
      "text",
      "stl",
      "document",
      "other",
    ];

    const getCurrentScroll = () => {
      if (
        this.$refs.publi &&
        this.current_scroll !== this.$refs.publi.scrollTop
      )
        this.current_scroll = this.$refs.publi.scrollTop;
      setTimeout(getCurrentScroll, 400);
    };
    getCurrentScroll();
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.addMedia", this.addMediaAtIndex);
    this.$root.settings.current_publication.accepted_media_type = [];
  },
  watch: {},
  computed: {
    index_currently_visible() {
      this.current_scroll;
      if (!this.$refs.publi) return -1;

      const insertMediaButtons = this.$refs.publi.querySelectorAll(
        ".m_insertMediaButton"
      );
      let index = 0;
      for (const insert of insertMediaButtons) {
        // loop until we get insert.offsetTop > this.current_scroll;
        if (insert.offsetTop > this.current_scroll + 80) break;

        index++;
      }
      return index;
    },
  },
  methods: {
    toggleTransition({ position, metaFileName }) {
      console.log(
        `METHODS • VideoPublication: toggleTransition for metaFileName = ${metaFileName} and position = ${position}`
      );
      this.$emit("editPubliMedia", { metaFileName, val });
    },
    addMediaAtIndex(d) {
      if (
        this.index_currently_visible >= 0 &&
        this.index_currently_visible <= this.medias_in_order.length
      ) {
        d.right_after_meta = this.medias_in_order[
          this.index_currently_visible - 1
        ].metaFileName;
      }
      this.addMedia(d);
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
<style>
@page {
  margin: 5cm;
}
</style>
