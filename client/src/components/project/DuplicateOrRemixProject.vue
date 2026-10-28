<template>
  <DuplicateOrMoveModal
    :title="modal_title"
    :scope.sync="scope"
    :scope_options="scope_options"
    :can_confirm="!!destination_space_path"
    :show_move="mode === 'duplicate'"
    :move_disabled_reason="
      scope === 'same_space' && $t('already_here_pick_another_destination')
    "
    :duplicate_label="mode === 'remix' ? $t('remix') : undefined"
    :duplicate_icon="mode === 'remix' ? 'intersect' : undefined"
    :is_copying="is_copying"
    @close="$emit('close')"
    @confirm="confirm"
  >
    <div class="u-spacingBottom u-instructions">
      <small>
        {{ $t("dm_instr") }}
      </small>
    </div>

    <div class="u-spacingBottom" v-if="scope === 'other_space'">
      <DLabel :str="destination_space_label" />
      <LoaderSpinner v-if="!spaces" />
      <select v-else v-model="destination_space_path">
        <option
          v-for="space in other_spaces"
          :key="space.$path"
          :value="space.$path"
          :disabled="!canLoggedinContributeToFolder({ folder: space })"
          v-text="makeSpaceTitle(space)"
        />
      </select>
    </div>

    <div class="u-spacingBottom">
      <DLabel :str="new_title_label" />
      <TextInput
        :content.sync="new_title"
        :maxlength="60"
        :required="true"
        ref="titleInput"
      />
    </div>
  </DuplicateOrMoveModal>
</template>
<script>
import DuplicateOrMoveModal from "@/components/DuplicateOrMoveModal.vue";

export default {
  props: {
    path: String,
    proposed_title: String,
    mode: {
      type: String,
      default: "duplicate",
    },
  },
  components: { DuplicateOrMoveModal },
  data() {
    return {
      spaces: undefined,
      scope: "same_space",
      destination_space_path: undefined,

      new_title: this.proposed_title,

      is_copying: false,
    };
  },
  created() {},
  async mounted() {
    this.destination_space_path = this.source_space_path;

    this.spaces = await this.$api.getFolders({
      path: "spaces",
    });
  },
  beforeDestroy() {},
  watch: {
    scope() {
      if (this.scope === "same_space")
        this.destination_space_path = this.source_space_path;
      else
        this.destination_space_path = this.other_spaces.find((s) =>
          this.canLoggedinContributeToFolder({ folder: s })
        )?.$path;
    },
  },
  computed: {
    has_other_space() {
      // while loading, keep the option available
      if (!this.spaces) return true;
      return this.other_spaces.some((s) =>
        this.canLoggedinContributeToFolder({ folder: s })
      );
    },
    source_space_path() {
      const { space_slug } = this.decomposePath(this.path);
      return this.createPath({ space_slug });
    },
    modal_title() {
      if (this.mode === "remix") return this.$t("remix_this_project");
      return this.$t("duplicate_or_move");
    },
    scope_options() {
      return [
        { key: "same_space", label: this.$t("in_this_space") },
        {
          key: "other_space",
          label: this.$t("in_another_space"),
          disabled: !this.has_other_space,
          instructions: !this.has_other_space
            ? this.$t("no_other_space_available")
            : undefined,
        },
      ];
    },
    destination_space_label() {
      if (this.mode === "remix") return this.$t("destination_space_remix");
      return this.$t("destination_space");
    },
    new_title_label() {
      if (this.mode === "remix") return this.$t("title_of_remix");
      return this.$t("title_of_copy");
    },
    other_spaces() {
      if (!this.spaces) return [];
      return this.spaces
        .filter((s) => s.$path !== this.source_space_path)
        .sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
    },
  },
  methods: {
    makeSpaceTitle(space) {
      if (this.canLoggedinContributeToFolder({ folder: space })) {
        return space.title;
      } else {
        return (
          space.title + " (" + this.$t("non_contributor").toLowerCase() + ")"
        );
      }
    },
    async confirm({ remove_original }) {
      this.is_copying = true;

      const path_to_destination_type =
        this.destination_space_path + "/projects";

      let new_folder_path;

      try {
        if (this.mode === "duplicate")
          new_folder_path = await this.$api.copyFolder({
            path: this.path,
            path_to_destination_type,
            is_copy_or_move: remove_original ? "move" : "copy",
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

        this.is_copying = false;
        return;
      }

      const url_to_copy = this.createURLFromPath(new_folder_path);

      if (remove_original) {
        await this.$api.deleteItem({
          path: this.path,
        });
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(this.$t("project_moved"));
        this.$router.push(url_to_copy);
        return;
      }

      this.toastWithLink({
        message:
          this.mode === "remix"
            ? this.$t("project_remixed")
            : this.$t("project_duplicated"),
        navigation: url_to_copy,
      });
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped></style>
