<template>
  <Modal
    @close="$emit('close')"
    @submit="newProject"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
    :is_loading="is_sending_content_to_server"
  >
    <template slot="header">
      <span class>{{ $t("create_a_project") }}</span>
    </template>

    <template slot="sidebar">
      <!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t("project_name") }}</label>
        <input type="text" v-model.trim="projectdata.name" required autofocus />
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
          <AuthorsInput
            :currentAuthors="projectdata.authors"
            @authorsChanged="(newAuthors) => (projectdata.authors = newAuthors)"
          />
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
        <div v-if="show_image">
          <ImageSelect
            :load_from_projects_medias="true"
            @newPreview="
              (value) => {
                preview = value;
              }
            "
          ></ImageSelect>
        </div>
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
          <!-- <label v-html="$t('add_to_existing_folder')" /> -->
          <div class="">
            <select v-model="existing_group_name">
              <option :key="'none'" :value="'_none'">{{ $t("none") }}</option>
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
        <div v-if="show_keywords">
          <TagsInput
            @tagsChanged="(newTags) => (projectdata.keywords = newTags)"
          />
        </div>
      </div>
    </template>

    <template slot="submit_button">{{ $t("create") }}</template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import ImageSelect from "../subcomponents/ImageSelect.vue";
import TagsInput from "../subcomponents/TagsInput.vue";
import AuthorsInput from "../subcomponents/AuthorsInput.vue";

export default {
  props: {
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
      show_folder: !!this.$root.settings.opened_folder,
      show_image: false,
      show_password: false,
      show_keywords: false,
      show_authors: this.$root.current_author,
      show_access_control: true,

      is_sending_content_to_server: false,

      existing_group_name: !!this.$root.settings.opened_folder
        ? this.$root.settings.opened_folder
        : "_none",
      new_group_name: "",
      enable_visible_to_all: false,

      projectdata: {
        name: "",
        editing_limited_to: "everybody",
        viewing_limited_to: "everybody",
        password: "",
        authors: this.$root.current_author
          ? [{ slugFolderName: this.$root.current_author.slugFolderName }]
          : [],
        keywords: [],
      },
      preview: undefined,
      askBeforeClosingModal: false,
    };
  },
  watch: {
    "projectdata.name": function () {
      if (this.projectdata.name.length > 0) {
        this.askBeforeClosingModal = true;
      } else {
        this.askBeforeClosingModal = false;
      }
    },
    preview: function () {
      if (!!this.preview) {
        this.askBeforeClosingModal = true;
      } else {
        this.askBeforeClosingModal = false;
      }
    },
    "projectdata.editing_limited_to": function () {
      if (this.projectdata.editing_limited_to === "everybody")
        this.projectdata.viewing_limited_to = "everybody";
      else if (this.projectdata.editing_limited_to === "only_authors")
        this.show_authors = true;
    },
  },
  computed: {},
  methods: {
    newProject: function (event) {
      console.log("newProject");

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
      if (!!this.preview) {
        this.projectdata.preview_rawdata = this.preview;
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

      this.$eventHub.$on(
        "socketio.folder_created_or_updated",
        this.newFolderCreated
      );

      this.is_sending_content_to_server = true;

      this.$root.createFolder({ type: "projects", data: this.projectdata });
    },
    newFolderCreated: function (fdata) {
      if (fdata.id === this.$root.justCreatedFolderID) {
        this.$eventHub.$off(
          "socketio.folder_created_or_updated",
          this.newFolderCreated
        );
        this.$root.justCreatedFolderID = false;

        if (fdata.password === "has_pass") {
          this.$auth.updateFoldersPasswords({
            projects: {
              [fdata.slugFolderName]: this.projectdata.password,
            },
          });
          this.$socketio.sendAuth();

          this.$eventHub.$once("socketio.authentificated", () => {
            this.$emit("close", "");
            this.$root.openProject(fdata.slugFolderName);
          });
        } else {
          this.$nextTick(() => {
            this.$emit("close", "");
            this.$root.openProject(fdata.slugFolderName);
          });
        }
      }
    },
  },
};
</script>
<style></style>
