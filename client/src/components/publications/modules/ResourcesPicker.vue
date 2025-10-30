<template>
  <BaseModal2
    :title="$t('free_resources')"
    size="large"
    @close="$emit('close')"
  >
    <div v-if="is_loading" class="_loading">
      <LoaderSpinner />
      <p>{{ $t("loading_resources") }}</p>
    </div>

    <div v-else-if="error" class="_error">
      <p>{{ error }}</p>
      <button class="u-button" @click="loadResources">
        {{ $t("retry") }}
      </button>
    </div>

    <div v-else class="_resourcesGrid">
      <div
        v-for="section in resourceSections"
        :key="section.key"
        class="_section"
      >
        <h3>{{ section.label }}</h3>
        <div class="_grid">
          <div
            v-for="(resource, index) in section.items"
            :key="`${section.key}-${index}`"
            class="_resourceCard"
          >
            <div class="_preview">
              <component
                :is="section.tag"
                :src="getFullUrl(resource.src)"
                :alt="
                  section.tag === 'img'
                    ? resource.credits || section.label
                    : null
                "
                :controls="section.tag !== 'img'"
                :preload="section.tag !== 'img' ? 'metadata' : null"
                @error="section.tag === 'img' ? handleImageError : null"
              />
            </div>
            <div class="_info">
              <p class="_credits" v-if="resource.credits">
                {{ resource.credits }}
              </p>
              <button
                class="u-button u-button_small"
                @click="downloadResource(resource.src, section.type)"
                :disabled="downloading.includes(resource.src)"
              >
                <b-icon icon="download" />
                {{ getDownloadButtonText(resource.src) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal2>
</template>

<script>
import AuthorsMixin from "@/mixins/Authors.js";

export default {
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
  components: {},
  data() {
    return {
      resources: {
        images: [],
        videos: [],
        sons: [],
      },
      is_loading: false,
      error: null,
      downloading: [],
      base_url: "https://latelier-des-chercheurs.fr/content/bibli-libre/",
    };
  },
  created() {
    this.loadResources();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    normalizedPickFromTypes() {
      // Normalize pick_from_types to always be an array
      if (typeof this.pick_from_types === "string") {
        return [this.pick_from_types];
      }
      return Array.isArray(this.pick_from_types)
        ? this.pick_from_types
        : ["image", "video", "audio"];
    },
    resourceSections() {
      return [
        {
          type: "image",
          key: "images",
          label: this.$t("images"),
          items: this.resources.images,
          tag: "img",
        },
        {
          type: "video",
          key: "videos",
          label: this.$t("videos"),
          items: this.resources.videos,
          tag: "video",
        },
        {
          type: "audio",
          key: "sons",
          label: this.$t("audio"),
          items: this.resources.sons,
          tag: "audio",
        },
      ].filter(
        (section) =>
          this.normalizedPickFromTypes.includes(section.type) &&
          section.items &&
          section.items.length > 0
      );
    },
  },
  methods: {
    getDownloadButtonText(src) {
      return this.downloading.includes(src)
        ? this.$t("downloading")
        : this.$t("download");
    },
    async loadResources() {
      this.is_loading = true;
      this.error = null;

      try {
        const response = await fetch(
          "https://latelier-des-chercheurs.fr/bibli-libre"
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        // Transform the new API format to match our expected structure
        this.resources = this.transformApiData(data);
      } catch (error) {
        console.error("Error loading resources:", error);
        this.error = this.$t("failed_to_load_resources");
      } finally {
        this.is_loading = false;
      }
    },

    transformApiData(data) {
      const resources = {
        images: [],
        videos: [],
        sons: [],
      };

      if (data.medias && Array.isArray(data.medias)) {
        data.medias.forEach((media) => {
          const resource = {
            src: media.src,
            filename: media.filename,
            size: media.size,
            mime: media.mime,
            modified: media.modified,
            credits: media.filename, // Use filename as credits for now
          };

          // Only add resources that match the pick_from_types filter
          switch (media.$type) {
            case "image":
              if (this.normalizedPickFromTypes.includes("image")) {
                resources.images.push(resource);
              }
              break;
            case "video":
              if (this.normalizedPickFromTypes.includes("video")) {
                resources.videos.push(resource);
              }
              break;
            case "audio":
              if (this.normalizedPickFromTypes.includes("audio")) {
                resources.sons.push(resource);
              }
              break;
          }
        });
      }

      return resources;
    },

    getFullUrl(src) {
      // The new API provides full URLs directly
      return src;
    },

    handleImageError(event) {
      event.target.style.display = "none";
    },

    async downloadResource(src, type) {
      if (this.downloading.includes(src)) return;

      this.downloading.push(src);

      try {
        const fullUrl = this.getFullUrl(src);
        const filename = this.getFilenameForResource(src);

        const additional_meta = {
          url: fullUrl,
          $credits: this.getCreditsForResource(src),
          $origin: "resources_picker",
          $authors: [this.connected_as.$path],
          requested_slug: filename,
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
        const index = this.downloading.indexOf(src);
        if (index > -1) {
          this.downloading.splice(index, 1);
        }
      }
    },

    getFilenameForResource(src) {
      // Find filename for this resource from our transformed data
      const allResources = [
        ...(this.resources.images || []),
        ...(this.resources.videos || []),
        ...(this.resources.sons || []),
      ];

      const resource = allResources.find((r) => r.src === src);
      return resource?.filename || this.extractFilenameFromUrl(src);
    },

    extractFilenameFromUrl(url) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split("/").pop();
        return filename || "downloaded-resource";
      } catch {
        return "downloaded-resource";
      }
    },

    getCreditsForResource(src) {
      // Find credits for this resource
      const allResources = [
        ...(this.resources.images || []),
        ...(this.resources.videos || []),
        ...(this.resources.sons || []),
      ];

      const resource = allResources.find((r) => r.src === src);
      return resource?.credits || src;
    },
  },
};
</script>

<style lang="scss" scoped>
._loading {
  text-align: center;
  padding: 2rem;

  p {
    margin-top: 1rem;
  }
}

._error {
  text-align: center;
  padding: 2rem;

  p {
    color: var(--color-error);
    margin-bottom: 1rem;
  }
}

._resourcesGrid {
  ._section {
    margin-bottom: 2rem;

    h3 {
      margin-bottom: 1rem;
      color: var(--color-text-secondary);
    }
  }

  ._grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  ._resourceCard {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--c-gris_clair);

    ._preview {
      aspect-ratio: 16/9;
      overflow: hidden;

      img,
      video,
      audio {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      audio {
        height: 40px;
        object-fit: none;
      }
    }

    ._info {
      padding: 0.75rem;

      ._credits {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.5rem;
        line-height: 1.4;
      }

      button {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
