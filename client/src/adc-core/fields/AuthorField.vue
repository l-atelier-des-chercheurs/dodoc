<template>
  <div>
    <DLabel
      v-if="label"
      :str="label"
      :tag="tag"
      :instructions="can_edit ? instructions : ''"
    />

    <div class="_authors">
      <div v-if="authors_paths === 'everyone'">
        {{ $t("everyone") }}
      </div>
      <div
        v-else-if="Array.isArray(authors_paths) && authors_paths.length === 0"
      >
        {{ $t("noone") }}
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
        <div v-if="instructions" class="u-instructions" :key="'noprojects'">
          {{ instructions }}
        </div>

        {{ new_authors_paths }}
        {{ Array.isArray(new_authors_paths) }}

        <br />

        <div class="u-radio">
          <label
            :for="'radioi-lmode-' + lmode.key"
            v-for="lmode in [
              {
                key: 'everyone',
                label: $t('everyone'),
                instructions: $t('everyone_instr'),
              },
              {
                key: 'noone',
                label: $t('noone'),
                instructions: $t('noone_instr'),
              },
              {
                key: 'restricted',
                label: $t('restricted'),
                instructions: $t('restricted_instr'),
              },
            ]"
            :key="lmode.key"
          >
            <input
              type="radio"
              :name="lmode.key"
              :id="'radioi-lmode-' + lmode.key"
              :value="lmode.key"
              :checked="
                (lmode.key === 'everyone' &&
                  new_authors_paths === 'everyone') ||
                (lmode.key === 'noone' && new_authors_paths === 'noone') ||
                (lmode.key === 'restricted' &&
                  Array.isArray(new_authors_paths) &&
                  new_authors_paths.length > 0)
              "
              :disabled="!edit_mode"
              @input="updateMode"
            />

            <span>
              {{ lmode.label }}<br />
              <small class="u-instructions" v-html="lmode.instructions" />
            </span>
          </label>
        </div>

        <div v-if="Array.isArray(new_authors_paths)" class="_listOfAuthors">
          <template v-if="new_authors_paths.length > 0">
            <DLabel class="_label" :str="$t('list_of_accounts')" />
            <transition-group
              tag="div"
              class="_authors"
              name="projectsList"
              appear
            >
              <AuthorTag
                v-for="author_path in new_authors_paths"
                :path="author_path"
                :key="author_path"
                :edit_mode="edit_mode"
                :links_to_author_page="false"
                @remove="removeAuthor(author_path)"
              />
            </transition-group>
            <br />
          </template>

          <DLabel class="_label" :str="$t('add_accounts')" />
          <AuthorPicker
            :current_authors="new_authors_paths"
            @addAuthor="addAuthor"
          />
        </div>

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
    updateMode(event) {
      if (event.target.value === "everyone")
        this.new_authors_paths = "everyone";
      else if (event.target.value === "noone") this.new_authors_paths = "noone";
      else if (event.target.value === "restricted") this.new_authors_paths = [];
    },
    initAuthorPaths() {
      if (this.authors_paths === "everyone") {
        this.new_authors_paths = "everyone";
      } else if (
        this.authors_paths === "noone" ||
        (Array.isArray(this.authors_paths) && this.authors_paths.length === 0)
      ) {
        this.new_authors_paths = "noone";
      } else if (Array.isArray(this.authors_paths)) {
        this.new_authors_paths = JSON.parse(JSON.stringify(this.authors_paths));
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
          .error(this.$t("notifications.couldntbesaved"));
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
  gap: calc(var(--spacing) / 4);
}

._footer {
  margin-top: calc(var(--spacing) / 4);
}
</style>
