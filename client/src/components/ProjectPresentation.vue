<template>
  <div
    class="_projectInfos"
    :class="{
      'is--list': ['list', 'tiny'].includes(context),
      'u-card': ['list', 'tiny'].includes(context),
      'u-card2': context !== 'full',
      'is--mobileView': $root.is_mobile_view,
    }"
    :data-context="context"
  >
    <div class="_projectInfos--cover">
      <CoverField
        :context="context"
        :cover="project.$cover"
        :path="project.$path"
        :can_edit="can_edit"
      />

      <transition name="toggleLock" mode="out-in">
        <sl-icon
          v-if="project.$status === 'finished'"
          :key="project.$status"
          name="check-circle-fill"
          class="_icon _check"
        />
        <sl-icon
          v-else-if="project.$status === 'private'"
          :key="project.$status"
          name="file-lock2-fill"
          class="_icon _private"
        />
      </transition>

      <div v-if="display_original_space" class="_originalSpace">
        +{{ original_space_name }}
      </div>
      <!-- <sl-icon
        v-if="project.$status === 'draft'"
        name="cone-striped"
        class="_icon _cone"
      /> -->
      <!-- <div class="u-wips" /> -->
    </div>

    <div class="_projectInfos--infos">
      <StatusTag
        v-if="context === 'full'"
        :status="project.$status"
        :path="project.$path"
        :can_edit="can_edit"
      />

      <!-- <br v-if="context === 'full'" /> -->

      <TitleField
        :field_name="'title'"
        :label="
          context === 'full' && can_edit && !project.title ? $t('title') : ''
        "
        class="_title"
        :content="project.title"
        :path="project.$path"
        :required="true"
        :maxlength="40"
        :tag="context === 'full' ? 'h1' : 'h3'"
        :can_edit="can_edit"
        :instructions="$t('project_title_instructions')"
      />

      <!-- <template v-if="context === 'list'">
        <button
          v-if="project.description"
          class="u-buttonLink _showDescription"
          type="button"
          @click="show_description = !show_description"
          v-html="
            !show_description ? $t('show_description') : $t('hide_description')
          "
        />
      </template> -->
      <TitleField
        v-if="show_description"
        :field_name="'description'"
        class="_description"
        :label="
          context === 'full' && can_edit && !project.description
            ? $t('description')
            : ''
        "
        :content="project.description"
        :path="project.$path"
        :maxlength="1280"
        :input_type="'markdown'"
        :can_edit="can_edit"
      />

      <div class="_allTags" v-if="context === 'full'">
        <TagsList
          v-if="project.keywords && project.keywords.length > 0"
          :tags="project.keywords"
          :tag_type="'keywords'"
          :clickable="false"
        />

        <TagsList
          v-if="project.machines && project.machines.length > 0"
          :tags="project.machines"
          :tag_type="'machines'"
          :clickable="false"
        />

        <TagsList
          v-if="project.materials && project.materials.length > 0"
          :tags="project.materials"
          :tag_type="'materials'"
          :clickable="false"
        />
      </div>

      <!-- <DebugBtn v-if="context === 'full'" :content="project" /> -->
    </div>

    <!-- <transition name="fade">
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
    </transition> -->

    <div
      class="_projectInfos--meta"
      :class="{
        'is--hidden': !show_meta,
      }"
      v-if="context === 'full'"
    >
      <CardMeta :project="project" :can_edit="can_edit" />
      <CardLicense :project="project" :can_edit="can_edit" />
      <CardFiles :project="project" :can_edit="can_edit" />
      <CardCompetences :project="project" :can_edit="can_edit" />
      <CardMachinesMaterials :project="project" :can_edit="can_edit" />
      <CardKeywords :project="project" :can_edit="can_edit" />
      <!-- <CardStatus :project="project" :can_edit="can_edit" /> -->
      <!-- <CardAuthor :project="project" :can_edit="can_edit" /> -->
    </div>

    <div class="_projectInfos--open" v-if="['list', 'tiny'].includes(context)">
      <router-link :to="{ path: createURLFromPath(project.$path) }">
        <div class="_clickZone" />
      </router-link>
    </div>
  </div>
</template>
<script>
import CardMeta from "@/components/project_cards/CardMeta.vue";
// import CardAuthor from "@/components/project_cards/CardAuthor.vue";
import CardKeywords from "@/components/project_cards/CardKeywords.vue";
import CardCompetences from "@/components/project_cards/CardCompetences.vue";
import CardMachinesMaterials from "@/components/project_cards/CardMachinesMaterials.vue";
// import CardStatus from "@/components/project_cards/CardStatus.vue";
import CardLicense from "@/components/project_cards/CardLicense.vue";
import CardFiles from "@/components/project_cards/CardFiles.vue";

export default {
  props: {
    project: Object,
    context: String,
    can_edit: Boolean,
    display_original_space: Boolean,
    // show_more_informations: Boolean,
  },
  components: {
    CardMeta,
    // CardAuthor,
    CardKeywords,
    CardCompetences,
    CardMachinesMaterials,
    // CardStatus,
    CardLicense,
    CardFiles,
  },
  data() {
    return {
      fetch_status: null,
      fetch_error: null,
      response: null,

      show_meta: true,
      show_description: true,
    };
  },
  created() {
    if (["list", "tiny"].includes(this.context)) this.show_description = false;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    "$root.is_mobile_view"() {
      if (this.$root.is_mobile_view) this.show_meta = true;
    },
  },
  computed: {
    original_space_name() {
      let { space_slug } = this.decomposePath(this.project.$path);
      const space_path = this.createPath({ space_slug });
      const space = this.getFromCache(space_path);
      return space.title;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._projectInfos {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;

  width: 100%;
  // max-width: calc(var(--max-column-width));
  margin: 0 auto;

  overflow: hidden;
  background: white;

  // width: 100%;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--linkToProject {
  }

  &.is--list {
    // border-bottom: 2px solid #b9b9b9;
    // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    border-radius: 4px;

    ._title {
      font-size: var(--sl-font-size-small);
    }
  }

  &.is--list {
    display: block;
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

  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 3) calc(var(--spacing) / 2);

  transition: all 0.4s;

  .is--list & {
    gap: calc(var(--spacing) / 4);
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
    padding-top: calc(var(--spacing) / 2);
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
  width: 45vh;
  height: 45vh;
  flex: 0 0 45vh;

  @supports not (aspect-ratio: 1/1) {
    width: 500px;
    height: 500px;
  }

  .is--list & {
    padding: 2px;
    width: 100%;
    height: auto;
  }

  .is--mobileView & {
    flex: 1 1 auto;
    // max-height: 40vh;
    // max-width: 40vh;
    max-width: none;
    max-height: none;
    height: auto;
  }

  ._icon {
    position: absolute;
    top: 0;
    right: 0;
    margin: calc(var(--spacing) / 1);
    font-size: 125%;
  }
  ._check {
    color: var(--c-bleuvert);
  }
  ._private {
  }

  ._originalSpace {
    position: absolute;
    bottom: 0;
    left: 0;
    margin: calc(var(--spacing) / 2);
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);

    // background-color: var(--c-noir);
    // color: white;
    backdrop-filter: blur(5px);
    // background: rgba(255, 255, 255, 0.3);

    font-size: var(--sl-font-size-small);
  }
}

._projectInfos--meta {
  // display: flex;
  // flex-flow: column nowrap;
  height: 45vh;
  overflow: auto;
  @include scrollbar(8px, 5px, 6px);

  .is--mobileView & {
    height: auto;
  }

  > * {
    flex: 0 0 auto;
    min-width: 220px;

    .is--mobileView & {
      // flex: 1 0 220px;
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

._allTags {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}
</style>
