<template>
  <div>
    <div class="_keywords" v-if="keywords.length > 0">
      <SingleKeyword
        v-for="keyword in keywords"
        :key="keyword"
        :keyword="keyword"
        @remove="edit_mode ? removeKeyword(keyword) : undefined"
      />
    </div>

    <template v-if="edit_mode">
      <input
        type="text"
        class="is--dark"
        v-model="user_suggestion"
        ref="keywordField"
        required
        placeholder="Mot-clé, matériaux, lieux, etc."
        @keydown.esc.prevent="$emit('cancelEdit')"
        @keydown.enter.prevent="submitFirstSuggestion"
      />

      <div class="_categories">
        <button
          type="button"
          class="u-button _category"
          :class="{
            'is--active': suggestion_from_category === category,
          }"
          v-for="category in all_categories"
          :key="category"
          :data-category="category"
          @click="toggleCategory(category)"
        >
          {{ category }}
        </button>
      </div>
      <div class="_suggestions" v-if="suggested_keywords.length > 0">
        <div class="_keywords">
          <SingleKeyword
            v-for="(suggested_keyword, index) in suggested_keywords"
            :key="suggested_keyword"
            :class="{
              'is--first': index === 0,
            }"
            :keyword="suggested_keyword"
            @add="addKeyword(suggested_keyword)"
          />
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import categories from "@/categories.json";
import SingleKeyword from "@/components/SingleKeyword.vue";

export default {
  props: {
    keywords: Array,
    edit_mode: Boolean,
  },
  components: {
    SingleKeyword,
  },
  data() {
    return {
      user_suggestion: "",
      categories,
      suggestion_from_category: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    all_categories() {
      return Object.keys(categories);
    },
    list_of_suggestions() {
      return Object.entries(categories).reduce((acc, [category, items]) => {
        items.map((item) => {
          acc.push(category + "/" + item);
        });
        return acc;
      }, []);
    },
    suggested_keywords() {
      return this.list_of_suggestions.filter((s) => {
        const category = s.split("/").at(0);
        const name = s.split("/").at(1);

        if (this.keywords.includes(s)) return false;

        if (
          this.suggestion_from_category &&
          this.suggestion_from_category !== category
        )
          return false;

        if (!this.suggestion_from_category && this.user_suggestion.length === 0)
          return false;

        return name
          .toLowerCase()
          .startsWith(this.user_suggestion.toLowerCase());
      });
      // return categories;
    },
  },
  methods: {
    toggleCategory(category) {
      if (this.suggestion_from_category === category)
        this.suggestion_from_category = false;
      else this.suggestion_from_category = category;
    },
    removeKeyword(_kw) {
      this.$emit(
        "update:keywords",
        this.keywords.filter((kw) => kw !== _kw)
      );
    },
    submitFirstSuggestion() {
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
._white::part(base) {
  color: white;
}

._keywords {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  // margin-bottom: calc(var(--spacing) / 2);
  font-size: var(--input-font-size-small);

  + input {
    margin-top: calc(var(--spacing) / 2);
  }

  > * {
    &.is--first {
      border: 2px solid white;
    }
  }
}
._suggestions {
  padding-top: calc(var(--spacing) / 2);
  border-top: 2px solid var(--c-noir);

  ._keyword {
    cursor: pointer;
  }
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
    background: white;
  }
}
</style>
