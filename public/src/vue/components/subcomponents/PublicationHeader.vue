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

        <div class="m_publicationMeta--topbar--title">
          {{ publication.name }}
          <ProtectedLock
            :editing_limited_to="publication.editing_limited_to"
            :is_protected="!can_edit_publi()"
          />
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
          @click="show_settings = !show_settings"
          :class="{ 'is--active': show_settings }"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="77.6px"
            height="85.4px"
            viewBox="0 0 77.6 85.4"
            style="enable-background: new 0 0 77.6 85.4;"
            xml:space="preserve"
          >
            <defs />
            <g>
              <path
                d="M73.9,39h-7.6c-1.6-5.6-6.7-9.7-12.7-9.7S42.5,33.5,40.8,39H3.7c-2,0-3.7,1.6-3.7,3.7c0,2,1.6,3.7,3.7,3.7h37.1
		c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h7.6c2,0,3.7-1.6,3.7-3.7C77.6,40.7,76,39,73.9,39z M53.6,48.7c-3.2,0-6-2.6-6-6
		s2.6-6,6-6s6,2.6,6,6S56.8,48.7,53.6,48.7z"
              />
              <path
                d="M3.7,17.1h7.9c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h36.9c2,0,3.7-1.6,3.7-3.7S76,9.7,73.9,9.7H37
		C35.4,4.1,30.3,0,24.3,0S13.2,4.1,11.6,9.7H3.7c-2,0-3.7,1.6-3.7,3.7S1.6,17.1,3.7,17.1z M24.3,7.4c3.2,0,6,2.6,6,6s-2.6,6-6,6
		s-6-2.8-6-6S21.1,7.4,24.3,7.4z"
              />
              <path
                d="M73.9,68.3H37c-1.6-5.6-6.7-9.7-12.7-9.7s-11.1,4.1-12.7,9.7H3.7c-2,0-3.7,1.6-3.7,3.7s1.6,3.7,3.7,3.7h7.9
		c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h36.9c2,0,3.7-1.6,3.7-3.7S76,68.3,73.9,68.3z M24.3,78c-3.2,0-6-2.6-6-6s2.6-6,6-6
		s6,2.6,6,6S27.5,78,24.3,78z"
              />
            </g>
          </svg>
          {{ $t("advanced_options") }}
        </button>

        <button
          type="button"
          class="buttonLink bg-rouge"
          v-if="show_export_button"
          @click="createButtonClicked"
          :class="{ 'is--disabled': export_button_is_disabled }"
        >
          {{ $t("create") }}
        </button>
      </div>
      <div
        class="text-centered"
        style="width: 100%;"
        v-if="
          publication.template === 'page_by_page' &&
          $root.consult_domains &&
          $root.consult_domains.length > 0 &&
          can_edit_publi() &&
          ![
            'export_publication',
            'print_publication',
            'link_publication',
          ].includes($root.state.mode)
        "
      >
        <div class="switch switch-xs">
          <input
            id="remember_password_on_this_device"
            type="checkbox"
            v-model="show_on_external_domain"
          />
          <label for="remember_password_on_this_device">
            {{ $t("display_on_website") }}
            <a
              v-for="domain in $root.consult_domains"
              :key="domain"
              :href="`http://${domain}`"
              target="_blank"
              class="js--openInBrowser"
              >{{ domain }}</a
            >
          </label>
        </div>
      </div>
    </div>
    <div class="m_publicationMeta--settingsBar" v-if="show_settings">
      <div>
        <div class="m_metaField" v-if="!!publication.authors">
          <div>{{ $t("author") }}</div>
          <div class="m_authorField">
            <span
              v-for="author in publication.authors"
              v-if="author.slugFolderName"
              :key="author.slugFolderName"
              class="is--active"
              :class="{
                'is--loggedInAuthor':
                  $root.current_author &&
                  $root.current_author.slugFolderName === author.slugFolderName,
              }"
            >
              <template v-if="$root.getAuthor(author.slugFolderName)">
                {{ $root.getAuthor(author.slugFolderName).name }}
              </template>
              <template v-else>
                {{ author.slugFolderName }}
              </template>
            </span>
          </div>
        </div>

        <AccessController
          :folder="publication"
          :context="'full'"
          :type="'publications'"
          @closeFolder="closePublication"
        />
      </div>

      <div>
        <button
          type="button"
          class="buttonLink"
          v-if="can_edit_publi()"
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
          :publi_password="publi_password()"
          :slugPubliName="slugPubliName"
          @close="show_edit_publication = false"
        />

        <button
          type="button"
          class="buttonLink"
          :class="{ 'is--active': show_copy_options }"
          v-if="can_edit_publi()"
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
          v-if="can_edit_publi()"
          @click="removePublication"
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
import AccessController from "./AccessController.vue";
import ProtectedLock from "./ProtectedLock.vue";

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
    AccessController,
    ProtectedLock,
  },
  data() {
    return {
      show_edit_publication: false,
      show_settings: false,
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
      if (!this.can_edit_publi()) return true;

      if (Object.values(this.publication_medias).length < 1) return true;

      if (
        this.number_of_medias_required !== -1 &&
        Object.values(this.publication_medias).length !==
          this.number_of_medias_required
      )
        return true;

      return false;
    },
    show_on_external_domain: {
      get() {
        if (
          !this.publication.hasOwnProperty("show_on_external_domain") ||
          this.publication.show_on_external_domain === false
        )
          return false;
        return this.publication.show_on_external_domain;
      },
      set(show_on_external_domain) {
        this.$root.editFolder({
          type: "publications",
          slugFolderName: this.slugPubliName,
          data: {
            show_on_external_domain,
          },
        });
      },
    },
  },
  methods: {
    closePublication() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: closePublication`);
      }
      this.$root.closePublication();
    },
    createButtonClicked() {
      if (!this.can_edit_publi()) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.action_not_allowed"));
        return;
      }

      this.$emit("export");
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
    publi_password() {
      if (this.publication.password !== "has_pass") return "";
      return this.$root.getFolderPassword({
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
    can_edit_publi() {
      return this.$root.canEditFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
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
