<template>
  <div class="_mediaPicker">
    <div>
      <sl-button size="small" variant="default" pill @click="hideMediaPicker">
        <sl-icon name="x-circle" />
        {{ $t("back") }}
      </sl-button>
      <sl-button
        variant="edit"
        class="editBtn"
        size="small"
        pill
        @click="showMediaPicker"
      >
        <sl-icon name="plus-circle-fill" :label="$t('edit')" />
        {{ $t("add_media") }}
      </sl-button>
    </div>

    <template v-if="show_media_picker">
      <sl-spinner
        style="--indicator-color: currentColor"
        v-if="projects.length === 0"
      />
      <template v-else>
        <label for="" class="u-label">{{ $t("source_project") }}</label>
        <select v-model="source_project_path">
          <option
            v-for="project in projects"
            :key="project.$path"
            :value="project.$path"
            v-text="project.title"
          />
        </select>

        <template v-if="source_project_path">
          <label for="" class="u-label">{{ $t("medias") }}</label>
          <sl-spinner
            style="--indicator-color: currentColor"
            v-if="!source_project"
          />
          <template v-else>
            <MediaLibrary
              class="_mediaLib"
              :project="source_project"
              :media_focused="media_focused"
              :select_mode="true"
              @update:media_focused="media_focused = $event"
              @selectMedia="selectMedia"
            />
          </template>
        </template>
      </template>
    </template>
  </div>
</template>
<script>
import MediaLibrary from "@/components/panes/MediaLibrary.vue";

export default {
  props: {
    publication_path: String,
  },
  components: {
    MediaLibrary,
  },
  data() {
    return {
      show_media_picker: false,

      projects: [],
      source_project_path: "",
      source_project: undefined,

      media_focused: undefined,
    };
  },
  async created() {},
  beforeDestroy() {},
  watch: {
    source_project_path() {
      if (this.source_project_path) this.fetchSelectedProject();
      else this.source_project = undefined;
    },
  },
  computed: {},
  methods: {
    showMediaPicker() {
      this.show_media_picker = true;
      this.loadProjects();
    },
    hideMediaPicker() {
      this.media_focused = undefined;
      this.show_media_picker = false;
    },
    selectMedia(path) {
      // TODO if path matches a media that is not in this project,
      // we need to copy this media to this project first then link that media instead
      this.$emit("selectMedia", path);
      this.hideMediaPicker();
    },
    async loadProjects() {
      this.source_project_path = this.publication_path
        .split("/")
        .splice(0, 2)
        .join("/");

      this.projects = await this.$api.getFolders({
        path: `projects`,
      });
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
._mediaPicker {
  position: relative;
  display: block;
  max-width: 330px;
  width: 100%;

  // max-height: 50vh;
  margin: calc(var(--spacing) / 4) 0;
  padding: calc(var(--spacing) / 4);
  overflow: auto;
  border-radius: 4px;
  background: white;

  display: flex;
  flex-flow: column nowrap;

  border: 2px dashed var(--c-gris_fonce);
  padding: calc(var(--spacing) / 2);

  > * {
    flex: 0 0 auto;

    &._mediaLib {
      overflow: hidden;
      flex: 1 1 50vh;
    }
  }
}
</style>
