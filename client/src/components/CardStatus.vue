<template>
  <ProjectCard>
    <div slot="header">
      {{ $t("progress") }}
      <sl-icon name="globe" />
    </div>
    <div class="">
      <SelectField
        :field_name="'status'"
        :content="project.status"
        :path="`/projects/${project.slug}`"
        :can_edit="can_edit_project"
        :options="status_options"
      />

      <div>
        <small>
          <template v-if="project.status === 'draft'">
            Le projet apparaîtra dans la section
            <b>{{ $t(project.status) }}</b> sur la page d'accueil.
          </template>
          <template v-else-if="project.status === 'invisible'">
            Ce projet sera invisible à tous sauf aux contributeurs. Il ne pourra
            pas non plus être ouvert en passant par l'URL.
          </template>
          <template v-else-if="project.status === 'finished'">
            Ce projet sera affiché en haut de la page d'accueil.
          </template>
        </small>
      </div>
    </div>
  </ProjectCard>
</template>
<script>
import ProjectCard from "@/components/ProjectCard.vue";

export default {
  props: {
    project: Object,
    can_edit_project: Boolean,
  },
  components: { ProjectCard },
  data() {
    return {
      status_options: ["draft", "invisible", "finished"],
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
<style lang="scss" scoped></style>
