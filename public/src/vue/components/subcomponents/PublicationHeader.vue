<template>
  <div class="m_publicationMeta">
    <!-- <div
      class="label padding-verysmall"
      v-if="
        ![
          'export_publication',
          'print_publication',
          'link_publication'
        ].includes($root.state.mode)
      "
    >
      {{ $t(publication.template) }}
    </div> -->
    <div class="m_publicationMeta--topbar">
      <div>
        <button
          type="button"
          class="m_publicationMeta--topbar--backbutton"
          v-if="
            ![
              'export_publication',
              'print_publication',
              'link_publication',
            ].includes($root.state.mode)
          "
          @click="closePublication()"
          :content="$t('close')"
          v-tippy="{
            placement: 'bottom',
            delay: [600, 0],
          }"
        >
          ‹
        </button>

        <div
          class="m_publicationMeta--topbar--title"
          :content="slugPubliName"
          v-tippy="{
            placement: 'bottom-start',
            delay: [600, 0],
            interactive: true,
          }"
        >
          {{ publication.name }}
        </div>
      </div>
      <div
        v-if="
          ![
            'export_publication',
            'print_publication',
            'link_publication',
          ].includes($root.state.mode)
        "
      >
        <button
          type="button"
          class="buttonLink"
          @click="show_edit_publication = true"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="100.7px"
            height="101px"
            viewBox="0 0 100.7 101"
            style="enable-background: new 0 0 100.7 101;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
              L19.1,91.5z"
            />
          </svg>
          {{ $t("edit") }}
        </button>

        <EditPublication
          v-if="show_edit_publication"
          :publication="publication"
          :slugPubliName="slugPubliName"
          @close="show_edit_publication = false"
        />

        <button
          type="button"
          class="buttonLink"
          :class="{ 'is--active': show_copy_options }"
          @click="show_copy_options = !show_copy_options"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="91.6px"
            height="95px"
            viewBox="0 0 91.6 95"
            style="enable-background: new 0 0 91.6 95;"
            xml:space="preserve"
          >
            <polygon
              class="st0"
              points="39.5,11.8 83,11.8 83,55.4 72.7,55.4 72.7,67.2 94.8,67.2 94.8,0 27.7,0 27.7,22.2 39.5,22.2 	"
            />
            <path
              class="st0"
              d="M67.2,27.7L0,27.7l0,67.2l67.2,0L67.2,27.7z M55.4,83l-43.6,0l0-43.6l43.6,0L55.4,83z"
            />
          </svg>
          <span class>{{ $t("duplicate") }}</span>
        </button>

        <div v-if="show_copy_options" class="margin-bottom-small">
          <label v-html="$t('name_of_copy')" />
          <form @submit.prevent="duplicateWithNewName()" class="input-group">
            <input
              type="text"
              v-model.trim="copy_publi_name"
              required
              autofocus
            />
            <button type="submit" v-html="$t('copy')" class="bg-bleuvert" />
          </form>
        </div>

        <button
          type="button"
          class="buttonLink"
          v-if="show_export_button"
          @click="$emit('export')"
          :class="{ 'is--disabled': export_button_is_disabled }"
        >
          {{ $t("create") }}
        </button>

        <button type="button" class="buttonLink" @click="removePublication">
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="91.6px"
            height="95px"
            viewBox="0 0 91.6 95"
            style="enable-background: new 0 0 91.6 95;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
            />
          </svg>
          {{ $t("remove") }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import EditPublication from "../modals/EditPublication.vue";
export default {
  props: {
    slugPubliName: String,
    publication: Object,
    publication_medias: [Boolean, Array, Object],
    number_of_medias_required: {
      type: Number,
      default: -1,
    },
    show_export_button: {
      type: Boolean,
      default: true,
    },
    enable_export_button: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    EditPublication,
  },
  data() {
    return {
      show_edit_publication: false,
      show_copy_options: false,
      copy_publi_name: this.$t("copy_of") + " " + this.publication.name,
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},

  watch: {},
  computed: {
    export_button_is_disabled() {
      if (!this.enable_export_button) return true;

      if (Object.values(this.publication_medias).length < 1) return true;

      if (
        this.number_of_medias_required !== -1 &&
        Object.values(this.publication_medias).length !==
          this.number_of_medias_required
      )
        return true;

      return false;
    },
  },
  methods: {
    closePublication() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: closePublication`);
      }
      this.$root.closePublication();
    },
    removePublication() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemovePubli"),
          () => {
            if (this.$root.state.dev_mode === "debug") {
              console.log(`METHODS • Publication: removePublication`);
            }
            this.$root.removeFolder({
              type: "publications",
              slugFolderName: this.slugPubliName,
            });
            this.closePublication();
          },
          () => {}
        );
    },
    duplicateWithNewName(event) {
      console.log("METHODS • PublicationHeader: duplicateWithNewName");

      function getAllPublisNames() {
        let allPublisName = [];
        for (let slugPubliName in window.store.publications) {
          let publi_name = window.store.publications[slugPubliName].name;
          allPublisName.push(publi_name);
        }
        return allPublisName;
      }
      let allPublisName = getAllPublisNames();

      // check if publi name (not slug) already exists
      if (allPublisName.indexOf(this.copy_publi_name) >= 0) {
        // invalidate if it does
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.name_already_exists"));

        return false;
      }

      this.$socketio.copyFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        new_folder_name: this.copy_publi_name,
      });
      this.show_copy_options = false;

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log(this.$t("notifications.copy_in_progress"));

      this.$eventHub.$once("socketio.publications.folder_listed", () => {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(this.$t("notifications.copy_completed"));
      });
    },
  },
};
</script>
<style></style>
