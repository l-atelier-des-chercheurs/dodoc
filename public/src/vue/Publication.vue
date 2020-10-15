<template>
  <div>
    <PagePublication
      v-if="publication.template === 'page_by_page'"
      ref="panel"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :paged_medias="paged_medias"
      :read_only="read_only"
      :can_edit_publi="can_edit_publi"
      :can_see_publi="can_see_publi"
      :preview_mode="preview_mode"
      :model_for_this_publication="model_for_this_publication"
      @togglePreviewMode="preview_mode = !preview_mode"
      @editPubliMedia="editPubliMedia"
      @addMedia="addMedia"
      @lockAndPublish="lockAndPublish"
    />
    <Story
      v-if="publication.template === 'story'"
      ref="panel"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias_in_order="medias_in_order"
      :read_only="read_only"
      :can_edit_publi="can_edit_publi"
      :can_see_publi="can_see_publi"
      :preview_mode="preview_mode"
      :model_for_this_publication="model_for_this_publication"
      @removePubliMedia="orderedRemovePubliMedia"
      @editPubliMedia="editPubliMedia"
      @duplicateMedia="orderedDuplicateMedia"
      @changeMediaOrder="changeMediaOrder"
      @addMedia="addMediaOrdered"
      @insertMediasInList="insertMediasInList"
      @togglePreviewMode="preview_mode = !preview_mode"
      @lockAndPublish="lockAndPublish"
    />
    <VideoPublication
      v-else-if="publication.template === 'video_assemblage'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias_in_order="medias_in_order"
      :read_only="read_only"
      :can_edit_publi="can_edit_publi"
      :can_see_publi="can_see_publi"
      :preview_mode="preview_mode"
      @removePubliMedia="orderedRemovePubliMedia"
      @editPubliMedia="editPubliMedia"
      @duplicateMedia="orderedDuplicateMedia"
      @changeMediaOrder="changeMediaOrder"
      @addMedia="addMediaOrdered"
    />
    <VideoEffects
      v-else-if="publication.template === 'video_effects'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias_in_order="medias_in_order"
      :read_only="read_only"
      :can_edit_publi="can_edit_publi"
      :can_see_publi="can_see_publi"
      :preview_mode="preview_mode"
      @removePubliMedia="orderedRemovePubliMedia"
      @editPubliMedia="editPubliMedia"
      @editPubliFolder="editPubliFolder"
      @addMedia="addMediaOrdered"
    />

    <DrawingPad
      v-else-if="publication.template === 'drawing_pad'"
      ref="panel"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :layered_medias="layered_medias"
      :read_only="read_only"
      :can_edit_publi="can_edit_publi"
      :can_see_publi="can_see_publi"
      :preview_mode="preview_mode"
      @togglePreviewMode="preview_mode = !preview_mode"
      @editPubliMedia="editPubliMedia"
      @addMedia="addMedia"
    />

    <StopmotionAnimation
      v-else-if="publication.template === 'stopmotion_animation'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias_in_order="medias_in_order"
      :read_only="read_only"
      :can_edit_publi="can_edit_publi"
      :can_see_publi="can_see_publi"
      :preview_mode="preview_mode"
      @removePubliMedia="orderedRemovePubliMedia"
      @editPubliMedia="editPubliMedia"
      @editPubliFolder="editPubliFolder"
      @duplicateMedia="orderedDuplicateMedia"
      @changeMediaOrder="changeMediaOrder"
      @addMedia="addMediaOrdered"
    />

    <MixAudioAndVideo
      v-else-if="publication.template === 'mix_audio_and_video'"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias_in_order="medias_in_order"
      :read_only="read_only"
      :can_edit_publi="can_edit_publi"
      :can_see_publi="can_see_publi"
      :preview_mode="preview_mode"
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
      :can_edit_publi="can_edit_publi"
      :can_see_publi="can_see_publi"
      :preview_mode="preview_mode"
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
    />-->
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
      publication_model_medias: [],
      preview_mode: true,
    };
  },
  created() {},
  mounted() {
    if (this.$root.state.mode === "live") {
      this.$socketio.listFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });

      this.$socketio.listMedias({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    }
    this.$eventHub.$on(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );

    this.preview_mode = !this.can_edit_publi;

    if (
      ["export_publication", "print_publication", "link_publication"].includes(
        this.$root.state.mode
      )
    ) {
      this.preview_mode = true;
    }

    // this.preview_mode =
    //   !this.can_edit_publi || this.$root.state.mode !== "live";

    document.addEventListener("keyup", this.publicationKeyListener);
    document.addEventListener("fullscreenchange", this.handleFullscreenChange);
    this.updateMediasPubli();
  },
  beforeDestroy() {
    this.$eventHub.$off(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );

    document.removeEventListener("keyup", this.publicationKeyListener);
    document.removeEventListener(
      "fullscreenchange",
      this.handleFullscreenChange
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
    "publication.follows_model": {
      handler() {
        const model = this.model_for_this_publication;
        if (model) {
          this.$socketio.listFolder({
            type: "publications",
            slugFolderName: model.slugFolderName,
          });
          this.$socketio.listMedias({
            type: "publications",
            slugFolderName: model.slugFolderName,
          });
        }
      },
      deep: true,
      immediate: true,
    },
    model_for_this_publication: {
      handler() {
        if (this.$root.state.dev_mode === "debug")
          console.log(`WATCH • Publication: model_for_this_publication`);

        this.updateMediasPubli();
      },
      deep: true,
    },
    preview_mode: function () {
      if (!this.preview_mode && !this.can_edit_publi) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.action_not_allowed"));
        this.preview_mode = true;
        this.$eventHub.$emit("publications.showAdvancedOptions");
      } else {
        if (this.preview_mode) {
          this.$root.settings.current_publication.selected_medias = [];
        }
      }
    },
    can_edit_publi: function () {
      if (this.can_edit_publi) {
        this.preview_mode = false;
      } else {
        this.preview_mode = true;
      }
    },
  },
  computed: {
    slugPubliName() {
      return this.publication.slugFolderName;
    },
    paged_medias() {
      const publication = this.model_for_this_publication
        ? this.model_for_this_publication
        : this.publication;

      // récupérer tous les médias du modèle
      const medias = this.model_for_this_publication
        ? this.publication_model_medias
        : this.medias;

      // return this.$_.groupBy(this.medias, "page_id");

      return medias.reduce((acc, media) => {
        if (this.model_for_this_publication && media.type === "placeholder") {
          const placeholder_reply_media = this.medias.find(
            (m) => m.placeholder_meta_reference === media.metaFileName
          );
          if (placeholder_reply_media) {
            media._reply = placeholder_reply_media;

            if (
              placeholder_reply_media.hasOwnProperty(
                "placeholder_medias_slugs"
              ) &&
              Array.isArray(placeholder_reply_media.placeholder_medias_slugs)
            ) {
              const reply_medias = placeholder_reply_media.placeholder_medias_slugs.reduce(
                (acc, { slugMediaName }) => {
                  const corresponding_media = this.medias.find(
                    (m) => m.metaFileName === slugMediaName
                  );
                  if (corresponding_media) acc.push(corresponding_media);
                  return acc;
                },
                []
              );
              if (reply_medias.length > 0) {
                media._reply._medias = reply_medias;
              }
            }
          }
        }

        const page_id = media.page_id;
        if (!acc.hasOwnProperty(page_id)) acc[page_id] = [];

        acc[page_id].push(media);
        return acc;
        // si le média du modèle est un placeholder
        // chercher les médias de la réponse qui contiennent une référence au modèle
      }, {});
    },
    layered_medias() {
      return this.$_.groupBy(this.medias, "layer_id");
    },
    can_see_publi() {
      return this.$root.canSeeFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
    can_edit_publi() {
      return this.$root.canEditFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
    model_for_this_publication() {
      if (!this.publication.follows_model) return false;
      return Object.values(this.$root.store.publications).find(
        (p) =>
          this.publication.template === p.template &&
          p.is_model === true &&
          p.slugFolderName === this.publication.follows_model
      );
    },
    medias_in_order() {
      // if publi follows model, then it doesn’t use a medias_slugs field but follows the model’s medias_slugs
      const publication = this.model_for_this_publication
        ? this.model_for_this_publication
        : this.publication;

      if (
        !Array.isArray(publication.medias_slugs) ||
        publication.medias_slugs.length === 0
      ) {
        return [];
      }

      return medias_in_order = publication.medias_slugs.reduce((acc, item) => {
        const medias = this.model_for_this_publication
          ? this.publication_model_medias
          : this.medias;

        const media = medias.find((m) => m.metaFileName === item.slugMediaName);
        if (!media) return acc;

        if (this.model_for_this_publication && media.type === "placeholder") {
          const placeholder_reply_media = this.medias.find(
            (m) => m.placeholder_meta_reference === media.metaFileName
          );
          if (placeholder_reply_media) {
            media._reply = placeholder_reply_media;

            if (
              placeholder_reply_media.hasOwnProperty(
                "placeholder_medias_slugs"
              ) &&
              Array.isArray(placeholder_reply_media.placeholder_medias_slugs)
            ) {
              const reply_medias = placeholder_reply_media.placeholder_medias_slugs.reduce(
                (acc, { slugMediaName }) => {
                  const corresponding_media = this.medias.find(
                    (m) => m.metaFileName === slugMediaName
                  );
                  if (corresponding_media) acc.push(corresponding_media);
                  return acc;
                },
                []
              );
              if (reply_medias.length > 0) {
                media._reply._medias = reply_medias;
              }
            }
          }
        }

        acc.push(media);
        return acc;
      }, []);
    },
  },
  methods: {
    updateMediasPubli() {
      // not using a computed prop here to prevent a loop with actually missing medias
      // triggering listspecificmedias over and over

      if (this.$root.state.dev_mode === "debug")
        console.log(`Publication • COMPUTED: medias`);

      let { medias, missingMedias } = this.getLinkedMediasForPubli({
        publication: this.publication,
      });

      if (this.model_for_this_publication) {
        const {
          medias: publication_model_medias,
          missingMedias: publi_missingMedias,
        } = this.getLinkedMediasForPubli({
          publication: this.model_for_this_publication,
        });
        this.publication_model_medias = publication_model_medias;
        missingMedias = missingMedias.concat(publi_missingMedias);
      }

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
    getLinkedMediasForPubli({ publication }) {
      let medias = [];
      let missingMedias = [];

      if (
        !publication.hasOwnProperty("medias") ||
        Object.keys(publication.medias).length === 0
      )
        return { medias, missingMedias };

      medias = Object.values(publication.medias).reduce((acc, publi_media) => {
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
      }, []);

      return { medias, missingMedias };
    },
    addMediaOrdered({
      values = {},
      right_before_meta,
      right_after_meta,
      in_position,
    }) {
      return new Promise((resolve, reject) => {
        this.addMedia({ values }).then((mdata) =>
          this.insertMediasInList({
            metaFileNames: [mdata.metaFileName],
            right_before_meta,
            right_after_meta,
            in_position,
          })
        );
      });
    },
    insertMediasInList({
      metaFileNames,
      right_before_meta,
      right_after_meta,
      in_position,
    }) {
      return new Promise((resolve, reject) => {
        const medias_slugs =
          !Array.isArray(this.publication.medias_slugs) ||
          this.publication.medias_slugs.length === 0
            ? []
            : JSON.parse(JSON.stringify(this.publication.medias_slugs));

        const new_media_metas = metaFileNames.map((metaFileName) => {
          return {
            slugMediaName: metaFileName,
          };
        });

        let index = medias_slugs.length;

        if (right_after_meta) {
          // this is much more complex than it could be because of possible missing medias
          // in medias_slugs_in_order: medias that were added and then removed or part
          // of a removed project
          index = medias_slugs.findIndex(
            (s) => s.slugMediaName === right_after_meta
          );
          index += 1;
        } else if (right_before_meta) {
          index = medias_slugs.findIndex(
            (s) => s.slugMediaName === right_before_meta
          );
        } else if (in_position && in_position === "start") {
          index = 0;
        }

        medias_slugs.splice(index, 0, ...new_media_metas);

        this.$root
          .editFolder({
            type: "publications",
            slugFolderName: this.slugPubliName,
            data: {
              medias_slugs: medias_slugs,
            },
          })
          .then((fdata) => {
            this.$nextTick(() => {
              metaFileNames.map((metaFileName) => {
                this.$eventHub.$emit(
                  "publication.just_inserted_media",
                  metaFileName
                );
              });
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
            this.$eventHub.$emit("publication.just_added_media", mdata);
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

    orderedDuplicateMedia({ metaFileName }) {
      this.$root
        .copyMediaToFolder({
          type: "publications",
          from_slugFolderName: this.slugPubliName,
          to_slugFolderName: this.slugPubliName,
          slugMediaName: metaFileName,
        })
        .then((mdata) => {
          this.insertMediasInList({
            metaFileNames: [mdata.metaFileName],
            right_after_meta: metaFileName,
          });
        });
    },

    editPubliMedia({ metaFileName, val }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • Publication: editPubliMedia / for metaFileName = ${metaFileName} and val = ${JSON.stringify(
            val,
            null,
            4
          )}`
        );

      this.$root
        .editMedia({
          type: "publications",
          slugFolderName: this.slugPubliName,
          slugMediaName: metaFileName,
          data: val,
        })
        .then((mdata) => {
          this.$eventHub.$emit("publication.media_just_edited", mdata);
        });
    },
    editPubliFolder({ val }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • Publication: editPubliFolder / args = ${JSON.stringify(
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
    changeMediaOrder({ metaFileName, dir, new_index_in_slugs }) {
      // find index in medias_slugs_in_order
      const current_index_in_slugs = this.publication.medias_slugs.findIndex(
        (m) => m.slugMediaName === metaFileName
      );

      const current_media_index = this.medias_in_order.findIndex(
        (m) => m.metaFileName === metaFileName
      );

      if (new_index_in_slugs === undefined) {
        const adjacent_media_meta = this.medias_in_order[
          current_media_index + dir
        ].metaFileName;

        new_index_in_slugs = this.publication.medias_slugs.findIndex(
          (m) => m.slugMediaName === adjacent_media_meta
        );
      }

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

    publicationKeyListener(evt) {
      switch (evt.key) {
        case "p":
        // this.preview_mode = !this.preview_mode;
      }
    },
    lockAndPublish() {
      var now = this.$moment();

      const editing_limited_to = "nobody";
      const viewing_limited_to = this.$root.current_author
        ? "only_authors"
        : "everybody";

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          date_submitted: now,
          editing_limited_to,
          viewing_limited_to,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
