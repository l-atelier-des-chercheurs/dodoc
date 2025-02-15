<template>
  <div
    class="_projectInfos"
    :class="{
      'is--list': ['list', 'tiny'].includes(context),
      'is--own': is_own_project,
      'u-card2': context !== 'full',
    }"
    :data-context="context"
  >
    <div class="_projectInfos--topContent">
      <div class="_projectInfos--cover">
        <CoverField
          class="_cover"
          :context="context"
          :ratio="'3 / 2'"
          :cover="project.$cover"
          :path="project.$path"
          :can_edit="can_edit"
        />

        <transition name="toggleLock" mode="out-in">
          <StatusTag
            v-if="
              project.$status === 'finished' || project.$status === 'private'
            "
            class="_icon"
            :key="project.$status"
            :show_label="false"
            :status="project.$status"
            :can_edit="false"
            :mode="context === 'list' ? 'active' : 'inactive'"
            @click="
              $emit('toggleFilter', {
                filter_type: '$status',
                value: project.$status,
              })
            "
          />
        </transition>

        <div v-if="display_original_space" class="_originalSpace">
          +&thinsp;{{ original_space_name }}
        </div>
      </div>

      <div
        class="_projectInfos--infos"
        :class="{
          'is--short': is_compacted,
        }"
      >
        <div class="_projectInfos--infos--settings" v-if="context === 'full'">
          <StatusTag
            :status="project.$status"
            :path="project.$path"
            :can_edit="can_edit"
          />

          <DropDown v-if="can_edit" :show_label="false" :right="true">
            <DownloadFolder
              :modal_title="$t('download_project', { name: project.title })"
              :modal_instructions="$t('download_project_instr')"
              :path="project.$path"
            />
            <div class="">
              <button
                type="button"
                class="u-buttonLink"
                @click="show_dup_modal = true"
              >
                <b-icon icon="file-plus" />
                {{ $t("duplicate_or_move") }}
              </button>
              <DuplicateOrRemixProject
                v-if="show_dup_modal"
                :path="project.$path"
                :proposed_title="`${$t('copy_of')} ${project.title}`"
                @close="show_dup_modal = false"
              />
            </div>
            <RemoveMenu
              :modal_title="$t('remove_project', { name: project.title })"
              @remove="removeProject"
            />
          </DropDown>
        </div>

        <TitleField
          :field_name="'title'"
          :label="context === 'full' ? $t('title') : ''"
          class="_title"
          :content="project.title"
          :path="project.$path"
          :required="true"
          :maxlength="40"
          :tag="context === 'full' ? 'h1' : context === 'list' ? 'h3' : 'h5'"
          :can_edit="can_edit"
          :instructions="
            can_edit ? $t('project_title_instructions') : undefined
          "
        />

        <TitleField
          v-if="
            (context === 'list' && project.description) ||
            (context === 'full' && (project.description || can_edit))
          "
          :field_name="'description'"
          :label="context === 'full' ? $t('description') : ''"
          :input_type="'editor'"
          :custom_formats="['bold', 'italic', 'link']"
          :content="project.description"
          :path="project.$path"
          :maxlength="1280"
          :can_edit="can_edit"
        />

        <AdminsAndContributorsField
          v-if="context === 'full'"
          :folder="project"
          :can_edit="can_edit"
          :admin_label="$t('referent')"
          :admin_instructions="$t('project_admin_instructions')"
          :contrib_instructions="$t('project_contrib_instructions')"
        />

        <div
          class="_allTags"
          v-if="context !== 'tiny' && context !== 'full' && all_tags.length > 0"
        >
          <template v-for="tags in all_tags">
            <SingleTag
              v-for="tag in tags.list"
              :key="tag"
              :tag_type="tags.type"
              :tag_str="tag"
              :mode="'active'"
              @tagClick="
                $emit('toggleFilter', { filter_type: tags.type, value: tag })
              "
            />
          </template>
        </div>

        <div
          v-if="is_compacted"
          class="_compactExpandButton"
          @click="toggleCompacted"
        >
          <button type="button" class="u-button u-button_icon" tabindex="-1">
            <b-icon v-if="short_project_view" icon="arrow-down-short" />
            <b-icon v-else icon="arrow-up-short" />
          </button>
        </div>
      </div>
    </div>

    <div
      class="_projectInfos--meta"
      :class="{
        'is--hidden': !show_meta,
      }"
      v-if="context === 'full'"
    >
      <CardLicense class="_card" :project="project" :can_edit="can_edit" />
      <CardFiles class="_card" :project="project" :can_edit="can_edit" />
      <!-- <CardMeta class="_card" :project="project" :can_edit="can_edit" /> -->
      <CardCompetences class="_card" :project="project" :can_edit="can_edit" />
      <CardMachinesMaterials
        class="_card"
        :project="project"
        :can_edit="can_edit"
      />
      <CardKeywords class="_card" :project="project" :can_edit="can_edit" />
      <!-- <CardAuthor :project="project" :can_edit="can_edit" /> -->
    </div>

    <router-link
      class="js--showCursor _projectInfos--open"
      v-if="['list', 'tiny'].includes(context)"
      :to="{ path: createURLFromPath(project.$path) }"
      :title="$t('open') + ' ' + project.title"
    />
  </div>
</template>
<script>
// import CardMeta from "@/components/project_cards/CardMeta.vue";
// import CardAuthor from "@/components/project_cards/CardAuthor.vue";
import CardKeywords from "@/components/project_cards/CardKeywords.vue";
import CardCompetences from "@/components/project_cards/CardCompetences.vue";
import CardMachinesMaterials from "@/components/project_cards/CardMachinesMaterials.vue";
// import CardStatus from "@/components/project_cards/CardStatus.vue";
import CardLicense from "@/components/project_cards/CardLicense.vue";
import CardFiles from "@/components/project_cards/CardFiles.vue";

import DuplicateOrRemixProject from "@/components/project/DuplicateOrRemixProject.vue";

export default {
  props: {
    project: Object,
    context: String,
    can_edit: Boolean,
    display_original_space: Boolean,
    // show_more_informations: Boolean,
  },
  components: {
    DuplicateOrRemixProject,

    // CardMeta,
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
      show_dup_modal: false,
      short_project_view: true,
    };
  },
  created() {},
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
    is_compacted() {
      return this.context === "list" && this.short_project_view;
    },
    is_own_project() {
      return this.isOwnItem({ folder: this.project });
    },
    all_tags() {
      let _all_tags = [];

      [
        "target_audience",
        "disciplines",
        "level",
        "keywords",
        "machines",
        "materials",
      ].map((tag_type) => {
        if (tag_type === "level" && this.project.level) {
          _all_tags.push({
            type: "level",
            list: [this.project.level],
          });
        } else {
          const kw = this.getKw(tag_type);
          if (kw.length > 0)
            _all_tags.push({
              type: tag_type,
              list: kw,
            });
        }
      });

      return _all_tags;
    },
  },
  methods: {
    getKw(type) {
      return this.project[type] && Array.isArray(this.project[type])
        ? this.project[type]
        : [];
    },
    async removeProject() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const response = await this.$api.deleteItem({
          path: this.project.$path,
        });
        this.response = response.data;
        this.fetch_status = "success";
        // this.$router.push("/projects");
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
    toggleCompacted() {
      this.short_project_view = !this.short_project_view;
    },
  },
};
</script>
<style lang="scss" scoped>
._projectInfos {
  position: relative;

  width: 100%;

  background: white;

  // width: 100%;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--linkToProject {
  }

  &.is--list {
    background-color: #fff;
    border-radius: 4px;

    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

    &.is--own {
      border-bottom-color: var(--c-bleumarine);
    }

    ._projectInfos--topContent {
      padding: 0;
      margin: 0;
      gap: 0;
      max-width: none;
    }

    ._title {
      h3 {
        font-size: var(--sl-font-size-medium);
      }
    }
  }

  &.is--list {
    display: block;
    ._projectInfos--infos {
      padding: calc(var(--spacing) / 2);
      width: 100%;
      place-content: flex-start;
      // max-height: 12rem;
    }
  }

  &[data-context="tiny"] {
    ._projectInfos--infos {
      padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    }
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
}

._projectInfos--topContent {
  max-width: min(var(--max-column-width), 1180px);
  // max-width: var(--max-column-width);

  margin: calc(var(--spacing) * 1) auto;
  overflow: hidden;

  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) * 2);

  > * {
    flex: 1 1 320px;
  }
}

._projectInfos--infos {
  --short-project-height: 8rem;

  position: relative;
  display: flex;
  flex-flow: column nowrap;
  place-content: center;

  gap: calc(var(--spacing) / 1);

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
    // pointer-events: none;

    ._showDescription {
      pointer-events: auto;
    }
  }

  &.is--short {
    max-height: var(--short-project-height);
  }

  > * {
    // max-width: 56ch;
  }
}

._projectInfos--infos--settings {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: flex-end;
}

._imageSelect {
  background: white;
  position: relative;
}

._projectInfos--cover {
  position: relative;
  width: 100%;
  max-width: 480px;

  .is--list & {
    // padding: 2px;
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

  ._cover {
    position: relative;

    aspect-ratio: 3/2;
    border-radius: 4px;
    overflow: hidden;

    margin-right: 0;
    margin-left: auto;

    .is--list & {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  ._icon {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    margin: calc(var(--spacing) / 1);
    // font-size: 125%;
  }

  ._check {
    // color: var(--c-bleuvert);
    // &::before {
    //   content: "";
    //   position: absolute;
    //   width: 90%;
    //   height: 90%;
    //   margin: 5%;
    //   background: white;
    //   z-index: -1;
    //   border-radius: 50%;
    // }
  }
  ._private {
    font-size: 125%;
    &::before {
      content: "";
      position: absolute;
      width: 60%;
      margin-left: 20%;
      height: 100%;
      background: white;
      z-index: -1;
      border-radius: 5px;
    }
  }

  ._originalSpace {
    position: absolute;
    bottom: 0;
    left: 0;
    margin: calc(var(--spacing) / 4);
    padding: calc(var(--spacing) / 16) calc(var(--spacing) / 2);
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
    background: rgba(0, 0, 0, 0.2);
    color: white;
    font-weight: 700;

    border-radius: 15px;
    font-size: var(--sl-font-size-small);
    /* max-width: 30ch; */
    max-width: calc(100% - calc(var(--spacing) / 2));
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}

._projectInfos--meta {
  display: flex;
  flex-flow: row nowrap;
  justify-content: safe center;
  align-items: flex-start;
  padding: calc(var(--spacing) * 2);
  // margin: calc(var(--spacing) * 1) 0 0;
  gap: calc(var(--spacing) / 2);
  overflow: auto;
  // padding-top: calc(var(--spacing) * 1);

  .is--mobileView & {
    height: auto;
  }

  ._card {
    flex: 0 0 240px;
    width: 240px;
    max-height: 50vh;
    // height: 240px;
    overflow: auto;
    @include scrollbar(8px, 5px, 6px);

    .is--mobileView & {
      // flex: 1 0 220px;
    }
  }
}

._projectInfos--open {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  position: relative;
  z-index: 1;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);

  > * {
  }
}

._compactExpandButton {
  --expand-button-height: 2rem;
  position: absolute;
  z-index: 2;
  top: calc(var(--short-project-height) - var(--expand-button-height));
  height: var(--expand-button-height);
  left: 0;
  right: 0;

  padding: calc(var(--spacing) / 4);

  background: linear-gradient(transparent, white);
  text-align: right;
  pointer-events: none;

  > button {
    pointer-events: auto;
    // font-size: var(--sl-font-size-medium);
    // background: rgba(255, 255, 255, 0.4);
    // color: black;
    border-radius: 50%;

    // &:hover,
    // &:focus {
    //   background: rgba(255, 255, 255, 1);
    // }
  }
}
</style>
