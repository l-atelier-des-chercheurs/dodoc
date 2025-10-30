<template>
  <div>
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
        <div class="_errorIcon">⚠</div>
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
          <div class="_sectionHeader">
            <h3>{{ section.label }}</h3>
            <span class="_count">{{ section.items.length }}</span>
          </div>

          <div class="_grid">
            <div
              v-for="(resource, index) in section.items"
              :key="`${section.key}-${index}`"
              class="u-card2 _resourceCard"
              :class="{ _isDownloading: downloading.includes(resource.src) }"
            >
              <div
                class="_preview"
                @click="openFullscreen(resource.src, section.tag)"
              >
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
                <p class="_credits" :title="resource.credits">
                  {{ resource.credits }}
                </p>
                <button
                  class="_downloadBtn"
                  @click="downloadResource(resource.src, section.type)"
                  :disabled="downloading.includes(resource.src)"
                  :title="getDownloadButtonText(resource.src)"
                >
                  <b-icon
                    :icon="
                      downloading.includes(resource.src) ? 'loader' : 'download'
                    "
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal2>

    <!-- Fullscreen Modal -->
    <transition name="fade">
      <div
        v-if="fullscreen_media"
        class="_fullscreenModal"
        @click="closeFullscreen"
      >
        <button class="_closeBtn" @click="closeFullscreen">
          <b-icon icon="close" />
        </button>
        <div class="_fullscreenContent" @click.stop>
          <component
            :is="fullscreen_media.tag"
            :src="fullscreen_media.src"
            :controls="fullscreen_media.tag !== 'img'"
            :autoplay="fullscreen_media.tag !== 'img'"
          />
        </div>
      </div>
    </transition>
  </div>
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
      fullscreen_media: null,
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
    openFullscreen(src, tag) {
      this.fullscreen_media = {
        src: this.getFullUrl(src),
        tag: tag,
      };
    },
    closeFullscreen() {
      this.fullscreen_media = null;
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

._resourcesGrid {
  padding: 0.5rem 0;

  ._section {
    margin-bottom: 3rem;

    &:last-child {
      margin-bottom: 1rem;
    }

    ._sectionHeader {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--c-gris);

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-text);
      }

      ._count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.75rem;
        height: 1.75rem;
        padding: 0 0.5rem;
        background: var(--c-gris);
        color: var(--color-text-secondary);
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
      }
    }
  }

  ._grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
  }

  ._resourceCard {
    position: relative;
    overflow: hidden;
    background: white;
    transition: all 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);

      ._preview::after {
        opacity: 1;
      }

      ._preview img {
        // transform: scale(1.05);
      }
    }

    &._isDownloading {
      opacity: 0.6;
    }

    ._preview {
      position: relative;
      aspect-ratio: 16/9;
      overflow: hidden;
      background: var(--c-gris_clair);
      cursor: pointer;

      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.05);
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }

      img,
      video,
      audio {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      audio {
        height: 54px;
        object-fit: none;
        padding: 0.5rem;
      }
    }

    ._info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;

      ._credits {
        flex: 1;
        margin: 0;
        font-size: 0.875rem;
        color: var(--color-text);
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      ._downloadBtn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        padding: 0;
        background: transparent;
        color: var(--color-text-secondary);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--c-gris_clair);
          color: var(--color-text);
        }

        &:active {
          // transform: scale(0.9);
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
          animation: spin 1s linear infinite;
        }

        ::v-deep svg {
          width: 1.125rem;
          height: 1.125rem;
        }
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// Fullscreen Modal
._fullscreenModal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(8px);

  ._closeBtn {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    padding: 0;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10001;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }

    ::v-deep svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }

  ._fullscreenContent {
    max-width: 95vw;
    max-height: 95vh;
    display: flex;
    align-items: center;
    justify-content: center;

    img,
    video,
    audio {
      max-width: 100%;
      max-height: 95vh;
      object-fit: contain;
      border-radius: 4px;
    }

    audio {
      min-width: 400px;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Responsive adjustments
@media (max-width: 768px) {
  ._resourcesGrid {
    ._grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }
  }

  ._fullscreenModal {
    ._closeBtn {
      top: 1rem;
      right: 1rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    ._fullscreenContent {
      audio {
        min-width: 300px;
      }
    }
  }
}

@media (max-width: 480px) {
  ._resourcesGrid {
    ._grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
