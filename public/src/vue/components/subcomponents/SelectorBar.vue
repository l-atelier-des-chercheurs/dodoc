<template>
  <div class="m_selector">
    <div class="m_selector--content">
      <div v-if="selected_medias.length > 0" class="m_selector--content--title">
        {{ selected_medias.length }} {{ $t("medias_selected") }}
      </div>
      <div
        v-if="selected_projects.length > 0"
        class="m_selector--content--title"
      >
        {{ selected_projects.length }} {{ $t("projects_selected") }}
      </div>
      <div class="m_selector--content--buttons">
        <button
          type="button"
          class="buttonLink bg-noir"
          v-if="selected_projects.length"
          @click="groupButtonClicked"
          :class="{ 'is--active': show_options === 'group' }"
        >
          <svg
            class="inline-svg"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="94px"
            height="87.7px"
            viewBox="0 0 94 87.7"
            style="enable-background: new 0 0 94 87.7;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M94,87.7H0v-74h94V87.7z M10,77.7h74v-54H10V77.7z"
            />
            <rect class="st0" width="40.3" height="13.7" />
          </svg>
          <span class>{{ $t("group") }}</span>
        </button>
        <button
          type="button"
          class="buttonLink bg-noir"
          v-if="selected_projects.length && some_projects_are_in_folders"
          @click="ungroupButtonClicked"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="94px"
            height="87.7px"
            viewBox="0 0 94 87.7"
            style="enable-background: new 0 0 94 87.7;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M94,87.7H0v-74h94V87.7z M10,77.7h74v-54H10V77.7z"
            />
            <polygon
              class="st0"
              points="69,63.8 55,50.7 69,37.7 61.8,30 61.6,29.7 47,43.3 32.4,29.7 32.2,30 25,37.7 39,50.7 25,63.8 
	32.4,71.8 47,58.2 61.6,71.8 "
            />
            <rect class="st0" width="40.3" height="13.7" />
          </svg>
          <span class>{{ $t("ungroup") }}</span>
        </button>
        <button
          type="button"
          class="buttonLink bg-noir"
          @click="duplicateButtonClicked"
          :class="{ 'is--active': show_options === 'duplicate' }"
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
            style="enable-background: new 0 0 91.6 95;"
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
        <button
          type="button"
          class="buttonLink bg-noir"
          @click="confirmRemoveSelection"
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
            style="enable-background: new 0 0 91.6 95;"
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
        <button
          type="button"
          class="buttonLink bg-noir"
          @click="$emit('deselect')"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="80px"
            height="80px"
            viewBox="0 0 80 80"
            style="enable-background: new 0 0 80 80;"
            xml:space="preserve"
          >
            <polygon
              class="st0"
              points="10,60 0,60 0,70 0,80 10,80 20,80 20,70 10,70 	"
            />
            <rect y="30" class="st0" width="10" height="20" />
            <polygon
              class="st0"
              points="70,70 60,70 60,80 70,80 80,80 80,70 80,60 70,60 	"
            />
            <rect x="70" y="30" class="st0" width="10" height="20" />
            <rect x="30" y="70" class="st0" width="20" height="10" />
            <polygon
              class="st0"
              points="0,0 0,10 0,20 10,20 10,10 20,10 20,0 10,0 	"
            />
            <rect x="30" class="st0" width="20" height="10" />
            <polygon
              class="st0"
              points="70,0 60,0 60,10 70,10 70,20 80,20 80,10 80,0 	"
            />
            <polygon
              class="st0"
              points="62,53.1 48,40 62,26.9 54.8,19.2 54.6,19 40,32.5 25.4,19 25.2,19.2 18,26.9 32,40 18,53.1 25.4,61 
	40,47.5 54.6,61 "
            />
          </svg>
          <span class>{{ $t("unselect") }}</span>
        </button>
      </div>
      <div class="m_selector--content--actions" v-if="show_options">
        <template v-if="show_options === 'duplicate'">
          <label v-html="$t('add_to_project')" />
          <div class="input-group">
            <select v-model="slugProjectName_to_copy_to">
              <option
                v-for="project in $root.projects_that_are_accessible"
                :key="project.slugFolderName"
                :value="project.slugFolderName"
                >{{ project.name }}</option
              >
            </select>
            <button
              type="button"
              @click="copyMediasToProject"
              :disabled="slugProjectName_to_copy_to === ''"
              v-html="$t('copy')"
              class="bg-bleuvert"
            />
          </div>
        </template>
        <form
          v-else-if="show_options === 'group'"
          @submit.prevent="groupProjects"
        >
          <template>
            <label v-html="$t('add_to_existing_folder')" />
            <div class="input-group">
              <select v-model="existing_group_name">
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

          <template v-if="existing_group_name === ''">
            <label v-html="$t('new_folder_name')" />
            <input type="text" class="text-uc" v-model.trim="new_group_name" />
          </template>
          <input
            type="submit"
            class="button button-bg_rounded bg-bleuvert margin-top-small"
            :disabled="!existing_group_name && !new_group_name"
          />
        </form>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    selected_medias: {
      type: Array,
      default: () => [],
    },
    selected_projects: {
      type: Array,
      default: () => [],
    },
    slugFolderName: String,
  },
  components: {},
  data() {
    return {
      show_options: false,
      slugProjectName_to_copy_to: !!this.$root.do_navigation
        .current_slugProjectName
        ? this.$root.do_navigation.current_slugProjectName
        : "",

      existing_group_name: "",
      new_group_name: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    some_projects_are_in_folders() {
      return this.selected_projects.some((p) => {
        const corresponding_project = this.$root.projects_that_are_accessible.find(
          (_p) => _p.slugFolderName === p.slugFolderName
        );
        if (corresponding_project) return !!corresponding_project.folder;
        return false;
      });
    },
  },
  methods: {
    groupButtonClicked() {
      if (this.selected_projects.length > 0) {
        this.show_options = this.show_options === "group" ? false : "group";
      }
    },
    ungroupButtonClicked() {
      this.selected_projects.map((m) => {
        this.$root.editFolder({
          type: "projects",
          slugFolderName: m.slugFolderName,
          data: {
            folder: "",
          },
        });
      });

      this.$emit("deselect");
    },
    groupProjects() {
      if (!this.existing_group_name && !this.new_group_name) return;

      let folder_name;

      this.new_group_name = this.new_group_name.toUpperCase();

      if (!!this.existing_group_name) {
        folder_name = this.existing_group_name;
      } else if (!!this.new_group_name) {
        folder_name = this.new_group_name;
      }

      this.selected_projects.map((m) => {
        this.$root.editFolder({
          type: "projects",
          slugFolderName: m.slugFolderName,
          data: {
            folder: folder_name,
          },
        });
      });

      this.existing_group_name = "";
      this.new_group_name = "";

      this.$emit("deselect");
    },
    duplicateButtonClicked() {
      if (this.selected_medias.length > 0) {
        this.show_options =
          this.show_options === "duplicate" ? false : "duplicate";
      } else if (this.selected_projects.length > 0) {
        this.selected_projects.map((m) => {
          let new_folder_name = this.$t("copy_of") + " " + m.slugFolderName;

          const corresponding_project = this.$root.projects_that_are_accessible.find(
            (p) => p.slugFolderName === m.slugFolderName
          );
          if (corresponding_project.hasOwnProperty("name"))
            new_folder_name =
              this.$t("copy_of") + " " + corresponding_project.name;

          this.$socketio.copyFolder({
            type: "projects",
            slugFolderName: m.slugFolderName,
            new_folder_name,
          });

          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .log(this.$t("notifications.copy_in_progress"));

          this.$emit("deselect");

          this.$eventHub.$once("socketio.projects.folder_listed", () => {
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .success(this.$t("notifications.copy_completed"));
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
            this.selected_medias.map((m) => {
              this.$root.removeMedia({
                type: "projects",
                slugFolderName: m.slugFolderName,
                slugMediaName: m.metaFileName,
              });
            });

            this.selected_projects.map((m) => {
              this.$root.removeFolder({
                type: "projects",
                slugFolderName: m.slugFolderName,
              });
            });

            this.$emit("deselect");
          },
          () => {}
        );
    },
    copyMediasToProject() {
      console.log("copyMediaToProject " + this.slugProjectName_to_copy_to);

      this.selected_medias.map((m) => {
        this.$socketio.copyMediaToFolder({
          type: "projects",
          from_slugFolderName: m.slugFolderName,
          to_slugFolderName: this.slugProjectName_to_copy_to,
          slugMediaName: m.metaFileName,
        });
      });
      this.show_options = false;

      this.$emit("deselect");
    },
  },
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

      > form {
        width: 100%;
      }

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
