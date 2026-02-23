<template>
  <FilterableListLayout
    class="_foldersListWithFilter"
    :has_sidebar="sorted_folders.length > 0 && show_sidebar_toggle"
  >
    <template #before-sidebar-toggle>
      <slot name="before-sidebar-toggle" />
    </template>

    <template #search v-if="sorted_folders.length > 0">
      <div class="_searchField">
        <SearchInput
          v-model="search_query"
          :search_placeholder="search_placeholder"
          :name="'search_folder'"
        />
      </div>
    </template>

    <template #top-right>
      <div class="_topRightControls">
        <template v-if="sorted_folders.length > 0">
          <select
            size="small"
            class="_orderSelect"
            :name="'order_folders'"
            v-model="order_key"
            :disabled="filtered_folders.length <= 1"
          >
            <option
              v-for="opt in order_options"
              :key="opt.key"
              :value="opt.key"
              v-text="opt.text"
            />
          </select>
        </template>

        <div class="_mode" v-if="view_mode">
          <button
            v-if="available_view_modes.includes('list')"
            class="u-button u-button_icon"
            type="button"
            :class="{
              'is--active': current_view_mode === 'list',
            }"
            @click="current_view_mode = 'list'"
          >
            <b-icon icon="list-ol" />
          </button>
          <button
            v-if="available_view_modes.includes('tiny')"
            class="u-button u-button_icon"
            type="button"
            :class="{
              'is--active': current_view_mode === 'tiny',
            }"
            @click="current_view_mode = 'tiny'"
          >
            <b-icon icon="grid-3x2-gap-fill" />
          </button>
          <button
            v-if="available_view_modes.includes('medium')"
            class="u-button u-button_icon"
            type="button"
            :class="{
              'is--active': current_view_mode === 'medium',
            }"
            @click="current_view_mode = 'medium'"
          >
            <b-icon icon="grid-fill" />
          </button>
          <button
            v-if="available_view_modes.includes('map')"
            class="u-button u-button_icon"
            type="button"
            :class="{
              'is--active': current_view_mode === 'map',
            }"
            :disabled="map_pins.length === 0"
            @click="current_view_mode = 'map'"
          >
            <b-icon icon="map-fill" />
          </button>
        </div>

        <slot name="top-right" />
      </div>
    </template>

    <template #sidebar>
      <!-- Projects Specific Filters -->
      <template v-if="folder_type === 'project'">
        <div>
          <DLabel :str="$t('status')" />
          <div class="_statusList">
            <StatusTag
              v-for="status in extractAll('$status')"
              :key="status"
              :status="status"
              :can_edit="false"
              :mode="
                getActiveTags('$status').includes(status) ? 'disable' : 'active'
              "
              @click="toggleFilter({ filter_type: '$status', value: status })"
            />
          </div>
        </div>

        <div>
          <DLabel :str="$t('contributors')" />
          <TagsList
            :tags="project_admins_and_contributors"
            :tag_type="'authors'"
            :tags_active="getActiveTags('authors')"
            @tagClick="
              toggleFilter({
                filter_type: 'authors',
                value: $event,
              })
            "
          />
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

            <template v-else>
              <DLabel :str="$t(filter)" />
              <TagsList
                :tags="extractAll(filter)"
                :tag_type="filter"
                :tags_active="getActiveTags(filter)"
                @tagClick="toggleFilter({ filter_type: filter, value: $event })"
              />
            </template>
          </div>
        </template>
      </template>

      <!-- Authors Specific Filters -->
      <template v-if="folder_type === 'author'">
        <div v-if="all_groups.length > 0">
          <DLabel :str="$t('group')" />
          <TagsList
            :tags="all_groups"
            :tag_type="'accountgroup'"
            :tags_active="[filter_by_group]"
            @tagClick="toggleGroupFilter($event)"
          />
        </div>
      </template>

      <slot name="sidebar" />
    </template>

    <template #active-filters>
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
              :key="'status_' + af.value"
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
            <AuthorTag
              v-else-if="af.filter_type === 'authors'"
              :path="af.value"
              :key="'authors_' + af.value"
              :mode="'disable'"
              @click="
                toggleFilter({
                  filter_type: 'authors',
                  value: af.value,
                })
              "
            />
            <SingleTag
              v-else
              :key="af.filter_type + '_' + af.value"
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
    </template>

    <template #list>
      <slot name="list-header" />

      <template
        v-if="
          current_view_mode === 'list' ||
          current_view_mode === 'medium' ||
          current_view_mode === 'tiny'
        "
      >
        <FoldersList
          :folders="filtered_folders"
          :pinned_folders="pinned_folders"
          :path="path"
          :can_edit="can_edit"
          :pin_field_name="pin_field_name"
          :pin_label="pin_label"
          :empty_message="empty_message"
          :view_mode="current_view_mode"
          v-slot="slotProps"
        >
          <slot
            name="item"
            :item="slotProps.item"
            :view_mode="current_view_mode"
          />
        </FoldersList>
      </template>
      <template v-else-if="current_view_mode === 'map'">
        <div class="_mapContainer">
          <DisplayOnMap
            :pins="map_pins"
            :map_baselayer_opacity="0.5"
            :map_baselayer_bw="true"
            :is_small="false"
            @update:opened_pin_path="pinClicked($event)"
          />
        </div>
      </template>
    </template>
  </FilterableListLayout>
</template>

<script>
import FilterableListLayout from "@/components/FilterableListLayout.vue";
import FoldersList from "@/components/FoldersList.vue";

export default {
  props: {
    folders: Array,
    pinned_folders: Array,
    path: String,
    can_edit: Boolean,
    folder_type: {
      type: String,
      default: "project", // 'project', 'author', 'publication', 'space'
    },
    pin_field_name: String,
    pin_label: String,
    empty_message: String,
    display_original_space: Boolean,
    available_view_modes: {
      type: Array,
      default: () => ["list", "medium", "map", "tiny"],
    },
    default_view_mode: {
      type: String,
      default: "tiny",
    },
  },
  components: {
    FilterableListLayout,
    FoldersList,
    DisplayOnMap: () => import("@/adc-core/fields/DisplayOnMap.vue"),
  },
  data() {
    return {
      search_query: "",
      order_key: "$date_created",

      current_view_mode: this.default_view_mode, // 'list' or 'map' or 'medium'
      filter_by_group: "", // for authors
    };
  },
  created() {
    // this.current_view_mode =
    //   localStorage.getItem(this.view_mode_saved_key) || "medium";
  },
  watch: {
    current_view_mode(newVal) {
      if (newVal) localStorage.setItem(this.view_mode_saved_key, newVal);
    },
    search_query(newVal) {
      localStorage.setItem(this.search_query_saved_key, newVal);
    },
    order_key(newVal) {
      localStorage.setItem(this.order_key_saved_key, newVal);
    },
    filter_by_group(newVal) {
      localStorage.setItem(this.filter_by_group_saved_key, newVal);
    },
    folder_type: {
      immediate: true,
      handler() {
        if (this.folder_type === "author") {
          this.order_key = "alphabetical";
        }
        this.loadSettings();
      },
    },
  },
  computed: {
    view_mode_saved_key() {
      return "folders_view_mode_" + this.folder_type.toLowerCase();
    },
    search_query_saved_key() {
      return "folders_search_query_" + this.folder_type.toLowerCase();
    },
    order_key_saved_key() {
      return "folders_order_key_" + this.folder_type.toLowerCase();
    },
    filter_by_group_saved_key() {
      return "folders_filter_by_group_" + this.folder_type.toLowerCase();
    },
    view_mode() {
      // Return true if map view should be available
      // Check if any folder has location data could be an enhancement
      return true;
    },
    search_placeholder() {
      if (this.folder_type === "project")
        return this.$t("search_in_title_desc_kw");
      if (this.folder_type === "publication") return this.$t("search_in_title");
      return this.$t("search_by_name");
    },
    order_options() {
      return [
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
      ];
    },
    sorted_folders() {
      if (!this.folders) return [];
      return this.folders
        .slice()
        .filter((f) =>
          this.canLoggedinSeeFolder({
            folder: f,
          })
        )
        .sort((a, b) => {
          if (this.folder_type === "project") {
            if (a.$status !== "finished" && b.$status === "finished") return 1;
            if (a.$status === "finished" && b.$status !== "finished") return -1;
          }

          if (this.order_key === "$date_created")
            return +new Date(b.$date_created) - +new Date(a.$date_created);
          else if (this.order_key === "$date_modified")
            return +new Date(b.$date_modified) - +new Date(a.$date_modified);
          else if (this.order_key === "alphabetical") {
            const nameA = a.title || a.name || "";
            const nameB = b.title || b.name || "";
            return nameA.localeCompare(nameB);
          }
        });
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
    opened_event() {
      return this.$route.hash.substring(1) || false;
    },
    filtered_folders() {
      return this.sorted_folders.filter((f) => {
        // Common Search
        if (this.search_query) {
          if (this.folder_type === "project") {
            if (!this.searchInProject(f)) return false;
          } else if (this.folder_type === "publication") {
            if (!this.twoStringsSearch(f.title, this.search_query))
              return false;
          } else {
            if (!this.twoStringsSearch(f.name, this.search_query)) return false;
          }
        }

        // View Mode Filter
        if (this.current_view_mode === "map") {
          if (!f.$location || !f.$location.latitude) return false;
        }

        // Project Specific Filters
        if (this.folder_type === "project") {
          for (const af of this.active_filters) {
            const filter_type = af.filter_type;
            const value = af.value;

            if (filter_type === "authors") {
              const a = this.getAuthor(value);
              if (!a) return false;
              if (
                !f.$contributors?.includes(a.$path) &&
                !f.$admins?.includes(a.$path)
              )
                return false;
            } else {
              if (!Object.prototype.hasOwnProperty.call(f, filter_type))
                return false;
            }

            if (
              Array.isArray(f[filter_type]) &&
              !f[filter_type].includes(value)
            )
              return false;
            else if (
              typeof f[filter_type] === "string" &&
              f[filter_type] !== value
            )
              return false;
          }

          if (this.opened_event)
            if (this.opened_event !== f.event_linked_slug) return false;
        }

        // Author Specific Filters
        if (this.folder_type === "author") {
          if (this.filter_by_group)
            if (!f.group?.includes(this.filter_by_group)) return false;
        }

        return true;
      });
    },
    project_admins_and_contributors() {
      if (this.folder_type !== "project") return [];
      const admins = this.extractArr(this.filtered_folders, "$admins");
      const contributors = this.extractArr(
        this.filtered_folders,
        "$contributors"
      );

      return [...admins, ...contributors]
        .reduce((acc, a_path) => {
          const author = this.getAuthor(a_path);
          if (author && !acc.some((a) => a.$path === author.$path))
            acc.push(author);
          return acc;
        }, [])
        .sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
    },
    all_groups() {
      if (this.folder_type !== "author") return [];
      return this.sorted_folders
        .reduce((acc, m) => {
          m.group?.map((k) => {
            if (!acc.some((_k) => _k === k)) {
              if (k) acc.push(k);
            }
          });
          return acc;
        }, [])
        .sort((a, b) => {
          return a.localeCompare(b);
        });
    },
    map_pins() {
      const pin_color = "#142257";
      return this.filtered_folders.reduce((acc, f) => {
        if (f.$location) {
          const { latitude, longitude } = f.$location;
          if (latitude && longitude)
            acc.push({
              latitude,
              longitude,
              path: f.$path,
              label: f.title || f.name,
              color: pin_color,
              pin_preview: "text",
            });
        }
        return acc;
      }, []);
    },
    show_sidebar_toggle() {
      if (this.folder_type === "author") return this.all_groups.length > 0;
      if (this.folder_type === "publication" || this.folder_type === "space")
        return this.$slots.sidebar || false;
      return true;
    },
  },
  methods: {
    loadSettings() {
      this.current_view_mode =
        localStorage.getItem(this.view_mode_saved_key) ||
        this.default_view_mode;
      this.search_query =
        localStorage.getItem(this.search_query_saved_key) || "";

      const saved_order = localStorage.getItem(this.order_key_saved_key);
      if (saved_order) {
        this.order_key = saved_order;
      }

      this.filter_by_group =
        localStorage.getItem(this.filter_by_group_saved_key) || "";
    },
    extractAll(key) {
      return this.extractArr(this.filtered_folders, key);
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
      if (!this.active_filters) return [];
      return this.active_filters.reduce((acc, af) => {
        if (af.filter_type === type) acc.push(af.value);
        return acc;
      }, []);
    },
    toggleGroupFilter(val) {
      this.filter_by_group = val === this.filter_by_group ? "" : val;
    },
    searchInProject(project) {
      if (
        project.title &&
        this.twoStringsSearch(project.title, this.search_query)
      )
        return true;
      if (
        project.description &&
        this.twoStringsSearch(project.description, this.search_query)
      )
        return true;

      for (const kw of ["keywords", "machines", "materials"]) {
        if (
          project[kw] &&
          project[kw].some((kw) => this.twoStringsSearch(kw, this.search_query))
        )
          return true;
      }
      return false;
    },
    pinClicked(path) {
      const url = this.createURLFromPath(path);
      this.$router.push(url);
    },
  },
};
</script>

<style lang="scss" scoped>
._tagList {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 4);
  margin: calc(var(--spacing) / 1) 0;
}

._orderSelect {
  max-width: 22ch;
}

._searchField {
  width: 45ch;
}

._statusList {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 8);
}

._mode {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 4);
  align-items: center;
}

._topRightControls {
  display: flex;
  gap: calc(var(--spacing) / 2);
  align-items: center;
}

._mapContainer {
  width: 100%;
  aspect-ratio: 20 / 9;
  min-height: 70dvh;
  margin-top: calc(var(--spacing) / 1);
}
</style>
