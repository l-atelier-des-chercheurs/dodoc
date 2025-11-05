<template>
  <TwoColumnLayout :show-sidebar.sync="show_create_bar">
    <template #sidebar>
      <h3 class="_dashboard--label">{{ $t("publications") }}</h3>
      <div class="u-spacingBottom" />
      <div class="u-instructions u-spacingBottom">
        {{ $t("publication_instr") }}
      </div>

      <hr />

      <div class="_createActions">
        <h3 class="_createActions_label" v-text="$t('create_a_publication')" />

        <button
          class="u-button u-button_outline _createAction"
          @click="show_create_collection = 'story_with_sections'"
        >
          <b-icon icon="plus-circle" />
          <span v-text="$t('new_story')"></span>
          <img :src="$root.publicPath + 'picto_luma/story.svg'" alt="story" />
        </button>
        <button
          class="u-button u-button_outline _createAction"
          @click="show_create_collection = 'edition'"
        >
          <b-icon icon="plus-circle" />
          <span v-text="$t('new_booklet')"></span>
          <img
            :src="$root.publicPath + 'picto_luma/edition.svg'"
            alt="booklet"
          />
        </button>
        <button
          class="u-button u-button_outline _createAction"
          @click="show_create_collection = 'agora'"
        >
          <b-icon icon="plus-circle" />
          <span v-text="$t('new_agora')"></span>
          <img :src="$root.publicPath + 'picto_luma/agora.svg'" alt="agora" />
        </button>
      </div>

      <CreateCollection
        v-if="show_create_collection"
        :modal_name="$t('create_a_publication')"
        :path="'publications'"
        :default_folder_status="'private'"
        :selected_template="show_create_collection"
        @close="show_create_collection = false"
        @openNew="openNewCollection"
      />
    </template>

    <template #content nopadding="true">
      <div class="_content">
        <div class="u-spacingBottom _actions">
          <RadioSwitch
            v-if="connected_as"
            class="_switch"
            :content.sync="show_publications_from"
            :options="[
              { label: $t('all_publications'), value: 'all' },
              { label: $t('my_publications'), value: 'me' },
            ]"
          />
          <div class="_searchinput">
            <SearchInput2
              v-model="search_coll_name"
              :search_placeholder="$t('search_in_titles')"
            />
          </div>
        </div>

        <div class="u-spacingBottom" />

        <PinnedNonpinnedFolder
          v-if="!is_loading"
          class="_pinnedPublications"
          :field_name="'publications_pinned'"
          :label="$t('publications_pinned')"
          :content="settings.publications_pinned"
          :path="''"
          :folders="filtered_collections"
          :can_edit="is_instance_admin"
          v-slot="slotProps"
        >
          <PublicationPreview :publication="slotProps.item" />
        </PinnedNonpinnedFolder>
        <!-- <div class="_collections">
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
      </div>-->
      </div>
    </template>
  </TwoColumnLayout>
</template>
<script>
import TwoColumnLayout from "@/adc-core/ui/TwoColumnLayout.vue";
import CreateCollection from "@/components/collections/CreateCollection.vue";
import SearchInput2 from "@/components/SearchInput2.vue";
import PinnedNonpinnedFolder from "@/adc-core/ui/PinnedNonpinnedFolder.vue";
import PublicationPreview from "@/components/collections/PublicationPreview.vue";

export default {
  props: {},
  components: {
    TwoColumnLayout,
    SearchInput2,
    CreateCollection,
    PinnedNonpinnedFolder,
    PublicationPreview,
  },
  data() {
    return {
      settings: undefined,
      show_create_bar: false,
      is_loading: true,
      show_create_collection: false,
      collections: [],
      path: "publications",
      search_coll_name: "",
      show_publications_from: "all",
    };
  },
  i18n: {
    messages: {
      fr: {
        publications: "Publications",
        new_story: "Nouveau rapport",
        search_in_titles: "Rechercher dans les titres",
        publication_instr:
          "Les publications regroupent des médias dans l'espace partagé pour les partager.",
        agora: "Agora",
        all_publications: "Toutes les publications",
        my_publications: "Mes publications",
        new_agora: "Nouvel écran",
        new_booklet: "Nouveau livret",
      },
      en: {
        publications: "Publications",
        new_story: "New report",
        search_in_titles: "Search in titles",
        publication_instr:
          "Publications include multiple medias to be shared together.",
        agora: "Agora",
        all_publications: "All publications",
        my_publications: "My publications",
        new_agora: "New screen",
        new_booklet: "New booklet",
      },
    },
  },
  async created() {
    await this.loadSettings();
    this.collections = await this.$api.getFolders({
      path: this.path,
    });
    this.is_loading = false;
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
        if (
          this.search_coll_name &&
          !this.twoStringsSearch(c.title, this.search_coll_name)
        )
          return false;
        if (this.show_publications_from === "me") {
          if (!c.$admins.includes(this.connected_as.$path)) return false;
        }
        return true;
      });
    },
  },
  methods: {
    async loadSettings() {
      this.settings = await this.$api
        .getFolder({
          path: "",
        })
        .catch((err) => {
          return err;
        });
      this.$api.join({ room: "." });
    },
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
._createActions {
  margin-top: calc(var(--spacing) * 1);

  .u-button {
    // width: 100%;
    // justify-content: center;
    // align-items: center;
    // gap: calc(var(--spacing) / 2);
  }
}
._createAction {
  margin: calc(var(--spacing) / 1) 0;
  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1);
  border-color: var(--c-gris);
  border-radius: calc(var(--spacing) / 2);
  width: 100%;
  font-size: var(--sl-font-size-large);
  background-color: var(--c-blanc);
  color: var(--c-text);

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: stretch;
  gap: calc(var(--spacing) / 1);

  .bi {
    flex: 0 0 auto;
    color: var(--active-color);
    margin-right: 0;
  }

  > span {
    flex: 1 1 auto;
    text-align: left;
  }

  > img {
    flex: 0 0 auto;
    // width: 64px;
    // height: 64px;
  }

  &:hover,
  &:active {
    background-color: var(--r-100);
    border-color: var(--r-500);
  }
}

._actions {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(var(--item-width, 320px), 1fr)
  );
  gap: calc(var(--spacing) / 1);
  align-items: center;
  justify-content: space-between;
  margin-bottom: calc(var(--spacing) * 1);

  ._switch {
    grid-column: 1 / 3;
  }

  ._searchinput {
    // grid-column: 2 / 3;
    // grid-row: 1 / 2;
    // max-width: 400px;
  }
}

._switch {
  // margin-bottom: calc(var(--spacing) * 1);
  --item-width: 100%;
  --radio-switch-width: 100%;

  ::v-deep .radio-switch {
    width: 100%;
    border: 0px;
    font-size: var(--sl-font-size-small);
    --radio-switch-width: 100%;
    --radio-switch-height: 41px;
    --radio-switch-padding: 0px;
  }
}

._pinnedPublications {
  ::v-deep ._pinSpace {
    left: auto;
    right: 0;
  }
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

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
}

._collection {
  border: 1px solid var(--border-color);
  border-radius: var(--card-radius);
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: flex-start;
  padding: calc(var(--spacing) * 1);
  gap: calc(var(--spacing) / 2);
  text-decoration: none;
  min-height: 100px;
  background: var(--c-blanc);
  box-shadow: var(--card-shadow);
  transition: all 0.15s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  h3 {
    margin: 0;
    font-size: var(--sl-font-size-large);
    color: var(--c-text);
  }

  > div:first-child {
    flex: 1 1 0;
  }
}

._collection_type {
  font-size: var(--sl-font-size-small);
  color: var(--c-text-secondary);
  margin-top: calc(var(--spacing) / 4);
}

.u-listOfAvatars {
  padding: 0;
  flex: 0 0 auto;
}

._content {
  overflow: auto;
  padding: calc(var(--spacing) * 2);
  height: 100%;
}
</style>
