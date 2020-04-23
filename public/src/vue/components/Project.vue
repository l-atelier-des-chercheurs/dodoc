<template>
  <div
    class="m_project"
    :class="{
      'is--hovered': is_hovered && can_see_project,
      'is--selected': is_selected,
      'is--accessible': can_see_project,
    }"
    @mouseover="is_hovered = true"
    @mouseleave="is_hovered = false"
  >
    <div
      class="m_project--presentation"
      :class="{ 'is--full': context === 'full' }"
    >
      <div v-if="previewURL" class="m_project--presentation--vignette">
        <img :src="previewURL" class draggable="false" />
      </div>
      <div
        v-else-if="context === 'full' && can_edit_project"
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
        <h2 class="m_project--presentation--text--title">
          <!-- Generator: Adobe Illustrator 24.1.0, SVG Export Plug-In  -->
          {{ project.name }}
          <ProtectedLock
            :editing_limited_to="project.editing_limited_to"
            :is_protected="!can_edit_project"
          />
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
                    $root.settings.project_filter.keyword === keyword.title,
                },
              ]"
              >{{ keyword.title }}</span
            >
          </div>
          <div class="m_metaField" v-if="!!project.authors">
            <div>{{ $t("author") }}</div>
            <div class="m_authorField">
              <span
                v-for="author in project.authors"
                v-if="author.slugFolderName"
                :key="author.slugFolderName"
                class="is--active"
                :class="{
                  'is--loggedInAuthor':
                    $root.current_author &&
                    $root.current_author.slugFolderName ===
                      author.slugFolderName,
                }"
              >
                <template v-if="$root.getAuthor(author.slugFolderName)">
                  {{ $root.getAuthor(author.slugFolderName).name }}
                </template>
                <template v-else>
                  {{ author.slugFolderName }}
                </template>
              </span>
            </div>
          </div>

          <div
            class="m_metaField"
            v-if="!!project.folder && context === 'full'"
          >
            <div>{{ $t("folder") }}</div>
            <div class="m_folderField">
              <span>{{ project.folder }}</span>
            </div>
          </div>

          <DateField :title="'created'" :date="project.date_created" />

          <DateField :title="'edited'" :date="project.date_modified" />

          <AccessController
            :folder="project"
            :context="context"
            :type="'projects'"
            @openFolder="openProject"
            @closeFolder="closeProject"
          />
        </div>
      </div>

      <div class="m_project--presentation--buttons">
        <button
          v-if="context !== 'full' && can_see_project"
          type="button"
          class="m_project--presentation--buttons--openButton button-redthin"
          @click.exact="openProject"
          @click.shift.left.exact="$emit('toggleSelect')"
          @click.meta.left.exact="$emit('toggleSelect')"
        >
          <span v-if="!project.folder" class>{{ $t("open") }}</span>
          <svg
            version="1.1"
            class="m_project--presentation--buttons--openButton--icon inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="46.3px"
            height="46.3px"
            viewBox="0 0 46.3 46.3"
            style="enable-background: new 0 0 46.3 46.3;"
            xml:space="preserve"
          >
            <path
              class="st0"
              style="fill: currentColor;"
              d="M38.1,29.1L37.8,23c-0.1-3.7-0.1-6.7,0.6-9.7l-33,33L0,40.9L32.9,7.9c-2.9,0.6-6,0.6-9.6,0.5l-6.2-0.3L17.8,0
		l27.1,1.4l1.4,27.1L38.1,29.1z"
            />
          </svg>
        </button>

        <button
          v-if="context !== 'full'"
          type="button"
          :class="{ 'is--disabled': !can_see_project }"
          class="m_project--presentation--buttons--invisibleOpenButton"
          @click.exact="openProject"
          @click.shift.left.exact="$emit('toggleSelect')"
          @click.meta.left.exact="$emit('toggleSelect')"
        >
          <span class>{{ $t("open") }}</span>
        </button>

        <label
          v-if="context !== 'full' && (is_hovered || is_selected)"
          :for="is_selected + id"
          class="m_project--presentation--buttons--selectionButton input-selector"
          @click.stop
        >
          <input
            :id="is_selected + id"
            type="checkbox"
            v-model="local_is_selected"
            @change="$emit('toggleSelect')"
            :class="{ disabled: !can_see_project || !can_edit_project }"
          />
          <!-- :disabled="!can_see_project" -->
        </label>

        <button
          v-if="can_see_project && can_edit_project && context === 'full'"
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
            style="enable-background: new 0 0 100.7 101;"
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
          v-if="can_see_project && can_edit_project && context === 'full'"
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
            style="enable-background: new 0 0 91.6 95;"
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

        <button
          v-if="can_see_project && can_edit_project && context === 'full'"
          type="button"
          class="buttonLink"
          :class="{ 'is--active': show_advanced_options }"
          @click="show_advanced_options = !show_advanced_options"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="77.6px"
            height="85.4px"
            viewBox="0 0 77.6 85.4"
            style="enable-background: new 0 0 77.6 85.4;"
            xml:space="preserve"
          >
            <defs />
            <g>
              <path
                d="M73.9,39h-7.6c-1.6-5.6-6.7-9.7-12.7-9.7S42.5,33.5,40.8,39H3.7c-2,0-3.7,1.6-3.7,3.7c0,2,1.6,3.7,3.7,3.7h37.1
		c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h7.6c2,0,3.7-1.6,3.7-3.7C77.6,40.7,76,39,73.9,39z M53.6,48.7c-3.2,0-6-2.6-6-6
		s2.6-6,6-6s6,2.6,6,6S56.8,48.7,53.6,48.7z"
              />
              <path
                d="M3.7,17.1h7.9c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h36.9c2,0,3.7-1.6,3.7-3.7S76,9.7,73.9,9.7H37
		C35.4,4.1,30.3,0,24.3,0S13.2,4.1,11.6,9.7H3.7c-2,0-3.7,1.6-3.7,3.7S1.6,17.1,3.7,17.1z M24.3,7.4c3.2,0,6,2.6,6,6s-2.6,6-6,6
		s-6-2.8-6-6S21.1,7.4,24.3,7.4z"
              />
              <path
                d="M73.9,68.3H37c-1.6-5.6-6.7-9.7-12.7-9.7s-11.1,4.1-12.7,9.7H3.7c-2,0-3.7,1.6-3.7,3.7s1.6,3.7,3.7,3.7h7.9
		c1.6,5.6,6.7,9.7,12.7,9.7s11.1-4.1,12.7-9.7h36.9c2,0,3.7-1.6,3.7-3.7S76,68.3,73.9,68.3z M24.3,78c-3.2,0-6-2.6-6-6s2.6-6,6-6
		s6,2.6,6,6S27.5,78,24.3,78z"
              />
            </g>
          </svg>
          {{ $t("advanced_options") }}
        </button>

        <div v-if="show_advanced_options">
          <button
            v-if="can_see_project && can_edit_project && context === 'full'"
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
                style="enable-background: new 0 0 46.7 70;"
                xml:space="preserve"
              >
                <g>
                  <g>
                    <path
                      class="st0"
                      d="M8.5,35.2l4.6,4.2c2.7,2.5,4.8,4.7,6.4,7.3l0-46.7h7.7l0,46.6c1.7-2.5,3.8-4.7,6.4-7.1l4.6-4.2l5.3,6.2 L23.3,59.6L3.2,41.5L8.5,35.2z"
                    />
                  </g>
                  <polygon
                    class="st0"
                    points="46.7,70 0,70 0,62.4 46.6,62.4 	"
                  />
                </g>
              </svg>
            </template>
            <template v-else>
              <span class="loader loader-small" />
            </template>
            {{ $t("download") }}
          </button>

          <button
            v-if="can_see_project && can_edit_project && context === 'full'"
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
        </div>
      </div>
      <EditProject
        v-if="showEditProjectModal"
        :project="project"
        :project_password="project_password()"
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
      :can_edit_project="can_edit_project"
    />
  </div>
</template>
<script>
import EditProject from "./modals/EditProject.vue";
import MediaLibrary from "./MediaLibrary.vue";
import AccessController from "./subcomponents/AccessController.vue";
import ProtectedLock from "./subcomponents/ProtectedLock.vue";

export default {
  props: {
    project: Object,
    read_only: Boolean,
    context: String,
    is_selected: Boolean,
  },
  components: {
    EditProject,
    MediaLibrary,
    AccessController,
    ProtectedLock,
  },
  data() {
    return {
      slugProjectName: this.project.slugFolderName,
      showEditProjectModal: false,
      remember_project_password_for_this_device: true,
      show_advanced_options: false,

      local_is_selected: false,
      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5),
      is_hovered: false,

      showDuplicateProjectMenu: false,
      copy_project_name: this.$t("copy_of") + " " + this.project.name,
      zip_export_started: false,
    };
  },
  watch: {
    showInputPasswordField() {
      if (this.showInputPasswordField) {
        this.$nextTick(() => {
          if (!!this.$refs.passwordField) this.$refs.passwordField.focus();
        });
      }
    },
    is_selected: function () {
      this.local_is_selected = this.is_selected;
    },
    "project.viewing_limited_to": function () {
      this.$socketio.listMedias({
        type: "projects",
        slugFolderName: this.slugProjectName,
      });
    },
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
      const thumb = this.project.preview.filter((p) => p.size === 640);
      if (thumb.length > 0) {
        return `${thumb[0].path}`;
      }
      return false;
    },
    can_see_project() {
      return this.$root.canSeeFolder({
        type: "projects",
        slugFolderName: this.slugProjectName,
      });
    },
    can_edit_project() {
      return this.$root.canEditFolder({
        type: "projects",
        slugFolderName: this.slugProjectName,
      });
    },
  },
  methods: {
    openProject() {
      if (this.can_see_project) this.$root.openProject(this.slugProjectName);
      else this.showInputPasswordField = !this.showInputPasswordField;
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
              slugFolderName: this.slugProjectName,
            });
            this.closeProject();
          },
          () => {}
        );
    },
    project_password() {
      if (this.password !== "has_pass") return "";
      return this.$root.getFolderPassword({
        type: "projects",
        slugFolderName: this.slugProjectName,
      });
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
          .error(this.$t("notifications.name_already_exists"));

        return false;
      }

      this.$socketio.copyFolder({
        type: "projects",
        slugFolderName: this.slugProjectName,
        new_folder_name: this.copy_project_name,
      });
      this.showDuplicateProjectMenu = false;

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log(this.$t("notifications.copy_in_progress"));

      this.$eventHub.$once("socketio.projects.folder_listed", () => {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(this.$t("notifications.copy_completed"));
      });
    },
    downloadProjectArchive() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`Project • METHODS: downloadProjectArchive`);
      }
      this.zip_export_started = true;
      setTimeout(() => {
        this.zip_export_started = false;
      }, 2000);

      const query_url =
        window.location.origin +
        "/_archives/projects/" +
        this.slugProjectName +
        `?socketid=${this.$root.$socketio.socket.id}`;

      if (this.$root.state.dev_mode === "debug")
        console.log(
          `Project • METHODS: downloadProjectArchive with query ${query_url}`
        );

      window.location.replace(query_url);
    },
  },
};
</script>
<style scoped>
._pwd_input,
._open_pwd_input {
  position: relative;
  z-index: 1;
}
</style>
