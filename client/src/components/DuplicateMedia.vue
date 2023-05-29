<template>
  <div>
    <button type="button" class="u-buttonLink" @click="show_modal = true">
      <sl-icon name="file-plus" />
      {{ $t("duplicate_or_move_media") }}
    </button>

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
          </div>

          <SpaceProjectPicker
            class="u-spacingBottom"
            :path="path"
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
  },
  components: {
    SpaceProjectPicker,
  },
  data() {
    return {
      navigation_to_copy: false,
      show_modal: false,

      destination_project_path: undefined,

      url_to_copy: false,
      remove_original: false,

      is_copying: false,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async confirm() {
      // const parent_type = this.getParent(this.path);

      this.is_copying = true;

      const path_to_destination_folder = this.destination_project_path;
      const copy_file_meta = await this.$api
        .copyFile({
          path: this.path,
          path_to_destination_folder,
          new_meta: {},
        })
        .catch((err_code) => {
          if (err_code === "not_allowed_to_copy_to_folder") {
            this.$alertify
              .delay(4000)
              .error(this.$t("notifications.not_allowed_to_copy_to_project"));
          }

          this.is_copying = false;
          throw "fail";
        });

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("folder_copied"));

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
          path: this.path,
        });
        // close media modal
        // this.$router.push(navigation);
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
