<template>
  <div class="_keywordsFieldEditor">
    <div class="u-spacingBottom u-keywords" v-if="keywords.length > 0">
      <SingleKeyword
        v-for="keyword in keywords"
        :key="keyword"
        :keyword="keyword"
        :can_remove="true"
        @remove="removeKeyword(keyword)"
      />
    </div>

    <DLabel :str="$t('add_keyword')" />

    <input
      type="text"
      v-model="user_suggestion"
      ref="keywordField"
      required
      :placeholder="$t('keyword_materials_etc')"
      @keydown.esc.prevent="$emit('cancelEdit')"
      @keydown.enter.exact.prevent="newKeyword"
      @keydown.enter.shift.exact.prevent="submitFirstSuggestion"
    />
    <div class="u-instructions">
      <small>
        <template v-if="suggested_keywords.length > 0">
          {{ $t("validate_with_shift_enter") }}
        </template>
        <template v-else-if="user_suggestion.length > 0">{{
          $t("create_new_keyword_enter")
        }}</template>
      </small>
    </div>

    <div class="_catSug">
      <div class="_categories" v-if="!suggestion_from_category">
        <button
          v-for="category in categories_with_keywords"
          type="button"
          class="u-button _category"
          :key="category"
          :style="getCatColor(category)"
          @click="toggleCategory(category)"
        >
          {{ category }}
          ({{ matchingKeywordsWithCategory(category).length }})
        </button>
      </div>
      <div v-else>
        <button
          type="button"
          class="u-button _category"
          :style="getCatColor(suggestion_from_category)"
          @click="toggleCategory(suggestion_from_category)"
        >
          {{ suggestion_from_category }}
          ({{ matchingKeywordsWithCategory(suggestion_from_category).length }})
          &nbsp;
          <b-icon icon="x-circle" />
        </button>
      </div>

      <div class="_suggestions" v-if="suggested_keywords.length > 0">
        <div class="u-keywords">
          <SingleKeyword
            v-for="(suggested_keyword, index) in suggested_keywords"
            :key="suggested_keyword"
            :class="{
              'is--first': index === 0,
            }"
            :keyword="suggested_keyword"
            :can_add="true"
            @add="addKeyword(suggested_keyword)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import SingleKeyword from "@/components/SingleKeyword.vue";

export default {
  props: {
    keywords: Array,
  },
  components: {
    SingleKeyword,
  },
  data() {
    return {
      user_suggestion: "",
      suggestion_from_category: false,
      categories: [],

      path: "categories",
    };
  },
  i18n: {
    messages: {
      fr: {
        add_keyword: "Ajouter un mot-clé",
        validate_with_shift_enter:
          "Validez la première suggestion avec SHIFT+ENTRÉE, ou créez un nouveau mot-clé avec ENTRÉE.",
        create_new_keyword_enter: "Créez un nouveau mot-clé avec ENTRÉE.",
      },
      en: {
        add_keyword: "Add a keyword",
        validate_with_shift_enter:
          "Add first suggestion with SHIFT+ENTER, or create a new keyword with ENTER.",
        create_new_keyword_enter: "Create a new keyword with ENTER.",
      },
    },
  },

  async created() {
    this.categories = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  async mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    all_categories() {
      return this.categories.map((c) => c.title);
    },
    all_keywords() {
      return this.categories.reduce((acc, category) => {
        if (category.title && category.list_of_suggestions) {
          category.list_of_suggestions.map((item) => {
            acc.push(category.title + "/" + item);
          });
        }
        return acc;
      }, []);
    },
    categories_with_keywords() {
      return this.all_categories.filter((c) => {
        return this.matchingKeywordsWithCategory(c).length > 0;
      });
    },
    suggested_keywords() {
      return this.matchingKeywordsWithCategory(this.suggestion_from_category);
    },
  },
  methods: {
    removeKeyword(keyword) {
      this.$emit(
        "update:keywords",
        this.keywords.filter((kw) => kw !== keyword)
      );
    },
    matchingKeywordsWithCategory(filter_by_category) {
      return this.all_keywords.filter((kw) => {
        const category = kw.includes("/") ? kw.split("/").at(0) : false;
        const name = kw.includes("/") ? kw.split("/").at(1) : kw;

        if (this.keywords.includes(kw)) return false;

        if (filter_by_category && filter_by_category !== category) return false;

        if (!filter_by_category && this.user_suggestion.length === 0)
          return false;

        return this.twoStringsMatch(name, this.user_suggestion);
      });
    },
    toggleCategory(category) {
      if (this.suggestion_from_category === category)
        this.suggestion_from_category = false;
      else this.suggestion_from_category = category;
    },
    getCatColor(category) {
      const c = window.app_infos.custom_suggested_categories.find(
        (c) => c.title === category
      );
      if (!c?.tag_color) return;
      return `--cat-color: ${c.tag_color}`;
    },
    newKeyword() {
      if (this.user_suggestion.length > 0)
        this.addKeyword(this.user_suggestion);
    },
    submitFirstSuggestion() {
      if (this.suggested_keywords.length === 0) return false;
      const first_suggestion = this.suggested_keywords.at(0);
      this.addKeyword(first_suggestion);
    },
    keywordKey(keyword) {
      return keyword.category + "/" + keyword.name;
    },
    addKeyword(new_keyword) {
      let kw = this.keywords.slice();
      kw.push(new_keyword);
      kw.sort((a, b) => {
        return b;
      });
      this.$emit("update:keywords", kw);
      this.user_suggestion = "";

      this.$refs.keywordField.focus();
    },
  },
};
</script>
<style lang="scss" scoped>
._keywordsFieldEditor {
  margin-top: calc(var(--spacing) / 4);
}
._suggestions {
  margin-top: calc(var(--spacing) / 2);
  padding-top: calc(var(--spacing) / 2);
  // border-top: 2px solid var(--c-noir);

  ._keyword {
    cursor: pointer;
  }
}

._catSug {
  // border-left: 2px solid black;
  padding: calc(var(--spacing) / 2) 0;
  // background: var(--c-noir);
}

._categories {
  display: flex;
  flex-flow: row wrap;
  padding: 0;
  gap: calc(var(--spacing) / 4);
}

._category {
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: 4px;
  font-weight: 600;
  background: var(--cat-color);
}
</style>
