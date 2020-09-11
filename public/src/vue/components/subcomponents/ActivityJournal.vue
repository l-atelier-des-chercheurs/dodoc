<template>
  <div class="m_activityJournal">
    <div>
      <div>
        <div class>
          <div class="m_actionbar">
            <div class="m_actionbar--text">
              <template>
                <button
                  type="button"
                  class="button-nostyle text-uc button-triangle"
                  :class="{ 'is--active': show_filters }"
                  @click="show_filters = !show_filters"
                >
                  {{ $t("filters") }}
                </button>
              </template>
              <div
                class="m_tagsAndAuthorFilters flex-wrap bg-creme rounded"
                v-if="show_filters"
              >
                <div
                  v-if="journal_authors && journal_authors.length > 0"
                  class="padding-sides-small"
                >
                  <label>{{ $t("authors") }}</label>
                  <div class="m_authorField margin-bottom-none">
                    <button
                      v-for="{ slugFolderName: author_slug } in journal_authors"
                      v-if="$root.getAuthor(author_slug)"
                      :key="author_slug"
                      :class="{
                        'is--active': author_filter === author_slug,
                        'is--loggedInAuthor':
                          $root.current_author &&
                          $root.current_author.slugFolderName === author_slug,
                      }"
                      @click="setAuthorFilter(author_slug)"
                    >
                      {{ $root.getAuthor(author_slug).name }}
                    </button>
                  </div>
                </div>
                <div
                  v-if="journal_days && journal_days.length > 0"
                  class="padding-sides-small"
                >
                  <label>{{ $t("days") }}</label>
                  <div class="m_authorField margin-bottom-none">
                    <button
                      v-for="day in journal_days"
                      :key="day"
                      :class="{
                        'is--active': day_filter === day,
                      }"
                      @click="setDayFilter(day)"
                    >
                      {{ $moment(day).format("LL") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="flex-nowrap flex-vertically-start flex-horizontally-end margin-vert-small"
            >
              <small style="flex: 0 0 auto" class="margin-verysmall">
                {{ `${filtered_entries.length} ${$t("entries").toLowerCase()}.`
                }}<br />
                <template v-if="filtered_entries.length">
                  {{
                    `${$t("entries")} ${
                      (current_page - 1) * number_of_items_per_page + 1
                    }  ${$t("to")} ${
                      (current_page - 1) * number_of_items_per_page +
                      entries_paginated.length
                    }`
                  }}
                  —
                  {{
                    `${$t("page")} ${current_page} ${$t(
                      "to"
                    )} ${number_of_possible_pages}`
                  }}
                </template>
              </small>
              <select
                v-if="filtered_entries.length"
                v-model="current_page"
                class="margin-verysmall select-xs"
                style="flex: 0 1 100px"
              >
                <option
                  v-for="page_number in number_of_possible_pages"
                  :key="page_number"
                  v-html="page_number"
                />
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <table class="table-striped table-bordered">
      <thead>
        <tr>
          <th colspan="1">{{ $t("date") }}</th>
          <th colspan="1">{{ $t("author") }}</th>
          <th colspan="1">{{ $t("action") }}</th>
          <th>{{ $t("detail") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="!entries_paginated || entries_paginated.length === 0"
          class="bg-gris_tresclair"
        >
          <td colspan="4">
            <small class>{{ $t("no_content_to_show") }}</small>
          </td>
        </tr>

        <tr
          v-for="(entry, index) of entries_paginated"
          :key="index"
          class="font-small"
        >
          <td>{{ entry.date.calendar() }}</td>
          <td>
            <template v-if="$root.getAuthor(entry.author)">{{
              $root.getAuthor(entry.author).name
            }}</template>
            <template v-else>
              <i>{{ entry.author }}</i>
            </template>
          </td>
          <td>{{ $t(entry.action).toLowerCase() }}</td>
          <td>
            <small v-if="show_detail_for_entry === index">{{
              entry.detail
            }}</small>
            <button
              type="button"
              class="button-thin margin-none"
              v-if="show_detail_for_entry !== index"
              @click="show_detail_for_entry = index"
            >
              {{ $t("show") }}
            </button>
            <button
              type="button"
              class="button-thin"
              v-if="show_detail_for_entry === index"
              @click="show_detail_for_entry = false"
            >
              {{ $t("hide") }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  props: {
    journal_entries: Array,
  },
  components: {},
  data() {
    return {
      show_filters: true,
      author_filter: "",
      day_filter: "",
      current_day_shown: false,
      show_detail_for_entry: false,
      current_page: 1,
      number_of_items_per_page: 100,
    };
  },
  created() {},
  mounted() {
    this.current_day_shown = this.$moment().day();
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    entries() {
      let journal = this.journal_entries;
      if (typeof journal !== "object" || journal.length === 0) return false;

      journal = journal.reduce((acc, j) => {
        if (j.author) {
          // const author = this.$root.getAuthor(j.author);
          // if (author) j.author = j.author;
        }
        if (j.timestamp && this.$moment(+j.timestamp).isValid()) {
          j.date = this.$moment(+j.timestamp);
          acc.push(j);
        }
        return acc;
      }, []);

      return journal.reverse();
    },
    filtered_entries() {
      if (!this.entries) return false;

      return this.entries.filter(
        (entry) =>
          (this.author_filter ? this.author_filter === entry.author : true) &&
          (this.day_filter
            ? this.day_filter === entry.date.format("YYYY-MM-DD")
            : true)
      );
    },
    entries_paginated() {
      if (!this.filtered_entries) return false;

      return this.filtered_entries.slice(
        (this.current_page - 1) * this.number_of_items_per_page,
        this.current_page * this.number_of_items_per_page
      );
    },
    number_of_possible_pages() {
      if (!this.filtered_entries) return false;
      return Math.ceil(
        this.filtered_entries.length / this.number_of_items_per_page
      );
    },
    journal_authors() {
      if (!this.entries) return false;

      let uniqueAuthors = this.entries.reduce((acc, { author }) => {
        if (!acc.includes(author)) acc.push(author);
        return acc;
      }, []);
      uniqueAuthors = uniqueAuthors.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });

      return uniqueAuthors.map((kw) => {
        return {
          slugFolderName: kw,
        };
      });
    },
    journal_days() {
      const group_entries_per_day = this.$_.groupBy(this.entries, (entry) =>
        entry.date.format("YYYY-MM-DD")
      );
      return Object.keys(group_entries_per_day);
    },
  },
  methods: {
    setAuthorFilter(author_slug) {
      if (this.author_filter !== author_slug) this.author_filter = author_slug;
      else this.author_filter = "";

      this.current_page = 1;
    },
    setDayFilter(day) {
      if (this.day_filter !== day) this.day_filter = day;
      else this.day_filter = "";

      this.current_page = 1;
    },
  },
};
</script>
<style lang="scss" scoped></style>
