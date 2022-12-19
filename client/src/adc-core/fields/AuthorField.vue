<template>
  <div>
    <DLabel
      v-if="label && (new_authors_paths.length > 0 || can_edit)"
      :str="label"
      :show_instructions.sync="show_instructions"
    />

    <div class="_authors">
      <template v-for="author_path in new_authors_paths">
        <AuthorTag
          :path="author_path"
          :key="author_path"
          :edit_mode="edit_mode"
          @remove="removeAuthor(author_path)"
        />
      </template>
      <!-- <sl-button
        v-if="edit_mode && add_new_author === false"
        variant="default"
        class=""
        size="small"
        pill
        @click="add_new_author = true"
      >
        <sl-icon name="plus-square" :label="$t('add')" />

      </sl-button> -->

      <template v-if="can_edit">
        <EditBtn v-if="!edit_mode" @click="enableEditMode" />
      </template>
    </div>

    <div class="u-instructions">
      <template v-if="show_instructions">
        <small v-html="instructions" />
      </template>
    </div>

    <div class="_footer" v-if="edit_mode">
      <!-- <TextInput
          :content.sync="new_tag_name"
          :maxlength="maxlength"
          :required="true"
          @toggleValidity="($event) => (allow_save_newkeyword = $event)"
          @onEnter="onEnter"
        /> -->
      <!-- <div class="u-wips" /> -->

      <DLabel :str="$t('add_authors')" />
      <AuthorPicker
        :current_authors="new_authors_paths"
        @addAuthor="addAuthor"
      />

      <div>
        <SaveCancelButtons
          class="_scb"
          :is_saving="is_saving"
          :allow_save="allow_save"
          @save="updateAuthors"
          @cancel="cancel"
        />
      </div>
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
    authors_paths: {
      type: Array,
      default: () => [],
    },
    path: String,
    instructions: {
      type: String,
      default: "",
    },

    can_edit: {
      type: Boolean,
    },
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      new_authors_paths: JSON.parse(JSON.stringify(this.authors_paths)),
      // new_authors_paths: ["pauline", "louis"],

      show_instructions: this.instructions ? false : undefined,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    authors_paths() {
      this.new_authors_paths = JSON.parse(JSON.stringify(this.authors_paths));
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
          $authors: this.new_authors_paths,
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
