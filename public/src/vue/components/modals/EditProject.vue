<template>
  <Modal
    @close="$emit('close')"
    @submit="editThisProject"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
    :is_loading="is_sending_content_to_server"
  >
    <template slot="header">
      <div class>{{ $t("edit_project") }}</div>
    </template>

    <template slot="sidebar">
      <!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t("project_name") }}</label>
        <input
          class="input-big"
          type="text"
          v-model.trim="projectdata.name"
          required
          :readonly="read_only"
        />
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

        <template v-if="show_authors">
          <AuthorsInput
            :currentAuthors="projectdata.authors"
            @authorsChanged="(newAuthors) => (projectdata.authors = newAuthors)"
          />
          <small>{{ $t("author_instructions") }}</small>
        </template>
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
          <div class="">
            <label>
              {{ $t("who_can_edit") }}
            </label>

            <div class="">
              <div
                v-for="mode in ['only_authors', 'with_password', 'everybody']"
                :key="mode"
              >
                <input
                  class="custom_radio"
                  type="radio"
                  :id="`editing_limited_to-${mode}`"
                  :name="`editing_limited_to-${mode}`"
                  :value="mode"
                  v-model="projectdata.editing_limited_to"
                />
                <label class="text-lc" :for="`editing_limited_to-${mode}`">
                  <span>{{ $t(mode) }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Password -->
          <div
            class="margin-top-small"
            v-if="projectdata.editing_limited_to === 'with_password'"
          >
            <label>
              {{ $t("password") }}
            </label>
            <div>
              <input
                type="password"
                required
                v-model="projectdata.password"
                autocomplete="new-password"
              />
            </div>
          </div>

          <div
            class="margin-top-small"
            v-if="projectdata.editing_limited_to !== 'everybody'"
          >
            <div class="">
              <input
                class=""
                type="checkbox"
                id="visible_to_all"
                name="visible_to_all"
                v-model="projectdata.viewing_limited_to"
                true-value="everybody"
                false-value=""
              />
              <label for="visible_to_all">
                <span>
                  {{ $t("visible_to_all") }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_image }"
            @click="show_image = !show_image"
          >
            {{ $t("cover_image") }}
          </button>
        </label>
        <template v-if="show_image">
          <ImageSelect
            :previewURL="previewURL"
            :load_from_projects_medias="true"
            :slugProjectName="slugProjectName"
            @newPreview="
              (value) => {
                preview_rawdata = value;
              }
            "
          />
        </template>
      </div>

      <!-- Folder -->
      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_folder }"
            @click="show_folder = !show_folder"
          >
            {{ $t("folder") }}
          </button>
        </label>
        <div v-if="show_folder">
          <template v-if="$root.all_folders.length">
            <!-- <label v-html="$t('add_to_existing_folder')" /> -->
            <div class="input-group margin-bottom-none">
              <select v-model="existing_group_name">
                <option
                  v-if="!!project.folder"
                  :key="'none'"
                  :value="'_none'"
                  >{{ $t("none") }}</option
                >
                <option :key="'create'" :value="''"
                  >** {{ $t("create_new_folder") }} **</option
                >
                <option
                  v-for="folder in $root.all_folders"
                  :key="folder"
                  :value="folder"
                  >{{ folder }}</option
                >
              </select>
            </div>
          </template>

          <div v-if="existing_group_name === ''">
            <label v-html="$t('new_folder_name')" />
            <input type="text" class="text-uc" v-model.trim="new_group_name" />
          </div>
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
        <template v-if="show_keywords">
          <TagsInput
            :keywords="projectdata.keywords"
            @tagsChanged="(newTags) => (projectdata.keywords = newTags)"
          />
        </template>
      </div>
    </template>

    <template slot="submit_button">{{ $t("save") }}</template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import slug from "slugg";
import ImageSelect from "../subcomponents/ImageSelect.vue";
import TagsInput from "../subcomponents/TagsInput.vue";
import AuthorsInput from "../subcomponents/AuthorsInput.vue";

export default {
  props: {
    slugProjectName: String,
    project_password: String,
    project: Object,
    read_only: Boolean,
  },
  components: {
    Modal,
    ImageSelect,
    TagsInput,
    AuthorsInput,
  },
  data() {
    return {
      show_folder: !!this.project.folder,
      show_image: !!this.project.preview,
      show_password: !!this.project_password,
      show_keywords: !!this.project.keywords,
      show_authors: !!this.project.authors,
      show_access_control: !!this.project.editing_limited_to,

      is_sending_content_to_server: false,

      existing_group_name: !!this.project.folder ? this.project.folder : "",
      new_group_name: "",

      projectdata: {
        name: this.project.name,
        authors: this.project.authors,
        editing_limited_to: this.project.editing_limited_to,
        viewing_limited_to: this.project.viewing_limited_to,
        keywords: this.project.keywords,
        password: this.project_password ? this.project_password : "",
      },

      tag: "",
      preview_rawdata: undefined,
      askBeforeClosingModal: false,
    };
  },
  watch: {
    projectdata: {
      handler() {
        this.askBeforeClosingModal = true;
      },
      deep: true,
    },
    preview_rawdata: function () {
      this.askBeforeClosingModal = true;
    },
    "projectdata.editing_limited_to": function () {
      if (this.projectdata.editing_limited_to === "everybody")
        this.projectdata.viewing_limited_to = "everybody";
      else if (this.projectdata.editing_limited_to === "only_authors")
        this.show_authors = true;
    },
  },
  mounted() {
    this.projectdata.editing_limited_to = !!this.project.editing_limited_to
      ? this.project.editing_limited_to
      : "everybody";
  },
  computed: {
    previewURL() {
      if (
        !this.project.hasOwnProperty("preview") ||
        this.project.preview === ""
      ) {
        return "";
      }
      const thumb = this.project.preview.filter((p) => p.size === 640);
      if (thumb.length > 0) {
        return `${thumb[0].path}`;
      }
      return "";
    },
  },
  methods: {
    editThisProject: function (event) {
      console.log("editThisProject");

      // only if user changed the name of this folder
      if (this.projectdata.name !== this.project.name) {
        function getAllProjectNames() {
          let allProjectsName = [];
          for (let slugProjectName in window.store.projects) {
            let projectName = window.store.projects[slugProjectName].name;
            allProjectsName.push(projectName);
          }
          return allProjectsName;
        }
        let allProjectsName = getAllProjectNames();

        // check if project name (not slug) already exists
        if (allProjectsName.indexOf(this.projectdata.name) >= 0) {
          // invalidate if it does
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.name_already_exists"));

          return false;
        }
      }

      if (this.preview_rawdata !== undefined) {
        this.projectdata.preview_rawdata = this.preview_rawdata;
      }

      // check if password and password changed
      if (this.projectdata.password) {
        this.$auth.updateFoldersPasswords({
          projects: {
            [this.slugProjectName]: this.projectdata.password,
          },
        });
      }

      if (!!this.existing_group_name) {
        if (this.existing_group_name === "_none") this.projectdata.folder = "";
        else this.projectdata.folder = this.existing_group_name;
      } else if (!!this.new_group_name) {
        this.projectdata.folder = this.new_group_name.toUpperCase();
      }

      if (
        this.projectdata.editing_limited_to === "only_authors" &&
        this.projectdata.authors.length === 0
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.if_only_authors_select_authors"));

        return false;
      }

      this.is_sending_content_to_server = true;

      this.$root.editFolder({
        type: "projects",
        slugFolderName: this.slugProjectName,
        data: this.projectdata,
      });

      this.$emit("close", "");
    },
  },
};
</script>
<style></style>
