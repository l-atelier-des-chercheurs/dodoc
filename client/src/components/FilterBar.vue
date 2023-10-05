<template>
  <div class="_filterBar">
    <transition name="slidedown" mode="out-in">
      <button
        type="button"
        v-if="can_be_reset"
        class="u-button u-button_black _resetFilters"
        @click="resetFilters"
      >
        {{ $t("reset") }}
      </button>
    </transition>

    <div class="">
      <input
        type="text"
        :placeholder="$t('search')"
        :value="search_str"
        @input="$emit('update:search_str', $event.target.value)"
      />
      <div class="u-instructions">
        {{ $t("search_fields") }}
      </div>
    </div>

    <div class="_sortSelect">
      <DLabel :str="$t('sort_by')" />
      <select
        :value="sort_order"
        @change="$emit('update:sort_order', $event.target.value)"
      >
        <option value="date_uploaded" v-text="$t('date_uploaded')" />
        <option value="date_created" v-text="$t('date_created')" />
      </select>
    </div>

    <div>
      <DLabel :str="$t('group_by_date')" />
      <div class="_groupBy">
        <div v-for="group_option in group_options" :key="group_option.key">
          <input
            type="radio"
            :id="group_option.key"
            :value="group_option.key"
            :checked="group_mode === group_option.key"
            @change="$emit('update:group_mode', $event.target.value)"
          />
          <label
            :for="group_option.key"
            v-text="group_option.label"
            :class="{
              'is--selected': group_option.key === group_mode,
            }"
          />
        </div>
      </div>
    </div>

    <div class="_myContent">
      <DLabel :str="$t('filter_by_author')" />
      <select
        :value="author_path_filter"
        @change="$emit('update:author_path_filter', $event.target.value)"
      >
        <option value="" v-text="$t('none')" />
        <option
          v-for="author in all_authors"
          :key="author.$path"
          :value="author.$path"
          v-text="author.name"
        />
      </select>
    </div>

    <div class="_tag">
      <DLabel :str="$t('filter_by_keyword')" />

      <div class="u-keywords _usedKw" v-if="keywords_filter.length > 0">
        <SingleKeyword
          v-for="keyword in keywords_filter"
          :key="keyword"
          :keyword="keyword"
          :can_remove="true"
          @remove="filterByKeyword(keyword)"
        />
      </div>

      <div class="u-keywords">
        <SingleKeyword
          v-for="keyword in collapsable_keywords"
          :key="keyword.title"
          :keyword="keyword.title"
          :count="keyword.count"
          :can_add="true"
          @add="filterByKeyword(keyword.title)"
        />

        <button
          type="button"
          v-if="available_keywords_except_active.length > 10"
          class="u-buttonLink"
          @click="show_all_keywords = !show_all_keywords"
          :class="{
            'is--active': show_all_keywords,
          }"
        >
          {{ $t("show_all_keywords") }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import SingleKeyword from "@/components/SingleKeyword.vue";

export default {
  props: {
    group_mode: String,
    sort_order: String,
    search_str: String,
    author_path_filter: String,
    keywords_filter: Array,
    available_keywords: Array,
  },
  components: {
    SingleKeyword,
  },
  data() {
    return {
      all_authors: [],

      show_all_keywords: false,

      group_options: [
        {
          key: "day",
          label: this.$t("day"),
        },
        {
          key: "month",
          label: this.$t("month"),
        },
        {
          key: "year",
          label: this.$t("year"),
        },
      ],
    };
  },
  async created() {
    this.all_authors = await this.$api.getFolders({
      path: `authors`,
    });
  },
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    available_keywords_except_active() {
      const _kw = this.available_keywords.filter(
        (kw) => !this.keywords_filter.includes(kw.title)
      );
      return _kw;
    },
    collapsable_keywords() {
      if (!this.show_all_keywords)
        return this.available_keywords_except_active.slice(0, 10);
      return this.available_keywords_except_active;
    },
    can_be_reset() {
      return (
        this.group_mode !== "day" ||
        this.sort_order !== "date_uploaded" ||
        this.search_str !== "" ||
        this.author_path_filter !== "" ||
        this.keywords_filter.length > 0
      );
    },
  },
  methods: {
    resetFilters() {
      this.$emit("update:group_mode", "day");
      this.$emit("update:sort_order", "date_uploaded");
      this.$emit("update:search_str", "");
      this.$emit("update:author_path_filter", "");
      this.$emit("update:keywords_filter", []);
    },
    filterByKeyword(keyword) {
      let _new_kw = this.keywords_filter.slice();
      if (this.keywords_filter.includes(keyword)) {
        _new_kw = _new_kw.filter((kw) => kw !== keyword);
      } else {
        _new_kw.push(keyword);
      }
      this.$emit("update:keywords_filter", _new_kw);
    },
  },
};
</script>
<style lang="scss" scoped>
._filterBar {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) * 1);
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 1);

  select,
  input {
    background-color: white;
  }
}

._groupBy {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: calc(var(--spacing) / 1);

  input {
    visibility: hidden;
    width: 1px;
    height: 1px;
    display: none;
  }

  label {
    cursor: pointer;
    &.is--selected {
      font-weight: 600;
    }
  }
}

._sortSelect {
  // width: 33ch;
  width: 100%;
}

._usedKw {
  padding-bottom: calc(var(--spacing) / 2);
  border-bottom: 2px solid white;
  margin-bottom: calc(var(--spacing) / 2);
}

._resetFilters {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: calc(var(--spacing) / 4);
  border-radius: 0;
}
</style>
