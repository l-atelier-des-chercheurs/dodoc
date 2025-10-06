<template>
  <BaseModal2 :title="modal_title" @close="$emit('close')">
    <template v-if="!url_to_copy">
      <div class="">
        <div class="u-spacingBottom u-instructions">
          <small>
            {{ $t("dm_instr") }}
          </small>
        </div>

        <div class="u-spacingBottom">
          <DLabel :str="destination_space_label" />

          <select v-model="destination_space_path">
            <option
              v-for="space in sorted_spaces"
              :key="space.$path"
              :value="space.$path"
              v-text="space.title"
            />
          </select>
        </div>

        <div class="u-spacingBottom">
          <DLabel :str="new_title_label" />
          <TextInput
            :content.sync="new_title"
            :maxlength="40"
            :required="true"
            ref="titleInput"
          />
        </div>

        <div class="u-spacingBottom" v-if="mode === 'duplicate'">
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
          <button type="button" class="u-button" @click="$emit('close')">
            <b-icon icon="x-circle" />
            {{ $t("cancel") }}
          </button>

          <button
            class="u-button u-button_bleuvert"
            type="button"
            autofocus
            @click="confirm"
          >
            <template v-if="remove_original">
              {{ $t("move") }}
            </template>
            <template v-else>
              <template v-if="mode === 'remix'">
                {{ $t("remix") }}
              </template>
              <template v-else>
                {{ $t("duplicate") }}
              </template>
            </template>
          </button>
        </template>
        <LoaderSpinner v-else />
      </template>
    </template>
    <template v-else>
      <router-link :to="url_to_copy" class="u-button u-button_bleumarine">
        {{ $t("open_copy") }}
      </router-link>
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    path: String,
    proposed_title: String,
    mode: {
      type: String,
      default: "duplicate",
    },
  },
  components: {},
  data() {
    return {
      spaces: undefined,
      destination_space_path: undefined,

      url_to_copy: false,
      remove_original: false,
      new_title: this.proposed_title,

      is_copying: false,
    };
  },
  created() {},
  async mounted() {
    const { space_slug } = this.decomposePath(this.path);
    this.destination_space_path = this.createPath({ space_slug });

    this.spaces = await this.$api.getFolders({
      path: "spaces",
    });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    modal_title() {
      if (this.mode === "remix") return this.$t("remix_this_project");
      return this.$t("duplicate_or_move");
    },
    destination_space_label() {
      if (this.mode === "remix") return this.$t("destination_space_remix");
      return this.$t("destination_space");
    },
    new_title_label() {
      if (this.mode === "remix") return this.$t("title_of_remix");
      return this.$t("title_of_copy");
    },
    sorted_spaces() {
      if (!this.spaces) return [];
      return this.spaces
        .slice()
        .filter((s) =>
          this.canLoggedinSeeFolder({
            folder: s,
          })
        )
        .sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
    },
  },
  methods: {
    async confirm() {
      // const parent_type = this.getParent(this.path);

      this.is_copying = true;

      const path_to_destination_type =
        this.destination_space_path + "/projects";

      let new_folder_path;

      try {
        if (this.mode === "duplicate")
          new_folder_path = await this.$api.copyFolder({
            path: this.path,
            path_to_destination_type,
            is_copy_or_move: this.remove_original ? "move" : "copy",
            new_meta: {
              title: this.new_title,
            },
          });
        else if (this.mode === "remix") {
          const new_meta = {
            title: this.new_title,
            $admins: this.setDefaultContentAdmins(),
            $contributors: [],
          };

          new_folder_path = await this.$api.remixFolder({
            path: this.path,
            path_to_destination_type,
            new_meta,
          });
        }
      } catch ({ code: err_code }) {
        if (err_code === "unique_field_taken") {
          this.$alertify.delay(4000).error(this.$t("title_taken"));
          this.$refs.titleInput.$el.querySelector("input").select();
        } else if (err_code === "not_allowed_to_copy_folder") {
          this.$alertify
            .delay(4000)
            .error(this.$t("not_allowed_to_copy_to_space"));
        } else if (err_code === "source_folder_not_open_to_remix") {
          this.$alertify
            .delay(4000)
            .error(this.$t("not_allowed_to_remix_folder"));
        } else if (
          err_code === "destination_folder_not_open_to_user_contribution"
        ) {
          this.$alertify
            .delay(4000)
            .error(this.$t("not_allowed_to_copy_to_space"));
        }

        debugger;

        this.is_copying = false;
        throw "fail";
      }

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("folder_copied"));

      const url_to_copy = this.createURLFromPath(new_folder_path);

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
<style lang="scss" scoped></style>
