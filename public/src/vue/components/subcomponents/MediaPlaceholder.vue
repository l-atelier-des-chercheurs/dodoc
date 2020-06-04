<template>
  <div
    class="m_mediaPlaceholder"
    :class="{
      'is--choices': modes_allowed.hasOwnProperty('choices'),
      'has--replies':
        model_placeholder_media._reply &&
        model_placeholder_media._reply._medias &&
        model_placeholder_media._reply._medias.length > 0,
    }"
  >
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
    <!-- <div
      v-if="!model_placeholder_media.hasOwnProperty('_reply')"
      class="m_mediaPlaceholder--reply"
    >
      <button
        type="button"
        class="m_mediaPlaceholder--replyButton buttonLink"
        v-if="!read_only"
        @click="createPlaceholderMedia"
      >
        {{ $t("reply") }}
      </button>
    </div>-->
    <div class="m_mediaPlaceholder--replies">
      <template v-if="modes_allowed.hasOwnProperty('choices')">
        <template
          v-if="
            modes_allowed['choices'].hasOwnProperty('multiple') &&
            modes_allowed['choices'].multiple === 'true'
          "
        >
          <div
            v-for="choice in modes_allowed['choices'].choices"
            :key="choice"
            class="m_choice"
            @click="toggleChoiceFromSelection(choice)"
          >
            <label class :for="id + '_choice_' + choice">
              <input
                :id="id + '_choice_' + choice"
                :type="'checkbox'"
                :disabled="read_only || preview_mode"
                :checked="choices_selected.includes(choice)"
                @change="toggleChoiceFromSelection(choice)"
              />
              {{ choice }}
            </label>
          </div>
        </template>
        <template v-else>
          <div
            v-for="choice in modes_allowed['choices'].choices"
            :key="choice"
            class="m_choice"
            @click="setChoiceFromSelect(choice)"
          >
            <input
              class="custom_radio"
              type="radio"
              :disabled="read_only || preview_mode"
              :id="id + '_choice_' + choice"
              :name="`${id}_multiple_choices_radio`"
              :checked="choices_selected.includes(choice)"
              @change="setChoiceFromSelect(choice)"
            />
            <label class :for="id + '_choice_' + choice">
              <span>{{ choice }}</span>
            </label>
          </div>
        </template>
      </template>
      <template v-else>
        <InsertMediaButton
          v-if="
            !preview_mode &&
            !read_only &&
            (!model_placeholder_media._reply ||
              !model_placeholder_media._reply._medias ||
              model_placeholder_media._reply._medias.length === 0) &&
            (remaining_modes_allowed === 'all' ||
              Object.keys(remaining_modes_allowed).length > 0)
          "
          :slugPubliName="slugPubliName"
          :publi_is_model="publi_is_model"
          :publi_follows_model="true"
          :modes_allowed="remaining_modes_allowed"
          :captureview_in_modal="captureview_in_modal"
          :can_collapse="
            !(
              !model_placeholder_media._reply ||
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
          v-if="
            model_placeholder_media._reply &&
            model_placeholder_media._reply._medias
          "
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
              :can_duplicate_media="(remaining_modes_allowed === 'all' ||
                    Object.keys(remaining_modes_allowed).length > 0)"
              @removePubliMedia="orderedRemovePubliMedia($event)"
              @changeMediaOrder="changeMediaOrder($event)"
              @editPubliMedia="$emit('editPubliMedia', $event)"
              @duplicateMedia="orderedDuplicateMedia($event)"
            />

            <div
              class="_story_insert_placeholders"
              :key="`insert_${media.metaFileName}`"
            >
              <InsertMediaButton
                v-if="
                  !preview_mode &&
                  !read_only &&
                  index === model_placeholder_media._reply._medias.length - 1 &&
                  (remaining_modes_allowed === 'all' ||
                    Object.keys(remaining_modes_allowed).length > 0)
                "
                :slugPubliName="slugPubliName"
                :publi_is_model="publi_is_model"
                :publi_follows_model="true"
                :modes_allowed="remaining_modes_allowed"
                :captureview_in_modal="captureview_in_modal"
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
      </template>
      <div v-if="answer_type_expected" class>
        <small
          class="margin-sides-small"
          v-html="
            $t('answer_type_expected:') +
            '&nbsp;' +
            answer_type_expected.toLowerCase()
          "
        />
      </div>
      <div v-if="answers_given">
        <small
          class="margin-sides-small"
          v-html="$t('answers_given:') + '&nbsp;' + answers_given"
        />
      </div>
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
    publi_is_model: Boolean,
    preview_mode: Boolean,
    read_only: Boolean,
    captureview_in_modal: Boolean,
  },
  components: {
    InsertMediaButton,
    MediaStory,
  },
  data() {
    return {
      choices_selected: [],
      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5),
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    "model_placeholder_media._reply": {
      handler() {
        if (
          this.model_placeholder_media._reply &&
          this.model_placeholder_media._reply.answers
        ) {
          this.choices_selected = this.model_placeholder_media._reply.answers.split(
            "|"
          );
        }
      },
      immediate: true,
      deep: true,
    },
  },
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
        return {};

      const modes_allowed = this.model_placeholder_media.available_modes.reduce(
        (acc, m) => {
          acc[m.mode_key] = JSON.parse(JSON.stringify(m));
          delete acc[m.mode_key].mode_key;
          return acc;
        },
        {}
      );

      if (modes_allowed.hasOwnProperty("choices")) {
        if (
          modes_allowed.choices.choices &&
          modes_allowed.choices.choices.length > 0
        ) {
          modes_allowed.choices.choices = modes_allowed.choices.choices
            .split("|")
            .filter((c) => c !== "");
        }
      }

      return modes_allowed;
    },
    remaining_modes_allowed() {
      const _modes_allowed = JSON.parse(JSON.stringify(this.modes_allowed));

      if (
        this.model_placeholder_media._reply &&
        this.model_placeholder_media._reply._medias &&
        this.model_placeholder_media._reply._medias.length > 0
      ) {
        // check for each if there is an amount, and if there is then how many medias with that type already exist
        Object.entries(_modes_allowed).map(([mode, opts]) => {
          if (opts.hasOwnProperty("amount") && opts.amount) {
            const amount_of_type = opts.amount;

            const number_of_medias_of_this_type = this.model_placeholder_media._reply._medias.filter(
              (m) => {
                if (mode === "photo")
                  return m.type === mode || m.type === "image";
                return m.type === mode;
              }
            ).length;

            if (number_of_medias_of_this_type >= amount_of_type)
              delete _modes_allowed[mode];
          }
        });
      }

      return _modes_allowed;
    },
    answers_given() {
      if (!this.model_placeholder_media._reply) return false;
      if (!!this.model_placeholder_media._reply.answers)
        return this.model_placeholder_media._reply.answers
          .split("|")
          .join(" - ");
      else if (false) {
      } else if (
        Array.isArray(this.model_placeholder_media._reply._medias) &&
        this.model_placeholder_media._reply._medias.length > 0
      ) {
        const medias_types = this.model_placeholder_media._reply._medias.reduce(
          (acc, m) => {
            const type = m.type;
            if (!acc.hasOwnProperty(type)) acc[type] = 0;
            acc[type]++;
            return acc;
          },
          {}
        );
        return Object.entries(medias_types).reduce((acc, [type, amount]) => {
          if (!!acc) acc += " • ";

          if (type === "image") type = "photo";

          acc += `${this.$t(type)} (${amount})`;

          return acc;
        }, "");
      }

      return this.$t("none");
    },
    answer_type_expected() {
      if (this.modes_allowed === "all") return this.$t("all");
      if (Object.keys(this.modes_allowed).length === 0) return this.$t("none");

      return Object.entries(this.modes_allowed).reduce(
        (acc, [type, { amount }]) => {
          if (!!acc) acc += " • ";

          if (amount && amount >= 1) acc += `${this.$t(type)} (${amount})`;
          else acc += `${this.$t(type)}`;
          return acc;
        },
        ""
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
    createPlaceholderMediaIfMissing() {
      return new Promise((resolve, reject) => {
        if (this.model_placeholder_media._reply) return resolve();

        this.$root
          .createMedia({
            slugFolderName: this.slugPubliName,
            type: "publications",
            additionalMeta: {
              type: "placeholder",
              placeholder_meta_reference: this.model_placeholder_media
                .metaFileName,
              placeholder_medias_slugs: [],
            },
          })
          .then((mdata) => {
            this.$nextTick(() => {
              return resolve(mdata);
            });
          });
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
        this.createPlaceholderMediaIfMissing().then(() => {
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
    toggleChoiceFromSelection(choice) {
      if (this.read_only || this.preview_mode) return false;
      if (this.choices_selected.includes(choice))
        this.choices_selected = this.choices_selected.filter(
          (c) => c !== choice
        );
      else this.choices_selected.push(choice);

      this.updateMediaAnswers({ answers: this.choices_selected.join("|") });
    },
    setChoiceFromSelect(choice) {
      if (this.read_only || this.preview_mode) return false;
      this.choices_selected = [choice];
      this.updateMediaAnswers({ answers: this.choices_selected.join("|") });
    },
    updateMediaAnswers(val) {
      this.createPlaceholderMediaIfMissing().then(() => {
        this.$root.editMedia({
          type: "publications",
          slugFolderName: this.slugPubliName,
          slugMediaName: this.model_placeholder_media._reply.metaFileName,
          data: val,
        });
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
