<template>
  <Modal
    @close="$emit('close')"
    @submit="editThisPublication"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
  >
    <template slot="header">
      <div class>{{ $t('edit_publication') }}</div>
    </template>

    <template slot="sidebar">
      <!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('name') }}</label>
        <input
          class="input-big"
          type="text"
          v-model="publidata.name"
          required
          autofocus
          :readonly="read_only"
        />
      </div>

      <!-- Preview -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('preview') }}</label><br>
        <ImageSelect 
          :previewURL="previewURL"
          @newPreview="value => { preview = value }"
        >
        </ImageSelect>
      </div>-->

      <!-- Password -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="publidata.password" :readonly="read_only">
        <small>{{ $t('password_instructions') }}</small>
      </div>-->

      <!-- Keywords -->
      <div class="margin-bottom-small">
        <label>{{ $t('keywords') }}</label>
        <TagsInput
          :keywords="publidata.keywords"
          @tagsChanged="newTags => publidata.keywords = newTags"
        />
      </div>

      <!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>{{ $t('author') }}</label>
        <br />
        <AuthorsInput
          :currentAuthors="publidata.authors"
          @authorsChanged="newAuthors => publidata.authors = newAuthors"
        />
        <small>{{ $t('author_instructions') }}</small>
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
    slugPubliName: String,
    publication: Object,
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
      publidata: {
        name: this.publication.name,
        authors:
          typeof this.publication.authors === "string" &&
          this.publication.authors !== ""
            ? this.publication.authors.split(",").map(a => {
                return { name: a };
              })
            : this.publication.authors,
        keywords: this.publication.keywords
      },
      tag: "",
      preview: undefined,
      askBeforeClosingModal: false
    };
  },
  watch: {
    publidata: {
      handler() {
        this.askBeforeClosingModal = true;
      },
      deep: true
    }
  },
  mounted() {},
  computed: {},
  methods: {
    editThisPublication: function(event) {
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
            .error(this.$t("notifications.publi_name_exists"));

          return false;
        }
      }

      if (typeof this.preview !== "undefined") {
        this.publidata.preview_rawdata = this.preview;
      }

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: this.publidata
      });

      this.$emit("close", "");
    }
  }
};
</script>
<style>
</style>
