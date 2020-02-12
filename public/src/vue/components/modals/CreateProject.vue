<template>
  <Modal
    @close="$emit('close')"
    @submit="newProject"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
  >
    <template slot="header">
      <span class>{{ $t('create_a_project') }}</span>
    </template>

    <template slot="sidebar">
      <!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('project_name') }}</label>
        <input type="text" v-model.trim="projectdata.name" required autofocus />
      </div>

      <!-- Folder -->
      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_folder }"
            @click="show_folder = !show_folder"
          >{{ $t("folder") }}</button>
        </label>
        <div v-if="show_folder">
          <template v-if="$root.all_folders.length">
            <!-- <label v-html="$t('add_to_existing_folder')" /> -->
            <div class="input-group margin-bottom-none">
              <select v-model="existing_group_name">
                <option :key="'create'" :value="''">** {{ $t("create_new") }} **</option>
                <option
                  v-for="folder in $root.all_folders"
                  :key="folder"
                  :value="folder"
                >{{ folder }}</option>
              </select>
            </div>
          </template>

          <div v-if="existing_group_name === ''">
            <label v-html="$t('new_folder_name')" />
            <input type="text" class="text-uc" v-model.trim="new_group_name" />
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
          >{{ $t("cover_image") }}</button>
        </label>
        <template v-if="show_image">
          <ImageSelect :load_from_projects_medias="true" @newPreview="value => { preview = value }"></ImageSelect>
        </template>
      </div>

      <!-- Password -->
      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_password }"
            @click="show_password = !show_password"
          >{{ $t("password") }}</button>
        </label>
        <template v-if="show_password">
          <input type="password" v-model="projectdata.password" autocomplete="new-password" />
          <small>{{ $t('password_instructions') }}</small>
        </template>
      </div>

      <!-- Keywords -->
      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_keywords }"
            @click="show_keywords = !show_keywords"
          >{{ $t("keywords") }}</button>
        </label>
        <template v-if="show_keywords">
          <TagsInput @tagsChanged="newTags => projectdata.keywords = newTags" />
        </template>
      </div>

      <!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_authors }"
            @click="show_authors = !show_authors"
          >{{ $t("author") }}</button>
        </label>

        <template v-if="show_authors">
          <AuthorsInput
            :currentAuthors="projectdata.authors"
            @authorsChanged="newAuthors => projectdata.authors = newAuthors"
          />
          <small>{{ $t('author_instructions') }}</small>
        </template>
      </div>
    </template>

    <template slot="submit_button">{{ $t('create') }}</template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import ImageSelect from "../subcomponents/ImageSelect.vue";
import TagsInput from "../subcomponents/TagsInput.vue";
import AuthorsInput from "../subcomponents/AuthorsInput.vue";

export default {
  props: {
    read_only: Boolean
  },
  components: {
    Modal,
    ImageSelect,
    TagsInput,
    AuthorsInput
  },
  data() {
    return {
      show_folder: !!this.$root.settings.opened_folder,
      show_image: false,
      show_password: false,
      show_keywords: false,
      show_authors: false,

      existing_group_name: !!this.$root.settings.opened_folder
        ? this.$root.settings.opened_folder
        : "",
      new_group_name: "",

      projectdata: {
        name: "",
        password: "",
        authors: this.$root.settings.current_author.hasOwnProperty("name")
          ? [{ name: this.$root.settings.current_author.name }]
          : [],
        keywords: []
      },
      preview: undefined,
      askBeforeClosingModal: false
    };
  },
  watch: {
    "projectdata.name": function() {
      if (this.projectdata.name.length > 0) {
        this.askBeforeClosingModal = true;
      } else {
        this.askBeforeClosingModal = false;
      }
    },
    preview: function() {
      if (!!this.preview) {
        this.askBeforeClosingModal = true;
      } else {
        this.askBeforeClosingModal = false;
      }
    }
  },
  computed: {},
  methods: {
    newProject: function(event) {
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
          .error(this.$t("notifications.project_name_exists"));

        return false;
      }
      if (!!this.preview) {
        this.projectdata.preview_rawdata = this.preview;
      }

      if (!!this.existing_group_name) {
        this.projectdata.folder = this.existing_group_name;
      } else if (!!this.new_group_name) {
        this.projectdata.folder = this.new_group_name.toUpperCase();
      }

      this.$eventHub.$on(
        "socketio.folder_created_or_updated",
        this.newFolderCreated
      );
      this.$root.createFolder({ type: "projects", data: this.projectdata });
    },
    newFolderCreated: function(fdata) {
      if (fdata.id === this.$root.justCreatedFolderID) {
        this.$eventHub.$off(
          "socketio.folder_created_or_updated",
          this.newFolderCreated
        );
        this.$root.justCreatedFolderID = false;

        if (fdata.password === "has_pass") {
          this.$auth.updateFoldersPasswords({
            projects: {
              [fdata.slugFolderName]: this.projectdata.password
            }
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
    }
  }
};
</script>
<style>
</style>
