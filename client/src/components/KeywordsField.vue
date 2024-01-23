<template>
  <div class="_keywordsField">
    <DLabel v-if="label" class="_label" :str="label" />
    <div class="u-keywords" v-if="new_keywords.length > 0">
      <SingleKeyword
        v-for="keyword in new_keywords"
        :key="keyword"
        :keyword="keyword"
        :can_remove="edit_mode"
        @remove="removeKeyword(keyword)"
      />
    </div>
    <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />

    <template v-if="edit_mode">
      <KeywordsFieldEditor
        :keywords="new_keywords"
        @update:keywords="new_keywords = $event"
      />
    </template>

    <template v-if="can_edit && path && field_name">
      <div class="_footer" v-if="edit_mode">
        <SaveCancelButtons
          class="_scb"
          @save="updateKeywords"
          @cancel="cancel"
        />
      </div>
    </template>
  </div>
</template>
<script>
import KeywordsFieldEditor from "@/components/KeywordsFieldEditor.vue";
import SingleKeyword from "@/components/SingleKeyword.vue";

export default {
  props: {
    field_name: String,
    label: String,
    path: String,
    keywords: Array,
    can_edit: Boolean,
  },
  components: {
    KeywordsFieldEditor,
    SingleKeyword,
  },
  data() {
    return {
      new_keywords: this.keywords || [],
      edit_mode: this.can_edit && !this.path && !this.field_name,
      is_saving: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    new_keywords() {
      this.$emit("update:keywords", this.new_keywords);
    },
  },
  computed: {},
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    async updateKeywords() {
      this.is_saving = true;
      await new Promise((r) => setTimeout(r, 50));

      try {
        const new_meta = {
          [this.field_name]: this.new_keywords,
        };

        await this.$api.updateMeta({
          path: this.path,
          new_meta,
        });
        this.edit_mode = false;
        this.is_saving = false;
      } catch (err) {
        this.is_saving = false;
      }
    },
    cancel() {
      this.new_keywords = this.keywords || [];
      this.edit_mode = false;
    },

    removeKeyword(_kw) {
      this.new_keywords = this.new_keywords.filter((kw) => kw !== _kw);
    },
  },
};
</script>
<style lang="scss" scoped></style>
