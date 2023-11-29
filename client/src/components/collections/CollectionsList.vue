<template>
  <!-- <BaseModal2 :title="$t('collections')" :size="'full'" @close="$emit('close')"> -->
  <div class="_cont">
    <div class="u-instructions u-spacingBottom">
      {{ $t("coll_instr") }}
    </div>

    <div class="_collectionsList">
      <div class="">
        <button
          type="button"
          class="u-button u-button_black"
          @click="show_create_coll = true"
        >
          <b-icon icon="plus-circle" />&nbsp;
          {{ $t("create_a_collection") }}
        </button>
        <CreateFolder
          v-if="show_create_coll"
          :modal_name="$t('create_a_collection')"
          :path="'collections'"
          :default_folder_status="'private'"
          @close="show_create_coll = false"
          @openNew="openNewCollection"
        />
      </div>
      <div v-for="collection in collections" :key="collection.$path">
        <button
          type="button"
          class="u-buttonLink"
          @click="openCollection({ path: collection.$path })"
        >
          {{ collection.title }}
        </button>
      </div>
    </div>

    <transition name="slideup" mode="out-in">
      <div
        class="_openedCollectionPane"
        v-if="opened_collection"
        :key="opened_collection.$path"
      >
        <OpenedCollection
          :collection="opened_collection"
          @close="closeCollection"
        />
      </div>
    </transition>
  </div>
  <!-- </BaseModal2> -->
</template>
<script>
import OpenedCollection from "@/components/collections/OpenedCollection.vue";

export default {
  props: {},
  components: {
    OpenedCollection,
  },
  data() {
    return {
      show_create_coll: false,
      collections: [],
      path: "collections",
    };
  },
  i18n: {
    messages: {
      fr: {
        collections: "Collections",
        create_a_collection: "Créer une collection",
        coll_instr:
          "Les collections permettent de sélectionner des piles dans l’espace partagé pour les réunir et les partager.",
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
    opened_collection_slug() {
      return this.$route.query?.collection;
    },
    opened_collection() {
      return this.collections.find(
        (c) => this.getFilename(c.$path) === this.opened_collection_slug
      );
    },
  },
  methods: {
    openNewCollection(new_folder_slug) {
      this.show_create_coll = false;
      this.openCollection({ slug: new_folder_slug });
    },
    openCollection({ slug, path }) {
      if (path) slug = this.getFilename(path);

      let query = this.$route.query
        ? JSON.parse(JSON.stringify(this.$route.query))
        : {};

      query.collection = slug;

      this.$router.push({ query });
    },
    closeCollection() {
      this.$router.push("/");
    },
  },
};
</script>
<style lang="scss" scoped>
._collections {
}
._cont {
  padding: calc(var(--spacing) / 1);
}

._collectionsList {
  // display: grid;
  // grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
  overflow: auto;

  > * {
    aspect-ratio: 1;
    flex: 0 0 150px;

    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--c-gris_clair);
  }
}

._openedCollectionPane {
  position: absolute;
  top: 0;
  left: 0;
  background: white;
  height: 100%;
  width: 100%;
  padding: calc(var(--spacing) / 1);
}
</style>
