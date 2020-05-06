<template>
  <div class="m_publicationview" :class="{ 'is--preview': preview_mode }" ref="panel">
    <PublicationHeader
      :slugPubliName="slugPubliName"
      :publication="publication"
      :publication_medias="publication_medias"
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

    <div class="m_videoPublication">
      <div class="margin-medium" v-if="publication_medias.length === 0">
        <p>
          <small class="c-blanc" v-html="$t('add_multiple_videos_files')" />
        </p>
      </div>

      <transition-group name="list-complete" :duration="300">
        <div v-for="(media, index) in publication_medias" :key="media.publi_meta.metaFileName">
          <div class="switch switch-xs m_videoPublication--transitionToggle">
            <input
              class="switch"
              :id="'transition_in_' + media.publi_meta.metaFileName"
              type="checkbox"
              :checked="media.publi_meta.transition_in === 'fade'"
              @change="
                toggleTransition({
                  position: 'transition_in',
                  metaFileName: media.publi_meta.metaFileName,
                })
              "
            />
            <label :for="'transition_in_' + media.publi_meta.metaFileName">
              {{
              $t("transition_fade")
              }}
            </label>
            <button
              type="button"
              v-if="media.publi_meta.type !== 'solid_color'"
              class="m_videoPublication--addSolidColor buttonLink bg-noir"
              @click="
                addMedia({
                  type: 'solid_color',
                  right_after: media.publi_meta.metaFileName,
                })
              "
            >{{ $t("add_solid_color") }}</button>
          </div>

          <div class="m_videoPublication--media" :data-type="media.publi_meta.type">
            <MediaMontagePublication
              :media="media"
              :preview_mode="false"
              :read_only="read_only"
              :enable_image_timer="true"
              :enable_set_video_volume="true"
              @removePubliMedia="
                (values) => {
                  removePubliMedia(values);
                }
              "
              @editPubliMedia="
                (values) => {
                  editPubliMedia(values);
                }
              "
            />
            <span class="m_videoPublication--media--mediaNumber">
              {{
              index + 1
              }}
            </span>
            <div class="m_videoPublication--media--moveItemButtons">
              <button
                type="button"
                class="m_videoPublication--media--moveItemButton--before"
                v-show="index > 0"
                @click="move(media.publi_meta.metaFileName, -1)"
              >
                <img src="/images/i_arrow_left.svg" draggable="false" />
              </button>
              <button
                type="button"
                class="m_videoPublication--media--moveItemButton--after"
                v-show="index < publication_medias.length - 1"
                @click="move(media.publi_meta.metaFileName, +1)"
              >
                <img src="/images/i_arrow_right.svg" draggable="false" />
              </button>
            </div>
          </div>
          <div
            v-if="index === publication_medias.length - 1"
            class="switch switch-xs m_videoPublication--transitionToggle margin-bottom-medium"
          >
            <input
              class="switch"
              :id="'transition_out_' + media.publi_meta.metaFileName"
              type="checkbox"
              :checked="media.publi_meta.transition_out === 'fade'"
              @change="
                toggleTransition({
                  position: 'transition_out',
                  metaFileName: media.publi_meta.metaFileName,
                })
              "
            />
            <label
              :for="'transition_out_' + media.publi_meta.metaFileName"
            >{{ $t("transition_fade") }}</label>
            <button
              type="button"
              class="m_videoPublication--addSolidColor buttonLink bg-noir"
              @click="
                addMedia({
                  type: 'solid_color',
                })
              "
            >{{ $t("add_solid_color") }}</button>
          </div>
        </div>
      </transition-group>
    </div>

    <div>
      <div>
        <!-- <input type="color" ref="solidColorPicker" /> -->
      </div>
    </div>
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import MediaMontagePublication from "../subcomponents/MediaMontagePublication.vue";
import ExportVideoPubliModal from "../modals/ExportVideoPubliModal.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    read_only: Boolean
  },
  components: {
    PublicationHeader,
    MediaMontagePublication,
    ExportVideoPubliModal
  },
  data() {
    return {
      show_export_modal: false,
      publication_medias: [],
      medias_slugs_in_order: []
    };
  },
  created() {},
  mounted() {
    this.$root.settings.current_publication.accepted_media_type = [
      "video",
      "image"
    ];

    this.$eventHub.$on("publication.addMedia", this.addMedia);
    this.$eventHub.$on(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );

    if (
      this.publication.hasOwnProperty("medias_slugs") &&
      this.publication.medias_slugs.length > 0
    ) {
      this.medias_slugs_in_order = this.publication.medias_slugs;
    }

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
    },
    "publication.medias_slugs": function() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`WATCH • Publication: publication.medias_slugs`);
      }

      this.medias_slugs_in_order =
        typeof this.publication.medias_slugs === "object"
          ? this.publication.medias_slugs
          : [];
      this.updateMediasPubli();
    }
  },
  computed: {},
  methods: {
    addMedia({ slugProjectName, metaFileName, type, right_after }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: addMedia with
        slugProjectName = ${slugProjectName} and metaFileName = ${metaFileName}`);
      }

      let additionalMeta = {};

      if (slugProjectName && metaFileName) {
        additionalMeta.slugProjectName = slugProjectName;
        additionalMeta.desired_filename = metaFileName;
        additionalMeta.slugMediaName = metaFileName;
      }
      if (type) additionalMeta.type = type;

      this.$eventHub.$on("socketio.media_created_or_updated", d => {
        this.$eventHub.$off("socketio.media_created_or_updated");

        if (!!right_after) {
          // this is much more complex than it could be because of possible missing medias
          // in medias_slugs_in_order: medias that were added and then removed or part
          // of a removed project
          const index = this.medias_slugs_in_order.findIndex(
            s => s.slugMediaName === right_after
          );
          this.medias_slugs_in_order.splice(index, 0, {
            slugMediaName: d.metaFileName
          });
        } else {
          this.medias_slugs_in_order.push({
            slugMediaName: d.metaFileName
          });
        }

        this.$root.editFolder({
          type: "publications",
          slugFolderName: this.slugPubliName,
          data: {
            medias_slugs: this.medias_slugs_in_order
          }
        });
      });

      this.$root.createMedia({
        slugFolderName: this.slugPubliName,
        type: "publications",
        additionalMeta
      });
    },
    removePubliMedia({ slugMediaName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • Publication: removeMedia / slugMediaName = ${slugMediaName}`
        );
      }

      this.$root.removeMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName
      });

      if (this.medias_slugs_in_order.length > 0) {
        this.medias_slugs_in_order = this.medias_slugs_in_order.filter(
          m => m.slugMediaName !== slugMediaName
        );
      }

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          medias_slugs: this.medias_slugs_in_order
        }
      });
    },
    editPubliMedia({ slugMediaName, val }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • Publication: editPubliMedia / args = ${JSON.stringify(
            arguments[0],
            null,
            4
          )}`
        );
      }

      this.$root.editMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName,
        data: val
      });
    },
    toggleTransition({ position, metaFileName }) {
      console.log(
        `METHODS • VideoPublication: toggleTransition for metaFileName = ${metaFileName} and position = ${position}`
      );

      let val = {};

      const media = this.publication_medias.find(
        m => m.publi_meta.metaFileName === metaFileName
      );

      if (
        media.publi_meta.hasOwnProperty(position) &&
        media.publi_meta[position] === "fade"
      ) {
        val[position] = "none";
      } else {
        val[position] = "fade";
      }

      this.editPubliMedia({ slugMediaName: metaFileName, val });
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
      let missingMedias = [];

      if (this.medias_slugs_in_order.length === 0) {
        this.publication_medias = [];
        return;
      }

      const publi_medias = this.medias_slugs_in_order.reduce((acc, item) => {
        const metaFileName = item.slugMediaName;

        if (!this.publication.medias.hasOwnProperty(metaFileName)) {
          // error : a media referenced in medias_slugs is not in this.publication.medias
          return acc;
        }

        const _media = this.publication.medias[metaFileName];

        // for each, check if it is a reference to a project’s media
        if (
          _media.hasOwnProperty("slugProjectName") &&
          _media.hasOwnProperty("metaFileName")
        ) {
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
            return acc;
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
            return acc;
          } else {
            let meta = JSON.parse(
              JSON.stringify(project_medias[slugMediaName])
            );

            if (meta.hasOwnProperty("_isAbsent") && meta._isAbsent) {
              console.error(
                `Missing media in store — not expected : ${slugProjectName} / ${slugMediaName}`
              );
              console.error(
                `Media was probably added to the publication before it was removed.`
              );
              return acc;
            }

            meta.slugProjectName = slugProjectName;
            meta.publi_meta = JSON.parse(JSON.stringify(_media));

            acc.push(meta);
            return acc;
          }
        } else {
          // not a reference to a project’s media : most probably a solid color
          let meta = {
            publi_meta: JSON.parse(JSON.stringify(_media))
          };
          acc.push(meta);
          return acc;
        }
      }, []);

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
    },
    move(metaFileName, dir) {
      const idx = this.medias_slugs_in_order.findIndex(
        m => m.slugMediaName === metaFileName
      );
      console.log(
        `METHODS • VideoPublication: move idx = ${idx} and dir = ${dir}`
      );

      if (dir < 0) {
        this.medias_slugs_in_order.move(idx, idx + dir);
      } else if (dir > 0) {
        this.medias_slugs_in_order.move(idx + dir, idx);
      }

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          medias_slugs: this.medias_slugs_in_order
        }
      });
    }
  }
};
</script>
<style></style>
