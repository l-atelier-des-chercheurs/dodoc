<template>
  <div class="_authorsView">
    <h1 class="_title" v-text="$t('list_of_accounts')" />

    <div class="u-spacingBottom">
      {{
        $t("accounts_displayed", {
          count: filtered_authors.length,
          total: authors.length,
        })
      }}
    </div>

    <div class="_topRow">
      <div class="_searchField">
        <SearchInput
          v-model="search_author_name"
          :search_placeholder="$t('search_by_name')"
          :name="'search_author'"
        />
      </div>
      <div v-if="all_groups.length > 0">
        <TagsList
          :tags="all_groups"
          :tag_type="'accountgroup'"
          :tags_active="[filter_by_group]"
          @tagClick="toggleGroupFilter($event)"
        />

        <!-- <TagsField
          :label="$t('group')"
          :tag_type="'accountgroup'"
          :content="all_groups"
          :can_edit="false"
        /> -->
      </div>

      <div class="_mode">
        <button
          class="u-button u-button_icon u-button_transparent"
          type="button"
          :class="{
            'is--active': view_mode === 'list',
          }"
          @click="view_mode = 'list'"
        >
          <svg
            viewBox="0 0 16 16"
            width="1em"
            height="1em"
            focusable="false"
            role="img"
            aria-label="person vcard"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi-person-vcard mx-auto b-icon bi"
            data-v-41be6633=""
          >
            <g data-v-41be6633="">
              <path
                d="M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4m4-2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5M9 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 9 8m1 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5"
              ></path>
              <path
                d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8.96q.04-.245.04-.5C9 10.567 7.21 9 5 9c-2.086 0-3.8 1.398-3.984 3.181A1 1 0 0 1 1 12z"
              ></path>
            </g>
          </svg>
        </button>
        <button
          class="u-button u-button_icon u-button_transparent"
          type="button"
          :class="{
            'is--active': view_mode === 'map',
          }"
          @click="view_mode = 'map'"
        >
          <b-icon icon="map-fill" />
        </button>
      </div>
    </div>

    <div
      class="_currentlyConnected"
      v-if="$api.other_devices_connected.length >= 1"
    >
      <DetailsPane
        :header="$t('other_devices_connected')"
        :icon="'people'"
        :has_items="$api.other_devices_connected.length"
      >
        <div
          v-for="(device, index) in $api.other_devices_connected"
          :key="device.id"
          class="u-spacingBottom"
        >
          <hr v-if="index !== 0" />
          <div>
            <AuthorTag
              v-if="device.meta.token_path"
              :path="device.meta.token_path"
            />
            <span v-else>{{ $t("not_logged_in") }}</span>
          </div>
          <!-- <div>{{ device.meta.user_agent }}</div> -->
          <DLabel :str="$t('opened_page')" />
          <router-link
            v-if="device.meta.path"
            :to="{ path: createURLFromPath(device.meta.path) }"
            class="u-buttonLink"
          >
            {{ $t("open") }}
          </router-link>
        </div>
      </DetailsPane>
    </div>

    <div v-if="filtered_authors.length === 0" class="u-instructions">
      {{ $t("no_accounts_to_show") }}
    </div>

    <template v-else>
      <transition-group
        v-if="view_mode === 'list'"
        tag="section"
        class="_allAuthors"
        name="listComplete"
        appear
      >
        <div v-for="author in filtered_authors" :key="author.$path">
          <AuthorCard :author="author" />
        </div>
      </transition-group>
      <div v-if="view_mode === 'map'" class="_mapContainer">
        <DisplayOnMap
          :pins="pins"
          :map_baselayer_opacity="0.5"
          :map_baselayer_bw="true"
          :is_small="false"
          @update:opened_pin_path="pinClicked($event)"
        />
      </div>
    </template>
  </div>
</template>
<script>
import AuthorCard from "@/adc-core/author/AuthorCard.vue";
import DynamicTitle from "@/mixins/DynamicTitle.js";

export default {
  props: {},
  mixins: [DynamicTitle],
  components: {
    AuthorCard,
    DisplayOnMap: () => import("@/adc-core/fields/DisplayOnMap.vue"),
  },
  data() {
    return {
      path: "authors",
      authors: [],
      search_author_name: "",
      filter_by_group: "",

      view_mode: "list",
    };
  },
  created() {},
  async mounted() {
    // Set the authors page title
    this.updateDocumentTitle(this.$t("list_of_accounts"));

    this.$api.updateSelfPath(this.path);
    this.authors = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    pins() {
      // return [
      //   {
      //     longitude: 5.39,
      //     latitude: 43.31,
      //   },
      //   {
      //     longitude: 5.29,
      //     latitude: 43.21,
      //   },
      //   {
      //     longitude: 5.19,
      //     latitude: 43.11,
      //   },
      // ];
      const pin_color = "#142257";

      return this.filtered_authors.reduce((acc, a) => {
        if (a.$location) {
          const { latitude, longitude } = a.$location;
          if (latitude && longitude)
            acc.push({
              latitude,
              longitude,
              path: a.$path,
              label: a.name,
              color: pin_color,
              pin_preview: "text",
            });
        }
        return acc;
      }, []);
    },
    sorted_authors() {
      return this.authors.slice().sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    },
    filtered_authors() {
      return this.sorted_authors.filter((a) => {
        if (this.search_author_name)
          if (!this.twoStringsSearch(a.name, this.search_author_name))
            return false;

        if (this.filter_by_group)
          if (!a.group?.includes(this.filter_by_group)) return false;

        if (this.view_mode === "map") if (!a.$location) return false;

        return true;
      });
    },
    all_groups() {
      return this.sorted_authors
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
  },
  methods: {
    toggleGroupFilter(val) {
      this.filter_by_group = val === this.filter_by_group ? "" : val;
    },
    pinClicked(path) {
      const url = this.createURLFromPath(path);
      this.$router.push(url);
    },
  },
};
</script>
<style lang="scss" scoped>
._backBtn {
  display: flex;
  margin-bottom: calc(var(--spacing) * 1);
}
._authorsView {
  // padding: calc(var(--spacing) * 1);
  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: calc(var(--spacing) * 2) auto calc(var(--spacing) * 4);
}

._currentlyConnected {
  max-width: 400px;
  margin-bottom: calc(var(--spacing) * 1);
}
._allAuthors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: calc(var(--spacing) / 1);

  > * {
    // for listComplete
    z-index: 1;
  }
}
._title {
  margin-top: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 1);
}

._searchField {
  max-width: 30ch;
}

._topRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  gap: calc(var(--spacing) / 1);
  margin-bottom: calc(var(--spacing) / 1);
}

._mode {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 4);
  align-items: center;
}

._mapContainer {
  width: 100%;
  aspect-ratio: 20 / 9;
  min-height: 70dvh;
  margin-top: calc(var(--spacing) / 1);
}
</style>
