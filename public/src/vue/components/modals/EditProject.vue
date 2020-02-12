<template>
  <Modal
    @close="$emit('close')"
    @submit="editThisProject"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
  >
    <template slot="header">
      <div class>{{ $t('edit_project') }}</div>
    </template>

    <template slot="sidebar">
      <!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('project_name') }}</label>
        <input
          class="input-big"
          type="text"
          v-model.trim="projectdata.name"
          required
          :readonly="read_only"
        />
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
                <option v-if="!!project.folder" :key="'create'" :value="'_none'">{{ $t("none") }}</option>
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
          <ImageSelect
            :previewURL="previewURL"
            :load_from_projects_medias="true"
            :slugProjectName="slugProjectName"
            @newPreview="value => { preview_rawdata = value }"
          />
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
          <input type="password" v-model="projectdata.password" :readonly="read_only" />
          <small>
            <template
              v-if="!!project_password && projectdata.password === ''"
            >{{ $t('removing_password_warning') }}</template>
            <template v-else>{{ $t('adding_password_warning') }}</template>
          </small>
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
          <TagsInput
            :keywords="projectdata.keywords"
            @tagsChanged="newTags => projectdata.keywords = newTags"
          />
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

    <template slot="submit_button">{{ $t('save') }}</template>
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
      show_folder: !!this.project.folder,
      show_image: !!this.project.preview,
      show_password: !!this.project_password,
      show_keywords: !!this.project.keywords,
      show_authors: !!this.project.authors,

      existing_group_name: !!this.project.folder ? this.project.folder : "",
      new_group_name: "",

      projectdata: {
        name: this.project.name,
        authors:
          typeof this.project.authors === "string" &&
          this.project.authors !== ""
            ? this.project.authors.split(",").map(a => {
                return { name: a };
              })
            : this.project.authors,
        keywords: this.project.keywords,
        password: this.project_password ? this.project_password : ""
      },
      tag: "",
      preview_rawdata: undefined,
      askBeforeClosingModal: false
    };
  },
  watch: {
    projectdata: {
      handler() {
        this.askBeforeClosingModal = true;
      },
      deep: true
    },
    preview_rawdata: function() {
      this.askBeforeClosingModal = true;
    }
  },
  mounted() {},
  computed: {
    previewURL() {
      if (
        !this.project.hasOwnProperty("preview") ||
        this.project.preview === ""
      ) {
        return "";
      }
      const thumb = this.project.preview.filter(p => p.size === 640);
      if (thumb.length > 0) {
        return `${thumb[0].path}`;
      }
      return "";
    }
  },
  methods: {
    editThisProject: function(event) {
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
            .error(this.$t("notifications.project_name_exists"));

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
            [this.slugProjectName]: this.projectdata.password
          }
        });
      }

      if (!!this.existing_group_name) {
        if (this.existing_group_name === "_none") this.projectdata.folder = "";
        else this.projectdata.folder = this.existing_group_name;
      } else if (!!this.new_group_name) {
        this.projectdata.folder = this.new_group_name.toUpperCase();
      }

      this.$root.editFolder({
        type: "projects",
        slugFolderName: this.slugProjectName,
        data: this.projectdata
      });

      this.$emit("close", "");
    }
  }
};
</script>
<style>
</style>
