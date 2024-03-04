<template>
  <section class="_projectsListWithFilter">
    <div class="_filterSortBar" v-if="sorted_projects.length > 0">
      <div class="u-sameRow">
        <div class="">
          <DLabel :str="$t('filter')" />
          <button
            type="button"
            size="small"
            class="u-button u-button_small u-button_bleumarine"
            :class="{
              'is--active': show_sidebar,
            }"
            @click="show_sidebar = !show_sidebar"
            v-text="!show_sidebar ? $t('show') : $t('hide')"
          />
        </div>
        <div class="">
          <SearchInput
            v-model="search_project"
            :search_placeholder="$t('search_in_title_desc_kw')"
          />
        </div>
      </div>
      <div class="">
        <DLabel :str="$t('sort')" />
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
    </div>
    <div class="_cont">
      <div class="_sidebar" v-if="show_sidebar">
        <div>
          <DLabel :str="$t('status')" />
          <div class="_statusList">
            <StatusTag
              v-for="status in extractAll('$status')"
              :key="status"
              :status="status"
              :can_edit="false"
              :mode="'active'"
              @click="toggleFilter({ filter_type: '$status', value: status })"
            />
          </div>
        </div>

        <div v-if="$root.app_infos.instance_meta.enable_events">
          <DLabel :str="$t('events')" />
          <!-- <EventField :project="" /> -->
        </div>

        <template
          v-for="filter in [
            'target_audience',
            'disciplines',
            'level',
            'keywords',
            'machines',
            'materials',
          ]"
        >
          <div v-if="extractAll(filter).length > 0" :key="filter">
            <template v-if="filter === 'level'">
              <DLabel :str="$t('levels_and_competences')" />
              <TagsList
                :tags="extractAll('level')"
                :tag_type="'level'"
                :tags_active="getActiveTags('level')"
                @tagClick="
                  toggleFilter({ filter_type: 'level', value: $event })
                "
              />
            </template>

            <template v-else-if="filter === 'keywords'">
              <DLabel :str="$t('keywords')" />
              <TagsList
                :tags="extractAll('keywords')"
                :tag_type="'keywords'"
                :tags_active="getActiveTags('keywords')"
                @tagClick="
                  toggleFilter({ filter_type: 'keywords', value: $event })
                "
              />
            </template>

            <template v-else-if="filter === 'materials'">
              <DLabel :str="$t('materials')" />
              <TagsList
                :tags="extractAll('materials')"
                :tag_type="'materials'"
                :tags_active="getActiveTags('materials')"
                @tagClick="
                  toggleFilter({ filter_type: 'materials', value: $event })
                "
              />
            </template>

            <template v-else-if="filter === 'machines'">
              <DLabel :str="$t('machines')" />
              <TagsList
                :tags="extractAll('machines')"
                :tag_type="'machines'"
                :tags_active="getActiveTags('machines')"
                @tagClick="
                  toggleFilter({ filter_type: 'machines', value: $event })
                "
              />
            </template>

            <template v-else-if="filter === 'disciplines'">
              <DLabel :str="$t('disciplines')" />
              <TagsList
                :tags="extractAll('disciplines')"
                :tag_type="'disciplines'"
                :tags_active="getActiveTags('disciplines')"
                @tagClick="
                  toggleFilter({ filter_type: 'disciplines', value: $event })
                "
              />
            </template>

            <template v-else-if="filter === 'target_audience'">
              <DLabel :str="$t('target_audience')" />
              <TagsList
                :tags="extractAll('target_audience')"
                :tag_type="'target_audience'"
                :tags_active="getActiveTags('target_audience')"
                @tagClick="
                  toggleFilter({
                    filter_type: 'target_audience',
                    value: $event,
                  })
                "
              />
            </template>
          </div>
        </template>
      </div>

      <div class="_listOfProjects">
        <transition name="scaleInFade" mode="out-in">
          <transition-group
            class="_tagList"
            v-if="active_filters.length > 0"
            tag="section"
            name="listComplete"
            appear
          >
            <template v-for="af in active_filters">
              <StatusTag
                v-if="af.filter_type === '$status'"
                :key="af.value"
                :status="af.value"
                :can_edit="false"
                :mode="'disable'"
                @click="
                  toggleFilter({
                    filter_type: '$status',
                    value: af.value,
                  })
                "
              />
              <SingleTag
                v-else
                :key="af.value"
                :tag_type="af.filter_type"
                :tag_str="af.value"
                :mode="'disable'"
                @tagClick="
                  toggleFilter({
                    filter_type: af.filter_type,
                    value: af.value,
                  })
                "
              />
            </template>
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
          :projects_pinned="projects_pinned"
          :path="space_path"
          :display_original_space="display_original_space"
          :can_edit="can_edit"
          @toggleFilter="toggleFilter($event)"
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
    projects_pinned: Array,
    space_path: String,
    display_original_space: Boolean,
    can_edit: Boolean,
  },
  components: {
    ProjectsList,
  },
  data() {
    return {
      show_sidebar: false,
      search_project: "",

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
    opened_event() {
      return this.$route.hash.substring(1) || false;
    },
    active_filters() {
      let _filters = [];
      if (this.$route.query?.pfilters) {
        const pfilters = JSON.parse(this.$route.query.pfilters);
        pfilters.map((f) => {
          _filters.push({
            filter_type: f.filter_type,
            value: decodeURI(f.value),
          });
        });
      }

      return _filters;
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
          if (a.$status !== "finished" && b.$status === "finished") return 1;
          if (a.$status === "finished" && b.$status !== "finished") return -1;
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

        if (this.search_project && !this.searchInProject(p)) return false;

        if (this.opened_event)
          if (this.opened_event !== p.event_linked_slug) return false;

        return true;
      });
    },
  },
  methods: {
    extractAll(key) {
      return this.extractArr(this.filtered_projects, key);
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

      const hash = this.$route.hash || false;

      if (_filters.length > 0) query.pfilters = JSON.stringify(_filters);
      else delete query.pfilters;

      this.$router.push({ query, hash });
    },
    resetFilters() {
      let query = {};
      const hash = this.$route.hash || false;

      if (this.$route.query?.pfilters) {
        query = JSON.parse(JSON.stringify(this.$route.query));
        delete query.pfilters;
      }
      this.$router.push({ query, hash });
    },
    getActiveTags(type) {
      return this.active_filters.reduce((acc, af) => {
        if (af.filter_type === type) acc.push(af.value);
        return acc;
      }, []);
    },
    searchInProject(project) {
      if (
        project.title &&
        this.twoStringsSearch(project.title, this.search_project)
      )
        return true;
      if (
        project.description &&
        this.twoStringsSearch(project.description, this.search_project)
      )
        return true;

      for (const kw of ["keywords", "machines", "materials"]) {
        if (
          project[kw] &&
          project[kw].some((kw) =>
            this.twoStringsSearch(kw, this.search_project)
          )
        )
          return true;
      }
      return false;
    },
  },
};
</script>
<style lang="scss" scoped>
._projectsListWithFilter {
  --item-width: 240px;

  width: 100%;
  min-height: 70vh;
}
._cont {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  gap: calc(var(--spacing) * 2);
}
._sidebar {
  flex: 0 0 240px;
  position: sticky;
  overflow: auto;
  max-height: 100vh;
  top: 0;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  // align-items: flex-end;
  align-items: flex-start;
  gap: calc(var(--spacing) / 2);

  // border-top: 2px solid var(--c-gris);
  padding: calc(var(--spacing) / 2);
  padding-left: 0;
  margin-top: 0;

  ::v-deep {
    button {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: " [..]";
    }
  }
}
._listOfProjects {
  flex: 1 1 0;
  margin-top: 0;
}
._tagList {
  display: flex;
  gap: calc(var(--spacing) / 8);
  margin: calc(var(--spacing) / 1) 0;
}
._projectsListWithFilter {
}

._orderSelect {
  max-width: 22ch;
}

._filterSortBar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}

._statusList {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 8);
}
</style>
