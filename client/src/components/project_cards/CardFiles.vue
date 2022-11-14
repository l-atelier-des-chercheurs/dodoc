<template>
  <ProjectCard>
    <div slot="header">
      {{ $t("files") }}
      <sl-icon name="file-earmark-arrow-down" />
    </div>
    <div class="">
      <ul class="_fileList">
        <li>
          <sl-icon name="file-earmark-arrow-down" />
          <a
            target="_blank"
            ng-href="/uploads/project_cao/102/%C3%A9l%C3%A9phant.svg"
            download="/uploads/project_cao/102/%C3%A9l%C3%A9phant.svg"
            class="ng-binding"
            href="/uploads/project_cao/102/%C3%A9l%C3%A9phant.svg"
            ><i class="fa fa-arrow-circle-o-down"> </i> éléphant.svg</a
          >
        </li>
        <li>
          <sl-icon name="file-earmark-arrow-down" />
          <a
            target="_blank"
            ng-href="/uploads/project_cao/101/%C3%A9l%C3%A9phant_serre_livre.svg"
            download="/uploads/project_cao/101/%C3%A9l%C3%A9phant_serre_livre.svg"
            class="ng-binding"
            href="/uploads/project_cao/101/%C3%A9l%C3%A9phant_serre_livre.svg"
            ><i class="fa fa-arrow-circle-o-down"> </i>
            éléphant_serre_livre.svg</a
          >
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
    can_edit_project: Boolean,
  },
  components: { ProjectCard },
  data() {
    return {};
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
