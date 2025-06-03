<template>
  <div class="_collectionsList">
    <div class="u-spacingBottom u-instructions">
      {{ $t("collection_instr") }}
    </div>
    <div class="u-spacingBottom">
      <button
        type="button"
        class="u-button"
        @click="show_create_collection = true"
      >
        <b-icon icon="plus-circle" />&nbsp;
        {{ $t("create_a_collection") }}
      </button>
      <CreateCollection
        v-if="show_create_collection"
        :modal_name="$t('create_a_collection')"
        :path="'collections'"
        :default_folder_status="'private'"
        @close="show_create_collection = false"
        @openNew="openNewCollection"
      />
    </div>

    <div class="u-spacingBottom _searchinput">
      <SearchInput2
        v-model="search_coll_name"
        :search_placeholder="$t('search_in_titles')"
      />
    </div>

    <div class="_collections">
      <div
        v-if="filtered_collections.length === 0"
        class="u-instructions"
        :key="'nopublis'"
      >
        {{ $t("no_collections") }}
      </div>
      <router-link
        v-for="collection in filtered_collections"
        :key="collection.$path"
        class="_collection"
        :to="getURLToFolder(collection.$path)"
      >
        <h3>{{ collection.title }}</h3>
        <div class="_collection_type">
          {{ $t(collection.template || "story").toLowerCase() }}
        </div>
        <div v-if="Array.isArray(collection.$admins)" class="u-listOfAvatars">
          <AuthorTag
            v-for="(atpath, index) in collection.$admins"
            :key="atpath + '_' + index"
            :path="atpath"
            :show_image_only="true"
          />
        </div>
      </router-link>
    </div>
  </div>
</template>
<script>
import CreateCollection from "@/components/collections/CreateCollection.vue";
import SearchInput2 from "@/components/SearchInput2.vue";

export default {
  props: {},
  components: {
    SearchInput2,
    CreateCollection,
  },
  data() {
    return {
      show_create_collection: false,
      collections: [],
      path: "collections",
      search_coll_name: "",
    };
  },
  i18n: {
    messages: {
      fr: {
        collections: "Collections",
        create_a_collection: "Créer une collection",
        search_in_titles: "Rechercher dans les titres",
        collection_instr:
          "Les collections regroupent des médias dans l’espace partagé pour les partager.",
        agora: "Agora",
      },
      en: {
        collections: "Collections",
        create_a_collection: "Create a collection",
        search_in_titles: "Search in titles",
        collection_instr: "Collections group multiple medias",
        agora: "Agora",
      },
    },
  },
  async created() {
    this.collections = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    can_edit() {
      return this.canLoggedinEditFolder({ folder: this.stack });
    },
    sorted_collections() {
      return this.collections
        .slice()
        .filter((s) =>
          this.canLoggedinSeeFolder({
            folder: s,
          })
        )
        .sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
    },
    filtered_collections() {
      return this.sorted_collections.filter((c) => {
        if (this.search_coll_name)
          return this.twoStringsSearch(c.title, this.search_coll_name);
        return true;
      });
    },
  },
  methods: {
    openNewCollection(new_publication_slug) {
      this.show_create_collection = false;
      this.$emit("open", new_publication_slug);
    },
    getURLToFolder(path) {
      const publication_slug = path.split("/").at(-1);
      return `/publish/${publication_slug}`;
    },
  },
};
</script>
<style lang="scss" scoped>
._collectionsList {
  > * {
  }
}

._searchinput {
  max-width: 30ch;
}

._collections {
  width: 100%;
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 1);
  align-items: stretch;
  grid-template-columns: repeat(
    auto-fill,
    minmax(var(--item-width, 320px), 1fr)
  );
}

._collection {
  border: 1px solid var(--h-100);
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  padding: calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 2);
  text-decoration: none;

  h3 {
    margin: 0;
  }
}

._collection_type {
  font-size: var(--sl-font-size-small);
}

.u-listOfAvatars {
  padding: 0;
}
</style>
