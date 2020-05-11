<template>
  <div
    class="m_publicationview"
    :class="{ 'is--preview': preview_mode }"
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
            <InsertMediaButton
              :key="`insert_${index}`"
              v-if="can_edit_publi && !read_only"
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
  },
};
</script>
<style></style>
