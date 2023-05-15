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
          <TagsList
            :tags="all_keywords"
            :tag_type="'keywords'"
            :clickable="true"
            :tags_active="getActiveTags('keywords')"
            @tagClick="toggleFilter({ filter_type: 'keywords', value: $event })"
          />
        </div>

        <div class="">
          <DLabel :str="$t('machines_and_materials')" />
          <TagsList
            :tags="all_materials"
            :tag_type="'materials'"
            :clickable="true"
            :tags_active="getActiveTags('materials')"
            @tagClick="
              toggleFilter({ filter_type: 'materials', value: $event })
            "
          />
        </div>

        <div class="">
          <DLabel :str="$t('levels_and_competences')" />
          <TagsList
            :tags="all_levels"
            :tag_type="'level'"
            :clickable="true"
            :translated="true"
            :tags_active="getActiveTags('level')"
            @tagClick="toggleFilter({ filter_type: 'level', value: $event })"
          />
        </div>
      </div>

      <div class="_listOfProjects">
        <transition name="scaleInFade" mode="out-in">
          <transition-group
            class="_tagList"
            v-if="active_filters.length > 0"
            tag="section"
            name="projectsList"
            appear
          >
            <SingleTag
              v-for="af in active_filters"
              :key="af.value"
              :tag_type="af.filter_type"
              :name="af.value"
              :clickable="true"
              :disableable="true"
              @tagClick="
                toggleFilter({
                  filter_type: af.filter_type,
                  value: af.value,
                })
              "
            />
            <button
              type="button"
              v-if="active_filters.length > 1"
              class="u-buttonLink"
              @click="resetFilters"
              :key="'reset_all'"
            >
              {{ $t("reset_all") }}
            </button>
          </transition-group>
        </transition>
        <ProjectsList
          :projects="filtered_projects"
          :display_original_space="display_original_space"
        />
      </div>
    </div>
  </section>
</template>
<script>
import ProjectsList from "@/components/ProjectsList.vue";

export default {
  props: {
    projects: Array,
    display_original_space: Boolean,
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
      return this.extractArr(this.filtered_projects, "keywords");
    },
    all_materials() {
      return this.extractArr(this.filtered_projects, "materials");
    },
    all_levels() {
      return this.extractArr(this.filtered_projects, "level");
      // .map((tag) =>
      //   this.$t(tag)
      // );
    },
    active_filters() {
      if (!this.$route.query?.pfilters) return [];
      const _filters = JSON.parse(this.$route.query.pfilters);
      return _filters.map((f) => {
        return { filter_type: f.filter_type, value: decodeURI(f.value) };
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
          const filter_type = af.filter_type;
          const value = af.value;

          if (!Object.prototype.hasOwnProperty.call(p, filter_type))
            return false;

          if (Array.isArray(p[filter_type]) && !p[filter_type].includes(value))
            return false;
          else if (
            typeof p[filter_type] === "string" &&
            p[filter_type] !== value
          )
            return false;
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
      if (type === "level") return "u-button_rouge";
      return "u-button_bleuvert";
    },
    toggleFilter({ filter_type, value }) {
      let query = {};

      if (this.$route.query)
        query = JSON.parse(JSON.stringify(this.$route.query));

      let _filters = query.pfilters ? JSON.parse(query.pfilters) : [];

      if (
        value &&
        !_filters.some(
          (f) => f.filter_type === filter_type && f.value === encodeURI(value)
        )
      )
        _filters.push({
          filter_type,
          value: encodeURI(value),
        });
      else
        _filters = _filters.filter(
          (f) =>
            !(f.filter_type === filter_type && f.value === encodeURI(value))
        );

      query.pfilters = JSON.stringify(_filters);
      this.$router.push({ query });
    },
    resetFilters() {
      let query = {};
      if (this.$route.query?.pfilters) {
        query = JSON.parse(JSON.stringify(this.$route.query));
        delete query.pfilters;
        this.$router.push({ query });
      }
    },
    getActiveTags(type) {
      return this.active_filters.reduce((acc, af) => {
        if (af.filter_type === type) acc.push(af.value);
        return acc;
      }, []);
    },
  },
};
</script>
<style lang="scss" scoped>
._projectsListWithFilter {
  margin-top: calc(var(--spacing) * 1);

  width: 100%;
  min-height: 70vh;
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
