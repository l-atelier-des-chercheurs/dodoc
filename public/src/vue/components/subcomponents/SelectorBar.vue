<template>
  <div class="m_selector">
    <div class="m_selector--content">
      <div
        v-if="selected_medias.length > 0"
        class="m_selector--content--title"
      >{{ selected_medias.length }} {{ $t("medias_selected") }}</div>
      <div
        v-if="selected_projects.length > 0"
        class="m_selector--content--title"
      >{{ selected_projects.length }} {{ $t("projects_selected") }}</div>
      <div class="m_selector--content--buttons">
        <button type="button" class="buttonLink" @click="$emit('deselect')">Deselect</button>

        <button
          type="button"
          class="buttonLink"
          @click="duplicateButtonClicked"
          :class="{ 'is--active': show_copy_options }"
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
            style="enable-background:new 0 0 91.6 95;"
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
        <button type="button" class="buttonLink" @click="confirmRemoveSelection">
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
            style="enable-background:new 0 0 91.6 95;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
            />
          </svg>
          <span class>{{ $t("remove") }}</span>
        </button>
      </div>
      <div class="m_selector--content--actions" v-if="show_copy_options">
        <label v-html="$t('add_to_project')" />
        <div class="input-group">
          <select v-model="slugProjectName_to_copy_to">
            <option
              v-for="project in all_projects"
              :key="project.slugFolderName"
              :value="project.slugFolderName"
            >{{ project.name }}</option>
          </select>
          <button
            type="button"
            @click="copyMediasToProject"
            :disabled="slugProjectName_to_copy_to === ''"
            v-html="$t('copy')"
            class="bg-bleuvert"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    selected_medias: {
      type: Array,
      default: () => []
    },
    selected_projects: {
      type: Array,
      default: () => []
    },
    slugFolderName: String
  },
  components: {},
  data() {
    return {
      show_copy_options: false,
      slugProjectName_to_copy_to: !!this.$root.do_navigation
        .current_slugProjectName
        ? this.$root.do_navigation.current_slugProjectName
        : ""
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    all_projects() {
      return this.$root.projects_that_are_accessible;
    }
  },
  methods: {
    duplicateButtonClicked() {
      if (this.selected_medias.length > 0) {
        this.show_copy_options = !this.show_copy_options;
      } else if (this.selected_projects.length > 0) {
        this.selected_projects.map(m => {
          let new_folder_name = this.$t("copy_of") + " " + m.slugFolderName;

          const corresponding_project = this.$root.projects_that_are_accessible.find(
            p => p.slugFolderName === m.slugFolderName
          );
          if (corresponding_project.hasOwnProperty("name"))
            new_folder_name =
              this.$t("copy_of") + " " + corresponding_project.name;

          this.$socketio.copyFolder({
            type: "projects",
            slugFolderName: m.slugFolderName,
            new_folder_name
          });

          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .log(this.$t("notifications.project_copy_in_progress"));

          this.$eventHub.$once("socketio.projects.folder_listed", () => {
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .success(this.$t("notifications.project_copy_completed"));
          });
        });
      }
    },
    confirmRemoveSelection() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveSelection"),
          () => {
            this.selected_medias.map(m => {
              this.$root.removeMedia({
                type: "projects",
                slugFolderName: m.slugFolderName,
                slugMediaName: m.metaFileName
              });
            });

            this.selected_projects.map(m => {
              this.$root.removeFolder({
                type: "projects",
                slugFolderName: m.slugFolderName
              });
            });

            this.$emit("deselect");
          },
          () => {}
        );
    },
    copyMediasToProject() {
      console.log("copyMediaToProject " + this.slugProjectName_to_copy_to);

      this.selected_medias.map(m => {
        this.$socketio.copyMediaToFolder({
          type: "projects",
          from_slugFolderName: m.slugFolderName,
          to_slugFolderName: this.slugProjectName_to_copy_to,
          slugMediaName: m.metaFileName
        });
      });
      this.show_copy_options = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.m_selector {
  position: fixed;
  bottom: 0;
  left: 0;
  pointer-events: none;
  z-index: 100;
  padding: var(--spacing);

  order: 0;

  display: flex;
  flex-flow: row wrap;
  align-items: center;

  .m_activitiesPanel--do.is--large & {
    position: absolute;
    width: 100%;
  }

  > .m_selector--content {
    background-color: var(--c-noir);
    color: white;
    max-width: 400px;
    // width: 80%;
    margin: 0 auto 20px;
    border-radius: 10px;
    text-align: center;
    font-size: 80%;

    pointer-events: auto;

    .m_selector--content--title {
      margin: calc(var(--spacing) / 2) calc(var(--spacing) / 2);
    }

    .m_selector--content--buttons {
      text-align: center;
      margin: calc(var(--spacing) / 2) calc(var(--spacing) / 2);
    }

    .m_selector--content--actions {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      margin: calc(var(--spacing) / 2) calc(var(--spacing) / 2);
      color: white;

      select {
        // max-width: 240px;
        flex: 1 1 240px;
      }
      > *:last-child {
        margin-bottom: 0;
      }
    }
  }
}

button {
  color: inherit;
  margin: 0;

  &.is--active {
    background-color: #fff;
    color: var(--c-noir);
  }
}
label {
  color: inherit;
}
</style>
