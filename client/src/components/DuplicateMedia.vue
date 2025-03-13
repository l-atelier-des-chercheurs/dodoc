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

    <BaseModal2
      v-if="show_modal"
      :title="$t('duplicate_or_move')"
      @close="show_modal = false"
    >
      <template v-if="!navigation_to_copy">
        <div class="">
          <div class="u-spacingBottom u-instructions">
            <small>
              {{ $t("dmm_instr") }}
            </small>

            <p class="u-spacingBottom" v-if="is_multiple_medias">
              {{ paths.length }} {{ $t("medias_selected").toLowerCase() }}
            </p>
          </div>

          <SpaceProjectPicker
            class="u-spacingBottom"
            :path="paths ? paths[0] : path"
            @newProjectSelected="destination_project_path = $event"
          />

          <div class="u-spacingBottom">
            <ToggleInput
              :content.sync="remove_original"
              :label="$t('remove_original')"
              :options="{
                true: $t('remove_original_after_copy'),
                false: $t('keep_original_after_copy'),
              }"
            />
          </div>
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
    paths: Array,
    source_title: String,
  },
  components: {
    SpaceProjectPicker,
  },
  data() {
    return {
      show_modal: false,

      navigation_to_copy: false,
      destination_project_path: undefined,
      remove_original: false,
      is_copying: false,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {
    show_modal() {
      this.navigation_to_copy = false;
      this.destination_project_path = undefined;
      this.is_copying = false;
    },
  },
  computed: {
    is_multiple_medias() {
      return Array.isArray(this.paths);
    },
  },
  methods: {
    async confirm() {
      // const parent_type = this.getParent(this.path);

      this.is_copying = true;

      const paths_of_medias_to_copy = this.paths ? this.paths : [this.path];

      for (const path_of_media_to_copy of paths_of_medias_to_copy) {
        const path_to_destination_folder = this.destination_project_path;
        const copy_file_meta = await this.$api
          .copyFile({
            path: path_of_media_to_copy,
            path_to_destination_folder,
            new_meta: {},
          })
          .catch((err_code) => {
            if (err_code === "not_allowed_to_copy_to_folder") {
              this.$alertify
                .delay(4000)
                .error(this.$t("not_allowed_to_copy_to_project"));
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
            type: "collect",
            size: 100,
            focus: copy_file_meta,
          },
        ]);
        const navigation = {
          path: this.createURLFromPath(path_to_destination_folder),
          query,
        };

        if (!this.remove_original) {
          this.navigation_to_copy = navigation;
          this.is_copying = false;
        } else {
          this.is_copying = false;
          await this.$api.deleteItem({
            path: path_of_media_to_copy,
          });
        }
      }

      // close media modal
      this.show_modal = false;
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped></style>
