<template>
  <div class="_projectInfos u-card">
    <div
      class="_projectInfos--cover"
      ref="coverImage"
      :class="{
        'is--fullscreen': is_fullscreen,
        'is--empty': !cover_thumb,
      }"
    >
      <template v-if="cover_thumb">
        <img :src="cover_thumb" />
        <sl-button
          v-if="context === 'full'"
          size="small"
          variant="semitransparent"
          class="_fsButton u-buttonLink"
          v-text="!is_fullscreen ? 'agrandir' : 'réduire'"
          @click="toggleFs"
        />
      </template>
      <div v-else class="_noImage" />

      <CoverField
        v-if="context === 'full'"
        class=""
        :cover="project.cover"
        :project_slug="project.slug"
        :path="`/projects/${project.slug}`"
        :can_edit="can_edit_project"
      />
    </div>

    <div class="_projectInfos--meta">
      <!-- <div class="_content"> -->
      <TitleField
        :field_name="'title'"
        :label="$t('title')"
        :content="project.title"
        :path="`/projects/${project.slug}`"
        :required="true"
        :maxlength="40"
        :tag="context === 'full' ? 'h1' : 'h2'"
        :can_edit="can_edit_project"
      />

      <TitleField
        :field_name="'description'"
        :label="$t('description')"
        :content="project.description"
        :path="`/projects/${project.slug}`"
        :maxlength="280"
        :can_edit="can_edit_project"
      />

      <TagsField
        :field_name="'keywords'"
        :label="$t('keywords')"
        :content="project.keywords"
        :path="`/projects/${project.slug}`"
        :can_edit="can_edit_project"
      />
    </div>

    <div class="_projectInfos--open" v-if="context === 'list'">
      <router-link
        :to="`/projects/${project.slug}`"
        class="u-button u-button_big u-button_red"
      >
        ouvrir&nbsp;
        <sl-icon name="arrow-up-right" />
      </router-link>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    project: Object,
    context: String,
    can_edit_project: Boolean,
  },
  components: {},
  data() {
    return {
      new_title: this.project.title,

      fetch_status: null,
      fetch_error: null,
      response: null,

      preview_rawdata: null,
      show_lib: false,
      select_cover_image: false,

      is_fullscreen: false,
    };
  },
  created() {},
  mounted() {
    document.addEventListener("fullscreenchange", this.detectFullScreen);
  },
  beforeDestroy() {
    document.removeEventListener("fullscreenchange", this.detectFullScreen);
  },
  watch: {},
  computed: {
    cover_thumb() {
      return this.makeRelativeURLFromThumbs({
        thumbs: this.project.cover,
        type: "image",
        project_slug: this.project.slug,
        resolution: 1200,
      });
    },
  },
  methods: {
    detectFullScreen() {
      if (document.fullscreenElement) {
        this.is_fullscreen = true;
        // window.addEventListener("popstate", this.quitFSOnBack);
      } else {
        this.is_fullscreen = false;
        this.$nextTick(() => {
          // window.removeEventListener("popstate", this.quitFSOnBack);
        });
      }
    },
    toggleFs() {
      const elem = this.$refs.coverImage;
      if (!this.is_fullscreen) elem.requestFullscreen().catch((err) => err);
      else document.exitFullscreen();
    },

    async updateProject() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      // TODO use updateItem

      try {
        const response = await this.$axios.patch(
          `/projects/${this.project.slug}`,
          {
            title: this.new_title,
          }
        );

        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
    async removeProject() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const response = await this.$axios.delete(
          `/projects/${this.project.slug}`
        );
        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._project {
  position: relative;
  // padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
}

._editBtn {
  position: absolute;
  top: 0;
  right: 0;
}

._projectInfos {
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;

  border-bottom: 2px solid #b9b9b9;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  margin: 0 auto;
  overflow: hidden;

  width: 100%;

  > * {
    flex: 1 1 260px;
  }
}

._projectInfos--meta {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) * 1);
  place-content: center;

  transition: all 0.4s;

  > * {
    max-width: 66ch;
  }
}

._imageSelect {
  background: white;
  position: relative;
}

._projectInfos--cover {
  position: relative;
  overflow: hidden;
  // min-height: 50vh;
  width: 100%;
  aspect-ratio: 1/1;
  // max-width: 100vh;

  --color1: transparent;
  --color2: var(--c-gris);

  &.is--empty {
    background: radial-gradient(
        circle,
        transparent 20%,
        var(--color1) 20%,
        var(--color1) 80%,
        transparent 80%,
        transparent
      ),
      radial-gradient(
          circle,
          transparent 20%,
          var(--color1) 20%,
          var(--color1) 80%,
          transparent 80%,
          transparent
        )
        15px 15px,
      linear-gradient(
          var(--color2) 1.2000000000000002px,
          transparent 1.2000000000000002px
        )
        0 -0.6000000000000001px,
      linear-gradient(
          90deg,
          var(--color2) 1.2000000000000002px,
          var(--color1) 1.2000000000000002px
        ) -0.6000000000000001px 0;
    background-size: 30px 30px, 30px 30px, 15px 15px, 15px 15px;
  }

  img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &.is--fullscreen img {
    object-fit: contain;
  }

  ::v-deep ._noImage {
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    background-color: var(--c-gris_fonce);
  }
  ::v-deep ._fsButton {
    position: absolute;
    bottom: 0;
    margin: calc(var(--spacing) / 1);
  }
}

._content {
  max-width: 80ch;
}

._projectInfos--open {
  display: flex;
  justify-content: center;
  margin: calc(var(--spacing) * 1);
}
</style>
