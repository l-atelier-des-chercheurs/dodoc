<template>
  <div class="_tagsField">
    <DLabel v-if="label" :str="label" />

    <TagsList
      class="u-spacingBottom"
      :tags="new_tags"
      :tag_type="field_name"
      :clickable="false"
      :removable="edit_mode"
      @removeClick="removeTag($event)"
    />

    <template v-if="can_edit && !edit_mode">
      <EditBtn @click="enableEditMode" />
    </template>

    <SaveCancelButtons
      v-if="can_edit && edit_mode"
      class="_scb"
      :is_saving="is_saving"
      @save="updateTags"
      @cancel="cancel"
    />

    <div class="_footer" v-if="edit_mode">
      <fieldset class="_newTagPane" v-if="create_new_tag">
        <legend class="u-label">{{ $t("add_item") }}</legend>

        <div class="_sameRowBtnInput">
          <TextInput
            class="_input"
            :content.sync="new_tag_name"
            :maxlength="maxlength"
            :required="true"
            :size="'small'"
            @toggleValidity="($event) => (allow_save_newkeyword = $event)"
            @onEnter="onEnter"
          />
          <div class="">
            <button
              type="button"
              :disabled="
                !(allow_save_newkeyword && !new_tag_name_already_exists)
              "
              class="u-button u-button_bleuvert _submitBtn"
              @click="$emit('save', local_value)"
            >
              <sl-icon
                style="font-size: 1.5em"
                name="check"
                :label="$t('submit')"
              />
            </button>
          </div>
        </div>

        <div v-if="new_tag_name_already_exists" class="fieldCaption u-colorRed">
          {{ $t("already_added") }}
        </div>
        <!-- <SaveCancelButtons
          class="_scb u-spacingBottom"
          :is_saving="is_saving"
          :allow_save="allow_save_newkeyword && !new_tag_name_already_exists"
          :save_text="$t('create')"
          @save="newTag"
          @cancel="cancelNewTag"
        /> -->

        <TagsSuggestion
          :tag_type="field_name"
          :new_tag_name="new_tag_name"
          :tags_to_exclude="new_tags"
          @newTag="newTag($event)"
        />
      </fieldset>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    field_name: String,
    label: {
      type: String,
      default: "",
    },
    content: {
      type: Array,
      default: () => [],
    },
    path: String,
    maxlength: {
      type: [Boolean, Number],
      default: 40,
    },
    can_edit: Boolean,
  },
  components: {
    TagsSuggestion: () => import("@/adc-core/fields/TagsSuggestion.vue"),
  },
  data() {
    return {
      edit_mode: false,
      is_saving: false,

      new_tags: this.content,
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
      this.new_tags = this.content;
    },
  },
  computed: {
    new_tag_name_already_exists() {
      return this.new_tags.includes(this.new_tag_name);
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
      this.new_tags = this.content;

      // todo interrupt updateMeta
    },
    onEnter() {
      this.newTag();
    },
    async updateTags() {
      this.is_saving = true;

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
          .error(this.$t("notifications.couldntbesaved"));
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
._tagsList {
  display: inline-flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
  margin-right: calc(var(--spacing) / 4);
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
}

._scb {
  width: 100%;
  text-align: center;
  justify-content: center;
}

._submitBtn {
  padding: calc(var(--spacing) / 8);
}

._sameRowBtnInput {
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) / 4);

  > ._input {
    width: 100%;
  }
}
</style>
