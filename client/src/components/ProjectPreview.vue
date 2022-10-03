<template>
  <div class="_projectInfos u-card">
    <div
      class="_projectInfos--cover"
      ref="coverImage"
      :class="{
        'is--fullscreen': is_fullscreen,
      }"
    >
      <template v-if="cover_thumb">
        <img :src="cover_thumb" />
      </template>
      <div v-else class="_noImage" />
      <button
        v-if="context === 'full'"
        type="button"
        class="_fsButton u-buttonLink"
        v-text="!is_fullscreen ? 'agrandir' : 'réduire'"
        @click="toggleFs"
      />

      <CoverField
        class=""
        :cover="project.cover"
        :project_slug="project.slug"
        :path="`/projects/${project.slug}`"
        :can_edit="can_edit_project"
      />
    </div>

    <div class="_projectInfos--meta">
      <!-- :help_text="$t('project_title_help_text')" -->
      <!-- :field_name="'title'" -->
      <TitleField
        :field_name="'title'"
        :field_type="'string'"
        :label="$t('title')"
        :content="project.title"
        :path="`/projects/${project.slug}`"
        :required="true"
        :maxlength="40"
        :tag="context === 'full' ? 'h1' : 'h2'"
        :can_edit="can_edit_project"
      />

      <br />

      <TitleField
        :field_name="'description'"
        :field_type="'string'"
        :label="$t('description')"
        :content="project.description"
        :path="`/projects/${project.slug}`"
        :maxlength="240"
        :can_edit="can_edit_project"
      />

      <br />

      <TagsField
        :field_name="'keywords'"
        :label="$t('keywords')"
        :content="project.keywords"
        :path="`/projects/${project.slug}`"
        :can_edit="can_edit_project"
      />

      <br />

      <router-link
        :to="`/projects/${project.slug}`"
        class=""
        v-if="context === 'list'"
      >
        <sl-button size="small" variant="primary" pill>ouvrir</sl-button>
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

  margin: 0 auto;
  // margin: calc(var(--spacing) * 2) auto;
  // padding: 0 calc(var(--spacing) * 2);
  background: white;
  border-radius: 0;
  overflow: hidden;

  // max-width: 800px;

  // min-height: 50vh;
  width: 100%;
  // max-width: 100vmin;

  > * {
    flex: 1 1 200px;
  }
}

._projectInfos--meta {
  display: flex;
  flex-flow: column nowrap;
  padding: calc(var(--spacing) * 1);
  place-content: center;
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
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.7);
  }
}
</style>
