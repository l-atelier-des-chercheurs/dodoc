<template>
  <div class="_filterBar">
    <div class="_topBtn">
      <div class="">
        <button
          type="button"
          class="u-buttonLink"
          :class="{
            'is--active': show_filter_sort_pane,
          }"
          @click="show_filter_sort_pane = !show_filter_sort_pane"
        >
          <b-icon icon="filter" />
          {{ $t("filters") }}
        </button>
      </div>

      <div class="_searchField">
        <SearchInput2
          :value="search_str"
          @input="$emit('update:search_str', $event)"
          :search_placeholder="$t('search_fields')"
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
        <button
          class="u-button u-button_icon"
          type="button"
          :class="{
            'is--active': view_mode === 'timeline',
          }"
          @click="$emit('update:view_mode', 'timeline')"
        >
          <b-icon icon="calendar-week" />
        </button>
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

    <transition name="pagechange">
      <div class="_filterPane" v-if="show_filter_sort_pane">
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

          <transition name="fade_fast" mode="out-in">
            <button
              type="button"
              v-if="can_be_reset"
              class="u-buttonLink _resetFilters"
              @click="resetFilters"
            >
              {{ $t("reset") }}
            </button>
          </transition>
        </div>

        <div class="_filterPane--row">
          <div class="_tag">
            <DLabel :str="$t('filter_by_keyword')" />

            <div class="_searchKW">
              <SearchInput2
                v-model="kw_search"
                :search_placeholder="$t('search')"
              />
            </div>

            <div class="u-keywords _usedKw" v-if="keywords_filter.length > 0">
              <SingleKeyword
                v-for="keyword in keywords_filter"
                :key="keyword"
                :keyword="keyword"
                :can_remove="true"
                @remove="removeFilter(keyword)"
              />
            </div>
            <div class="u-keywords">
              <SingleKeyword
                v-for="keyword in collapsable_keywords"
                :key="keyword.title"
                :keyword="keyword.title"
                :count="keyword.count"
                :can_add="true"
                @add="addFilter(keyword.title)"
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
      </div>
    </transition>
  </div>
</template>
<script>
import SingleKeyword from "@/components/SingleKeyword.vue";
import SearchInput2 from "@/components/SearchInput2.vue";

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
  },
  components: {
    SingleKeyword,
    SearchInput2,
  },
  data() {
    return {
      show_filter_sort_pane: false,

      all_authors: [],

      show_all_keywords: false,
      kw_search: "",

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
      },
      en: {
        search_fields: "Search in titles or descriptions of documents.",
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
    available_keywords_except_active() {
      let _keywords = this.available_keywords.filter((kw) => {
        if (this.keywords_filter.includes(kw.title)) return false;
        if (this.kw_search)
          return this.twoStringsSearch(kw.title, this.kw_search);

        return true;
      });
      return _keywords;
    },
    collapsable_keywords() {
      if (!this.show_all_keywords)
        return this.available_keywords_except_active.slice(0, 10);
      return this.available_keywords_except_active;
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
    filterByKeyword(keyword) {
      let _new_kw = this.keywords_filter.slice();
      if (this.keywords_filter.includes(keyword)) {
        _new_kw = _new_kw.filter((kw) => kw !== keyword);
      } else {
        _new_kw.push(keyword);
      }
      this.$emit("update:keywords_filter", _new_kw);
    },
    removeFilter(kw) {
      this.$nextTick(() => {
        this.filterByKeyword(kw);
      });
    },
    addFilter(kw) {
      this.$nextTick(() => {
        this.kw_search = "";
        this.filterByKeyword(kw);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._filterBar {
  position: relative;
  z-index: 1;
  margin: calc(var(--spacing) / 1);
  border-bottom: 1px solid var(--h-500);

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

._searchKW {
  margin-bottom: calc(var(--spacing) / 2);
}

._resetFilters {
  flex: 0 0 100px;
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
}

._searchKW {
  margin-bottom: calc(var(--spacing) / 2);
}

._searchField {
  flex-grow: 1;
  max-width: 420px;
}
</style>
