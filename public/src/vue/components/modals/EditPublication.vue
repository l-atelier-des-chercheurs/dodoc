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

      <!-- Preview -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('cover_image') }}</label><br>
        <ImageSelect 
          :previewURL="previewURL"
          @newPreview="value => { preview = value }"
        >
        </ImageSelect>
      </div>-->

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
              {{ project.name }}</option
            >
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
            @tagsChanged="(newTags) => (publidata.keywords = newTags)"
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
          >
            {{ $t("author") }}
          </button>
        </label>

        <template v-if="show_authors">
          <AuthorsInput
            :currentAuthors="publidata.authors"
            @authorsChanged="(newAuthors) => (publidata.authors = newAuthors)"
          />
          <small>{{ $t("author_instructions") }}</small>
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
    slugPubliName: String,
    publication: Object,
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
      publidata: {
        name: this.publication.name,
        attached_to_project: !!this.publication.attached_to_project
          ? this.publication.attached_to_project
          : "",
        authors:
          typeof this.publication.authors === "string" &&
          this.publication.authors !== ""
            ? this.publication.authors.split(",").map((a) => {
                return { name: a };
              })
            : this.publication.authors,
        keywords: this.publication.keywords,
      },
      tag: "",
      preview: undefined,
      askBeforeClosingModal: false,

      show_attached_project: !!this.publication.attached_to_project,
      show_keywords: !!this.publication.keywords,
      show_authors: !!this.publication.authors,
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
  computed: {},
  methods: {
    editThisPublication: function (event) {
      console.log("editThisPublication");

      // only if user changed the name of this folder
      if (this.publidata.name !== this.publication.name) {
        function getAllProjectNames() {
          let allPublicationsName = [];
          for (let slugPubliName in window.store.publications) {
            let projectName = window.store.publications[slugPubliName].name;
            allPublicationsName.push(projectName);
          }
          return allPublicationsName;
        }
        let allPublicationsName = getAllProjectNames();

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
