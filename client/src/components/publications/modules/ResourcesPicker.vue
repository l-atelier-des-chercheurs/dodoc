<template>
  <div>
    <BaseModal2
      :title="$t('free_resources')"
      size="large"
      @close="$emit('close')"
    >
      <div class="u-instructions">
        {{ $t("free_resources_description") }}
      </div>

      <div v-if="is_loading" class="_loading">
        <LoaderSpinner />
        <p>{{ $t("loading_resources") }}</p>
      </div>

      <div v-else-if="error" class="_error">
        <div class="_errorIcon">⚠</div>
        <p>{{ error }}</p>
        <button class="u-button" @click="loadResources">
          {{ $t("retry") }}
        </button>
      </div>

      <div v-else class="_content">
        <!-- Projects List View -->
        <div v-if="!selected_project" class="_projectsList">
          <div
            v-for="project in resources_projects_list"
            :key="project.$path"
            class="_projectCard"
            @click="selectProject(project)"
          >
            <div class="_projectInfo">
              <h3 class="_projectTitle">
                {{ project.title }}
              </h3>
              <p
                v-if="project.description"
                class="_projectDescription"
                v-html="project.description"
              />
            </div>
            <div class="_projectArrow">→</div>
          </div>
        </div>

        <!-- Project Files Grid View -->
        <div v-else class="_filesView">
          <div class="_header">
            <button class="u-buttonLink" @click="backToProjects">
              ← {{ $t("back") }}
            </button>
            <div class="_projectHeader">
              <h2>{{ selected_project.title }}</h2>
              <p
                v-if="selected_project.description"
                v-html="selected_project.description"
              ></p>
            </div>
          </div>

          <div v-if="is_loading_files" class="_loading">
            <LoaderSpinner />
            <p>{{ $t("loading") }}...</p>
          </div>

          <ResourceFilesGrid
            v-if="project_files && project_files.length > 0"
            :files="project_files"
            :downloading="downloading"
            :resources_base_url="resources_base_url"
            :selected_project_path="selected_project.$path"
            @download="downloadProjectFile"
          />

          <div v-else class="_noFiles">
            <p>{{ $t("no_files_found") }}</p>
          </div>
        </div>
      </div>
    </BaseModal2>
  </div>
</template>

<script>
import AuthorsMixin from "@/mixins/Authors.js";
import ResourceFilesGrid from "./ResourceFilesGrid.vue";

export default {
  components: {
    ResourceFilesGrid,
  },
  mixins: [AuthorsMixin],
  props: {
    project_path: {
      type: String,
      required: true,
    },
    select_mode: {
      type: String,
      default: "single",
    },
    pick_from_types: {
      type: [String, Array],
      default: () => ["image", "video", "audio"],
    },
  },
  data() {
    return {
      resources_projects_list: [],
      selected_project: null,
      project_files: [],
      is_loading: false,
      is_loading_files: false,
      error: null,
      downloading: [],

      resources_api_url: "https://ressources.dodoc.fr/_api2",
      resources_base_url: "https://ressources.dodoc.fr",
    };
  },
  created() {
    this.loadResources();
  },
  methods: {
    async loadResources() {
      this.is_loading = true;
      this.error = null;

      try {
        const response = await fetch(
          this.resources_api_url + "/spaces/espace-ressource/projects"
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        this.resources_projects_list = data;
      } catch (error) {
        console.error("Error loading resources:", error);
        this.error = this.$t("failed_to_load_resources");
      } finally {
        this.is_loading = false;
      }
    },

    async selectProject(project) {
      this.selected_project = project;
      this.is_loading_files = true;
      this.project_files = [];

      try {
        const response = await fetch(
          this.resources_api_url + "/" + project.$path
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        const files = data.$files;

        // Filter by pick_from_types if specified
        const types = Array.isArray(this.pick_from_types)
          ? this.pick_from_types
          : [this.pick_from_types];

        this.project_files = files.filter((file) => {
          if (!file.$type) return false;
          return types.includes(file.$type);
        });
      } catch (error) {
        console.error("Error loading project files:", error);
        this.$alertify.delay(4000).error(this.$t("failed_to_load_files"));
      } finally {
        this.is_loading_files = false;
      }
    },

    backToProjects() {
      this.selected_project = null;
      this.project_files = [];
    },

    async downloadProjectFile(file) {
      const url =
        this.resources_base_url +
        "/" +
        this.selected_project.$path +
        "/" +
        file.$media_filename;
      if (this.downloading.includes(url)) return;

      this.downloading.push(url);

      try {
        const additional_meta = {
          url,
          $credits: file.$credits || file.$authors || "",
          $origin: "resources_picker",
          $authors: [this.connected_as.$path],
          requested_slug: file.$media_filename,
        };

        const { uploaded_meta } = await this.$api.uploadFile({
          path: this.project_path,
          additional_meta,
        });

        if (uploaded_meta) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t("resource_imported_successfully"));

          setTimeout(() => {
            this.$emit("pickResources", [uploaded_meta]);
          }, 200);
        }
      } catch (error) {
        console.error("Error downloading resource:", error);
        this.$alertify.delay(4000).error(this.$t("failed_to_import_resource"));
      } finally {
        const index = this.downloading.indexOf(url);
        if (index > -1) {
          this.downloading.splice(index, 1);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
._loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  min-height: 300px;

  p {
    margin-top: 1.5rem;
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
  }
}

._error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  min-height: 300px;

  ._errorIcon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  p {
    color: var(--color-error);
    margin-bottom: 1.5rem;
    font-size: 0.9375rem;
  }
}

._content {
  padding: 0.5rem 0;
}

// Projects List View
._projectsList {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

._projectCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: white;
  border: 1px solid var(--c-gris);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--c-noir);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateX(4px);

    ._projectArrow {
      transform: translateX(4px);
    }
  }

  ._projectInfo {
    flex: 1;
    min-width: 0;

    ._projectTitle {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
    }

    ._projectDescription {
      margin: 0;
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  ._projectArrow {
    flex-shrink: 0;
    margin-left: 1rem;
    font-size: 1.5rem;
    color: var(--color-text-secondary);
    transition: transform 0.2s ease;
  }
}

// Files View
._filesView {
  ._header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--c-gris);

    ._projectHeader {
      margin-top: 1rem;

      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-text);
      }

      p {
        margin: 0;
        font-size: 0.9375rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
      }
    }
  }
}

._noFiles {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  min-height: 200px;

  p {
    margin: 0;
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
  }
}
</style>
