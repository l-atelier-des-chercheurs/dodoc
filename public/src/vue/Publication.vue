<template>
  <div>
    <PagePublication
      v-if="publication.template === 'page_by_page'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :paged_medias="paged_medias"
      :read_only="read_only"
      @addMedia="addMedia"
    />
    <Story
      v-if="publication.template === 'story'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias_in_order="medias_in_order"
      :read_only="read_only"
      :can_edit_publi="can_edit_publi"
      :can_see_publi="can_see_publi"
      @removePubliMedia="orderedRemovePubliMedia"
      @editPubliMedia="editPubliMedia"
      @changeMediaOrder="changeMediaOrder"
      @addMedia="addMediaOrdered"
    />
    <VideoPublication
      v-else-if="publication.template === 'video_assemblage'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias_in_order="medias_in_order"
      :read_only="read_only"
      @removePubliMedia="orderedRemovePubliMedia"
      @editPubliMedia="editPubliMedia"
      @changeMediaOrder="changeMediaOrder"
      @addMedia="addMediaOrdered"
    />
    <VideoEffects
      v-else-if="publication.template === 'video_effects'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias_in_order="medias_in_order"
      :read_only="read_only"
      @removePubliMedia="orderedRemovePubliMedia"
      @editPubliMedia="editPubliMedia"
      @editPubliFolder="editPubliFolder"
      @addMedia="addMediaOrdered"
    />

    <DrawingPad
      v-else-if="publication.template === 'drawing_pad'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :layered_medias="layered_medias"
      :read_only="read_only"
      @addMedia="addMedia"
    />

    <StopmotionAnimation
      v-else-if="publication.template === 'stopmotion_animation'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias_in_order="medias_in_order"
      :read_only="read_only"
      @removePubliMedia="orderedRemovePubliMedia"
      @editPubliMedia="editPubliMedia"
      @editPubliFolder="editPubliFolder"
      @addMedia="addMediaOrdered"
    />

    <MixAudioAndVideo
      v-else-if="publication.template === 'mix_audio_and_video'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias_in_order="medias_in_order"
      :read_only="read_only"
      @removePubliMedia="orderedRemovePubliMedia"
      @editPubliMedia="editPubliMedia"
      @editPubliFolder="editPubliFolder"
      @addMedia="addMediaOrdered"
    />

    <MixAudioAndImage
      v-else-if="publication.template === 'mix_audio_and_image'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias_in_order="medias_in_order"
      :read_only="read_only"
      @removePubliMedia="orderedRemovePubliMedia"
      @editPubliMedia="editPubliMedia"
      @editPubliFolder="editPubliFolder"
      @addMedia="addMediaOrdered"
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
  </div>
</template>
<script>
import PagePublication from "./components/publication_templates/PagePublication.vue";
import Story from "./components/publication_templates/Story.vue";
import VideoPublication from "./components/publication_templates/VideoPublication.vue";
import DrawingPad from "./components/publication_templates/DrawingPad.vue";
import VideoEffects from "./components/publication_templates/VideoEffects.vue";
import StopmotionAnimation from "./components/publication_templates/StopmotionAnimation.vue";
import MixAudioAndVideo from "./components/publication_templates/MixAudioAndVideo.vue";
import MixAudioAndImage from "./components/publication_templates/MixAudioAndImage.vue";
// import Carreau from "./components/publication_templates/Carreau.vue";

export default {
  props: {
    publication: Object,
    read_only: Boolean,
  },
  components: {
    PagePublication,
    Story,
    VideoPublication,
    VideoEffects,
    DrawingPad,
    StopmotionAnimation,
    MixAudioAndVideo,
    MixAudioAndImage,
  },
  data() {
    return {
      medias: [],
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );

    this.updateMediasPubli();
  },
  beforeDestroy() {
    this.$eventHub.$off(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );
  },
  watch: {
    "publication.medias": function () {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`WATCH • Publication: publication.medias`);
      }
      this.updateMediasPubli();
    },
    "$root.store.projects": {
      handler() {
        if (this.$root.state.dev_mode === "debug") {
          console.log(`WATCH • Publication: $root.store.projects`);
        }
        this.updateMediasPubli();
      },
      deep: true,
    },
  },
  computed: {
    slugPubliName() {
      return this.publication.slugFolderName;
    },
    paged_medias() {
      return this.$_.groupBy(this.medias, "page_id");
    },
    layered_medias() {
      return this.$_.groupBy(this.medias, "layer_id");
    },
    medias_slugs() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`Publication • COMPUTED: medias`);

      if (
        !this.publication.hasOwnProperty("medias") ||
        Object.keys(this.publication.medias).length === 0
      )
        return [];
    },
    medias_in_order() {
      if (this.medias.length === 0) return [];

      if (
        !Array.isArray(this.publication.medias_slugs) ||
        this.publication.medias_slugs.length === 0
      ) {
        return [];
      }

      const medias_in_order = this.publication.medias_slugs.reduce(
        (acc, item) => {
          const media = this.medias.find(
            (m) => m.metaFileName === item.slugMediaName
          );
          if (media) acc.push(media);
          return acc;
        },
        []
      );
      return medias_in_order;
    },
    can_edit_publi() {
      return this.$root.canEditFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
    can_see_publi() {
      return this.$root.canSeeFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
  },
  methods: {
    updateMediasPubli() {
      // not using a computed prop here to prevent a loop with actually missing medias
      // triggering listspecificmedias over and over

      if (this.$root.state.dev_mode === "debug")
        console.log(`Publication • COMPUTED: medias`);

      let medias = [];

      if (
        !this.publication.hasOwnProperty("medias") ||
        Object.keys(this.publication.medias).length === 0
      )
        return medias;

      let missingMedias = [];

      medias = Object.values(this.publication.medias).reduce(
        (acc, publi_media) => {
          let media = {};
          media = JSON.parse(JSON.stringify(publi_media));

          if (
            publi_media.hasOwnProperty("slugProjectName") &&
            publi_media.hasOwnProperty("slugMediaName")
          ) {
            const original_media_meta = this.$root.getOriginalMediaMeta(
              publi_media
            );

            // case of missing project media locally
            if (!original_media_meta) {
              media._linked_media = {
                _isAbsent: true,
                slugProjectName: publi_media.slugProjectName,
                slugMediaName: publi_media.slugMediaName,
              };
              acc.push(media);
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
            media._linked_media = original_media_meta;
            media._linked_media.slugProjectName = publi_media.slugProjectName;
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

      this.medias = medias;
    },

    addMediaOrdered({ values = {}, right_after_meta = false }) {
      return new Promise((resolve, reject) => {
        this.addMedia({ values }).then((mdata) => {
          const medias_slugs =
            !Array.isArray(this.publication.medias_slugs) ||
            this.publication.medias_slugs.length === 0
              ? []
              : JSON.parse(JSON.stringify(this.publication.medias_slugs));

          if (right_after_meta) {
            // this is much more complex than it could be because of possible missing medias
            // in medias_slugs_in_order: medias that were added and then removed or part
            // of a removed project
            const index = medias_slugs.findIndex(
              (s) => s.slugMediaName === right_after_meta
            );
            medias_slugs.splice(index, 0, {
              slugMediaName: mdata.metaFileName,
            });
          } else {
            medias_slugs.push({
              slugMediaName: mdata.metaFileName,
            });
          }
          this.$root
            .editFolder({
              type: "publications",
              slugFolderName: this.slugPubliName,
              data: {
                medias_slugs: medias_slugs,
              },
            })
            .then((fdata) => {
              this.$eventHub.$emit("publication.justAddedMedia", mdata);
            });
        });
      });
    },

    addMedia({ values = {} }) {
      return new Promise((resolve, reject) => {
        if (this.$root.state.dev_mode === "debug")
          console.log(`METHODS • Publication: addMedia with
        values = ${JSON.stringify(values)}`);

        let additionalMeta = {};

        if (values && values.metaFileName) {
          additionalMeta.desired_filename = values.metaFileName;
          additionalMeta.slugMediaName = values.metaFileName;
        }

        if (values) Object.assign(additionalMeta, values);

        this.$root
          .createMedia({
            slugFolderName: this.slugPubliName,
            type: "publications",
            additionalMeta,
          })
          .then((mdata) => {
            return resolve(mdata);
          });
      });
    },

    orderedRemovePubliMedia({ metaFileName }) {
      const medias_slugs = this.publication.medias_slugs.filter(
        (m) => m.slugMediaName !== metaFileName
      );
      this.$root
        .editFolder({
          type: "publications",
          slugFolderName: this.slugPubliName,
          data: {
            medias_slugs,
          },
        })
        .then(() => {
          this.$root.removeMedia({
            type: "publications",
            slugFolderName: this.slugPubliName,
            slugMediaName: metaFileName,
          });
        });
    },
    editPubliMedia({ metaFileName, val }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • Publication: editPubliMedia / args = ${JSON.stringify(
            arguments[0],
            null,
            4
          )}`
        );

      this.$root.editMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName: metaFileName,
        data: val,
      });
    },
    editPubliFolder({ val }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • Publication: editPubliMedia / args = ${JSON.stringify(
            arguments[0],
            null,
            4
          )}`
        );

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: val,
      });
    },
    changeMediaOrder({ metaFileName, dir }) {
      // find index in medias_slugs_in_order
      const current_index_in_slugs = this.publication.medias_slugs.findIndex(
        (m) => m.slugMediaName === metaFileName
      );

      const current_media_index = this.medias_in_order.findIndex(
        (m) => m.metaFileName === metaFileName
      );
      const adjacent_media_meta = this.medias_in_order[
        current_media_index + dir
      ].metaFileName;

      const new_index_in_slugs = this.publication.medias_slugs.findIndex(
        (m) => m.slugMediaName === adjacent_media_meta
      );

      const medias_slugs = JSON.parse(
        JSON.stringify(this.publication.medias_slugs)
      );

      medias_slugs.move(current_index_in_slugs, new_index_in_slugs);

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          medias_slugs,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
