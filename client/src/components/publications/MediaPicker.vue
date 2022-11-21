<template>
  <div class="_mediaPicker">
    MediaPicker {{ show_media_picker }}

    <sl-button
      variant="edit"
      class="editBtn"
      size="small"
      pill
      @click="show_media_picker = !show_media_picker"
    >
      <sl-icon name="plus-circle-fill" :label="$t('edit')" />
      {{ $t("add_media") }}
    </sl-button>
    <sl-button
      size="small"
      variant="default"
      pill
      @click="show_media_picker = false"
    >
      <sl-icon name="x-circle" />
      {{ $t("back") }}
    </sl-button>

    <div v-if="show_media_picker">
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
        <br />

        <div v-if="source_project_path">
          <label for="" class="u-label">{{ $t("medias") }}</label>
          <sl-spinner
            style="--indicator-color: currentColor"
            v-if="!source_project"
          />
          <template v-else>
            <MediaLibrary
              :project="source_project"
              :focus_height="focus_height"
              :media_focused="focus"
              @update:focus_height="focus_height = $event"
              @update:media_focused="focus = $event"
            />
          </template>
        </div>
      </template>
    </div>
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

      focus_height: 0,
      focus: undefined,
    };
  },
  created() {},
  async mounted() {
    this.projects = await this.$api.getFolders({
      path: `projects`,
    });

    const opened_project = this.projects.find((p) =>
      this.publication_path.includes(p.$path)
    );
    if (opened_project) this.source_project_path = opened_project.$path;
  },
  beforeDestroy() {},
  watch: {
    source_project_path() {
      if (this.source_project_path) this.fetchSelectedProject();
      else this.source_project = undefined;
    },
  },
  computed: {},
  methods: {
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
  max-width: 320px;
  margin: calc(var(--spacing) / 4) 0;
  padding: calc(var(--spacing) / 4);
  border-radius: 4px;
  background: white;
  // border: 1px solid black;
}
</style>
