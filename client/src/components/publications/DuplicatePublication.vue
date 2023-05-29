<template>
  <div>
    <button type="button" class="u-buttonLink" @click="show_modal = true">
      <sl-icon name="file-plus" />
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

          <br />
          <details>
            <summary>{{ $t("more_informations") }}</summary>
            <div>
              project_medias_to_copy = {{ project_medias_to_copy.length }}
              {{ project_medias_to_copy }}
            </div>
          </details>
        </div>

        <div class="u-sameRow" slot="footer">
          <template v-if="!is_copying">
            <button
              type="button"
              class="u-buttonLink"
              @click="show_modal = false"
            >
              {{ $t("cancel") }}
            </button>
            <button
              class="u-button u-button_red"
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
        </div>
      </template>
      <template v-else>
        <router-link
          :to="navigation_to_copy"
          class="u-button u-button_bleumarine"
        >
          {{ $t("open_copy") }}
        </router-link>
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
  watch: {},
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
      // - other project, copyfolder then check for included medias, which we'll also copy. If their meta filename needs to be changed
      // during copy, update all modules that uses it

      const copy_folder_path = await this.$api
        .copyFolder({
          path: this.path,
          path_to_destination_type,
          new_meta: {
            title: this.new_title,
          },
        })
        .catch((err_code) => {
          if (err_code === "unique_field_taken") {
            this.$alertify
              .delay(4000)
              .error(this.$t("notifications.title_taken"));
            this.$refs.titleInput.$el.querySelector("input").select();
          } else if (err_code === "not_allowed_to_copy_to_space") {
            this.$alertify
              .delay(4000)
              .error(this.$t("notifications.not_allowed_to_copy_to_space"));
            this.$refs.titleInput.$el.querySelector("input").select();
          }

          this.is_copying = false;
          throw "fail";
        });

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("completed"));

      let query = {};
      query.projectpanes = JSON.stringify([
        {
          type: "publish",
          size: 100,
          folder: this.getFilename(copy_folder_path),
        },
      ]);
      const navigation = {
        path: this.createURLFromPath(this.destination_project_path),
        query,
      };

      if (!this.remove_original) {
        this.is_copying = false;
        this.navigation_to_copy = navigation;
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
