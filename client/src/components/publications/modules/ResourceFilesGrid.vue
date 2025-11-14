<template>
  <div class="_filesGrid">
    <div v-for="file in files" :key="file.$path" class="u-card2 _fileCard">
      <div v-if="downloading.includes(file.$media_url)" class="_downloading">
        <LoaderSpinner />
        <p>{{ $t("downloading") }}</p>
      </div>

      <template v-else>
        <div class="_preview">
          <img
            v-if="file.$type === 'image'"
            :src="makeMediaFileURL(file)"
            :alt="file.$title || file.$media_filename"
            loading="lazy"
          />
          <video
            v-else-if="file.$type === 'video'"
            :src="makeMediaFileURL(file)"
            preload="metadata"
          />
          <audio
            v-else-if="file.$type === 'audio'"
            :src="makeMediaFileURL(file)"
            controls
          />
          <div v-else class="_filePlaceholder">
            {{ file.$type || "FILE" }}
          </div>
        </div>

        <div class="_info">
          <p class="_fileTitle">
            {{ file.$title || file.$media_filename }}
          </p>
          <button
            class="u-button u-button--small"
            @click="$emit('download', file)"
          >
            {{ $t("download") }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    files: {
      type: Array,
      required: true,
    },
    downloading: {
      type: Array,
      default: () => [],
    },
    resources_base_url: {
      type: String,
      required: true,
    },
    selected_project_path: {
      type: String,
      required: true,
    },
  },
  methods: {
    makeMediaFileURL(file) {
      return (
        this.resources_base_url +
        "/" +
        this.selected_project_path +
        "/" +
        file.$media_filename
      );
    },
  },
};
</script>

<style lang="scss" scoped>
._filesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1.25rem;
}

._fileCard {
  position: relative;
  overflow: hidden;
  background: white;
  border-radius: var(--border-radius);
  transition: all 0.25s ease;

  ._downloading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    min-height: 200px;

    p {
      margin-top: 1rem;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
  }

  ._preview {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
    background: var(--c-gris_clair);

    img,
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    audio {
      width: 100%;
      height: 54px;
      padding: 0.5rem;
    }

    ._filePlaceholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
    }
  }

  ._info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;

    ._fileTitle {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text);
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }
  }
}
</style>
