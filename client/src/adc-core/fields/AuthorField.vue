<template>
  <div>
    <DLabel v-if="label" :str="label" :tag="tag" :instructions="instructions" />

    <transition-group tag="div" class="_authors" name="listComplete" appear>
      <div v-if="authors_paths === 'everyone'" class="t-500" key="everyone">
        {{ $t("everyone") }}
      </div>
      <template
        v-else-if="Array.isArray(authors_paths) && authors_paths.length > 0"
      >
        <AuthorTag
          v-for="author_path in authors_paths"
          :path="author_path"
          :key="author_path"
          :mode="'link'"
          :show_image_only="show_image_only"
        />
      </template>
      <div v-else class="t-500" key="noone">
        {{ $t("noone") }}
      </div>
      <EditBtn
        key="editbtn"
        v-if="can_edit && !edit_mode"
        @click="enableEditMode"
      />
    </transition-group>

    <div class="_footer" v-if="edit_mode">
      <BaseModal2 @close="cancel" :title="label">
        <div
          v-if="instructions"
          class="u-instructions u-spacingBottom"
          :key="'noprojects'"
        >
          {{ instructions }}
        </div>

        <RadioCheckboxInput
          :value.sync="radio_mode"
          :options="editing_options"
          :can_edit="edit_mode"
        />

        <div v-if="Array.isArray(new_authors_paths)" class="_listOfAuthors">
          <DLabel class="_label" :str="$t('list_of_accounts')" />
          <div v-if="new_authors_paths.length === 0" class="u-instructions">
            {{ $t("noone") }}
          </div>
          <transition-group
            v-else
            tag="div"
            class="_authors"
            name="listComplete"
            appear
          >
            <AuthorTag
              v-for="author_path in new_authors_paths"
              :path="author_path"
              :key="author_path"
              :edit_mode="edit_mode"
              :mode="'remove'"
              @click="removeAuthor(author_path)"
            />
          </transition-group>

          <div class="u-spacingBottom" />

          <DLabel class="_label" :str="$t('add_accounts')" />
          <AuthorPicker
            :current_authors="new_authors_paths"
            @addAuthor="addAuthor"
          />
        </div>

        <div class="u-spacingBottom" />

        <div v-if="warning_wont_be_able_to_edit" class="u-warning">
          {{ $t("warning_wont_be_able_to_edit") }}
        </div>

        <template slot="footer">
          <SaveCancelButtons
            :is_saving="is_saving"
            :allow_save="allow_save"
            @save="updateAuthors"
            @cancel="cancel"
          />
        </template>
      </BaseModal2>
    </div>
  </div>
</template>
<script>
import { Handler } from "pagedjs";

export default {
  props: {
    label: {
      type: String,
      default: "",
    },
    field: {
      type: String,
    },
    authors_paths: {
      type: [Boolean, String, Array],
      default: "noone",
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
    no_options: {
      type: Boolean,
      default: false,
    },
    show_image_only: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      new_authors_paths: [],
      new_editing_mode: [],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    authors_paths: {
      handler() {
        this.initAuthorPaths();
      },
      immediate: true,
    },
  },
  computed: {
    radio_mode: {
      set(value) {
        if (value === "everyone") this.new_authors_paths = "everyone";
        else if (value === "noone") this.new_authors_paths = "noone";
        else if (value === "restricted") this.new_authors_paths = [];
      },
      get() {
        if (this.new_authors_paths === "everyone") return "everyone";
        if (Array.isArray(this.new_authors_paths)) return "restricted";
        return "noone";
      },
    },
    allow_save() {
      return (
        JSON.stringify(this.new_authors_paths) !==
        JSON.stringify(this.authors_paths)
      );
    },
    warning_wont_be_able_to_edit() {
      if (this.field === "$admins") {
        const folder = {
          $admins: this.new_authors_paths,
        };
        return this.canLoggedinEditFolder({ folder }) === false;
      }
      return false;
    },
    editing_options() {
      if (this.no_options)
        return [
          {
            key: "noone",
            label: this.$t("noone"),
            instructions: this.$t("noone_instr"),
          },
          {
            key: "restricted",
            label: this.$t("restricted"),
            instructions: this.$t("restricted_instr"),
          },
        ];
      return [
        {
          key: "everyone",
          label: this.$t("everyone"),
          instructions: this.$t("everyone_instr"),
        },
        {
          key: "noone",
          label: this.$t("noone"),
          instructions: this.$t("noone_instr"),
        },
        {
          key: "restricted",
          label: this.$t("restricted"),
          instructions: this.$t("restricted_instr"),
        },
      ];
    },
  },
  methods: {
    initAuthorPaths() {
      if (this.authors_paths === "everyone") {
        this.new_authors_paths = "everyone";
      } else if (
        this.authors_paths === "noone" ||
        (Array.isArray(this.authors_paths) && this.authors_paths.length === 0)
      ) {
        this.new_authors_paths = "noone";
      } else if (Array.isArray(this.authors_paths)) {
        this.new_authors_paths = this.authors_paths.reduce((acc, a) => {
          const author = this.getAuthor(a);
          if (author) acc.push(author.$path);
          return acc;
        }, []);
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

      let _new_authors_paths = undefined;
      if (this.new_authors_paths === "noone") _new_authors_paths = [];
      else _new_authors_paths = this.new_authors_paths;

      this.$emit("save", _new_authors_paths);
      if (!this.path) {
        this.edit_mode = false;
        this.is_saving = false;
        return;
      }

      try {
        const new_meta = {
          [this.field]: _new_authors_paths,
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
          .error(this.$t("couldntbesaved"));
        this.$alertify.closeLogOnClick(true).error(e.response.data);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._listOfAuthors {
  padding-left: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 2) 0;
  border-left: 2px solid var(--c-gris);
}

._authors {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}

._footer {
  margin-top: calc(var(--spacing) / 4);
}
</style>
