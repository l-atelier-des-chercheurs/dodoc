<template>
  <div>
    <DLabel
      v-if="label"
      :str="label"
      :tag="tag"
      :instructions="can_edit ? instructions : ''"
    />

    <div class="_authors">
      <div v-if="authors_paths === 'all'">
        {{ $t("all") }}
      </div>

      <AuthorTag
        v-else-if="Array.isArray(authors_paths)"
        v-for="author_path in authors_paths"
        :path="author_path"
        :key="author_path"
        :edit_mode="false"
        :links_to_author_page="false"
      />
      <!-- :links_to_author_page="!edit_mode" -->
      <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />
    </div>

    <div class="_footer" v-if="edit_mode">
      <BaseModal2 @close="cancel" :title="label">
        <div
          v-if="instructions"
          class="u-instructions _projectsNotice"
          :key="'noprojects'"
        >
          {{ instructions }}
        </div>

        <br />

        <div class="_authors">
          <div
            v-if="new_authors_paths.length === 0"
            class="u-instructions _projectsNotice"
            :key="'noprojects'"
          >
            {{ $t("none") }}
          </div>
          <AuthorTag
            v-else
            v-for="author_path in new_authors_paths"
            :path="author_path"
            :key="author_path"
            :edit_mode="edit_mode"
            :links_to_author_page="false"
            @remove="removeAuthor(author_path)"
          />
          <!-- :links_to_author_page="!edit_mode" -->
        </div>

        <br />

        <DLabel class="_label" :str="$t('add')" />
        <AuthorPicker
          :current_authors="new_authors_paths"
          @addAuthor="addAuthor"
        />

        <br />

        <div>
          <SaveCancelButtons
            class="_scb"
            :is_saving="is_saving"
            :allow_save="allow_save"
            @save="updateAuthors"
            @cancel="cancel"
          />
        </div>
      </BaseModal2>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    label: {
      type: String,
      default: "",
    },
    field: {
      type: String,
      required: true,
    },
    authors_paths: {
      type: [String, Array],
      default: "all",
    },
    path: String,
    instructions: {
      type: String,
      default: "",
    },
    tag: String,
    can_edit: {
      type: Boolean,
    },
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      new_authors_paths: [],
    };
  },
  created() {
    this.initAuthorPaths();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    authors_paths() {
      this.initAuthorPaths();
    },
  },
  computed: {
    allow_save() {
      return (
        JSON.stringify(this.new_authors_paths) !==
        JSON.stringify(this.authors_paths)
      );
    },
  },
  methods: {
    initAuthorPaths() {
      if (Array.isArray(this.authors_paths)) {
        this.new_authors_paths = JSON.parse(JSON.stringify(this.authors_paths));
      } else {
        this.new_authors_paths = [];
      }
    },
    enableEditMode() {
      this.edit_mode = true;
    },
    addAuthor(path) {
      this.new_authors_paths.push(path);
    },
    removeAuthor(path) {
      this.new_authors_paths = this.new_authors_paths.filter((a) => a !== path);
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.new_authors_paths = JSON.parse(JSON.stringify(this.authors_paths));

      this.$nextTick(() => {
        // this.content = "";
        // this.$nextTick(() => {
        // this.content = this.new_authors_paths;
        // });
      });

      // todo interrupt updateMeta
    },
    async updateAuthors() {
      this.is_saving = true;
      await new Promise((r) => setTimeout(r, 50));

      try {
        const new_meta = {
          [this.field]: this.new_authors_paths,
        };

        await this.$api.updateMeta({
          path: this.path,
          new_meta,
        });

        this.edit_mode = false;
        this.is_saving = false;
      } catch (e) {
        this.is_saving = false;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.couldntbesaved"));
        this.$alertify.closeLogOnClick(true).error(e.response.data);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._authors {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}

._footer {
  margin-top: calc(var(--spacing) / 4);
}
</style>
