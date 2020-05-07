<template>
  <div
    class="m_publicationview"
    :class="{ 'is--preview': preview_mode }"
    ref="panel"
  >
    <PublicationHeader
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias="medias_in_order"
      @export="show_export_modal = true"
      @close="$root.closePublication"
    />

    <ExportVideoPubliModal
      v-if="show_export_modal"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :instructions="$t('export_video_instructions')"
    />

    <div class="m_storyPublication">
      <transition-group name="list-complete" :duration="300">
        <div
          v-for="(media, index) in medias_in_order"
          :key="media.metaFileName"
        >
          <div class="m_storyPublication--media" :data-type="media.type">
            <MediaStory
              :media="media"
              :preview_mode="preview_mode"
              :read_only="read_only"
            />

            <div class="m_storyPublication--media--moveItemButtons">
              <button
                type="button"
                class="m_storyPublication--media--moveItemButton--before"
                v-show="index > 0"
                @click="
                  $emit('changeMediaOrder', {
                    metaFileName: media.metaFileName,
                    dir: -1,
                  })
                "
              >
                <img src="/images/i_arrow_left.svg" draggable="false" />
              </button>
              <button
                type="button"
                class="m_storyPublication--media--moveItemButton--after"
                v-show="index < medias_in_order.length - 1"
                @click="
                  $emit('changeMediaOrder', {
                    metaFileName: media.metaFileName,
                    dir: +1,
                  })
                "
              >
                <img src="/images/i_arrow_right.svg" draggable="false" />
              </button>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import MediaStory from "../subcomponents/MediaStory.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    medias_in_order: Array,
    read_only: Boolean,
  },
  components: {
    PublicationHeader,
    MediaStory,
  },
  data() {
    return {
      show_export_modal: false,
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
  },
};
</script>
<style></style>
