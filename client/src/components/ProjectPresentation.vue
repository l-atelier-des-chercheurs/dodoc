z
<template>
  <div
    class="_projectInfos"
    :class="{
      'is--list': context === 'list',
      'is--tiny': context === 'tiny',
      'u-card': context === 'list',
      'is--linkToProject': context !== 'full',
      'is--mobileView': $root.is_mobile_view,
    }"
  >
    <div class="_projectInfos--cover">
      <div
        class="_projectInfos--cover--content"
        :class="{
          'is--empty': !cover_thumb,
        }"
      >
        <template v-if="cover_thumb">
          <img :src="cover_thumb" />

          <template v-if="context === 'full'">
            <FullscreenBtn
              class="u-floatingFsButton"
              :icon="'fullscreen'"
              :label="$t('fullscreen')"
              @click="show_cover_fullscreen = true"
            />
            <FullscreenView
              v-if="show_cover_fullscreen"
              :image_src="cover_thumb"
              @close="show_cover_fullscreen = false"
            />
          </template>
        </template>
        <div v-else class="_noImage" />

        <CoverField
          v-if="context === 'full' && can_edit_project"
          class="_coverPicker"
          :cover="project.$cover"
          :path="project.$path"
        />
      </div>
    </div>

    <div class="_projectInfos--infos">
      <sl-badge variant="neutral" v-if="project.$status === 'invisible'">
        {{ $t("invisible") }}
      </sl-badge>
      <!-- <sl-badge variant="success" v-if="project.$status === 'finished'">
        {{ $t("finished") }}
      </sl-badge>
      <sl-badge
        variant="warning"
        v-if="project.$status !== 'finished' && project.$status !== 'invisible'"
      >
        {{ $t("draft") }}
      </sl-badge> -->

      <AuthorField
        v-if="context !== 'tiny' && context !== 'list'"
        :label="context === 'full' ? $t('contributors') : ''"
        :authors_paths="project.$authors"
        :path="project.$path"
        :can_edit="can_edit_project"
        :instructions="$t('project_author_instructions')"
      />

      <!-- <br v-if="context === 'full'" /> -->

      <TitleField
        :field_name="'title'"
        :label="context === 'full' ? $t('title') : ''"
        class="_title"
        :content="project.title"
        :path="project.$path"
        :required="true"
        :maxlength="40"
        :tag="context === 'full' ? 'h1' : 'h3'"
        :can_edit="can_edit_project"
        :instructions="$t('project_title_instructions')"
      />

      <!-- <br v-if="context === 'full'" /> -->

      <template v-if="context === 'list'">
        <button
          v-if="project.description"
          class="u-buttonLink _showDescription"
          type="button"
          @click="show_description = !show_description"
          v-html="
            !show_description ? $t('show_description') : $t('hide_description')
          "
        />
        <small v-else class="u-instructions">
          {{ $t("no_description") }}
        </small>
      </template>
      <TitleField
        v-if="context !== 'tiny' && show_description"
        :field_name="'description'"
        class="_description"
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
      <!-- <DebugBtn v-if="context === 'full'" :content="project" /> -->
    </div>

    <transition name="fade">
      <button
        v-if="context === 'full'"
        v-show="!$root.is_mobile_view"
        :key="'show_meta-' + show_meta"
        class="u-buttonLink _showMeta"
        type="button"
        @click="show_meta = !show_meta"
      >
        <template v-if="!show_meta">
          {{ $t("show_meta") }}
        </template>
        <template v-else>
          {{ $t("hide_meta") }}
        </template>
      </button>
    </transition>

    <div
      class="_projectInfos--meta"
      :class="{
        'is--hidden': !show_meta,
      }"
      v-if="context === 'full'"
    >
      <CardMeta :project="project" :can_edit="can_edit_project" />
      <CardStatus :project="project" :can_edit_project="can_edit_project" />
      <!-- <CardAuthor :project="project" :can_edit_project="can_edit_project" /> -->
      <CardKeywords :project="project" :can_edit_project="can_edit_project" />
      <CardMachines :project="project" :can_edit_project="can_edit_project" />
      <!-- <CardLicense :project="project" :can_edit_project="can_edit_project" /> -->
      <!-- <CardFiles :project="project" :can_edit_project="can_edit_project" /> -->
    </div>

    <div
      class="_projectInfos--open"
      v-if="context === 'list' || context === 'tiny'"
    >
      <router-link :to="{ path: createURLFromPath(project.$path) }">
        <div class="_clickZone" />
        <!-- <div class="u-button u-button_red _openBtn" v-if="context === 'list'">
          {{ $t("open") }}&nbsp;<sl-icon name="arrow-up-right" />
        </div> -->
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
// import CardLicense from "@/components/project_cards/CardLicense.vue";
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
    // CardLicense,
    // CardFiles,
  },
  data() {
    return {
      new_title: this.project.title,

      fetch_status: null,
      fetch_error: null,
      response: null,

      show_meta: true,
      show_description: true,
      show_cover_fullscreen: false,
    };
  },
  created() {
    if (this.context === "list") this.show_description = false;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    "$root.is_mobile_view"() {
      if (this.$root.is_mobile_view) this.show_meta = true;
    },
  },
  computed: {
    cover_thumb() {
      return this.makeRelativeURLFromThumbs({
        $thumbs: this.project.$cover,
        $type: "image",
        $path: this.project.$path,
        resolution: this.context === "full" ? 2000 : 640,
      });
    },
  },
  methods: {
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
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;

  margin: 0 auto;
  max-width: 180ch;
  max-width: var(--max-column-width);

  overflow: hidden;
  background: white;

  // width: 100%;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--linkToProject {
    &:hover {
      transform: translateY(-12px);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    }
  }

  &.is--list,
  &.is--tiny {
    // border-bottom: 2px solid #b9b9b9;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    border-radius: 4px;

    ._title {
      font-size: 90%;
    }
    ._description {
      font-size: 90%;
    }
  }

  &.is--list {
    display: block;
  }
  &.is--tiny {
    // flex-flow: row nowrap;

    // ._projectInfos--open {
    //   position: absolute;
    //   inset: 0;
    // }
  }

  &.is--mobileView {
    flex-flow: row wrap;
  }

  > * {
    flex: 10 1 320px;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

    &._projectInfos--cover {
      // flex: 1 1 40vmin;
    }
    &._projectInfos--meta {
      flex: 1 0 260px;

      &.is--hidden {
        flex: 0 0 0;
        opacity: 0;
      }
    }
  }

  &.is--mobileView ._projectInfos--meta {
    flex: 0 0 100%;
  }
}

._projectInfos--infos {
  display: flex;
  flex-flow: column nowrap;
  place-content: center;

  gap: calc(var(--spacing) / 1);
  padding: calc(var(--spacing) / 1);

  transition: all 0.4s;

  .is--list &,
  .is--tiny & {
    gap: calc(var(--spacing) / 2);
    order: 0;
    // position: absolute;
    // bottom: 0;
    // left: 0;
    // z-index: 1;
    // width: 100%;
    // background: linear-gradient(
    //   to bottom,
    //   rgba(255, 255, 255, 0.6) 1em,
    //   rgba(255, 255, 255, 0.9) 100%
    // );
    // backdrop-filter: blur(12px);
    padding-top: 0;
    pointer-events: none;

    ._showDescription {
      pointer-events: auto;
    }
  }

  > * {
    max-width: 56ch;
  }
}

._imageSelect {
  background: white;
  position: relative;
}

._projectInfos--cover {
  position: relative;
  aspect-ratio: 1/1;
  width: 40vh;
  height: 40vh;
  flex: 0 0 40vh;

  @supports not (aspect-ratio: 1/1) {
    width: 500px;
    height: 500px;
  }

  .is--list & {
    // margin: calc(var(--spacing) / 2);
    width: 100%;
    height: auto;
  }

  .is--mobileView & {
    flex: 1 1 auto;
    max-height: 40vh;
    max-width: 40vh;
    height: auto;
  }

  ._projectInfos--cover--content {
    position: absolute;
    inset: 0;
    margin: calc(var(--spacing) * 1);
    margin: 2px;
    overflow: hidden;
    border-radius: 3px;

    --color1: var(--c-gris);
    --color2: var(--c-gris_clair);
  }

  ._projectInfos--cover--content.is--empty {
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

  ::v-deep ._noImage {
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    background-color: var(--c-gris_fonce);
  }
}

._projectInfos--meta {
  display: flex;
  flex-flow: column nowrap;
  font-size: 90%;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--c-gris_clair);

  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2);

  height: 40vh;

  @include scrollbar(8px, 5px, 6px);

  .is--mobileView & {
    flex-flow: row nowrap;
    max-height: none;
    overflow-x: auto;
    overflow-y: hidden;
    height: auto;
  }

  > * {
    flex: 0 0 auto;
    min-width: 220px;

    background: white;
    box-shadow: 0 1px 6px var(--c-gris);
    border-radius: 8px;

    .is--mobileView & {
      flex: 1 0 220px;
    }
  }
}

._projectInfos--open {
  display: flex;

  justify-content: center;
  // margin: calc(var(--spacing) * 1);

  ._clickZone {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  ._openBtn {
    text-decoration: underline;
    position: relative;
    margin: calc(var(--spacing) / 2);
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

._showMeta {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 100;
  background: white;
  margin: calc(var(--spacing) / 4);
}
._showDescription {
  position: relative;
  z-index: 100;
  padding: 0;
  text-align: left;
}
</style>
