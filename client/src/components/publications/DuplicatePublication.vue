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
      <template v-if="!url_to_copy">
        <div class="u-spacingBottom">
          <div class="u-instructions">
            <small>
              {{ $t("dmp_instr") }}
            </small>
          </div>

          <br />

          <div class="u-spacingBottom _spaceProjectSelect">
            <DLabel :str="$t('destination_project')" />
            <div class="_row">
              <select v-model="destination_space_path">
                <option
                  v-for="space in spaces"
                  :key="space.$path"
                  :value="space.$path"
                  v-text="space.title"
                />
              </select>
              <select v-model="destination_project_path">
                <option
                  v-for="project in projects"
                  :key="project.$path"
                  :value="project.$path"
                  v-text="project.title"
                />
              </select>
            </div>
          </div>

          <!-- <div class="">todo choix space</div> -->
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
        <router-link :to="url_to_copy" class="u-button u-button_bleumarine">
          {{ $t("open_copy") }}
        </router-link>
      </template>
    </BaseModal2>
  </div>
</template>
<script>
export default {
  props: {
    path: String,
    source_title: String,
  },
  components: {},
  data() {
    return {
      show_modal: false,

      spaces: undefined,
      destination_space_path: undefined,

      projects: undefined,
      destination_project_path: undefined,

      url_to_copy: false,
      remove_original: false,
      new_title: this.$t("copy_of") + " " + this.source_title,

      is_copying: false,
    };
  },
  created() {},
  async mounted() {
    const { space_slug, project_slug } = this.decomposePath(this.path);
    this.destination_space_path = this.createPath({ space_slug });
    this.destination_project_path = this.createPath({
      space_slug,
      project_slug,
    });

    this.spaces = await this.$api.getFolders({
      path: "spaces",
    });
  },
  beforeDestroy() {},
  watch: {
    async destination_space_path() {
      this.projects = await this.$api.getFolders({
        path: this.destination_space_path + "/projects",
      });
      if (this.projects.length > 0)
        this.destination_project_path = this.projects[0].$path;
    },
  },
  computed: {},
  methods: {
    async confirm() {
      // const parent_type = this.getParent(this.path);

      this.is_copying = true;

      const path_to_destination_type =
        this.destination_space_path + "/projects";

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
        .success(this.$t("folder_copied"));

      const url_to_copy = this.createURLFromPath(copy_folder_path);

      if (!this.remove_original) {
        this.url_to_copy = url_to_copy;
        this.is_copying = false;
      } else {
        this.is_copying = false;
        await this.$api.deleteItem({
          path: this.path,
        });
        this.$router.push(url_to_copy);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._spaceProjectSelect {
  ._row {
    display: flex;
    flex-flow: row nowrap;
    gap: calc(var(--spacing) / 2);

    > * {
      flex: 1 1 0;
    }
  }
}
</style>
