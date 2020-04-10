<template>
  <div class="m_addcreationtoproject">
    <div class="margin-bottom-small">
      <label v-html="$t('add_to_project')" />
      <div class="flex-nowrap">
        <select v-model="upload_to_folder">
          <option
            v-for="project in all_projects"
            :key="project.slugFolderName"
            :value="project.slugFolderName"
            >{{ project.name }}</option
          >
        </select>
        <button
          type="button"
          @click="addTempMediaToFolder()"
          :disabled="upload_to_folder === ''"
          v-html="$t('send')"
          class="bg-bleuvert button-small"
        />
      </div>
    </div>
    <!-- <div class="margin-bottom-small">
      <label v-html="$t('create_project_and_add_media')" />


    </div>-->
  </div>
</template>
<script>
export default {
  props: {
    media_filename: String,
    publication: Object,
  },
  components: {},
  data() {
    return {
      upload_to_folder: "",
    };
  },

  created() {},
  mounted() {
    if (this.$root.do_navigation.current_slugProjectName) {
      this.upload_to_folder = this.$root.do_navigation.current_slugProjectName;
    } else {
      this.upload_to_folder = this.all_projects[0].slugFolderName;
    }
  },
  beforeDestroy() {},

  watch: {},
  computed: {
    all_projects() {
      return this.$root.projects_that_are_accessible;
    },
  },
  methods: {
    addTempMediaToFolder() {
      let caption = this.$t("cooking_pot") + " / " + this.publication.name;

      this.$socketio.addTempMediaToFolder({
        from: {
          media_filename: this.media_filename,
          type: "publications",
        },
        to: {
          slugFolderName: this.upload_to_folder,
          type: "projects",
        },
        additionalMeta: {
          caption,
          authors: this.$root.current_author
            ? [{ slugFolderName: this.$root.current_author.slugFolderName }]
            : "",
        },
      });

      if (
        this.$root.do_navigation.view === "ProjectView" &&
        this.$root.do_navigation.current_slugProjectName ===
          this.upload_to_folder
      ) {
        this.$emit("close");
        return;
      }

      this.$root.closeProject();
      this.$nextTick(() => {
        this.$root.openProject(this.upload_to_folder);
        this.$emit("close");
      });
    },
  },
};
</script>
<style></style>
