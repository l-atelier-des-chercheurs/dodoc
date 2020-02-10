<template>
  <div
    class="m_project"
    :class="{ 'is--hovered': is_hovered, 'is--selected': is_selected }"
    @mouseover="is_hovered = true"
    @mouseleave="is_hovered = false"
  >
    <div class="m_project--presentation">
      <div v-if="previewURL" class="m_project--presentation--vignette">
        <img :src="previewURL" class draggable="false" />
      </div>
      <div
        v-else-if="context === 'full'"
        class="m_project--presentation--novignette"
      >
        <button
          type="button"
          class="buttonLink"
          @click="showEditProjectModal = true"
        >
          {{ $t("add_a_cover_image") }}
        </button>
      </div>

      <div class="m_project--presentation--text">
        <h2
          class="m_project--presentation--text--title"
          :content="slugProjectName"
          v-tippy="{
            placement: 'bottom-start',
            delay: [600, 0],
            interactive: true
          }"
        >
          {{ project.name }}
        </h2>

        <div class="m_project--presentation--text--infos">
          <div class="m_keywordField">
            <span
              v-for="keyword in project.keywords"
              :key="keyword.title"
              :class="[
                'tagcolorid_' + (parseInt(keyword.title, 36) % 2),
                {
                  'is--active':
                    $root.settings.project_filter.keyword === keyword.title
                }
              ]"
              >{{ keyword.title }}</span
            >
          </div>
          <div class="m_metaField" v-if="!!project.authors">
            <div>{{ $t("author") }}</div>
            <div class="m_authorField">
              <span v-if="typeof project.authors === 'string'">
                {{ project.authors }}
              </span>
              <span
                v-else-if="typeof project.authors === 'object'"
                v-for="author in project.authors"
                :key="author.name"
                class="is--active"
                >{{ author.name }}</span
              >
            </div>
          </div>

          <DateField :title="'created'" :date="project.date_created" />

          <DateField :title="'edited'" :date="project.date_modified" />

          <div
            class="m_metaField"
            v-if="
              can_access_folder &&
                project.password === 'has_pass' &&
                context !== 'full'
            "
          >
            <label>{{ $t("protected_by_pass") }}</label>
          </div>
          <button
            v-if="!can_access_folder && !showInputPasswordField"
            type="button"
            class="buttonLink"
            style="display: block; margin: 0 auto calc(var(--spacing) / 2);"
            :readonly="read_only"
            @click="showInputPasswordField = !showInputPasswordField"
          >
            {{ $t("password_required_to_open") }}
          </button>

          <div
            class="padding-small"
            v-if="showInputPasswordField && !can_access_folder"
          >
            <div class="margin-bottom-small">
              <label>{{ $t("password") }}</label>
              <input
                type="password"
                ref="passwordField"
                @keydown.enter.prevent="submitPassword"
                required
                autofocus
                placeholder="…"
              />
            </div>
            <!-- <div class="switch switch-xs margin-bottom-small">
                <input
                  type="checkbox"
                  class="switch"
                  id="remember_project_password_for_this_device"
                  v-model="remember_project_password_for_this_device"
                />
                <label
                  for="remember_project_password_for_this_device"
                >{{ $t('remember_project_password_for_this_device') }}</label>
            </div>-->

            <button
              type="button"
              class="button bg-bleuvert"
              @click="submitPassword"
            >
              Valider
            </button>
          </div>

          <div
            v-if="can_access_folder && project_password && context === 'full'"
            class="m_metaField"
          >
            <div
              class="cursor-pointer"
              :readonly="read_only"
              @click="showCurrentPassword = !showCurrentPassword"
              v-html="!showCurrentPassword ? $t('show_password') : $t('hide')"
            />
            <div v-if="showCurrentPassword && can_access_folder">
              {{ project_password }}
            </div>
          </div>

          <button
            v-if="can_access_folder && project_password && context === 'full'"
            type="button"
            class="_button_forgetpassword"
            @click="forgetPassword"
          >
            {{ $t("forget_password_and_close") }}
          </button>
        </div>
      </div>

      <div class="m_project--presentation--buttons">
        <button
          v-if="can_access_folder && context !== 'full'"
          type="button"
          class="m_project--presentation--buttons--openButton"
          @click="$root.openProject(slugProjectName)"
        >
          <span class>{{ $t("open") }}</span>
        </button>

        <label
          v-if="
            can_access_folder &&
              context !== 'full' &&
              (is_hovered || is_selected)
          "
          :for="is_selected + id"
          class="m_project--presentation--buttons--selectionButton input-selector"
          @click.stop
        >
          <input
            :id="is_selected + id"
            type="checkbox"
            v-model="local_is_selected"
            @change="$emit('toggleSelect')"
          />
        </label>

        <button
          v-if="can_access_folder && context === 'full'"
          type="button"
          class="buttonLink"
          @click="showEditProjectModal = true"
          :disabled="read_only"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="100.7px"
            height="101px"
            viewBox="0 0 100.7 101"
            style="enable-background:new 0 0 100.7 101;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
              L19.1,91.5z"
            />
          </svg>
          {{ $t("edit") }}
        </button>

        <button
          v-if="can_access_folder && context === 'full'"
          type="button"
          class="buttonLink"
          @click="downloadProjectArchive"
          :disabled="zip_export_started"
        >
          <template v-if="!zip_export_started">
            <svg
              version="1.1"
              class="inline-svg"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="46.7px"
              height="70px"
              viewBox="0 0 46.7 70"
              style="enable-background:new 0 0 46.7 70;"
              xml:space="preserve"
            >
              <g>
                <g>
                  <path
                    class="st0"
                    d="M8.5,35.2l4.6,4.2c2.7,2.5,4.8,4.7,6.4,7.3l0-46.7h7.7l0,46.6c1.7-2.5,3.8-4.7,6.4-7.1l4.6-4.2l5.3,6.2
			L23.3,59.6L3.2,41.5L8.5,35.2z"
                  />
                </g>
                <polygon class="st0" points="46.7,70 0,70 0,62.4 46.6,62.4 	" />
              </g>
            </svg>
          </template>
          <template v-else>
            <span class="loader loader-small" />
          </template>
          {{ $t("download") }}
        </button>

        <button
          v-if="can_access_folder && context === 'full'"
          type="button"
          class="buttonLink"
          :class="{ 'is--active': showDuplicateProjectMenu }"
          @click="showDuplicateProjectMenu = !showDuplicateProjectMenu"
          :disabled="read_only"
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
          {{ $t("duplicate") }}
        </button>

        <div v-if="showDuplicateProjectMenu" class="margin-bottom-small">
          <label v-html="$t('name_of_copy')" />
          <form @submit.prevent="duplicateWithNewName()" class="input-group">
            <input
              type="text"
              v-model.trim="copy_project_name"
              required
              autofocus
            />
            <button type="submit" v-html="$t('copy')" class="bg-bleuvert" />
          </form>
        </div>

        <button
          v-if="can_access_folder && context === 'full'"
          type="button"
          class="buttonLink"
          @click="removeProject()"
          :disabled="read_only"
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
            <path
              class="st0"
              d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
            />
          </svg>
          {{ $t("remove") }}
        </button>
      </div>
      <EditProject
        v-if="showEditProjectModal"
        :project="project"
        :project_password="project_password"
        :slugProjectName="slugProjectName"
        @close="showEditProjectModal = false"
        :read_only="read_only"
      />
    </div>

    <MediaLibrary
      v-if="context === 'full'"
      :slugProjectName="slugProjectName"
      :project="project"
      :read_only="read_only"
    ></MediaLibrary>
  </div>
</template>
<script>
import EditProject from "./modals/EditProject.vue";
import MediaLibrary from "./MediaLibrary.vue";
import MediaCard from "./subcomponents/MediaCard.vue";

export default {
  props: {
    project: Object,
    read_only: Boolean,
    context: String,
    is_selected: Boolean
  },
  components: {
    EditProject,
    MediaLibrary,
    MediaCard
  },
  data() {
    return {
      slugProjectName: this.project.slugFolderName,
      showEditProjectModal: false,
      showInputPasswordField: false,
      showCurrentPassword: false,
      remember_project_password_for_this_device: true,

      local_is_selected: false,
      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5),
      is_hovered: false,

      showDuplicateProjectMenu: false,
      copy_project_name: this.$t("copy_of") + " " + this.project.name,
      zip_export_started: false
    };
  },
  watch: {
    can_access_folder() {
      if (!this.can_access_folder && this.context === "full") {
        // cas d’un mdp qui a été ajouté ou changé
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t("notifications.password_added_or_changed_to_this_project")
          );

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(
            this.$t("notifications.enter_password_to_reopen_project") +
              "&nbsp;:" +
              this.project.name
          );

        this.closeProject();
      }
    },
    is_selected: function() {
      this.local_is_selected = this.is_selected;
    }
  },
  mounted() {},
  beforeDestroy() {},
  computed: {
    previewURL() {
      if (
        !this.project.hasOwnProperty("preview") ||
        this.project.preview === ""
      ) {
        return false;
      }
      const thumb = this.project.preview.filter(p => p.size === 640);
      if (thumb.length > 0) {
        return `${thumb[0].path}`;
      }
      return false;
    },
    can_access_folder() {
      return this.$root.canAccessFolder({
        type: "projects",
        slugFolderName: this.slugProjectName
      });
    },
    project_password() {
      const projects_password = this.$auth.getFoldersPasswords();
      if (
        projects_password.hasOwnProperty("projects") &&
        projects_password["projects"].hasOwnProperty(this.slugProjectName) &&
        this.project.password === "has_pass"
      ) {
        return projects_password["projects"][this.slugProjectName];
      }
      return "";
    }
  },
  methods: {
    openProject() {
      if (context !== "full") {
        this.$root.openProject(this.slugProjectName);
      }
    },
    closeProject() {
      this.$root.closeProject();
    },
    removeProject() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveProject"),
          () => {
            this.$root.removeFolder({
              type: "projects",
              slugFolderName: this.slugProjectName
            });
            this.closeProject();
          },
          () => {}
        );
    },
    duplicateWithNewName(event) {
      console.log("METHODS • Project: duplicateWithNewName");

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
      if (allProjectsName.indexOf(this.copy_project_name) >= 0) {
        // invalidate if it does
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.project_name_exists"));

        return false;
      }

      this.$socketio.copyFolder({
        type: "projects",
        slugFolderName: this.slugProjectName,
        new_folder_name: this.copy_project_name
      });
      this.showDuplicateProjectMenu = false;

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
    },
    submitPassword() {
      console.log("METHODS • Project: submitPassword");

      this.$auth.updateFoldersPasswords({
        projects: {
          [this.slugProjectName]: this.$refs.passwordField.value
        }
      });

      this.$socketio.sendAuth();

      // check if password matches or not
      this.$eventHub.$once("socketio.authentificated", () => {
        const has_passworded_folder = window.state.list_authorized_folders.filter(
          f =>
            f.type === "projects" &&
            f.allowed_slugFolderNames.includes(this.slugProjectName)
        );
        if (has_passworded_folder.length === 0) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              this.$t("notifications.wrong_password_for") + this.project.name
            );
          this.$refs.passwordField.value = "";
          this.$refs.passwordField.focus();
        } else {
          this.showInputPasswordField = false;
        }
      });
    },
    forgetPassword() {
      this.$auth.removeFolderPassword({
        type: "projects",
        slugFolderName: this.slugProjectName
      });
      this.$socketio.sendAuth();

      this.closeProject();
    },
    downloadProjectArchive() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`Project • METHODS: downloadProjectArchive`);
      }
      this.zip_export_started = true;
      setTimeout(() => {
        this.zip_export_started = false;
      }, 2000);

      const pwd = this.$auth.hashCode(this.project_password);
      const query_url =
        window.location.origin +
        "/_archives/projects/" +
        this.slugProjectName +
        `?pwd=${pwd}`;

      if (this.$root.state.dev_mode === "debug")
        console.log(
          `Project • METHODS: downloadProjectArchive with query ${query_url}`
        );

      window.location.replace(query_url);
    }
  }
};
</script>
<style scoped></style>
