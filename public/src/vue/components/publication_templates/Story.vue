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
          <InsertMediaButton
            @addMedia="
              (values) =>
                addMedia({ values, right_after_meta: media.metaFileName })
            "
          />

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
                :disabled="index === 0"
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
                class="m_storyPublication--media--moveItemButton--options"
                @click="show_media_options = media.metaFileName"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  width="4px"
                  height="16.2px"
                  viewBox="0 0 4 16.2"
                  style="enable-background: new 0 0 4 16.2;"
                  xml:space="preserve"
                >
                  <path
                    style="fill: currentColor;"
                    d="M0,14.1c0,1.1,0.9,2,2,2s2-0.9,2-2s-0.9-2-2-2S0,13,0,14.1z M0,2c0,1.1,0.9,2,2,2s2-0.9,2-2S3.1,0,2,0
	S0,0.9,0,2z M0,8.1c0,1.1,0.9,2,2,2s2-0.9,2-2s-0.9-2-2-2S0,7,0,8.1z"
                  />
                </svg>
              </button>

              <button
                type="button"
                class="m_storyPublication--media--moveItemButton--after"
                :disabled="index >= medias_in_order.length - 1"
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
import InsertMediaButton from "../subcomponents/InsertMediaButton.vue";

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
  },
};
</script>
<style></style>
