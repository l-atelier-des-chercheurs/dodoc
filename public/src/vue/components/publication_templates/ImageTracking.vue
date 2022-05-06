<template>
  <div
    class="m_publicationview"
    :class="{ 'is--preview': preview_mode }"
    ref="panel"
  >
    <template v-if="!preview_mode">
      <PublicationHeader
        :slugPubliName="slugPubliName"
        :publication="publication"
        :medias="paged_medias"
        @export="show_export_modal = true"
        @close="$root.closePublication"
      />
    </template>

    <ExportImageTrackingPubliModal
      v-if="show_export_modal"
      :publication="publication"
      :all_targets="all_targets"
      :current_mind="current_mind"
      :slugPubliName="slugPubliName"
      @close="show_export_modal = false"
    />

    <PublicationDisplayButtons
      :preview_mode="preview_mode"
      @togglePreviewMode="$emit('togglePreviewMode')"
    />

    <template v-if="!preview_mode">
      <div class="margin-medium" v-if="ar_blocks.length === 0">
        <p>
          <small class="c-blanc" v-html="$t('add_multiple_images')" />
        </p>
      </div>
      <div v-else class="m_imageTracking">
        <div
          v-for="(ar_block, index) in ar_blocks"
          :key="ar_block.id"
          class="m_imageTracking--block"
        >
          <label class="_index">{{ index + 1 }}</label>
          <div v-if="!ar_block.target && !ar_block.results">
            <div class="padding-verysmall">
              <small class="">
                Commencez par ajouter l’image cible, celle qui déclenchera
                l’affichage d’une ou plusieurs autres images, une vidéo et/ou un
                son.
              </small>
            </div>
            <button
              type="button"
              class="buttonLink"
              v-if="can_edit_publi"
              :key="'create_page'"
              @click="removeBlock(ar_block.id)"
            >
              {{ $t("remove") }}
            </button>
          </div>

          <div class="_targetResultGroup" v-else>
            <div>
              <label>
                {{ $t("target_image") }}
              </label>
              <MediaMontagePublication
                v-if="ar_block.target"
                :media="ar_block.target"
                :preview_mode="false"
                :read_only="read_only"
                @removePubliMedia="
                  removeFromBlock({
                    id: ar_block.id,
                    media_types: ['target'],
                  })
                "
                @editPubliMedia="$emit('editPubliMedia', $event)"
                @duplicateMedia="$emit('duplicateMedia', $event)"
              />
            </div>
            <img
              class="_targetResultGroup--arrow"
              src="/images/i_arrow_right.svg"
              draggable="false"
            />
            <div>
              <label>
                {{ $t("image_shown") }}
              </label>
              <template v-if="ar_block.results">
                <MediaMontagePublication
                  v-for="result in ar_block.results"
                  :key="result.metaFileName"
                  :media="result"
                  :preview_mode="false"
                  :read_only="read_only"
                  @removePubliMedia="$emit('removePubliMedia', $event)"
                  @editPubliMedia="$emit('editPubliMedia', $event)"
                  @duplicateMedia="$emit('duplicateMedia', $event)"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="_createBlock">
        <button
          type="button"
          class=""
          v-if="can_edit_publi"
          :key="'create_page'"
          @click="
            insertPageAtIndex(
              publication.pages ? publication.pages.length + 1 : 0
            )
          "
        >
          {{ $t("create_block") }}
        </button>
      </div>
    </template>
    <template v-else-if="paged_medias && Object.keys(paged_medias).length > 0">
      <ImageTrackingModule
        :ar_blocks="ar_blocks"
        :mind="current_mind"
        :slugPubliName="slugPubliName"
      />
    </template>
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import PublicationDisplayButtons from "../subcomponents/PublicationDisplayButtons.vue";
import MediaMontagePublication from "../subcomponents/MediaMontagePublication.vue";
import ExportImageTrackingPubliModal from "../modals/ExportImageTrackingPubliModal.vue";
import ImageTrackingModule from "./subcomponents/ImageTrackingModule.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    paged_medias: Object,
    read_only: Boolean,
    can_edit_publi: Boolean,
    can_see_publi: Boolean,
    preview_mode: Boolean,
  },
  components: {
    PublicationHeader,
    PublicationDisplayButtons,
    MediaMontagePublication,
    ExportImageTrackingPubliModal,
    ImageTrackingModule,
  },
  data() {
    return {
      show_export_modal: false,
    };
  },
  created() {},
  mounted() {
    this.$root.settings.current_publication.accepted_media_type = [
      "image",
      "video",
      "audio",
    ];
    this.$eventHub.$on("publication.addMedia", this.addMedia);
  },
  beforeDestroy() {
    this.$root.settings.current_publication.accepted_media_type = [];
    this.$eventHub.$off("publication.addMedia", this.addMedia);
  },
  watch: {},
  computed: {
    ar_blocks() {
      if (
        !this.publication.hasOwnProperty("pages") ||
        this.publication.pages.length === 0
      ) {
        return [];
      }

      // make block with page_id, target, mind, results
      return this.publication.pages.reduce((acc, pages) => {
        let obj = {
          id: pages.id,
        };

        const medias = this.paged_medias[pages.id];
        if (medias)
          medias.map((m) => {
            if (m.is_ar_target) obj.target = m;
            else {
              if (!obj.results) obj.results = [];
              obj.results.push(m);
            }
          });

        acc.push(obj);
        return acc;
      }, []);
    },
    all_targets() {
      return this.ar_blocks.reduce((acc, ab) => {
        if (ab.target) acc.push(ab.target);
        return acc;
      }, []);
    },
    current_mind() {
      const targets_metafilename = this.all_targets.map((m) => m.metaFileName);
      const mind = Object.values(this.publication.medias).find(
        (m) =>
          m.hasOwnProperty("is_mind_for") &&
          m.is_mind_for === targets_metafilename.join("/")
      );
      return mind;
    },
  },
  methods: {
    addMedia({ values }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`PagePublication • METHODS: addMedia`);

      const last_block = this.ar_blocks[this.ar_blocks.length - 1];
      values.page_id = last_block.id;

      if (!last_block.target) values.is_ar_target = true;

      this.$emit("addMedia", { values });
    },

    generateID() {
      return (
        +new Date() +
        "_" +
        (Math.random().toString(36) + "00000000000000000").slice(2, 3)
      );
    },
    insertPageAtIndex(index) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • Publication: insertPageAtIndex ${index}`);

      // insert page in page array
      let pages = [];
      if (
        this.publication.hasOwnProperty("pages") &&
        this.publication.pages.length > 0
      ) {
        pages = this.publication.pages.slice();
      }

      pages.splice(index, 0, {
        id: this.generateID(),
      });

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          pages,
        },
      });
    },
    removeBlock(id) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • Publication: imagetracking removeBlock id = ${id}`
        );

      this.removeFromBlock({ id, media_types: ["target", "result"] });

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          pages: this.publication.pages.filter((p) => p.id !== id),
        },
      });
    },
    removeFromBlock({ id, media_types }) {
      const block = this.ar_blocks.find((b) => b.id === id);

      // target and result
      media_types.map((mt) => {
        if (block[mt])
          this.$emit("removePubliMedia", {
            metaFileName: block[mt].metaFileName,
          });
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.m_publicationview {
  display: block;
}

._targetResultGroup {
  display: flex;
  flex-flow: row nowrap;
  padding: 0 calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);

  > * {
    flex: 1 1 0;
  }

  ._targetResultGroup--arrow {
    flex: 0 0 4em;
    width: 4em;
  }
}

._index {
  position: absolute;
  right: 100%;
  padding: calc(var(--spacing) / 4);
  color: black;
}

._createBlock {
  display: flex;
  justify-content: center;
  margin: calc(var(--spacing));
}
</style>
