<template>
  <div>
    <div class="_keywords">
      <div
        class="_keyword"
        v-for="keyword in keywords"
        :key="keyword"
        @click="edit_mode ? removeKeyword(keyword) : ''"
      >
        {{ keyword }}&nbsp;
        <sl-icon-button class="_white" name="dash-circle" v-if="edit_mode" />
      </div>
    </div>

    <template v-if="edit_mode">
      <input
        type="text"
        class="is--dark"
        v-model="suggestion"
        required
        placeholder="Mot-clé, matériaux, lieux, etc."
        @keydown.esc.prevent="$emit('cancelEdit')"
      />

      <span class="u-instructions" v-if="suggestion.length === 0">
        Corrigez ou complétez le titre et les mots-clés pour partager ce
        document.
      </span>

      <div class="_suggestions" v-else>
        <div class="_keywords">
          <div
            class="_keyword"
            v-for="suggested_keyword in suggested_keywords"
            :key="suggested_keyword"
            @click="addKeyword(suggested_keyword)"
          >
            {{ suggested_keyword }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import categories from "@/categories.json";

export default {
  props: {
    keywords: Array,
    edit_mode: Boolean,
  },
  components: {},
  data() {
    return {
      suggestion: "",
      categories,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    list_of_suggestions() {
      return Object.entries(categories).reduce((acc, [domain, cat]) => {
        acc = acc.concat(cat.map((c) => domain + "/" + c));
        return acc;
      }, []);
    },
    suggested_keywords() {
      return this.list_of_suggestions.filter((s) =>
        s.includes(this.suggestion.toLowerCase())
      );
      // return categories;
    },
  },
  methods: {
    removeKeyword(_kw) {
      this.$emit(
        "update:keywords",
        this.keywords.filter((kw) => kw !== _kw)
      );
    },
    addKeyword(_kw) {
      let kw = this.keywords.slice();
      kw.push(_kw);
      this.$emit("update:keywords", kw);

      this.suggestion = "";
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
  margin-bottom: calc(var(--spacing) / 2);
  font-size: var(--input-font-size-small);
}
._keyword {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: 4px;

  sl-icon-button::part(base) {
    padding: 0;
  }
}
._suggestions {
  margin-top: calc(var(--spacing) / 2);

  ._keyword {
    cursor: pointer;
  }
}
</style>
