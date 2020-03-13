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
      :enable_export_button="export_button_enabled"
      @export="show_export_modal = true"
    />

    <ExportVideoPubliModal
      v-if="show_export_modal"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :instructions="$t('export_video_instructions')"
    />

    <div class="m_videoEffects">
      <div class="" v-if="!video_media">
        <p>
          <small v-html="$t('add_one_video_file')" />
        </p>
      </div>

      <template v-else>
        <div class="m_videoEffects--options">
          <div
            class="m_videoEffects--options--effect"
            v-for="(effect, index) in effects"
            :key="index"
          >
            <label class="c-white">{{ $t("effect") }}</label>

            <div class="margin-bottom-small">
              <select
                :value="effect.type"
                @change="setEffectType({ $event, id: effect.id })"
              >
                <option value="">— </option>
                <option value="watermark"> {{ $t("watermark") }}… </option>
                <option value="black_and_white">
                  {{ $t("black_and_white") }}
                </option>
                <option value="colored_filter">
                  {{ $t("colored_filter") }}…
                </option>
                <option value="slow_down"> {{ $t("slow_down") }}… </option>
                <option value="speed_up"> {{ $t("speed_up") }}… </option>
                <option value="reverse">
                  {{ $t("reverse") }}
                </option>
                <option value="rotate"> {{ $t("rotate") }}… </option>
                <option value="mirror">
                  {{ $t("mirror") }}
                </option>
              </select>
            </div>

            <div
              v-if="effect.type === 'watermark'"
              class="margin-bottom-small"
              :key="'watermark'"
            >
              <label>
                {{ $t("image") }}
              </label>
              <div v-if="!watermark_media">
                <small>{{ $t("watermark_instructions") }}</small>
              </div>
              <div class="_watermark_media" v-else="watermark_media">
                <MediaMontagePublication
                  :media="watermark_media"
                  :preview_mode="false"
                  :read_only="read_only"
                  @removePubliMedia="
                    values => {
                      removePubliMedia(values);
                    }
                  "
                />
              </div>
            </div>

            <div
              v-if="effect.type === 'colored_filter'"
              class="margin-bottom-small"
              :key="'colored_filter'"
            >
              <label>
                {{ $t("filters_color") }}
                <input
                  type="color"
                  :value="effect.color"
                  @change="
                    setEffectProp({ $event, id: effect.id, prop: 'color' })
                  "
                />
              </label>
            </div>
            <div
              v-else-if="effect.type === 'slow_down'"
              class="margin-bottom-small"
              :key="'slow_down'"
            >
              <select
                :value="effect.speed"
                @change="
                  setEffectProp({ $event, id: effect.id, prop: 'speed' })
                "
              >
                <option value="0.75">{{ $t("a_little").toLowerCase() }}</option>
                <option value="0.5">{{ $t("a_lot").toLowerCase() }}</option>
                <option value="custom">{{ $t("custom").toLowerCase() }}</option>
              </select>
              <input
                v-if="effect.speed === 'custom'"
                type="number"
                min="0.1"
                max="1"
                step="0.1"
                :value="effect.custom_speed"
                @change="
                  setEffectProp({ $event, id: effect.id, prop: 'custom_speed' })
                "
              />
              <div class="ta-ri">
                <small
                  >×
                  {{
                    effect.speed !== "custom"
                      ? effect.speed
                      : effect.custom_speed
                  }}
                </small>
              </div>
              <div v-if="video_media && video_media.duration">
                <hr />
                <div class="m_metaField">
                  <div>{{ $t("duration") }}</div>
                  <div>
                    {{
                      $root.formatDurationToMinuteHours(
                        video_media.duration * 1000
                      )
                    }}
                  </div>
                </div>
                <div class="m_metaField">
                  <div>{{ $t("new_duration") }}</div>
                  <div>{{ getVideomedaiNewDuration(effect) }}</div>
                </div>
              </div>
              <div>
                <small
                  v-if="effect.speed === 'custom' && effect.custom_speed < 0.5"
                >
                  {{ $t("slowing_video_down_limit") }}
                </small>
              </div>
            </div>
            <div
              v-else-if="effect.type === 'speed_up'"
              class="margin-bottom-small ta-ri"
              :key="'speed_up'"
            >
              <select
                :value="effect.speed"
                @change="
                  setEffectProp({ $event, id: effect.id, prop: 'speed' })
                "
              >
                <option value="1.5">
                  {{ $t("a_little").toLowerCase() }}
                </option>
                <option value="4">
                  {{ $t("a_lot").toLowerCase() }}
                </option>
                <option value="custom">{{ $t("custom").toLowerCase() }}</option>
              </select>
              <input
                v-if="effect.speed === 'custom'"
                type="number"
                min="1"
                max="100"
                step="0.1"
                :value="effect.custom_speed"
                @change="
                  setEffectProp({ $event, id: effect.id, prop: 'custom_speed' })
                "
              />
              <div class="ta-ri">
                <small
                  >×
                  {{
                    effect.speed !== "custom"
                      ? effect.speed
                      : effect.custom_speed
                  }}
                </small>
              </div>
              <div v-if="video_media && video_media.duration">
                <hr />
                <div class="m_metaField">
                  <div>{{ $t("duration") }}</div>
                  <div>
                    {{
                      $root.formatDurationToMinuteHours(
                        video_media.duration * 1000
                      )
                    }}
                  </div>
                </div>
                <div class="m_metaField">
                  <div>{{ $t("new_duration") }}</div>
                  <div>{{ getVideomedaiNewDuration(effect) }}</div>
                </div>
              </div>
            </div>
            <div
              v-else-if="effect.type === 'rotate'"
              class="margin-bottom-small ta-ri"
              :key="'rotate'"
            >
              <select
                :value="effect.rotation"
                @change="
                  setEffectProp({ $event, id: effect.id, prop: 'rotation' })
                "
              >
                <option :value="1">
                  {{ $t("clockwise").toLowerCase() }}
                </option>
                <option :value="2">
                  {{ $t("counterclockwise").toLowerCase() }}
                </option>
              </select>
            </div>
            <div
              v-else-if="effect.type === 'mirror'"
              class="margin-bottom-small ta-ri"
              :key="'mirror'"
            >
              <select
                :value="effect.flip"
                @change="setEffectProp({ $event, id: effect.id, prop: 'flip' })"
              >
                <option value="vflip">
                  {{ $t("vertical_flip").toLowerCase() }}
                </option>
                <option value="hflip">
                  {{ $t("horizontal_flip").toLowerCase() }}
                </option>
                <option value="hflip, vflip">
                  {{ $t("both").toLowerCase() }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="m_videoEffects--media">
          <MediaMontagePublication
            :media="video_media"
            :preview_mode="false"
            :read_only="read_only"
            :enable_set_video_volume="true"
            @removePubliMedia="
              values => {
                removePubliMedia(values);
              }
            "
            @editPubliMedia="
              values => {
                editPubliMedia(values);
              }
            "
          />
        </div>
      </template>
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
      medias_slugs_in_order: [],
      number_of_medias_required: 1
    };
  },
  created() {},
  mounted() {
    this.$root.settings.current_publication.accepted_media_type = this.accepted_media_type;

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
  computed: {
    effects() {
      if (!!this.publication.effects && Array.isArray(this.publication.effects))
        return this.publication.effects;
      return [];
    },
    accepted_media_type() {
      if (
        this.effects.length > 0 &&
        this.effects.some(e => e.type === "watermark")
      ) {
        return ["video", "image"];
      }
      return ["video"];
    },
    export_button_enabled() {
      if (
        !this.publication.effects ||
        !Array.isArray(this.publication.effects) ||
        this.publication.effects.length === 0
      )
        return false;

      return true;
    },
    watermark_media() {
      return this.publication_medias.find(m => m.type === "image");
    },
    video_media() {
      return this.publication_medias.find(m => m.type === "video");
    }
  },
  methods: {
    getVideomedaiNewDuration(effect) {
      return this.$root.formatDurationToMinuteHours(
        (this.video_media.duration * 1000) /
          (effect.speed !== "custom" ? effect.speed : effect.custom_speed)
      );
    },

    setEffectType({ $event, id }) {
      const new_type = $event.target.value;
      const effects = this.publication.effects.map(e => {
        if (e.id === id && e.type !== new_type) {
          e.type = new_type;

          if (new_type === "colored_filter") e.color = "#FC4B60";
          // else if (new_type === "watermark") e.image = {};
          else if (new_type === "slow_down") {
            e.speed = 0.75;
            e.custom_speed = 0.6;
          } else if (new_type === "speed_up") {
            e.speed = 1.5;
            e.custom_speed = 6;
          } else if (new_type === "rotate") e.rotation = 1;
          else if (new_type === "mirror") e.flip = "vflip";
        }
        return e;
      });

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          effects
        }
      });
    },
    setEffectProp({ $event, id, prop }) {
      const new_value = $event.target.value;

      const effects = this.publication.effects.map(e => {
        if (e.id === id && e[prop] !== new_value) {
          e[prop] = new_value;
        }
        return e;
      });

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          effects
        }
      });
    },

    addMedia({ slugProjectName, metaFileName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: addMedia with
        slugProjectName = ${slugProjectName} and metaFileName = ${metaFileName}`);
      }

      const desired_filename = metaFileName;

      this.$eventHub.$on("socketio.media_created_or_updated", d => {
        this.$eventHub.$off("socketio.media_created_or_updated");

        this.medias_slugs_in_order.push({
          slugMediaName: d.metaFileName
        });

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
    updateMediasPubli() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: updateMediasPubli`);
      }

      this.$root.settings.current_publication.accepted_media_type = this.accepted_media_type;

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

      if (this.medias_slugs_in_order.length === 0) {
        this.publication_medias = [];
        return;
      }

      this.medias_slugs_in_order.map(item => {
        const metaFileName = item.slugMediaName;

        if (!this.publication.medias.hasOwnProperty(metaFileName)) {
          // error : a media referenced in medias_slugs is not in this.publication.medias
          return;
        }

        const _media = this.publication.medias[metaFileName];

        // for each, get slugFolderName and metaFileName
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

      const types_of_medias = publi_medias.map(m => m.type);
      this.$root.settings.current_publication.accepted_media_type = this.accepted_media_type.filter(
        t => !types_of_medias.includes(t)
      );

      this.publication_medias = publi_medias;
    }
  }
};
</script>
<style></style>
