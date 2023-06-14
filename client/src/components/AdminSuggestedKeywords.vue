<template>
  <div class="_kwField">
    <DLabel :str="$t('suggested_keywords')" />
    <KeywordsField
      :edit_mode="edit_keywords"
      :keywords.sync="new_suggested_keywords"
    />
    <EditBtn
      key="editbtn"
      v-if="!edit_keywords"
      class="_editBtn"
      @click="edit_keywords = true"
    />
    <SaveCancelButtons
      class="_scb"
      v-if="edit_keywords"
      @save="saveSuggestedKeywords"
      @cancel="cancelKw"
    />
  </div>
</template>
<script>
import KeywordsField from "@/components/KeywordsField.vue";

export default {
  props: {
    settings: Object,
  },
  components: {
    KeywordsField,
  },
  data() {
    return {
      new_suggested_keywords: [],
      edit_keywords: false,
    };
  },
  created() {},
  mounted() {
    this.new_suggested_keywords = this.settings.suggested_keywords || [];
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async saveSuggestedKeywords() {
      await this.$api.updateMeta({
        path: this.settings.$path,
        new_meta: {
          suggested_keywords: this.new_suggested_keywords,
        },
      });
      this.edit_keywords = false;
    },
    cancelKw() {
      this.new_suggested_keywords = this.settings.suggested_keywords || [];
      this.edit_keywords = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._kwField {
  color: white;
  background: var(--c-noir);
  padding: calc(var(--spacing) / 1);
}
</style>
