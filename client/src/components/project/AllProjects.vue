<template>
  <div class="_allProjects">
    <transition name="fade_fast" :duration="150" mode="out-in">
      <LoaderSpinner v-if="is_loading" />
      <div v-else>
        <div class="_cont">
          <div class="_sidebar">
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

            <br />

            <DLabel :str="$t('keywords')" />
            <button
              type="button"
              class="u-button u-button_orange u-button_small"
              v-for="kw in all_keywords"
              :key="kw"
              @click="toggleFilter({ type: 'keywords', value: kw })"
            >
              {{ kw }}
            </button>

            <br />

            <DLabel :str="$t('machines_and_materials')" />
            <button
              type="button"
              class="u-button u-button_bleumarine u-button_small"
              v-for="kw in all_materials"
              :key="kw"
              @click="toggleFilter({ type: 'materials', value: kw })"
            >
              {{ kw }}
            </button>

            <br />

            <DLabel :str="$t('levels_and_competences')" />
            <button
              type="button"
              class="u-button u-button_bleuvert u-button_small"
              v-for="kw in all_levels"
              :key="kw"
              @click="toggleFilter({ type: 'level', value: kw })"
            >
              {{ kw }}
            </button>
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
                {{ Object.values(af)[0] }}
              </button>
            </div>
            <!-- {{ filtered_projects.length }} -->
            <ProjectsList :projects="filtered_projects" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import ProjectsList from "@/components/ProjectsList.vue";

export default {
  props: {},
  components: { ProjectsList },
  data() {
    return {
      all_projects: [],
      is_loading: true,
      search_project: "",
    };
  },
  created() {},
  async mounted() {
    await this.loadAllProjects();
    this.is_loading = false;
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    all_keywords() {
      return this.extractArr(this.all_projects, "keywords");
    },
    all_materials() {
      return this.extractArr(this.all_projects, "materials");
    },
    all_levels() {
      return this.extractArr(this.all_projects, "level");
    },
    active_filters() {
      if (!this.$route.query) return [];
      return Object.entries(this.$route.query).map(([k, v]) => {
        return { [k]: decodeURI(v) };
      });
    },
    sorted_projects() {
      return (
        this.all_projects
          .clone()
          .sort(
            (a, b) => +new Date(b.$date_created) - +new Date(a.$date_created)
          ) || []
      ).reverse();
    },
    filtered_projects() {
      return this.all_projects.filter((p) => {
        if (this.active_filters.length === 0)
          if (this.search_project.length === 0) return true;

        for (const af of this.active_filters) {
          const k = Object.keys(af).at(0);
          const v = Object.values(af).at(0);
          if (!Object.prototype.hasOwnProperty.call(p, k)) return false;
          if (Array.isArray(p[k]) && !p[k].includes(v)) return false;
          else if (typeof p[k] === "string" && p[k] !== v) return false;
        }

        if (this.search_project) return p.title.includes(this.search_project);

        return true;
      });
    },
  },
  methods: {
    async loadAllProjects() {
      const spaces = await this.$api
        .getFolders({
          path: "spaces",
        })
        .catch((err) => {
          this.fetch_spaces_error = err.response;
          return;
        });

      if (spaces.length === 0) {
        return;
      }

      for (const space of spaces) {
        const projects = await this.$api.getFolders({
          path: space.$path + "/projects",
        });
        if (projects.length > 0)
          this.all_projects = this.all_projects.concat(projects);
      }

      return;
    },
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
._allProjects {
  width: 100%;
  max-width: calc(var(--max-column-width));
  // max-width: calc(var(--max-column-width) + 240px);
  margin: calc(var(--spacing) * 1) auto;
  padding: calc(var(--spacing) * 1);
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
  gap: calc(var(--spacing) / 4);
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
  padding-top: calc(var(--spacing) * 1);
}
._tagList {
  display: flex;
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) * 1);
}
</style>
