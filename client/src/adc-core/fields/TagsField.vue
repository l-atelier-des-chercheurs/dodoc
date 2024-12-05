<template>
  <div class="_tagsField">
    <DLabel v-if="label" :str="label" />
    <div class="_tl">
      <TagsList
        :tags="content"
        :tag_type="tag_type"
        :mode="'inactive'"
        :shorten_if_too_long="shorten_if_too_long"
      />
      <EditBtn v-if="can_edit" @click="enableEditMode" />
    </div>

    <BaseModal2 v-if="edit_mode" @close="cancel" :title="label">
      <div class="u-spacingBottom">
        <TagsList
          :tags="new_tags"
          :tag_type="tag_type"
          :mode="'remove'"
          :shorten_if_too_long="false"
          @tagClick="removeTag($event)"
        />
      </div>

      <fieldset class="_newTagPane" v-if="create_new_tag">
        <legend class="u-label">{{ $t("add_item") }}</legend>

        <div class="u-spacingBottom">
          <TagsSuggestion
            :tag_type="tag_type"
            :local_suggestions="local_suggestions"
            :new_tag_name="new_tag_name"
            :tags_to_exclude="new_tags"
            @newTag="newTag($event)"
          />
        </div>

        <div class="_sameRowBtnInput">
          <TextInput
            class="_input"
            :content.sync="new_tag_name"
            :maxlength="maxlength"
            :required="true"
            @toggleValidity="($event) => (allow_save_newkeyword = $event)"
            @onEnter="onEnter"
            @onShiftEnter="onShiftEnter"
          />
          <div>
            <button
              v-if="allow_save_newkeyword && !new_tag_name_already_exists"
              type="button"
              class="u-button u-button_bleuvert _submitBtn"
              @click="onEnter"
            >
              <b-icon
                icon="check"
                style="font-size: 1.5em"
                :aria-label="$t('submit')"
              />
            </button>
          </div>
        </div>

        <div v-if="new_tag_name_already_exists" class="fieldCaption u-colorRed">
          {{ $t("already_added") }}
        </div>
      </fieldset>
      <SaveCancelButtons
        slot="footer"
        class="_scb"
        :is_saving="is_saving"
        @save="updateTags"
        @cancel="cancel"
      />
    </BaseModal2>
  </div>
</template>
<script>
export default {
  props: {
    field_name: String,
    tag_type: String,
    local_suggestions: Array,
    label: String,
    content: {
      type: Array,
      default: () => [],
    },
    path: String,
    maxlength: {
      type: [Boolean, Number],
      default: 40,
    },
    never_shorten_list: Boolean,
    can_edit: Boolean,
  },
  components: {
    TagsSuggestion: () => import("@/adc-core/fields/TagsSuggestion.vue"),
  },
  data() {
    return {
      edit_mode: false,
      is_saving: false,

      new_tags: this.content.slice(),
      new_tag_name: "",
      create_new_tag: true,

      allow_save_newkeyword: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    content() {
      this.new_tags = this.content.slice();
    },
  },
  computed: {
    new_tag_name_already_exists() {
      return this.new_tags.includes(this.new_tag_name);
    },
    shorten_if_too_long() {
      if (this.never_shorten_list) return false;
      return this.edit_mode ? false : true;
    },
  },
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    newTag(tag = this.new_tag_name) {
      this.new_tags.push(tag);
      this.new_tag_name = "";
      // this.create_new_tag = false;
    },
    cancelNewTag() {
      this.new_tag_name = "";
      // this.create_new_tag = false;
    },
    removeTag(tag) {
      this.new_tags = this.new_tags.filter((t) => t !== tag);
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.new_tags = this.content.slice();

      // todo interrupt updateMeta
    },
    onEnter() {
      if (this.allow_save_newkeyword && !this.new_tag_name_already_exists)
        this.newTag();
    },
    onShiftEnter() {
      this.updateTags();
    },
    async updateTags() {
      this.is_saving = true;

      if (this.new_tag_name.length > 0) this.newTag();

      this.$emit("save", this.new_tags);
      if (!this.path) {
        this.edit_mode = false;
        this.is_saving = false;
        return;
      }

      try {
        const new_meta = {
          [this.field_name]: this.new_tags,
        };
        await this.$api.updateMeta({
          path: this.path,
          new_meta,
        });

        this.edit_mode = false;
        this.is_saving = false;
      } catch (e) {
        this.is_saving = false;
        this.edit_mode = false;

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
._tagsField {
  width: 100%;
}

._tl {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}

._footer {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;

  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  padding: calc(var(--spacing) / 4) 0;
  gap: calc(var(--spacing) / 4);
}

._addNewTagForm {
  padding: calc(var(--spacing) / 4) 0;
}

._newTagPane {
  width: 100%;
  margin-top: calc(var(--spacing) / 4);
}

._scb {
  width: 100%;
  text-align: center;
  justify-content: center;
}

._sameRowBtnInput {
  display: flex;
  justify-content: space-between;

  > ._input {
    width: 100%;
  }
  ._submitBtn {
    padding: calc(var(--spacing) / 8);
    height: 2rem;
    width: 2rem;
  }
}
</style>
