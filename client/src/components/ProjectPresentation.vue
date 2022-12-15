z
<template>
  <div
    class="_projectInfos"
    :class="{
      'is--preview': context === 'list',
      'u-card': context === 'list',
    }"
  >
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
          variant="neutral"
          class="_fsButton u-buttonLink"
          @click="toggleFs"
        >
          <sl-icon
            :name="!is_fullscreen ? 'arrows-fullscreen' : 'fullscreen-exit'"
          />
        </sl-button>
      </template>
      <div v-else class="_noImage" />

      <CoverField
        v-if="context === 'full' && can_edit_project"
        class="_coverPicker"
        :cover="project.$cover"
        :path="project.$path"
      />
    </div>

    <div class="_projectInfos--infos">
      <AuthorField
        :label="context === 'full' ? $t('contributors') : ''"
        :authors_paths="project.$authors"
        :path="project.$path"
        :can_edit="can_edit_project"
      />

      <br />

      <TitleField
        :field_name="'title'"
        :label="context === 'full' ? $t('title') : ''"
        :content="project.title"
        :path="project.$path"
        :required="true"
        :maxlength="40"
        :tag="context === 'full' ? 'h1' : 'h2'"
        :can_edit="can_edit_project"
        :instructions="$t('project_title_instructions')"
      />

      <br />

      <TitleField
        :field_name="'description'"
        :label="
          context === 'full' && (project.description || can_edit_project)
            ? $t('description')
            : ''
        "
        :content="project.description"
        :path="project.$path"
        :maxlength="280"
        :can_edit="can_edit_project"
        :instructions="$t('project_desc_instructions')"
      />
      <DebugBtn v-if="context === 'full'" :content="project" />
    </div>

    <div class="_projectInfos--meta" v-if="context === 'full'">
      <CardMeta :project="project" :can_edit_project="can_edit_project" />
      <CardStatus :project="project" :can_edit_project="can_edit_project" />
      <!-- <CardAuthor :project="project" :can_edit_project="can_edit_project" /> -->
      <CardKeywords :project="project" :can_edit_project="can_edit_project" />
      <CardMachines :project="project" :can_edit_project="can_edit_project" />
      <CardLicense :project="project" :can_edit_project="can_edit_project" />
      <!-- <CardFiles :project="project" :can_edit_project="can_edit_project" /> -->
    </div>

    <div class="_projectInfos--open" v-if="context === 'list'">
      <router-link
        :to="{ path: '/' + project.$path }"
        class="u-button u-button_red"
      >
        {{ $t("open") }}&nbsp;<sl-icon name="arrow-up-right" />
      </router-link>
    </div>
  </div>
</template>
<script>
import CardMeta from "@/components/project_cards/CardMeta.vue";
// import CardAuthor from "@/components/project_cards/CardAuthor.vue";
import CardKeywords from "@/components/project_cards/CardKeywords.vue";
import CardMachines from "@/components/project_cards/CardMachines.vue";
import CardStatus from "@/components/project_cards/CardStatus.vue";
import CardLicense from "@/components/project_cards/CardLicense.vue";
// import CardFiles from "@/components/project_cards/CardFiles.vue";

export default {
  props: {
    project: Object,
    context: String,
    can_edit_project: Boolean,
    // show_more_informations: Boolean,
  },
  components: {
    CardMeta,
    // CardAuthor,
    CardKeywords,
    CardMachines,
    CardStatus,
    CardLicense,
    // CardFiles,
  },
  data() {
    return {
      new_title: this.project.title,

      fetch_status: null,
      fetch_error: null,
      response: null,

      confirm_remove: false,

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
        $thumbs: this.project.$cover,
        $type: "image",
        $path: this.project.$path,
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

      try {
        this.response = await this.$api.updateMeta({
          path: this.project.$path,
          new_meta: {
            title: this.new_title,
          },
        });
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

._projectInfos {
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;

  margin: 0 auto;
  overflow: hidden;
  background: white;

  // width: 100%;

  &.is--preview {
    border-bottom: 2px solid #b9b9b9;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  > * {
    flex: 10 1 320px;

    &._projectInfos--cover {
      // flex: 1 1 40vmin;
    }
    &._projectInfos--meta {
      flex: 1 0 260px;
      max-height: calc((100vw - 260px) / 2);
    }
  }
}

._projectInfos--infos {
  display: flex;
  flex-flow: column nowrap;
  place-content: center;

  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 1);

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
  // max-height: 40vmin;
  min-width: 280px;
  min-height: 280px;
  aspect-ratio: 1/1;

  --color1: var(--c-gris);
  --color2: var(--c-gris_clair);

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

._projectInfos--meta {
  display: flex;
  flex-flow: column nowrap;
  font-size: 90%;
  overflow: auto;

  // padding: calc(var(--spacing) / 2);
  // gap: calc(var(--spacing) / 2);

  > * {
    flex: 1 1 260px;

    background: white;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    margin: calc(var(--spacing) / 2) calc(var(--spacing) / 2);
    border-radius: 8px;

    &:first-child {
      // border-top: 0 solid #000;
    }
    &:not(:last-child) {
      // border-bottom: 0 solid #000;
    }
  }
}

._projectInfos--open {
  display: flex;
  justify-content: center;
  margin: calc(var(--spacing) * 1);

  a {
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    &:hover,
    &:focus {
      transform: translateY(-4px) rotate(-2deg);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    }
  }
}

._coverPicker {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: calc(var(--spacing) / 1);
}
</style>
