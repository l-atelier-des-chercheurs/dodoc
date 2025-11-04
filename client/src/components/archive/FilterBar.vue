<template>
  <div class="_filterBar">
    <slot name="top" />

    <div>
      <div class="_stackPreviewWidthSlider">
        <label class="_sliderLabel">{{ $t("stack_preview_width") }}</label>
        <input
          type="range"
          class="_inputRange"
          :value="stack_preview_width"
          min="50"
          max="250"
          step="5"
          @input="$emit('update:stack_preview_width', +$event.target.value)"
        />
      </div>
      <div class="u-sameRow">
        <div>
          <button
            type="button"
            class="u-button u-button_icon u-button_transparent"
            :class="{
              'is--active': fav_filter === true,
            }"
            @click="$emit('update:fav_filter', !fav_filter)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.38174 1.75501C7.59507 1.19234 8.40241 1.19234 8.61641 1.75501L9.99641 5.57767C10.0931 5.83101 10.3391 5.99967 10.6137 5.99967H14.0051C14.6317 5.99967 14.9051 6.77967 14.4124 7.16167L11.9991 9.33301C11.891 9.41611 11.812 9.53132 11.7734 9.66211C11.7348 9.7929 11.7387 9.93255 11.7844 10.061L12.6657 13.7963C12.8804 14.3963 12.1857 14.9117 11.6604 14.5423L8.38241 12.4623C8.27015 12.3834 8.13628 12.3411 7.99907 12.3411C7.86187 12.3411 7.728 12.3834 7.61574 12.4623L4.33774 14.5423C3.81307 14.9117 3.11774 14.3957 3.33241 13.7963L4.21374 10.061C4.25946 9.93255 4.26331 9.7929 4.22475 9.66211C4.18618 9.53132 4.10718 9.41611 3.99907 9.33301L1.58574 7.16167C1.09241 6.77967 1.36707 5.99967 1.99241 5.99967H5.38374C5.51727 6.00012 5.64778 5.96001 5.75802 5.88466C5.86825 5.8093 5.95301 5.70225 6.00107 5.57767L7.38107 1.75501H7.38174Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            <!-- <b-icon v-if="!is_favorite" icon="star" :aria-label="$t('add')" />
          <b-icon v-else icon="star-fill" :aria-label="$t('remove')" /> -->
          </button>
        </div>

        <button
          class="u-button u-button_icon"
          type="button"
          :class="{
            'is--active': view_mode === 'list',
          }"
          @click="$emit('update:view_mode', 'list')"
        >
          <b-icon icon="grid3x3" />
        </button>
        <!-- <button
          class="u-button u-button_icon"
          type="button"
          :class="{
            'is--active': view_mode === 'timeline',
          }"
          @click="$emit('update:view_mode', 'timeline')"
        >
          <b-icon icon="calendar-week" />
        </button> -->
        <button
          class="u-button u-button_icon"
          type="button"
          :class="{
            'is--active': view_mode === 'map',
          }"
          @click="$emit('update:view_mode', 'map')"
        >
          <b-icon icon="map-fill" />
        </button>
      </div>
    </div>

    <div class="_searchField">
      <SearchInput2
        :value="search_str"
        @input="$emit('update:search_str', $event)"
        :search_placeholder="$t('search_fields')"
      />
    </div>

    <transition name="pagechange">
      <div class="_filterPane">
        <!-- <button
          type="button"
          class="u-buttonLink _closeBtn"
          :class="{
            'is--white': can_be_reset,
          }"
          @click="$emit('close')"
        >
          <b-icon icon="x-lg" />
        </button> -->
        <div class="_filterPane--row">
          <select
            class="_selectField"
            :value="sort_order"
            @change="$emit('update:sort_order', $event.target.value)"
          >
            <option value="date_modified" v-text="$t('date_modified')" />
            <option value="date_created" v-text="$t('date_created')" />
          </select>

          <select
            class="_selectField"
            :value="group_mode"
            @change="$emit('update:group_mode', $event.target.value)"
          >
            <option
              v-for="group_option in group_options"
              :key="group_option.key"
              :value="group_option.key"
              v-text="group_option.label"
            />
          </select>

          <select
            class="_selectField"
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

        <div class="_filterPane--row">
          <div class="_tag">
            <DLabel :str="$t('filter_by_keyword')" />

            <div class="_keywordsScrollContainer">
              <div
                v-for="category in keywords_by_category"
                :key="category.type"
                class="_keywordCategory"
              >
                <div class="_categoryHeader">
                  {{ category.type }}
                </div>
                <div class="_keywordCheckboxes">
                  <label
                    v-for="keyword in category.keywords"
                    :key="keyword.title"
                    class="u-keywords _keywordCheckbox"
                  >
                    <input
                      type="checkbox"
                      :checked="isKeywordSelected(keyword.title)"
                      @change="
                        toggleKeyword(keyword.title, $event.target.checked)
                      "
                    />
                    <SingleKeyword
                      :keyword="keyword.title"
                      :count="keyword.count"
                      :cat_color="getCategoryColor(category.type)"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div class="_resetFilters" v-if="can_be_reset">
      <button type="button" class="u-buttonLink" @click="resetFilters">
        {{ $t("reset") }}
      </button>
    </div>
  </div>
</template>
<script>
import SearchInput2 from "@/components/SearchInput2.vue";
import SingleKeyword from "@/components/SingleKeyword.vue";

export default {
  props: {
    shared_files: Array,
    group_mode: String,
    sort_order: String,
    search_str: String,
    filetype_filter: String,
    author_path_filter: String,
    available_keywords: Array,
    keywords_filter: Array,
    fav_filter: Boolean,
    view_mode: String,
    stack_preview_width: Number,
  },
  components: {
    SearchInput2,
    SingleKeyword,
  },
  data() {
    return {
      all_authors: [],

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

      type_of_media_to_display: "all",
      types_of_medias: [
        {
          key: "all",
          label: this.$t("all_medias_types"),
        },
        {
          key: "image",
          label: this.$t("image"),
        },
        {
          key: "video",
          label: this.$t("video"),
        },
        {
          key: "audio",
          label: this.$t("audio"),
        },
        {
          key: "text",
          label: this.$t("text"),
        },
        {
          key: "pdf",
          label: this.$t("pdf"),
        },
        {
          key: "stl",
          label: this.$t("stl"),
        },
        {
          key: "other",
          label: this.$t("other"),
        },
      ],
    };
  },
  i18n: {
    messages: {
      fr: {
        search_fields:
          "Rechercher dans les champs titre et description des documents.",
        stack_preview_width: "Largeur aperçu",
      },
      en: {
        search_fields: "Search in titles or descriptions of documents.",
        stack_preview_width: "Preview width",
      },
    },
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
    keywords_by_category() {
      const categories = {};

      // available_keywords already contains only valid keywords (computed in parent)
      this.available_keywords.forEach((kw) => {
        const category = this.getKeywordCategory(kw.title);
        const categoryKey = category || "OTHER";

        if (!categories[categoryKey]) {
          categories[categoryKey] = {
            type: categoryKey,
            keywords: [],
          };
        }

        categories[categoryKey].keywords.push(kw);
      });

      // Sort categories and keywords within each category
      return Object.keys(categories)
        .sort()
        .map((key) => ({
          type: key,
          keywords: categories[key].keywords.sort((a, b) =>
            this.getKeywordName(a.title).localeCompare(
              this.getKeywordName(b.title)
            )
          ),
        }));
    },
    can_be_reset() {
      return (
        this.group_mode !== "year" ||
        this.sort_order !== "date_modified" ||
        this.search_str !== "" ||
        this.author_path_filter !== "" ||
        this.filetype_filter !== "all" ||
        this.keywords_filter.length > 0
      );
    },
  },
  methods: {
    resetFilters() {
      this.$emit("update:group_mode", "year");
      this.$emit("update:sort_order", "date_modified");
      this.$emit("update:search_str", "");
      this.$emit("update:author_path_filter", "");
      this.$emit("update:filetype_filter", "all");
      this.$emit("update:keywords_filter", []);
    },
    getKeywordCategory(keyword) {
      return keyword.includes("/") ? keyword.split("/")[0] : null;
    },
    getKeywordName(keyword) {
      return keyword.includes("/") ? keyword.split("/")[1] : keyword;
    },
    isKeywordSelected(keyword) {
      return this.keywords_filter.includes(keyword);
    },
    toggleKeyword(keyword, checked) {
      let _new_kw = this.keywords_filter.slice();
      if (checked) {
        // Add to inclusion list (show only items with this keyword)
        if (!_new_kw.includes(keyword)) {
          _new_kw.push(keyword);
        }
      } else {
        // Remove from inclusion list
        _new_kw = _new_kw.filter((kw) => kw !== keyword);
      }
      this.$emit("update:keywords_filter", _new_kw);
    },
    getCategoryColorStyle(categoryType) {
      if (!categoryType || !window.app_infos?.custom_suggested_categories) {
        return "";
      }
      const category = window.app_infos.custom_suggested_categories.find(
        (c) => c.title === categoryType
      );
      if (!category?.tag_color) return "";
      return `--cat-color: ${category.tag_color}`;
    },
    getCategoryColor(categoryType) {
      if (!categoryType || !window.app_infos?.custom_suggested_categories) {
        return undefined;
      }
      const category = window.app_infos.custom_suggested_categories.find(
        (c) => c.title === categoryType
      );
      return category?.tag_color;
    },
  },
};
</script>
<style lang="scss" scoped>
._filterBar {
  position: relative;
  z-index: 1;
  // padding: calc(var(--spacing) / 1);
  // height: 100%;
  // overflow: auto;

  @include scrollbar(3px, 4px, 4px, transparent, var(--c-noir));

  // select,
  // input {
  //   &:not(.is--dark) {
  //     background-color: white;
  //   }
  // }
}

._topBtn {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  padding-bottom: calc(var(--spacing) * 1);

  > * {
    flex: 0 0 auto;
  }
}

._filterPane {
}

._filterPane--row {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  padding-bottom: calc(var(--spacing) * 1);

  > * {
    flex: 1 1 100px;
  }
}

._usedKw {
  padding-bottom: calc(var(--spacing) / 2);
  border-bottom: 2px solid white;
  margin-bottom: calc(var(--spacing) / 2);
}

._resetFilters {
  text-align: center;
  padding: calc(var(--spacing) / 2);
}
._closeBtn {
  position: absolute;
  right: 0;
  margin: calc(var(--spacing) / 2);
  z-index: 100;

  &.is--white {
    color: white;
  }
}

._selectField {
  border: 1px solid var(--h-500);
  border-radius: 4px;
  // max-width: 420px;
  min-width: 20ch;
  color: var(--h-700);

  background-color: transparent;
}

._searchField {
  flex: 1 1 100px;
  max-width: 420px;
  margin-bottom: calc(var(--spacing) / 2);
}

._keywordsScrollContainer {
}

._keywordCategory {
  margin-bottom: calc(var(--spacing) * 1);
}

._categoryHeader {
  position: sticky;
  // padding: calc(var(--spacing) / 2) 0;
  // margin-bottom: calc(var(--spacing) / 2);
  font-weight: 600;
  // font-size: var(--sl-font-size-small);
  // text-transform: uppercase;
  // color: var(--h-700);
  // border-radius: 4px;
  // padding-left: calc(var(--spacing) / 2);
  // padding-right: calc(var(--spacing) / 2);
}

._keywordCheckboxes {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);
  max-height: 30vh;
  overflow-y: auto;
  overflow-x: hidden;
}

._keywordCheckbox {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  cursor: pointer;
  // padding: calc(var(--spacing) / 4) 0;

  input[type="checkbox"] {
    cursor: pointer;
    flex: 0 0 auto;
  }
}

._stackPreviewWidthSlider {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  min-width: 200px;
}

._sliderLabel {
  font-size: var(--sl-font-size-small);
  white-space: nowrap;
}

._inputRange {
  flex: 1 1 100px;
  min-width: 100px;
  margin: 0;
}

._sliderValue {
  font-size: var(--sl-font-size-small);
  min-width: 50px;
  text-align: right;
  white-space: nowrap;
}
</style>
