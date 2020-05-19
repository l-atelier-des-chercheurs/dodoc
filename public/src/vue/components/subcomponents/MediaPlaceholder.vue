<template>
  <div class="m_mediaPlaceholder">
    <!-- <label>{{ $t("placeholder") }} </label> -->

    <div
      v-if="model_placeholder_media.hasOwnProperty('instructions')"
      class="m_mediaPlaceholder--instructions"
    >
      <!-- <label>{{ $t("instructions") }}</label> -->
      <div
        class="mediaTextContent"
        v-html="model_placeholder_media.instructions"
      />
    </div>
    <div
      v-if="!model_placeholder_media.hasOwnProperty('_reply')"
      class="m_mediaPlaceholder--reply"
    >
      <button
        type="button"
        class="m_mediaPlaceholder--replyButton"
        @click="createPlaceholderMedia"
      >
        {{ $t("reply") }}
      </button>
    </div>
    <div v-else>
      <InsertMediaButton
        v-if="!preview_mode"
        :slugPubliName="slugPubliName"
        :publi_is_model="publication.is_model"
        :publi_follows_model="true"
        :modes_allowed="modes_allowed"
        :can_collapse="
          !(
            !model_placeholder_media._reply._medias ||
            model_placeholder_media._reply._medias.length === 0
          )
        "
        :read_only="read_only"
        @addMedia="
          (values) => addMediaOrdered({ values, in_position: 'start' })
        "
        @insertMedias="
          ({ metaFileNames }) =>
            insertMediasInList({
              metaFileNames,
              in_position: 'start',
            })
        "
      />

      <transition-group
        v-if="model_placeholder_media._reply._medias"
        tag="div"
        name="StoryModules"
        appear
        :duration="700"
      >
        <template
          v-for="(media, index) in model_placeholder_media._reply._medias"
        >
          <MediaStory
            :key="media.metaFileName"
            :media="media"
            :media_position="mediaPosition(index)"
            :preview_mode="preview_mode"
            :slugPubliName="slugPubliName"
            :read_only="read_only || preview_mode"
            @removePubliMedia="orderedRemovePubliMedia($event)"
            @changeMediaOrder="changeMediaOrder($event)"
            @editPubliMedia="$emit('editPubliMedia', $event)"
          />

          <div
            class="_story_insert_placeholders"
            :key="`insert_${media.metaFileName}`"
          >
            <InsertMediaButton
              v-if="!preview_mode"
              :slugPubliName="slugPubliName"
              :publi_is_model="publication.is_model"
              :publi_follows_model="true"
              :modes_allowed="modes_allowed"
              :read_only="read_only"
              @addMedia="
                (values) =>
                  addMediaOrdered({
                    values,
                    right_after_meta: media.metaFileName,
                  })
              "
              @insertMedias="
                ({ metaFileNames }) =>
                  insertMediasInList({
                    metaFileNames,
                    right_after_meta: media.metaFileName,
                  })
              "
            />
          </div>
        </template>
      </transition-group>
    </div>
  </div>
</template>
<script>
import InsertMediaButton from "./InsertMediaButton.vue";
import MediaStory from "./MediaStory.vue";

export default {
  props: {
    model_placeholder_media: Object,
    slugPubliName: String,
    publication: Object,
    preview_mode: Boolean,
  },
  components: {
    InsertMediaButton,
    MediaStory,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    placeholder_medias_slugs() {
      if (!this.model_placeholder_media.hasOwnProperty("_reply")) return false;
      if (
        !Array.isArray(
          this.model_placeholder_media._reply.placeholder_medias_slugs
        )
      )
        return [];
      return this.model_placeholder_media._reply.placeholder_medias_slugs;
    },
    modes_allowed() {
      if (
        !this.model_placeholder_media.available_modes ||
        !Array.isArray(this.model_placeholder_media.available_modes)
      )
        return "all";
      return this.model_placeholder_media.available_modes.map(
        (m) => m.mode_key
      );
    },
  },
  methods: {
    mediaPosition(index) {
      if (this.model_placeholder_media._reply._medias.length === 1)
        return "alone";
      if (index === 0) return "first";
      if (index === this.model_placeholder_media._reply._medias.length - 1)
        return "last";
      return "";
    },
    createPlaceholderMedia() {
      this.$emit("addMedia", {
        type: "placeholder",
        placeholder_meta_reference: this.model_placeholder_media.metaFileName,
        placeholder_medias_slugs: [],
      });
    },
    addMediaOrdered({ values = {}, right_after_meta, in_position }) {
      return new Promise((resolve, reject) => {
        this.addMedia({ values }).then((mdata) =>
          this.insertMediasInList({
            metaFileNames: [mdata.metaFileName],
            right_after_meta,
            in_position,
          })
        );
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

    insertMediasInList({ metaFileNames, right_after_meta, in_position }) {
      return new Promise((resolve, reject) => {
        const medias_slugs =
          !Array.isArray(this.placeholder_medias_slugs) ||
          this.placeholder_medias_slugs.length === 0
            ? []
            : JSON.parse(JSON.stringify(this.placeholder_medias_slugs));

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
        } else if (in_position && in_position === "start") {
          index = 0;
        }

        medias_slugs.splice(index, 0, ...new_media_metas);

        this.$root
          .editMedia({
            type: "publications",
            slugFolderName: this.slugPubliName,
            slugMediaName: this.model_placeholder_media._reply.metaFileName,
            data: {
              placeholder_medias_slugs: medias_slugs,
            },
          })
          .then((mdata) => {
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
    orderedRemovePubliMedia({ metaFileName }) {
      let medias_slugs =
        !Array.isArray(this.placeholder_medias_slugs) ||
        this.placeholder_medias_slugs.length === 0
          ? []
          : JSON.parse(JSON.stringify(this.placeholder_medias_slugs));

      medias_slugs = medias_slugs.filter(
        (m) => m.slugMediaName !== metaFileName
      );

      this.$root
        .editMedia({
          type: "publications",
          slugFolderName: this.slugPubliName,
          slugMediaName: this.model_placeholder_media._reply.metaFileName,
          data: {
            placeholder_medias_slugs: medias_slugs,
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

    changeMediaOrder({ metaFileName, dir }) {
      let medias_slugs =
        !Array.isArray(this.placeholder_medias_slugs) ||
        this.placeholder_medias_slugs.length === 0
          ? []
          : JSON.parse(JSON.stringify(this.placeholder_medias_slugs));

      // find index in medias_slugs_in_order
      const current_index_in_slugs = medias_slugs.findIndex(
        (m) => m.slugMediaName === metaFileName
      );

      const current_media_index = this.model_placeholder_media._reply._medias.findIndex(
        (m) => m.metaFileName === metaFileName
      );
      const adjacent_media_meta = this.model_placeholder_media._reply._medias[
        current_media_index + dir
      ].metaFileName;

      const new_index_in_slugs = medias_slugs.findIndex(
        (m) => m.slugMediaName === adjacent_media_meta
      );

      medias_slugs.move(current_index_in_slugs, new_index_in_slugs);

      this.$root.editMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName: this.model_placeholder_media._reply.metaFileName,
        data: {
          placeholder_medias_slugs: medias_slugs,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
