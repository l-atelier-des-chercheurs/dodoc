<template>
  <ProjectCard :header="$t('files')" :icon="'file-earmark-arrow-down'">
    <div class="">
      <!-- <PickMediaFromProjects
      v-if="show_file_picker"
        :path="current_project_path"
        @selectMedia="fileSelect"
        @close="show_file_picker = false"
      /> -->

      <ul class="_fileList">
        <li v-for="(file, i) in files" :key="i">
          <sl-icon name="file-earmark-arrow-down" />
          <a
            :download="file"
            :href="$root.publicPath + '/jdle/' + file"
            target="_blank"
            class="u-buttonLink"
          >
            {{ file }}
          </a>
        </li>
      </ul>
    </div>
  </ProjectCard>
</template>
<script>
import ProjectCard from "@/components/ProjectCard.vue";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: { ProjectCard },
  data() {
    return {
      files: [
        "middle-def-2.pdf",
        "cartes-jeu-tolon-ni-kalan.pdf",
        "dessous-def-3-2.pdf",
        "dessus-def-4.pdf",
        "mode-demploi.pdf",
        "middle-def.ai",
        "dessus-def.ai",
        "dessous-def.ai",
        "complet-v2.ai",
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._fileList {
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    margin: calc(var(--spacing) / 4) 0;
    padding: calc(var(--spacing) / 4);
    border-radius: var(--button-radius);

    border: 1px solid black;
    display: flex;
    word-break: break-word;
    align-items: center;
    gap: calc(var(--spacing) / 4);
  }
}
</style>
