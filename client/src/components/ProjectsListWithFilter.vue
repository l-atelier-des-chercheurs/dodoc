<template>
  <section class="_projectsListWithFilter">
    <div class="_filterSortBar">
      <button
        type="button"
        class="u-button u-button_small u-button_bleumarine"
        :class="{
          'is--active': show_sidebar,
        }"
        @click="show_sidebar = !show_sidebar"
      >
        {{ $t("filters") }}
      </button>
      <select
        size="small"
        class="_orderSelect"
        v-model="order_key"
        :disabled="filtered_projects.length <= 1"
      >
        <option
          v-for="opt in order_options"
          :key="opt.key"
          :value="opt.key"
          v-text="opt.text"
        />
      </select>
    </div>
    <div class="_cont">
      <div class="_sidebar" v-if="show_sidebar">
        <div class="u-switch u-switch-xs">
          <input
            id="only_finished"
            type="checkbox"
            v-model="show_only_finished"
          />
          <label class="u-label" for="only_finished">{{
            $t("only_finished")
          }}</label>
        </div>
        <div class="u-sameRow" style="width: 100%">
          <input
            type="text"
            v-model="search_project"
            :placeholder="$t('search_by_title')"
          />
          <button
            type="button"
            class="u-button u-button_bleumarine"
            style="flex: 0 0 auto"
            v-if="search_project.length > 0"
            @click="search_project = ''"
          >
            <sl-icon name="x-lg" />
          </button>
        </div>

        <div class="">
          <DLabel :str="$t('keywords')" />
          <KeywordsList
            :keywords="all_keywords"
            :kw_type="'keywords'"
            :clickable="true"
            @tagClick="toggleFilter({ type: 'keywords', value: $event })"
          />
        </div>

        <div class="">
          <DLabel :str="$t('machines_and_materials')" />
          <KeywordsList
            :keywords="all_materials"
            :kw_type="'materials'"
            :clickable="true"
            @tagClick="toggleFilter({ type: 'materials', value: $event })"
          />
        </div>

        <div class="">
          <DLabel :str="$t('levels_and_competences')" />
          <KeywordsList
            :keywords="all_levels"
            :kw_type="'level'"
            :clickable="true"
            @tagClick="toggleFilter({ type: 'level', value: $event })"
          />
        </div>
      </div>

      <div class="_listOfProjects">
        <div class="_tagList" v-if="active_filters.length > 0">
          <button
            type="button"
            class="u-button u-button_small"
            :class="btnClassForMedia(Object.keys(af)[0])"
            v-for="af in active_filters"
            :key="Object.keys(af)[0]"
            @click="
              toggleFilter({
                type: Object.keys(af)[0],
                value: Object.values(af)[0],
              })
            "
          >
            {{ Object.values(af)[0] }} <sl-icon name="x" />
          </button>
        </div>
        <!-- {{ filtered_projects.length }} -->
        <ProjectsList :projects="filtered_projects" />
      </div>
    </div>
  </section>
</template>
<script>
import ProjectsList from "@/components/ProjectsList.vue";

export default {
  props: {
    projects: Array,
  },
  components: {
    ProjectsList,
  },
  data() {
    return {
      show_sidebar: false,
      search_project: "",
      show_only_finished: false,

      order_key: "$date_created",
      order_options: [
        {
          key: "$date_created",
          text: this.$t("date_created"),
        },
        {
          key: "$date_modified",
          text: this.$t("date_modified"),
        },
        {
          key: "alphabetical",
          text: this.$t("alphabetical"),
        },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    all_keywords() {
      return this.extractArr(this.sorted_projects, "keywords");
    },
    all_materials() {
      return this.extractArr(this.sorted_projects, "materials");
    },
    all_levels() {
      return this.extractArr(this.sorted_projects, "level");
    },
    active_filters() {
      if (!this.$route.query) return [];
      return Object.entries(this.$route.query).map(([k, v]) => {
        return { [k]: decodeURI(v) };
      });
    },
    sorted_projects() {
      if (!this.projects) return [];
      return this.projects
        .slice()
        .filter((p) =>
          this.canLoggedinSeeFolder({
            folder: p,
          })
        )
        .sort((a, b) => {
          if (this.order_key === "$date_created")
            return +new Date(b.$date_created) - +new Date(a.$date_created);
          else if (this.order_key === "$date_modified")
            return +new Date(b.$date_modified) - +new Date(a.$date_modified);
          else if (this.order_key === "alphabetical")
            return a.title.localeCompare(b.title);
        });
    },
    filtered_projects() {
      return this.sorted_projects.filter((p) => {
        if (this.active_filters.length === 0)
          if (
            this.search_project.length === 0 &&
            this.show_only_finished === false
          )
            return true;

        if (this.show_only_finished && p.$status !== "finished") return false;

        for (const af of this.active_filters) {
          const k = Object.keys(af).at(0);
          const v = Object.values(af).at(0);
          if (!Object.prototype.hasOwnProperty.call(p, k)) return false;
          if (Array.isArray(p[k]) && !p[k].includes(v)) return false;
          else if (typeof p[k] === "string" && p[k] !== v) return false;
        }

        if (this.search_project)
          return p.title
            .toLowerCase()
            .includes(this.search_project.toLowerCase());

        return true;
      });
    },
  },
  methods: {
    btnClassForMedia(type) {
      if (type === "keywords") return "u-button_orange";
      if (type === "materials") return "u-button_bleumarine";
      if (type === "level") return "u-button_bleuvert";
    },
    toggleFilter({ type, value }) {
      let query = {};

      if (this.$route.query)
        query = JSON.parse(JSON.stringify(this.$route.query));

      if (value && query[type] !== encodeURI(value))
        query[type] = encodeURI(value);
      else delete query[type];

      this.$router.push({ query });
    },
  },
};
</script>
<style lang="scss" scoped>
._projectsListWithFilter {
  margin-top: calc(var(--spacing) * 1);

  width: 100%;
  max-width: calc(var(--max-column-width));
  margin: 0 auto;
}
._cont {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  gap: calc(var(--spacing) / 1);
}
._sidebar {
  flex: 0 0 240px;
  position: sticky;
  overflow: hidden;
  top: 0;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  // align-items: flex-end;
  align-items: flex-start;
  gap: calc(var(--spacing) / 2);
  padding-top: calc(var(--spacing) * 1);

  ::v-deep {
    button {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: " [..]";
    }
  }
}
._listOfProjects {
  flex: 1 1 auto;
  margin-top: calc(var(--spacing) / 1);
}
._tagList {
  display: flex;
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) * 1);
}
._projectsListWithFilter {
}

._orderSelect {
  max-width: 22ch;
}

._filterSortBar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}
</style>
