<template>
  <div>
    <button
      type="button"
      class="u-buttonLink"
      @click="$emit('close')"
      v-text="$t('close')"
    />
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <div v-else>
      <TitleField
        class="_title"
        :field_name="'title'"
        :content="category.title"
        :path="category.$path"
        tag="h3"
        :can_edit="true"
      />

      <div>
        <div v-for="suggestion in new_list_of_suggestions" :key="suggestion">
          {{ suggestion }}
          <sl-icon-button
            class="_white"
            name="dash-circle"
            @click="removeSuggestion(suggestion)"
          />
        </div>

        <div class="u-spacingBottom">
          <input
            type="text"
            v-model="new_suggestion"
            placeholder="Nouveau mot-clé"
            @keydown.enter.prevent="newKeyword"
          />
          <div class="u-instructions" v-if="new_suggestion.length > 0">
            <small
              >Validez avec la touche entrée. Enregistrez la nouvelle liste avec
              les boutons ci-dessous.</small
            >
          </div>
        </div>

        <SaveCancelButtons
          class="_scb"
          v-if="new_suggestion.length === 0"
          @save="saveNewSuggestion"
          @cancel="cancel"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    path: String,
  },
  components: {},
  data() {
    return {
      category: undefined,
      is_loading: true,

      new_list_of_suggestions: [],
      new_suggestion: "",
    };
  },
  created() {},
  async mounted() {
    this.category = await this.$api.getFolder({
      path: this.path,
    });
    this.new_list_of_suggestions = this.category.list_of_suggestions || [];
    this.is_loading = false;
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    removeSuggestion(suggestion) {
      this.new_list_of_suggestions = this.new_list_of_suggestions.filter(
        (s) => s !== suggestion
      );
    },
    newKeyword() {
      this.new_list_of_suggestions.push(this.new_suggestion);
      this.new_suggestion = "";
    },
    cancel() {
      this.new_list_of_suggestions = this.category.list_of_suggestions;
      this.new_suggestion = "";
    },
    async saveNewSuggestion() {
      await this.$api.updateMeta({
        path: this.path,
        new_meta: {
          list_of_suggestions: this.new_list_of_suggestions,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
