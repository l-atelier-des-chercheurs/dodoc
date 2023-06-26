<template>
  <div class="_keywordsFieldEditor">
    <input
      type="text"
      class="is--dark"
      v-model="user_suggestion"
      ref="keywordField"
      required
      placeholder="Mot-clé, matériaux, lieux, etc."
      @keydown.esc.prevent="$emit('cancelEdit')"
      @keydown.enter.exact.prevent="newKeyword"
      @keydown.enter.shift.exact.prevent="submitFirstSuggestion"
    />
    <div class="u-instructions">
      <small>
        <template v-if="suggested_keywords.length > 0">
          Validez la première suggestion avec SHIFT+ENTRÉE, ou créez un nouveau
          mot-clé avec ENTRÉE.
        </template>
        <template v-else-if="user_suggestion.length > 0"
          >Créez un nouveau mot-clé avec ENTRÉE.</template
        >
      </small>
    </div>

    <div class="_catSug">
      <div class="_categories">
        <button
          type="button"
          class="u-button _category"
          :class="{
            'is--active': suggestion_from_category === category,
          }"
          v-for="category in categories_with_keywords"
          :key="category"
          :data-category="category"
          @click="toggleCategory(category)"
        >
          {{ category }}
          ({{ matchingKeywordsWithCategory(category).length }})
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
    matchingKeywordsWithCategory(filter_by_category) {
      return this.all_keywords.filter((kw) => {
        const category = kw.includes("/") ? kw.split("/").at(0) : false;
        const name = kw.includes("/") ? kw.split("/").at(1) : kw;

        if (this.keywords.includes(kw)) return false;

        if (filter_by_category && filter_by_category !== category) return false;

        if (!filter_by_category && this.user_suggestion.length === 0)
          return false;

        return name
          .toLowerCase()
          .startsWith(this.user_suggestion.toLowerCase());
      });
    },
    toggleCategory(category) {
      if (this.suggestion_from_category === category)
        this.suggestion_from_category = false;
      else this.suggestion_from_category = category;
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
  padding-top: calc(var(--spacing) / 2);
  border-top: 2px solid var(--c-noir);

  ._keyword {
    cursor: pointer;
  }
}

._catSug {
  border-left: 2px solid black;
  padding-left: calc(var(--spacing) / 2);
  background: var(--c-noir);
}

._categories {
  display: flex;
  flex-flow: row wrap;
  padding: calc(var(--spacing) / 2) 0;
  gap: calc(var(--spacing) / 2);
}

._category {
  background-color: rgba(255, 255, 255, 0.2);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: 4px;
  color: white;
  font-weight: 600;

  &[data-category="techniques"] {
    color: var(--color-vert);
  }
  &[data-category="gisement"] {
    color: var(--color-rouge);
  }
  &[data-category="lieu"] {
    color: var(--color-bleu);
  }
  &[data-category="domaine"] {
    color: var(--color-jaune);
  }

  &.is--active {
    background: black;
  }
}
</style>
