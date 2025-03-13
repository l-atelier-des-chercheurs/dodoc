<template>
  <div class="_authorsView">
    <div class="_backBtn">
      <router-link :to="'/'" class="u-buttonLink">
        <b-icon icon="arrow-left-short" />
        {{ $t("home") }}
      </router-link>
    </div>

    <h1 class="_title" v-text="$t('list_of_accounts')" />

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
    </div>

    <div
      class="_currentlyConnected"
      v-if="$api.all_devices_connected.length > 1"
    >
      <DetailsPane
        :header="$t('devices_connected')"
        :icon="'people'"
        :has_items="$api.all_devices_connected.length"
      >
        <div
          v-for="device in $api.all_devices_connected"
          :key="device.id"
          class="u-spacingBottom"
        >
          <!-- <hr /> -->
          <div>
            <AuthorTag
              v-if="device.meta.token_path"
              :path="device.meta.token_path"
            />
            <span v-else>{{ $t("not_logged_in") }}</span>
          </div>
          <div>{{ device.meta.user_agent }}</div>
          <div>{{ device.meta.path }}</div>
        </div>
      </DetailsPane>
    </div>

    <transition-group
      tag="section"
      class="_allAuthors"
      name="listComplete"
      appear
    >
      <div v-for="author in filtered_authors" :key="author.$path">
        <AuthorCard :author="author" :links_to_author_page="true" />
      </div>
    </transition-group>
    <div v-if="filtered_authors.length === 0">
      {{ $t("no_accounts_to_show") }}
    </div>
  </div>
</template>
<script>
import AuthorCard from "@/adc-core/author/AuthorCard.vue";

export default {
  props: {},
  components: {
    AuthorCard,
  },
  data() {
    return {
      path: "authors",
      authors: [],
      search_author_name: "",
      filter_by_group: "",
    };
  },
  created() {},
  async mounted() {
    this.$api.updateSelfPath(this.path);
    this.authors = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
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
  },
};
</script>
<style lang="scss" scoped>
._backBtn {
  display: flex;
  margin-bottom: calc(var(--spacing) * 1);
}
._authorsView {
  padding: calc(var(--spacing) * 1);
  max-width: calc(var(--max-column-width));
  margin: 0 auto;
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
  margin-bottom: calc(var(--spacing) * 1);
}

._searchField {
  max-width: 30ch;
}

._topRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: calc(var(--spacing) / 1);
  margin-bottom: calc(var(--spacing) / 1);
}
</style>
