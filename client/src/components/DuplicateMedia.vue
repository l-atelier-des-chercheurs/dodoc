<template>
  <div>
    <span v-if="$slots.hasOwnProperty('button')" @click="show_modal = true">
      <slot name="button" />
    </span>
    <template v-else>
      <button type="button" class="u-buttonLink" @click="show_modal = true">
        <b-icon icon="file-plus" />
        {{ $t("duplicate_or_move") }}
      </button>
    </template>

    <DuplicateOrMoveModal
      v-if="show_modal"
      :scope.sync="scope"
      :scope_options="scope_options"
      :can_confirm="!!destination_project_path"
      :move_disabled_reason="
        scope === 'same_project' && $t('already_here_pick_another_destination')
      "
      :is_copying="is_copying"
      @close="show_modal = false"
      @confirm="confirm"
    >
      <p class="u-spacingBottom" v-if="is_multiple_medias">
        {{ paths.length }} {{ $t("medias_selected").toLowerCase() }}
      </p>

      <template v-if="scope === 'other_project'">
        <div class="u-spacingBottom u-instructions">
          <small>
            {{ $t("dmm_instr") }}
          </small>
        </div>
        <SpaceProjectPicker
          class="u-spacingBottom"
          :path="source_project_path"
          :excluded_project_path="source_project_path"
          @newProjectSelected="pickOtherProject"
        />
      </template>
    </DuplicateOrMoveModal>
  </div>
</template>
<script>
import SpaceProjectPicker from "@/components/fields/SpaceProjectPicker.vue";
import DuplicateOrMoveModal from "@/components/DuplicateOrMoveModal.vue";

export default {
  props: {
    path: String,
    paths: Array,
    source_title: String,
  },
  components: {
    SpaceProjectPicker,
    DuplicateOrMoveModal,
  },
  data() {
    return {
      show_modal: false,

      scope: "same_project",
      destination_project_path: undefined,
      is_copying: false,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {
    show_modal() {
      this.is_copying = false;
      this.scope = "same_project";
      this.destination_project_path = this.source_project_path;
    },
    scope() {
      this.destination_project_path =
        this.scope === "same_project" ? this.source_project_path : undefined;
      // other_project: waits for SpaceProjectPicker
    },
  },
  computed: {
    is_multiple_medias() {
      return Array.isArray(this.paths);
    },
    paths_of_medias() {
      return this.is_multiple_medias ? this.paths : [this.path];
    },
    source_project_path() {
      return this.getParent(this.paths_of_medias[0]);
    },
    scope_options() {
      return [
        { key: "same_project", label: this.$t("in_this_project") },
        { key: "other_project", label: this.$t("in_another_project") },
      ];
    },
  },
  methods: {
    pickOtherProject(project_path) {
      // the picker starts on the current project before switching to another
      if (project_path === this.source_project_path) return;
      this.destination_project_path = project_path;
    },
    async confirm({ remove_original }) {
      this.is_copying = true;

      const path_to_destination_folder = this.destination_project_path;
      let copy_file_meta;

      try {
        for (const path_of_media_to_copy of this.paths_of_medias) {
          copy_file_meta = await this.$api.copyFile({
            path: path_of_media_to_copy,
            path_to_destination_folder,
            new_meta: {},
          });
          if (remove_original)
            await this.$api.deleteItem({
              path: path_of_media_to_copy,
            });
        }
      } catch (err) {
        const err_code = err?.code || err;
        if (err_code === "not_allowed_to_copy_to_folder")
          this.$alertify
            .delay(4000)
            .error(this.$t("not_allowed_to_copy_to_project"));
        else this.$alertify.delay(4000).error(err_code);
        this.is_copying = false;
        return;
      }

      const count = this.paths_of_medias.length;
      let message;
      if (count > 1)
        message = remove_original
          ? this.$t("medias_moved", { count })
          : this.$t("medias_duplicated", { count });
      else
        message = remove_original
          ? this.$t("media_moved")
          : this.$t("media_duplicated");

      this.toastWithLink({
        message,
        navigation: this.makeNavigationToProjectPane({
          project_path: path_to_destination_folder,
          pane: { type: "collect", focus: copy_file_meta },
        }),
      });

      // close media modal
      this.show_modal = false;
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped></style>
