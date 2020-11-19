<template>
  <Modal
    @close="$emit('close')"
    @submit="editThisPublication"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
  >
    <template slot="header">
      <div class>{{ $t("edit_publication") }}</div>
    </template>

    <template slot="sidebar">
      <!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t("name") }}</label>
        <input
          class="input-big"
          type="text"
          v-model.trim="publidata.name"
          required
          autofocus
          :readonly="read_only"
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
              >
                {{ model.name }}
              </option>
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

      <!-- Attached to project -->
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
              v-for="project in Object.values($root.store.projects)"
              :key="project.slugFolderName"
              :value="project.slugFolderName"
            >
              {{ project.name }}
            </option>
          </select>
          <small>{{ $t("attached_to_project_instructions") }}</small>
        </div>
      </div>

      <!-- Password -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="publidata.password" :readonly="read_only">
        <small>{{ $t('password_instructions') }}</small>
      </div>-->

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
        <template v-if="show_keywords">
          <TagsInput
            :keywords="publidata.keywords"
            :type="'publications'"
            @tagsChanged="(newTags) => (publidata.keywords = newTags)"
          />
        </template>
      </div>
    </template>

    <template slot="submit_button">{{ $t("save") }}</template>
  </Modal>
</template>
<script>
import EditAccessControl from "../subcomponents/EditAccessControl.vue";
import TagsInput from "../subcomponents/TagsInput.vue";
import AuthorsInput from "../subcomponents/AuthorsInput.vue";
import slug from "slugg";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    publi_password: String,
    read_only: Boolean,
  },
  components: {
    EditAccessControl,
    TagsInput,
    AuthorsInput,
  },
  data() {
    return {
      publidata: {
        name: this.publication.name,
        editing_limited_to: !!this.publication.editing_limited_to
          ? this.publication.editing_limited_to
          : this.publication.password === "has_pass"
          ? "with_password"
          : "everybody",
        viewing_limited_to: this.publication.viewing_limited_to,
        attached_to_project: !!this.publication.attached_to_project
          ? this.publication.attached_to_project
          : "",
        password: this.publi_password,
        authors:
          typeof this.publication.authors === "string" &&
          this.publication.authors !== ""
            ? this.publication.authors.split(",").map((a) => {
                return { name: a };
              })
            : this.publication.authors,
        keywords: this.publication.keywords,
        is_model: this.publication.is_model,
        follows_model: this.publication.follows_model
          ? this.publication.follows_model
          : "",
      },
      tag: "",
      preview: undefined,
      askBeforeClosingModal: false,

      show_attached_project: !!this.publication.attached_to_project,
      show_keywords: !!this.publication.keywords,
      show_authors: !!this.publication.authors,
      show_access_control: !!this.publication.editing_limited_to,
      show_model_options:
        this.publication.is_model || !!this.publication.follows_model,
      publi_follows_model: !!this.publication.follows_model,
    };
  },
  watch: {
    publidata: {
      handler() {
        this.askBeforeClosingModal = true;
      },
      deep: true,
    },
  },
  mounted() {},
  computed: {
    model_recipes_of_this_template() {
      // return publications with template === identical
      const publis = Object.values(this.$root.store.publications).filter(
        (p) =>
          this.publication.template === p.template &&
          p.is_model === true &&
          p.slugFolderName !== this.publication.slugFolderName
      );
      return publis;
    },
  },
  methods: {
    editThisPublication: function (event) {
      console.log("editThisPublication");

      // only if user changed the name of this folder
      if (this.publidata.name !== this.publication.name) {
        function getAllPubliNames() {
          let allPublicationsName = [];
          for (let slugPubliName in window.store.publications) {
            let projectName = window.store.publications[slugPubliName].name;
            allPublicationsName.push(projectName);
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
      }

      if (typeof this.preview !== "undefined") {
        this.publidata.preview_rawdata = this.preview;
      }

      if (
        this.publidata.editing_limited_to === "only_authors" &&
        (!this.publidata.authors ||
          !Array.isArray(this.publidata.authors) ||
          this.publidata.authors.length === 0)
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.if_only_authors_select_authors"));
        this.show_authors = true;
        return false;
      }

      if (this.publidata.is_model) {
        if (
          this.publidata.viewing_limited_to !== "everybody" &&
          this.publidata.editing_limited_to !== "everybody"
        ) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              this.$t("notifications.models_must_be_visible_to_everybody")
            );
          this.show_access_control = true;
          return false;
        }
      }

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: this.publidata,
      });

      this.$emit("close", "");
    },
  },
};
</script>
<style></style>
