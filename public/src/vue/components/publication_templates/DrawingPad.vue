<template>
  <div
    class="m_publicationview"
    :class="{ 'is--preview': preview_mode }"
    ref="panel"
  >
    <PublicationHeader
      :slugPubliName="slugPubliName"
      :publication="publication"
      :publication_medias="publication_medias"
      @export="show_export_modal = true"
    />

    <!-- <pre>{{ publication_medias }}</pre> -->

    <div class="m_drawingPad">
      <PagePublicationSinglePage
        :mode="'export'"
        :preview_mode="false"
        :slugPubliName="slugPubliName"
        :page="page"
        :publication_medias="publication_medias"
        :read_only="read_only"
        :pixelsPerMillimeters="1"
        :zoom="1"
      />
      <PadSurface />
    </div>
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import PadSurface from "../subcomponents/PadSurface.vue";
import PagePublicationSinglePage from "./PagePublicationSinglePage.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    read_only: Boolean
  },
  components: {
    PublicationHeader,
    PadSurface,
    PagePublicationSinglePage
  },
  data() {
    return {
      show_export_modal: false,
      publication_medias: [],
      accepted_media_type: ["audio", "video"]
    };
  },
  created() {},
  mounted() {
    this.$root.settings.current_publication.accepted_media_type = [
      "image",
      "video",
      "audio",
      "text",
      "document",
      "other"
    ];

    this.$eventHub.$on("publication.addMedia", this.addMedia);
    this.$eventHub.$on(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );

    this.updateMediasPubli();
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.addMedia", this.addMedia);
    this.$eventHub.$off(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );

    this.$root.settings.current_publication.accepted_media_type = [];
  },
  watch: {
    "publication.medias": function() {
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
      deep: true
    }
  },
  computed: {
    page() {
      return {
        margin_left: 0,
        margin_right: 0,
        margin_top: 0,
        margin_bottom: 0,
        width: 1024,
        height: 768
      };
    }
  },
  methods: {
    addMedia({ slugProjectName, metaFileName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • DrawingPad: addMedia with 
        slugProjectName = ${slugProjectName} and metaFileName = ${metaFileName}`);
      }

      const desired_filename = metaFileName;

      // this.$eventHub.$on("socketio.media_created_or_updated", d => {
      //   this.$eventHub.$off("socketio.media_created_or_updated");
      // });

      this.$root.createMedia({
        slugFolderName: this.slugPubliName,
        type: "publications",
        additionalMeta: {
          slugProjectName,
          desired_filename,
          slugMediaName: metaFileName
        }
      });
    },
    removePubliMedia({ slugMediaName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • DrawingPad: removeMedia / slugMediaName = ${slugMediaName}`
        );
      }

      this.$root.removeMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName
      });
    },
    updateMediasPubli() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: updateMediasPubli`);
      }

      if (
        !this.publication.hasOwnProperty("medias") ||
        Object.keys(this.publication.medias).length === 0
      ) {
        this.publication_medias = [];
        return;
      }

      // get list of publications items
      let publi_medias = [];
      let missingMedias = [];

      Object.values(this.publication.medias).map(_media => {
        if (
          !_media.hasOwnProperty("slugProjectName") ||
          !_media.hasOwnProperty("metaFileName")
        ) {
          return;
        }

        const slugProjectName = _media.slugProjectName;
        const slugMediaName = _media.slugMediaName;

        // find in store if slugFolderName exists
        if (!this.$root.store.projects.hasOwnProperty(slugProjectName)) {
          console.error(
            `Missing project in store — not expected : ${slugProjectName}`
          );
          console.error(
            `Medias from project was probably added to the publication before it was removed altogether.`
          );
          return;
        }

        // find in store if metaFileName exists
        const project_medias = this.$root.store.projects[slugProjectName]
          .medias;
        if (!project_medias.hasOwnProperty(slugMediaName)) {
          console.log(`Some medias missing from client`);
          missingMedias.push({
            slugFolderName: slugProjectName,
            metaFileName: slugMediaName
          });
        } else {
          let meta = JSON.parse(JSON.stringify(project_medias[slugMediaName]));

          if (meta.hasOwnProperty("_isAbsent") && meta._isAbsent) {
            console.error(
              `Missing media in store — not expected : ${slugProjectName} / ${slugMediaName}`
            );
            console.error(
              `Media was probably added to the publication before it was removed.`
            );
            return;
          }

          meta.slugProjectName = slugProjectName;
          meta.publi_meta = JSON.parse(JSON.stringify(_media));

          publi_medias.push(meta);
          return;
        }
      });

      console.log(
        `Finished building media list. Missing medias: ${missingMedias.length}`
      );

      // send list of medias to get
      if (missingMedias.length > 0) {
        this.$root.listSpecificMedias({
          type: "projects",
          medias_list: missingMedias
        });
      }

      this.publication_medias = publi_medias;
    }
  }
};
</script>
<style></style>
