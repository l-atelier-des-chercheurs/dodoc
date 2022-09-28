<template>
  <div class="_tagsField">
    <div class="_topLabel" v-if="label">
      <label for="" class="u-label">{{ label }}</label>
    </div>

    <span class="_tagsList">
      <sl-tag
        v-for="tag in new_tags"
        :key="tag"
        size="small"
        :removable="edit_mode"
        @click="removeTag(tag)"
      >
        {{ tag }}
      </sl-tag>
    </span>

    <template v-if="can_be_edited">
      <template v-if="!edit_mode">
        <sl-button
          variant="neutral"
          class="_editBtn"
          size="small"
          circle
          @click="enableEditMode"
        >
          <sl-icon name="pencil-fill" :label="$t('edit')" />
        </sl-button>
      </template>

      <template v-else>
        <!-- // options : append tag, remove existing -->
        <form class="" @submit.prevent="newTag">
          <input
            type="text"
            class="u-input-small"
            required
            v-model="new_tag_name"
          />
          <input type="submit" :value="$t('submit')" />
        </form>

        <div class="_footer">
          <SaveCancelButtons
            class="_scb"
            :is_saving="is_saving"
            :allow_save="allow_save"
            @save="updateText"
            @cancel="cancel"
          />
        </div>
      </template>
    </template>
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
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,

      new_tags: this.content,
      new_tag_name: "",

      current_character_count: undefined,
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
    can_be_edited() {
      return this.$api.is_logged_in;
    },
    allow_save() {
      if (this.maxlength && this.current_character_count > this.maxlength)
        return false;
      if (this.required && this.current_character_count === 0) return false;
      return true;
    },
  },
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    newTag() {
      this.new_tags.push(this.new_tag_name);
      this.new_tag_name = "";
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
    async updateText() {
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
}

._topLabel {
  display: block;
}

._editBtn {
  margin-left: calc(var(--spacing) / 2);
}

._footer {
  display: flex;
  justify-content: space-between;
  flex-flow: row wrap;
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  padding: calc(var(--spacing) / 4) 0;
  gap: calc(var(--spacing) / 4);
}
</style>
