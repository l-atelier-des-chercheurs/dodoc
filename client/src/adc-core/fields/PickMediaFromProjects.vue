<template>
  <BaseModal2
    :title="select_mode === 'single' ? $t('pick_media') : $t('pick_medias')"
    @close="$emit('close')"
  >
    <div class="_pickMediaFromProject">
      <sl-spinner style="--indicator-color: currentColor" v-if="is_loading" />
      <template v-else>
        <DLabel
          :str="$t('source_project')"
          :instructions="$t('media_pickers_instr')"
        />

        <div
          v-if="projects && Array.isArray(projects) && projects.length === 0"
          class="u-instructions"
          :key="'noprojects'"
        >
          {{ $t("no_projects") }}
        </div>

        <select v-else v-model="source_project_path" class="u-spacingBottom">
          <option
            v-for="project in projects"
            :key="project.$path"
            :value="project.$path"
            v-text="project.title"
            disabled
          />
        </select>

        <ToggleInput
          v-if="unaddable_medias"
          class="u-spacingBottom"
          :content.sync="hide_unaddable_medias"
          :label="$t('hide_unaddable_medias')"
        />

        <template v-if="source_project_path">
          <DLabel :str="$t('medias')" />
          <sl-spinner
            style="--indicator-color: currentColor"
            v-if="!source_project"
          />
          <template v-else>
            <MediaLibrary
              class="_mediaLib"
              :project="source_project"
              :media_focused="media_focused"
              :select_mode="select_mode"
              :meta_filenames_already_present="meta_filenames_already_present"
              :unaddable_medias="hide_unaddable_medias ? unaddable_medias : []"
              @update:media_focused="media_focused = $event"
              @addMedias="addMedias"
            />
          </template>
        </template>
      </template>
    </div>
  </BaseModal2>
</template>
<script>
import MediaLibrary from "@/components/panes/MediaLibrary.vue";

export default {
  props: {
    path: String,
    select_mode: {
      type: String,
      required: true,
    },
  },
  components: {
    MediaLibrary,
  },
  inject: ["$getMetaFilenamesAlreadyPresent", "$getUnaddableMedias"],
  data() {
    return {
      is_loading: false,
      projects: undefined,
      source_project_path: "",
      source_project: undefined,
      media_focused: undefined,
      hide_unaddable_medias: true,
    };
  },
  created() {},
  async mounted() {
    this.is_loading = true;
    await this.loadProjects();
    this.is_loading = false;
  },
  beforeDestroy() {},
  watch: {
    source_project_path() {
      if (this.source_project_path) this.fetchSelectedProject();
      else this.source_project = undefined;
    },
  },
  computed: {
    meta_filenames_already_present() {
      if (this.$getMetaFilenamesAlreadyPresent)
        return this.$getMetaFilenamesAlreadyPresent();
      return false;
    },
    unaddable_medias() {
      if (this.$getUnaddableMedias) return this.$getUnaddableMedias();
      return [];
    },
  },
  methods: {
    addMedias(path_to_source_media_metas) {
      // TODO if path matches a media that is not in this project,
      // we need to copy this media to this project first then link that media instead
      this.$emit("addMedias", {
        path_to_source_media_metas,
      });
      this.$emit("close");
    },
    async loadProjects() {
      let { space_slug, project_slug } = this.decomposePath(this.path);

      if (!space_slug) return false;

      this.projects = await this.$api.getFolders({
        path:
          this.createPath({
            space_slug,
          }) + "/projects",
      });

      if (project_slug) {
        this.source_project_path = this.createPath({
          space_slug,
          project_slug,
        });
      } else if (this.projects.length > 0) {
        this.source_project_path = this.projects[0].$path;
      }
    },
    async fetchSelectedProject() {
      this.source_project = await this.$api.getFolder({
        path: this.source_project_path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._pickMediaFromProject {
  position: relative;
  display: block;
  // max-width: 480px;
  width: 100%;

  // max-height: 50vh;
  // margin: calc(var(--spacing) / 4) 0;
  // padding: calc(var(--spacing) / 4);
  overflow: auto;
  // border-radius: 4px;
  background: white;

  // display: flex;
  // flex-flow: column nowrap;

  // border: 2px dashed var(--c-gris_fonce);
  // padding: calc(var(--spacing) / 2);

  > * {
    // flex: 0 0 auto;

    &._mediaLib {
      height: 60vh;
      // overflow: hidden;
      // flex: 1 1 70vh;
    }
  }
}
</style>
