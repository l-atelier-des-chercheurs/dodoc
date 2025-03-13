<template>
  <div>
    <div class="u-spacingBottom _top">
      <div>
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          <b-icon icon="arrow-left-short" />
          {{ $t("back") }}
        </button>
      </div>

      <RemoveMenu :button_text="$t('remove_category')" @remove="removeCat" />
    </div>
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <div v-else>
      <div class="u-spacingBottom">
        <TitleField
          class="_title"
          :label="$t('category_title')"
          :field_name="'title'"
          :content="category.title"
          :path="category.$path"
          tag="h3"
          :required="true"
          :maxlength="20"
          :can_edit="false"
        />
      </div>

      <!-- <div class="">
        <TagsField
          :label="$t('list_of_suggestions')"
          :field_name="'list_of_suggestions'"
          :tag_type="tag_type"
          :content="category.list_of_suggestions"
          :path="path"
          :never_shorten_list="true"
          :can_edit="true"
        />
      </div> -->
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
    this.$api.join({ room: this.path });

    this.new_list_of_suggestions = this.category.list_of_suggestions || [];
    // this.new_list_of_suggestions = this.new_list_of_suggestions.map(
    //   (s) => this.category.title + "/" + s
    // );
    this.is_loading = false;
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    tag_type() {
      return this.path.split("/").at(-1);
    },
    new_keyword_already_exists() {
      return this.new_list_of_suggestions.some(
        (s) => s.toLowerCase() === this.new_suggestion.toLowerCase()
      );
    },
    new_keyword_contains_slash() {
      return this.new_suggestion.includes("/");
    },
  },
  methods: {
    removeSuggestion(suggestion) {
      this.new_list_of_suggestions = this.new_list_of_suggestions.filter(
        (s) => s !== suggestion
      );
    },
    newKeyword() {
      if (
        this.new_suggestion.length === 0 ||
        this.new_keyword_already_exists ||
        this.new_keyword_contains_slash
      )
        return false;
      this.new_list_of_suggestions.push(this.new_suggestion);
      this.new_suggestion = "";
    },
    cancel() {
      this.new_list_of_suggestions = this.category.list_of_suggestions;
      this.new_suggestion = "";
      this.$emit("close");
    },
    async saveNewSuggestion() {
      await this.$api.updateMeta({
        path: this.path,
        new_meta: {
          list_of_suggestions: this.new_list_of_suggestions,
        },
      });
      this.$emit("close");
    },
    async saveNewColor($event) {
      await this.$api.updateMeta({
        path: this.path,
        new_meta: {
          tag_color: $event || "",
        },
      });
    },
    async removeCat() {
      await this.$api.deleteItem({
        path: this.path,
      });
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._top {
  // display: flex;
  // flex-flow: row nowrap;
  // justify-content: space-between;
}

._kwSimulation {
  display: flex;
}
</style>
