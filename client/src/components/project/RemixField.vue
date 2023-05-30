<template>
  <div class="_remixField">
    <!-- <DLabel :str="$t('remix')" /> -->

    <ToggleField
      v-if="can_edit"
      :label="$t('project_can_be_remixed')"
      :field_name="'$can_be_remixed'"
      :content="project.$can_be_remixed === true"
      :path="project.$path"
      :can_edit="can_edit"
    />

    <button
      v-if="project.$can_be_remixed"
      type="button"
      class="u-button u-button_bleumarine"
      @click="show_remix_modal = true"
    >
      <sl-icon name="sign-intersection-y" />
      {{ $t("remix_this_project") }}
    </button>
    <DuplicateOrRemixProject
      v-if="show_remix_modal"
      :path="project.$path"
      :mode="'remix'"
      :proposed_title="`${$t('remix_of')} ${project.title}`"
      :source_title="project.title"
      @close="show_remix_modal = false"
    />

    <!-- <details>
      <summary>infos</summary>
      Remixes infos
      <pre>{{ project.$list_of_remixes }}</pre>
      <pre>{{ project.$is_remix_of }}</pre>
    </details> -->
  </div>
</template>
<script>
import DuplicateOrRemixProject from "@/components/project/DuplicateOrRemixProject.vue";
export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {
    DuplicateOrRemixProject,
  },
  data() {
    return {
      is_loading: false,
      show_remix_modal: false,
    };
  },
  async created() {
    if (this.project.is_remix_of) {
      this.is_loading = true;
      this.source_project = await this.$api
        .getFolder({
          path: this.event_path,
        })
        .catch((err) => {
          this.error_fetching_source_project = err;
          this.is_loading = false;
        });
      this.is_loading = false;
    }
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    remixProject() {
      // accessible
    },
  },
};
</script>
<style lang="scss" scoped>
._remixField {
}
</style>
