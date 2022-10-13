<template>
  <div class="_tagsField">
    <div class="_topLabel" v-if="label">
      <label for="" class="u-label">{{ label }}</label>
    </div>

    <span class="_tagsList" v-if="new_tags.length > 0">
      <sl-tag
        v-for="tag in new_tags"
        :key="tag"
        variant="success"
        size="small"
        :removable="edit_mode"
        @click="edit_mode ? removeTag(tag) : ''"
      >
        {{ tag }}
      </sl-tag>
    </span>

    <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />

    <template v-if="can_edit">
      <sl-button
        v-if="edit_mode && create_new_tag === false"
        variant="default"
        class=""
        size="small"
        pill
        @click="create_new_tag = true"
      >
        <sl-icon name="plus-square" :label="$t('add')" />
        <!-- {{ $t("add") }} -->
      </sl-button>
    </template>

    <div class="_footer" v-if="edit_mode">
      <template v-if="create_new_tag">
        <TextInput
          :content.sync="new_tag_name"
          :maxlength="maxlength"
          :required="true"
          @toggleValidity="($event) => (allow_save_newkeyword = $event)"
          @onEnter="onEnter"
        />
        <div v-if="new_tag_name_already_exists" class="fieldCaption u-colorRed">
          {{ $t("already_added") }}
        </div>
        <SaveCancelButtons
          class="_scb"
          :is_saving="is_saving"
          :allow_save="allow_save_newkeyword && !new_tag_name_already_exists"
          :save_text="'create'"
          @save="newTag"
          @cancel="cancelNewTag"
        />
      </template>

      <div v-else>
        <SaveCancelButtons
          class="_scb"
          :is_saving="is_saving"
          @save="updateTags"
          @cancel="cancel"
        />
      </div>
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
      default: 30,
    },
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,

      new_tags: this.content,
      new_tag_name: "",
      create_new_tag: false,

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
    newTag() {
      this.new_tags.push(this.new_tag_name);
      this.new_tag_name = "";
      this.create_new_tag = false;
    },
    cancelNewTag() {
      this.new_tag_name = "";
      this.create_new_tag = false;
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

._topLabel {
  display: block;
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
</style>
