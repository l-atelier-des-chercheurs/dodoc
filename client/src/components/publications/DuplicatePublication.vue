<template>
  <div>
    <button type="button" class="u-buttonLink" @click="show_modal = true">
      <b-icon icon="file-plus" />
      {{ $t("duplicate_or_move") }}
    </button>

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
      <template v-if="scope === 'other_project'">
        <div class="u-spacingBottom u-instructions">
          <small>
            {{ $t("dmp_instr") }}
          </small>
        </div>
        <SpaceProjectPicker
          class="u-spacingBottom"
          :path="path"
          :excluded_project_path="source_project_path"
          @newProjectSelected="pickOtherProject"
        />
      </template>

      <div class="u-spacingBottom">
        <DLabel :str="$t('title_of_copy')" />
        <TextInput
          :content.sync="new_title"
          :maxlength="60"
          :required="true"
          ref="titleInput"
        />
      </div>
    </DuplicateOrMoveModal>
  </div>
</template>
<script>
import SpaceProjectPicker from "@/components/fields/SpaceProjectPicker.vue";
import DuplicateOrMoveModal from "@/components/DuplicateOrMoveModal.vue";

export default {
  props: {
    path: String,
    source_title: String,
    publication: Object,
  },
  components: { SpaceProjectPicker, DuplicateOrMoveModal },
  data() {
    return {
      show_modal: false,

      scope: "same_project",
      destination_project_path: undefined,

      new_title: this.$t("copy_of") + " " + this.source_title,

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
    source_project_path() {
      return this.getParent(this.getParent(this.path));
    },
    scope_options() {
      return [
        { key: "same_project", label: this.$t("in_this_project") },
        { key: "other_project", label: this.$t("in_another_project") },
      ];
    },
    project_medias_to_copy() {
      // we get all references medias projects
      return this.publication.$files.reduce((acc, f) => {
        if (Object.prototype.hasOwnProperty.call(f, "source_medias")) {
          f.source_medias.forEach((source_media) => {
            const _linked_media = this.getSourceMedia({
              source_media,
              folder_path: this.publication.$path,
            });
            // skip missing medias and those stored in the publication itself,
            // which are already copied with the publication folder
            if (
              !_linked_media ||
              this.getParent(_linked_media.$path) === this.publication.$path
            )
              return;
            if (!acc.includes(_linked_media.$path))
              acc.push(_linked_media.$path);
          });
        }
        return acc;
      }, []);
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

      const path_to_destination_type =
        this.destination_project_path + "/publications";

      // multiple cases :
      // - same project, copyfolder
      // - other project, copyfolder then check for included medias in project, which we'll also copy. If their meta filename needs to be changed
      // during copy, update all modules that uses it

      const copy_publication_path = await this.$api
        .copyFolder({
          path: this.path,
          path_to_destination_type,
          is_copy_or_move: remove_original ? "move" : "copy",
          new_meta: {
            title: this.new_title,
          },
        })
        .catch((err) => {
          if (err.code === "unique_field_taken") {
            this.$alertify.delay(4000).error(this.$t("title_taken"));
            this.$refs.titleInput.$el.querySelector("input").select();
          } else if (err.code === "not_allowed_to_copy_to_space") {
            this.$alertify
              .delay(4000)
              .error(this.$t("not_allowed_to_copy_to_space"));
          }
          this.is_copying = false;
          throw "fail";
        });

      const copy_publication = await this.$api.getFolder({
        path: copy_publication_path,
      });

      // publication changed project, so we need to copy medias aswell
      if (
        this.getParent(this.path) !==
        this.destination_project_path + "/publications"
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log("has_linked_media_to_copy");
        for (let media_path of this.project_medias_to_copy) {
          const copy_file_meta = await this.$api
            .copyFile({
              path: media_path,
              path_to_destination_folder: this.destination_project_path,
              new_meta: {
                group: "imported_from_" + copy_publication_path,
              },
            })
            .catch((err_code) => {
              this.$alertify.delay(4000).error(err_code);
            });

          const original_file_meta = this.getFilename(media_path);
          if (copy_file_meta !== original_file_meta) {
            for (let publication_file of copy_publication.$files) {
              if (
                !Object.prototype.hasOwnProperty.call(
                  publication_file,
                  "source_medias"
                )
              )
                continue;

              if (
                !publication_file.source_medias.some(
                  (sm) =>
                    sm.meta_filename_in_project &&
                    sm.meta_filename_in_project === original_file_meta
                )
              )
                continue;

              const source_medias = publication_file.source_medias.map((sm) => {
                if (sm.meta_filename_in_project === original_file_meta) {
                  sm.meta_filename_in_project = copy_file_meta;
                }
                return sm;
              });

              // update publication file in new folder
              await this.$api.updateMeta({
                path: publication_file.$path,
                new_meta: {
                  source_medias,
                },
              });
            }
          }
        }
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success("linked media copied");
      }

      this.toastWithLink({
        message: remove_original
          ? this.$t("publication_moved")
          : this.$t("publication_duplicated"),
        navigation: this.makeNavigationToProjectPane({
          project_path: this.destination_project_path,
          pane: {
            type: "publish",
            folder: this.getFilename(copy_publication.$path),
          },
        }),
      });

      this.is_copying = false;
      this.show_modal = false;
      if (remove_original) {
        await this.$api.deleteItem({
          path: this.path,
        });
        this.$emit("close");
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
