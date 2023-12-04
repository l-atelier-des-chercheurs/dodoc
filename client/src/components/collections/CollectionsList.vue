<template>
  <!-- <BaseModal2 :title="$t('collections')" :size="'full'" @close="$emit('close')"> -->
  <div class="_cont">
    <div class="u-instructions">
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
          @click="$emit('toggleCollection', getFilename(collection.$path))"
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
          :files="opened_collection_items"
          @openFile="$emit('openFile', $event)"
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
  props: {
    shared_folder: Object,
    shared_files: Array,
    opened_collection_slug: String,
  },
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

    this.$eventHub.$on("collection.addStack", this.addToStack);
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.path });

    this.$eventHub.$off("collection.addStack", this.addToStack);
  },
  watch: {},
  computed: {
    opened_collection() {
      return this.collections.find(
        (c) => this.getFilename(c.$path) === this.opened_collection_slug
      );
    },
    opened_collection_items() {
      if (!this.opened_collection?.stacks_list) return [];
      return this.opened_collection.stacks_list.reduce((acc, path) => {
        const item = this.shared_files.find((f) => f.$path === path);
        if (item) acc.push(item);
        return acc;
      }, []);
    },
  },
  methods: {
    openNewCollection(new_folder_slug) {
      this.show_create_coll = false;
      this.$emit("toggleCollection", new_folder_slug);
    },
    closeCollection() {
      this.$emit("toggleCollection", undefined);
    },
    addToStack(stack_path) {
      const items_paths = this.opened_collection_items.map((i) => i.$path);
      items_paths.push(stack_path);
      this.updateOpenedCollection({ stacks_list: items_paths });
    },
    async updateOpenedCollection(new_meta) {
      await this.$api.updateMeta({
        path: this.opened_collection.$path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._collections {
}
._cont {
  // padding: calc(var(--spacing) / 1);
}

._collectionsList {
  // display: grid;
  // grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 1);
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
  border-top: 2px solid var(--c-gris);
  padding: calc(var(--spacing) / 1);
}
</style>
