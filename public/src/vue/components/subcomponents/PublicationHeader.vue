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
    </div>-->
    <div class="m_publicationMeta--topbar">
      <div class="m_publicationMeta--topbar--name">
        <button
          type="button"
          class="m_publicationMeta--topbar--backbutton bg-noir"
          v-if="
            !(
              [
                'export_publication',
                'print_publication',
                'link_publication',
              ].includes($root.state.mode) ||
              $root.store.request.display === 'survey'
            )
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
          <div class="input-group" v-if="edit_publi_title_in_survey">
            <input type="text" class v-model="new_publi_name" />
            <button
              type="button"
              class="input-addon button-small bg-bleuvert"
              :disabled="new_publi_name.length === 0"
              @click="setNewTitle(new_publi_name)"
            >
              <img src="/images/i_enregistre.svg" draggable="false" />
            </button>
          </div>
          <template v-else>
            {{ publication.name }}
          </template>
          <ProtectedLock
            v-if="
              !(
                [
                  'export_publication',
                  'print_publication',
                  'link_publication',
                ].includes($root.state.mode) ||
                $root.store.request.display === 'survey'
              )
            "
            :editing_limited_to="publication.editing_limited_to"
            :is_protected="!can_edit_publi()"
          />
        </div>
      </div>
      <div
        class="m_publicationMeta--topbar--buttons"
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
          v-if="$root.store.request.display !== 'survey'"
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
            style="enable-background: new 0 0 77.6 85.4"
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
          v-if="show_export_button && $root.store.request.display !== 'survey'"
          @click="createButtonClicked"
          :class="{ 'is--disabled': export_button_is_disabled }"
        >
          {{ $t("create") }}
        </button>

        <button
          type="button"
          class="buttonLink"
          v-if="can_edit_publi() && $root.store.request.display === 'survey'"
          @click="edit_publi_title_in_survey = !edit_publi_title_in_survey"
          :class="{ 'is--active': edit_publi_title_in_survey }"
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
            style="enable-background: new 0 0 100.7 101"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
              L19.1,91.5z"
            />
          </svg>
          {{ $t("edit_title") }}
        </button>

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
            style="enable-background: new 0 0 91.6 95"
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
      <div
        style="width: 100%"
        class="ta-ce"
        v-if="
          publication.is_model &&
          $root.store.request.display !== 'survey' &&
          $root.state.mode !== 'link_publication'
        "
      >
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_publi_model_infos }"
            @click.stop="show_publi_model_infos = !show_publi_model_infos"
          >
            {{ $t("publi_is_model") }}
          </button>
        </label>

        <label v-if="show_publi_model_infos">
          <span v-html="$t('URL_to_share_for_replies')" />
          <a
            :href="url_to_share_for_replies"
            target="_blank"
            class="js--openInBrowser text-lc"
            >{{ url_to_share_for_replies }}</a
          >
        </label>
      </div>
      <div
        style="width: 100%"
        class="ta-ce"
        v-else-if="
          model_for_this_publication &&
          $root.store.request.display !== 'survey' &&
          ![
            'export_publication',
            'print_publication',
            'link_publication',
          ].includes($root.state.mode)
        "
      >
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_publi_model_infos }"
            @click.stop="show_publi_model_infos = !show_publi_model_infos"
          >
            <span v-html="$t('publi_follows_model:')" />
            <span
              class="text-underline button padding-none button-rectangle"
              @click="
                $root.openPublication(model_for_this_publication.slugFolderName)
              "
              >{{ model_for_this_publication.name }}</span
            >
          </button>
        </label>
        <label v-if="show_publi_model_infos">
          <span v-html="$t('URL_to_edit_in_simple_interface')" />
          <a
            :href="url_to_access_simplified_mode"
            target="_blank"
            class="js--openInBrowser text-lc"
            >{{ url_to_access_simplified_mode }}</a
          >
        </label>
      </div>
      <div v-else-if="model_for_this_publication" style="width: 100%">
        <div class v-if="url_to_publi">
          <small>
            {{ $t("save_following_address_and_come_back_later") }}
            <br />
            <a :href="url_to_publi">{{ url_to_publi }}</a>
          </small>
        </div>
      </div>
      <div class="text-centered" style="width: 100%">
        <ClientsCheckingOut
          v-if="$root.store.request.display !== 'survey'"
          :type="'publications'"
          :slugFolderName="slugPubliName"
        />
      </div>

      <div
        class="text-centered"
        style="width: 100%"
        v-if="
          publication.template === 'page_by_page' &&
          $root.consult_domains &&
          $root.consult_domains.length > 0 &&
          can_edit_publi() &&
          ![
            'export_publication',
            'print_publication',
            'link_publication',
          ].includes($root.state.mode) &&
          $root.store.request.display !== 'survey'
        "
      >
        <div class="switch switch-xs">
          <input
            id="show_on_external_domain"
            type="checkbox"
            v-model="show_on_external_domain"
          />
          <label for="show_on_external_domain">
            {{ $t("display_on_website") }}
            <a
              v-for="domain in $root.consult_domains"
              :key="domain"
              :href="`http://${domain}`"
              target="_blank"
              class="js--openInBrowser text-lc"
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
              v-if="$root.getAuthor(author.slugFolderName)"
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
            </span>
          </div>
        </div>

        <AccessController
          v-if="$root.store.request.display !== 'survey'"
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
          v-if="can_edit_publi() && $root.store.request.display !== 'survey'"
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
            style="enable-background: new 0 0 100.7 101"
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
          v-if="can_edit_publi() && $root.store.request.display !== 'survey'"
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
            style="enable-background: new 0 0 91.6 95"
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
            style="enable-background: new 0 0 91.6 95"
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
import ClientsCheckingOut from "./ClientsCheckingOut.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    medias: [Object, Array],
    number_of_medias_required: {
      type: Number,
      default: -1,
    },
    model_for_this_publication: [Boolean, Object],
    show_export_button: {
      type: Boolean,
      default: true,
    },
    url_to_publi: [Boolean, URL],
    enable_export_button: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    EditPublication,
    AccessController,
    ClientsCheckingOut,
  },
  data() {
    return {
      show_edit_publication: false,
      show_settings: false,
      show_copy_options: false,
      show_publi_model_infos: false,
      copy_publi_name: this.$t("copy_of") + " " + this.publication.name,
      edit_publi_title_in_survey: false,
    };
  },

  created() {},
  mounted() {
    this.$eventHub.$on(
      "publications.showAdvancedOptions",
      this.showAdvancedOptions
    );
  },
  beforeDestroy() {
    this.$eventHub.$off(
      "publications.showAdvancedOptions",
      this.showAdvancedOptions
    );
  },

  watch: {
    edit_publi_title_in_survey() {
      if (this.edit_publi_title_in_survey)
        this.new_publi_name = this.publication.name;
    },
  },
  computed: {
    export_button_is_disabled() {
      if (!this.enable_export_button) return true;
      if (!this.can_edit_publi()) return true;

      if (this.medias.length < 1) return true;

      if (
        this.number_of_medias_required !== -1 &&
        this.medias.length !== this.number_of_medias_required
      )
        return true;

      return false;
    },
    url_to_share_for_replies() {
      return (
        window.location.origin +
        "/_publications/reply/" +
        this.publication.slugFolderName
      );
    },
    url_to_access_simplified_mode() {
      return (
        window.location.origin +
        "/_publications/survey/" +
        this.publication.slugFolderName
      );
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
      this.$emit("close");
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
    setNewTitle() {
      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          name: this.new_publi_name,
        },
      });
      setTimeout(() => {
        this.edit_publi_title_in_survey = false;
      }, 200);
    },
    showAdvancedOptions() {
      this.show_settings = true;
    },
    removePublication() {
      if (this.publication.is_model) {
        // check if other recipes depend on it
        // if so, prevent removing
        const publication_relying_on_this_model = Object.values(
          this.$root.store.publications
        ).filter(
          (p) =>
            p.template === this.publication.template &&
            p.follows_model &&
            p.follows_model === this.publication.slugFolderName
        );

        if (publication_relying_on_this_model.length > 0) {
          this.$alertify.alert(
            this.$t("publiHasPubliRelyingOnItCantDelete") +
              `<br><b>${publication_relying_on_this_model.length}</b> ` +
              this.$t("recipes").toLowerCase()
          );
          return;
        }

        //   Object.values(this.publications).filter(
        //   (r) => r.template === template_key
        // );
      }

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
