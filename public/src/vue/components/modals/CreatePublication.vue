<template>
  <Modal
    @close="$emit('close')"
    @submit="newPublication"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
  >
    <template slot="header">
      <span>{{ $t(publidata.template) }}</span>
    </template>

    <template slot="sidebar">
      <!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t("name") }}</label>
        <input
          type="text"
          v-model.trim="publidata.name"
          required
          autofocus
          autoselect
        />
      </div>

      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_model_options }"
            @click="show_model_options = !show_model_options"
          >
            {{ $t("model") }}
          </button>
        </label>
        <div v-if="show_model_options">
          <div class="margin-bottom-small">
            <div>
              <span class="switch switch-xs">
                <input
                  type="checkbox"
                  class="switch"
                  id="is_model_switch"
                  v-model="publidata.is_model"
                />
                <label
                  for="is_model_switch"
                  :class="{ 'c-rouge': publidata.is_model }"
                  >{{ $t("publi_is_model") }}</label
                >
              </span>
            </div>
            <small>{{ $t("publi_is_model_instructions") }}</small>
          </div>

          <div class="margin-bottom-small" v-if="!publidata.is_model">
            <div>
              <span class="switch switch-xs">
                <input
                  type="checkbox"
                  class="switch"
                  id="follows_model_switch"
                  v-model="publi_follows_model"
                />
                <label
                  for="follows_model_switch"
                  :class="{ 'c-rouge': publi_follows_model }"
                  >{{ $t("select_publi_model") }}</label
                >
              </span>
            </div>
            <small>{{ $t("select_publi_model_instructions") }}</small>
          </div>
          <div v-if="publi_follows_model && !publidata.is_model">
            <!-- <pre>{{ model_recipes_of_this_template }}</pre> -->
            <small v-if="model_recipes_of_this_template.length === 0">{{
              $t("no_models_yet")
            }}</small>
            <select
              :disabled="model_recipes_of_this_template.length === 0"
              v-model="publidata.follows_model"
            >
              <option value>** {{ $t("none") }} **</option>
              <option
                v-for="model in model_recipes_of_this_template"
                :key="model.slugFolderName"
                :value="model.slugFolderName"
                >{{ model.name }}</option
              >
            </select>
          </div>
        </div>
      </div>

      <!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_authors }"
            @click="show_authors = !show_authors"
          >
            {{ $t("author") }}
          </button>
        </label>

        <div v-if="show_authors">
          <AuthorsInput :currentAuthors.sync="publidata.authors" />
          <small>{{ $t("author_instructions") }}</small>
        </div>
      </div>

      <!-- Access control -->
      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_access_control }"
            @click="show_access_control = !show_access_control"
          >
            {{ $t("manage_access") }}
          </button>
        </label>

        <div v-if="show_access_control">
          <EditAccessControl
            :editing_limited_to.sync="publidata.editing_limited_to"
            :viewing_limited_to.sync="publidata.viewing_limited_to"
            :password.sync="publidata.password"
            :authors.sync="publidata.authors"
          />
        </div>
      </div>

      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_attached_project }"
            @click="show_attached_project = !show_attached_project"
          >
            {{ $t("attached_to_project") }}
          </button>
        </label>
        <div v-if="show_attached_project">
          <select v-model="publidata.attached_to_project">
            <option key="''" :value="''">** {{ $t("none") }} **</option>
            <option
              v-for="project in $root.projects_that_are_accessible"
              :key="project.slugFolderName"
              :value="project.slugFolderName"
              >{{ project.name }}</option
            >
          </select>
          <small>{{ $t("attached_to_project_instructions") }}</small>
        </div>
      </div>

      <!-- Keywords -->
      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_keywords }"
            @click="show_keywords = !show_keywords"
          >
            {{ $t("keywords") }}
          </button>
        </label>
        <div v-if="show_keywords">
          <TagsInput
            :type="'publications'"
            @tagsChanged="(newTags) => (publidata.keywords = newTags)"
          />
        </div>
      </div>
    </template>

    <template slot="submit_button">{{ $t("create") }}</template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import EditAccessControl from "../subcomponents/EditAccessControl.vue";
import TagsInput from "../subcomponents/TagsInput.vue";
import AuthorsInput from "../subcomponents/AuthorsInput.vue";

export default {
  props: {
    read_only: Boolean,
    default_name: {
      default: "",
      type: String,
    },
    default_template: {
      default: "page_by_page",
      type: String,
    },
  },
  components: {
    Modal,
    EditAccessControl,

    TagsInput,
    AuthorsInput,
  },
  data() {
    return {
      publidata: {
        name: this.default_name,
        editing_limited_to: this.$root.current_author
          ? "only_authors"
          : "everybody",
        viewing_limited_to: "everybody",
        password: "",
        template: this.default_template,
        keywords: [],
        authors: this.$root.current_author
          ? [{ slugFolderName: this.$root.current_author.slugFolderName }]
          : [],
        attached_to_project: this.$root.do_navigation.current_slugProjectName,
        is_model: false,
        follows_model: "",
      },

      show_attached_project: this.$root.do_navigation.current_slugProjectName,
      show_password: false,
      show_keywords: false,
      show_authors: this.$root.current_author,
      show_model_options: true,
      publi_follows_model: false,
      show_access_control: true,
    };
  },
  watch: {
    publidata: {
      handler: function () {
        this.askBeforeClosingModal = true;
      },
      deep: true,
    },
  },
  mounted() {},
  computed: {
    model_recipes_of_this_template() {
      // return publications with template === identical
      const publis = Object.values(window.store.publications).filter(
        (p) => this.publidata.template === p.template && p.is_model === true
      );
      return publis;
    },
  },
  methods: {
    newPublication: function (event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • CreatePublication: newPublication");
      }
      let name = this.publidata.name;

      function getAllPubliNames() {
        let allPublicationsName = [];
        for (let slugPubliName in window.store.publications) {
          let publiName = window.store.publications[slugPubliName].name;
          allPublicationsName.push(publiName);
        }
        return allPublicationsName;
      }
      let allPublicationsName = getAllPubliNames();

      // check if project name (not slug) already exists
      if (allPublicationsName.indexOf(this.publidata.name) >= 0) {
        // invalidate if it does
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.name_already_exists"));

        return false;
      }

      if (
        this.publidata.editing_limited_to === "only_authors" &&
        this.publidata.authors.length === 0
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.if_only_authors_select_authors"));
        this.show_authors = true;
        return false;
      }

      let publidata = {
        name,
        editing_limited_to: this.publidata.editing_limited_to,
        viewing_limited_to: this.publidata.viewing_limited_to,
        password: this.publidata.password,
        template: this.publidata.template,
        authors: this.publidata.authors,
        keywords: this.publidata.keywords,
        attached_to_project: this.publidata.attached_to_project,
        is_model: this.publidata.is_model,
        follows_model: this.publidata.follows_model,
      };

      if (publidata.template === "page_by_page") {
        publidata.pages = [
          {
            id:
              +new Date() +
              "_" +
              (Math.random().toString(36) + "00000000000000000").slice(2, 3),
          },
        ];
        publidata.width = 210;
        publidata.height = 297;
      } else if (publidata.template === "drawing_pad") {
        publidata.layers = [
          // {
          //   type: "drawing",
          //   name: this.$t("drawing_layer_1"),
          //   id:
          //     +new Date() +
          //     "_" +
          //     (Math.random().toString(36) + "00000000000000000").slice(2, 3)
          // },
          {
            type: "medias",
            name: this.$t("media_layer_1"),
            id:
              +new Date() +
              "_" +
              (Math.random().toString(36) + "00000000000000000").slice(2, 3),
          },
        ];
        publidata.width = 200;
        publidata.height = 150;
      } else if (publidata.template === "video_effects") {
        publidata.effects = [
          {
            type: "",
            id:
              +new Date() +
              "_" +
              (Math.random().toString(36) + "00000000000000000").slice(2, 3),
          },
        ];
      }

      this.$root
        .createFolder({ type: "publications", data: publidata })
        .then((pdata) => {
          this.$emit("close", "");
          this.$root.openPublication(pdata.slugFolderName);
        });
    },
  },
};
</script>
