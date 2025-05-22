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

    <table class="u-spacingBottom _list">
      <transition-group tag="tbody" name="projectsList" appear>
        <tr
          v-for="collection in filtered_collections"
          :key="collection.$path"
          @click="$emit('open', getFilename(collection.$path))"
        >
          <td>
            <strong>{{ collection.title }}</strong> –
            <i>{{
              $t(collection.template || "story_with_sections").toLowerCase()
            }}</i>
          </td>
          <td>
            <div class="u-sameRow">
              <AuthorTag
                v-for="(atpath, index) in collection.$admins"
                :key="atpath + '_' + index"
                :path="atpath"
                :show_image_only="true"
              />
            </div>
          </td>
        </tr>
      </transition-group>
    </table>
  </div>
  <!-- </BaseModal2> -->
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
      },
      en: {
        collections: "Collections",
        create_a_collection: "Create a collection",
        search_in_titles: "Search in titles",
        collection_instr: "Collections group multiple medias",
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
    openNewCollection(new_folder_slug) {
      this.show_create_collection = false;
      this.$emit("open", new_folder_slug);
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

table,
th,
td {
  border: 2px solid var(--h-100);
  border-collapse: collapse;
}

._list {
  width: 100%;
  // background: var(--c-gris);
  // padding: 1px;

  tr {
    padding: calc(var(--spacing) / 2);
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background-color: var(--h-100);
    }

    // background: white;
  }

  tr:nth-child(2n) {
    // background-color: var(--c-gris);
  }
  tr:nth-child(2n + 1) {
    // background-color: var(--c-gris_clair);
  }
  tr > td:last-child {
    width: 100px;
    padding: 0;
  }

  td {
    padding: calc(var(--spacing) / 2);
    // pointer-events: none;
  }
}
</style>
