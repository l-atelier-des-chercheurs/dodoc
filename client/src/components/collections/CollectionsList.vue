<template>
  <div class="_collectionsList">
    <div class="u-spacingBottom u-instructions">
      {{ $t("publication_instr") }}
    </div>
    <div class="u-spacingBottom _actions">
      <button
        type="button"
        class="u-button"
        @click="show_create_collection = true"
      >
        <b-icon icon="plus-circle" />&nbsp;
        {{ $t("create_a_publication") }}
      </button>
      <CreateCollection
        v-if="show_create_collection"
        :modal_name="$t('create_a_publication')"
        :path="'publications'"
        :default_folder_status="'private'"
        @close="show_create_collection = false"
        @openNew="openNewCollection"
      />
      <div class="_searchinput">
        <SearchInput2
          v-model="search_coll_name"
          :search_placeholder="$t('search_in_titles')"
        />
      </div>
    </div>

    <RadioSwitch
      class="_switch"
      :content.sync="show_my_publications"
      :options="[
        { label: $t('all_publications'), value: false },
        { label: $t('my_publications'), value: true },
      ]"
    />
    <div class="u-spacingBottom" />

    <div class="_collections">
      <div
        v-if="filtered_collections.length === 0"
        class="u-instructions"
        :key="'nopublis'"
      >
        {{ $t("no_publications") }}
      </div>
      <router-link
        v-for="collection in filtered_collections"
        :key="collection.$path"
        class="_collection"
        :to="getURLToFolder(collection.$path)"
      >
        <div>
          {{ formatDate(collection.$date_created) }}
          <h3>{{ collection.title }}</h3>
          <div class="_collection_type">
            {{ $t(collection.template || "story") }}
          </div>
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
      path: "publications",
      search_coll_name: "",
      show_my_publications: false,
    };
  },
  i18n: {
    messages: {
      fr: {
        publications: "Publications",
        create_a_publication: "Créer une publication",
        search_in_titles: "Rechercher dans les titres",
        publication_instr:
          "Les publications regroupent des médias dans l’espace partagé pour les partager.",
        agora: "Agora",
      },
      en: {
        publications: "Publications",
        create_a_publication: "Create a publication",
        search_in_titles: "Search in titles",
        publication_instr:
          "Publications include multiple medias to be shared together.",
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
          return a.$date_created.localeCompare(b.$date_created);
        })
        .reverse();
    },
    filtered_collections() {
      return this.sorted_collections.filter((c) => {
        if (this.search_coll_name)
          return this.twoStringsSearch(c.title, this.search_coll_name);
        if (this.show_my_publications)
          return c.$admins.includes(this.$user.path);
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

._actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: calc(var(--spacing) / 1);

  @media (max-width: 600px) {
    display: block;

    > * {
      margin-bottom: calc(var(--spacing) / 1);
    }
  }

  > * {
    flex: 1 1 0;
    overflow: hidden;

    &._searchinput {
      grid-column: 2 / 4;
    }
  }
}

._searchinput {
  // max-width: 40ch;
  // width: 100%;
  margin-bottom: 0;
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
  align-items: flex-start;
  padding: calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 2);
  text-decoration: none;
  min-height: 100px;

  h3 {
    margin: 0;
    font-size: var(--sl-font-size-large);
  }
}

._collection_type {
  font-size: var(--sl-font-size-small);
}

.u-listOfAvatars {
  padding: 0;
}
</style>
