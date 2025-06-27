<template>
  <div>
    <button type="button" class="u-buttonLink" @click="show_modal = true">
      <b-icon icon="file-plus" />
      {{ $t("duplicate_or_move") }}
    </button>

    <BaseModal2
      v-if="show_modal"
      :title="$t('duplicate_or_move')"
      @close="show_modal = false"
    >
      <template v-if="!navigation_to_copy">
        <div class="u-spacingBottom">
          <div class="u-instructions">
            <small>
              {{ $t("dmp_instr") }}
            </small>
          </div>

          <br />

          <SpaceProjectPicker
            class="u-spacingBottom"
            :path="path"
            @newProjectSelected="destination_project_path = $event"
          />

          <div class="u-spacingBottom">
            <DLabel :str="$t('title_of_copy')" />
            <TextInput
              :content.sync="new_title"
              :maxlength="40"
              :required="true"
              ref="titleInput"
            />
          </div>

          <div class="">
            <ToggleInput
              :content.sync="remove_original"
              :label="$t('remove_original')"
              :options="{
                true: $t('remove_original_after_copy'),
                false: $t('keep_original_after_copy'),
              }"
            />
          </div>

          <!-- <br />
          <details>
            <summary>{{ $t("more_informations") }}</summary>
            <pre>
              project_medias_to_copy = {{ project_medias_to_copy.length }}
              {{ project_medias_to_copy }}
            </pre>
          </details> -->
        </div>

        <template slot="footer">
          <template v-if="!is_copying">
            <button type="button" class="u-button" @click="show_modal = false">
              <b-icon icon="x-circle" />
              {{ $t("cancel") }}
            </button>
            <button
              class="u-button u-button_bleuvert"
              type="button"
              autofocus
              :disabled="!destination_project_path"
              @click="confirm"
            >
              <template v-if="remove_original">
                {{ $t("move") }}
              </template>
              <template v-else>
                {{ $t("duplicate") }}
              </template>
            </button>
          </template>
          <LoaderSpinner v-else />
        </template>
      </template>
      <template v-else>
        <a :href="navigation_to_copy" class="u-button u-button_bleumarine">
          {{ $t("open_copy") }}
        </a>
        <!-- <router-link
          :to="navigation_to_copy"
          class="u-button u-button_bleumarine"
        >
          {{ $t("open_copy") }}
        </router-link> -->
      </template>
    </BaseModal2>
  </div>
</template>
<script>
import SpaceProjectPicker from "@/components/fields/SpaceProjectPicker.vue";

export default {
  props: {
    path: String,
    source_title: String,
    publication: Object,
  },
  components: { SpaceProjectPicker },
  data() {
    return {
      navigation_to_copy: false,
      show_modal: false,

      destination_project_path: undefined,

      remove_original: false,
      new_title: this.$t("copy_of") + " " + this.source_title,

      is_copying: false,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {
    show_modal() {
      if (this.show_modal) {
        this.navigation_to_copy = undefined;
      }
    },
  },
  computed: {
    project_medias_to_copy() {
      // we get all references medias projects
      return this.publication.$files.reduce((acc, f) => {
        if (Object.prototype.hasOwnProperty.call(f, "source_medias")) {
          f.source_medias.map((source_media) => {
            const _linked_media = this.getSourceMedia({
              source_media,
              folder_path: this.publication.$path,
            });
            if (!acc.includes(_linked_media.$path))
              acc.push(_linked_media.$path);
          });
        }
        return acc;
      }, []);
    },
  },
  methods: {
    async confirm() {
      // const parent_type = this.getParent(this.path);

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
          is_copy_or_move: this.remove_original ? "move" : "copy",
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

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success("publication_copy_success");

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

      let query = {};
      query.projectpanes = JSON.stringify([
        {
          type: "publish",
          size: 100,
          folder: this.getFilename(copy_publication.$path),
        },
      ]);
      const navigation = {
        path: this.createURLFromPath(this.destination_project_path),
        query,
      };

      if (!this.remove_original) {
        this.is_copying = false;
        this.navigation_to_copy = this.$router.resolve(navigation).href;
      } else {
        this.is_copying = false;
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
