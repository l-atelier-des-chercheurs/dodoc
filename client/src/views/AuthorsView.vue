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

    <div class="u-spacingBottom" v-if="all_devices_connected.length > 1">
      <div>
        {{
          $tc("devices_connected", all_devices_connected.length, {
            count: all_devices_connected.length,
          })
        }}
      </div>
    </div>

    <transition-group
      tag="section"
      class="_allAuthors"
      name="listComplete"
      appear
    >
      <AuthorCard
        v-for="author in filtered_authors"
        :key="author.$path"
        :author="author"
        :links_to_author_page="true"
      />
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
    this.authors = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    all_devices_connected() {
      return this.$api.users || [];
    },
    accounts_logged_in() {
      return this.all_devices_connected.filter((u) => u.meta?.token_path);
    },
    logged_in_devices() {
      const all_users_paths = this.$api.users.reduce((acc, u) => {
        if (u.meta?.token_path) acc.push(u.meta.token_path);
        return acc;
      }, []);
      return [...new Set(all_users_paths)];
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
