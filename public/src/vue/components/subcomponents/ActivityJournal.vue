<template>
  <div>
    <div class="">
      <div>
        <div class="">
          <div class="m_tagsAndAuthorFilters flex-wrap bg-creme rounded">
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
      </div>
    </div>

    <table class="table-striped table-bordered">
      <thead>
        <tr>
          <th colspan="1">
            {{ $t("date") }}
          </th>
          <th colspan="1">
            {{ $t("author") }}
          </th>
          <th colspan="1">
            {{ $t("action") }}
          </th>
          <th>
            {{ $t("detail") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) of filtered_entries" :key="index">
          <td>
            {{ entry.date.calendar() }}
          </td>
          <td>
            <template v-if="$root.getAuthor(entry.author)">
              {{ $root.getAuthor(entry.author).name }}
            </template>
            <template v-else>
              <i>{{ entry.author }}</i>
            </template>
          </td>
          <td>
            {{ $t(entry.action).toLowerCase() }}
          </td>
          <td>
            <small v-if="show_detail_for_entry === index">
              {{ entry.detail }}
            </small>
            <button
              type="button"
              class="button-small"
              v-if="show_detail_for_entry !== index"
              @click="show_detail_for_entry = index"
            >
              {{ $t("show") }}
            </button>
            <button
              type="button"
              class="button-small"
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
      show_filters: false,
      author_filter: "",
      day_filter: "",
      current_day_shown: false,
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
      if (typeof journal !== "object" || this.$root.state.journal.length === 0)
        return false;

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
      return this.entries.filter(
        (entry) =>
          (this.author_filter ? this.author_filter === entry.author : true) &&
          (this.day_filter
            ? this.day_filter === entry.date.format("YYYY-MM-DD")
            : true)
      );
    },
    entries_paginated_per_day() {
      return this.$_.groupBy(this.entries, (entry) =>
        entry.date.format("YYYY-MM-DD")
      );
    },
    journal_authors() {
      let uniqueAuthors = this.entries.reduce((acc, { author }) => {
        if (!acc.includes(author)) acc.push(author);
        return acc;
      }, []);
      uniqueAuthors = uniqueAuthors.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });

      debugger;
      return uniqueAuthors.map((kw) => {
        return {
          slugFolderName: kw,
        };
      });
    },
    journal_days() {
      return Object.keys(this.entries_paginated_per_day);
    },
  },
  methods: {
    setAuthorFilter(author_slug) {
      if (this.author_filter !== author_slug) this.author_filter = author_slug;
      else this.author_filter = "";
    },
    setDayFilter(day) {
      if (this.day_filter !== day) this.day_filter = day;
      else this.day_filter = "";
    },
  },
};
</script>
<style lang="scss" scoped></style>
