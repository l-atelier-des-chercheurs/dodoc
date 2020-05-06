<template>
  <div>
    <PagePublication
      v-if="publication.template === 'page_by_page'"
      :slugPubliName="publication.slugFolderName"
      :publication="publication"
      :medias="medias"
      :read_only="read_only"
    />
    <!-- <Carreau
      v-if="
        $root.settings.current_publication.slug !== false &&
        $root.store.publications[$root.settings.current_publication.slug]
          .template === 'carreau'
      "
      :slugPubliName="$root.settings.current_publication.slug"
      :publication="
        $root.store.publications[$root.settings.current_publication.slug]
      "
      :read_only="!$root.state.connected"
    /> -->

    <!--

    <VideoEffects
      v-else-if="
        $root.store.publications[$root.settings.current_publication.slug]
          .template === 'video_effects'
      "
      :slugPubliName="$root.settings.current_publication.slug"
      :publication="
        $root.store.publications[$root.settings.current_publication.slug]
      "
      :read_only="!$root.state.connected"
    />

    <DrawingPad
      v-else-if="
        $root.store.publications[$root.settings.current_publication.slug]
          .template === 'drawing_pad'
      "
      :slugPubliName="$root.settings.current_publication.slug"
      :publication="
        $root.store.publications[$root.settings.current_publication.slug]
      "
      :read_only="!$root.state.connected"
    />
    <StopmotionAnimation
      v-else-if="
        $root.store.publications[$root.settings.current_publication.slug]
          .template === 'stopmotion_animation'
      "
      :slugPubliName="$root.settings.current_publication.slug"
      :publication="
        $root.store.publications[$root.settings.current_publication.slug]
      "
      :read_only="!$root.state.connected"
    />
    <MixAudioAndVideo
      v-else-if="
        $root.store.publications[$root.settings.current_publication.slug]
          .template === 'mix_audio_and_video'
      "
      :slugPubliName="$root.settings.current_publication.slug"
      :publication="
        $root.store.publications[$root.settings.current_publication.slug]
      "
      :read_only="!$root.state.connected"
    />
    <MixAudioAndImage
      v-else-if="
        $root.store.publications[$root.settings.current_publication.slug]
          .template === 'mix_audio_and_image'
      "
      :slugPubliName="$root.settings.current_publication.slug"
      :publication="
        $root.store.publications[$root.settings.current_publication.slug]
      "
      :read_only="!$root.state.connected"
    />
    <VideoPublication
      :slugPubliName="$root.settings.current_publication.slug"
      :publication="
        $root.store.publications[$root.settings.current_publication.slug]
      "
      :read_only="!$root.state.connected"
    /> -->
  </div>
</template>
<script>
import PagePublication from "./components/publication_templates/PagePublication.vue";
import VideoPublication from "./components/publication_templates/VideoPublication.vue";
import Carreau from "./components/publication_templates/Carreau.vue";
import DrawingPad from "./components/publication_templates/DrawingPad.vue";
import VideoEffects from "./components/publication_templates/VideoEffects.vue";
import StopmotionAnimation from "./components/publication_templates/StopmotionAnimation.vue";
import MixAudioAndVideo from "./components/publication_templates/MixAudioAndVideo.vue";
import MixAudioAndImage from "./components/publication_templates/MixAudioAndImage.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    read_only: Boolean,
  },
  components: {
    PagePublication,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    medias() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`Publication • COMPUTED: medias`);

      if (
        !this.publication.hasOwnProperty("medias") ||
        Object.keys(this.publication.medias).length === 0
      )
        return [];

      let missingMedias = [];

      const medias = Object.values(this.publication.medias).reduce(
        (acc, publi_media) => {
          let media = {};
          media = JSON.parse(JSON.stringify(publi_media));

          if (
            publi_media.hasOwnProperty("slugProjectName") &&
            publi_media.hasOwnProperty("metaFileName")
          ) {
            const original_media_meta = this.$root.getOriginalMediaMeta(
              publi_media
            );

            // case of missing project media locally
            if (!original_media_meta) {
              media.is_missing = true;
              return acc;
            }

            if (Object.keys(original_media_meta).length === 0) {
              console.log(`Some medias missing from client`);
              missingMedias.push({
                slugFolderName: publi_media.slugProjectName,
                metaFileName: publi_media.slugMediaName,
              });
              return acc;
            }
            media.linked_media = original_media_meta;
            media.linked_media.slugProjectName = publi_media.slugProjectName;
          }

          acc.push(media);
          return acc;
        },
        []
      );

      console.log(
        `Finished building media list. Missing medias: ${missingMedias.length}`
      );

      // send list of medias to get
      if (missingMedias.length > 0) {
        this.$root.listSpecificMedias({
          type: "projects",
          medias_list: missingMedias,
        });
      }

      return medias;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
