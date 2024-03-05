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
      <CreateFolder
        v-if="show_create_collection"
        :modal_name="$t('create_a_collection')"
        :path="'collections'"
        :default_folder_status="'private'"
        @close="show_create_collection = false"
        @openNew="openNewCollection"
      />
    </div>

    <table class="_list">
      <!-- <thead>
    <tr>
      <th colspan="2">The table header</th>
    </tr>
  </thead> -->
      <tbody>
        <tr
          v-for="collection in sorted_collections"
          :key="collection.$path"
          @click="$emit('open', getFilename(collection.$path))"
        >
          <td>
            <h3>{{ collection.title }}</h3>
          </td>
          <td>
            <div class="u-sameRow">
              <AuthorTag
                v-for="atpath in collection.$admins"
                :key="atpath"
                :path="atpath"
                :show_image_only="false"
                :mode="'link'"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- </BaseModal2> -->
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      show_create_collection: false,
      collections: [],
      path: "collections",
    };
  },
  i18n: {
    messages: {
      fr: {
        collections: "Collections",
        create_a_collection: "Créer une collection",
        collection_instr:
          "Les collections regroupent des médias dans l’espace partagé pour les partager.",
      },
      en: {
        collections: "Collections",
        create_a_collection: "Create a collection",
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
      return this.collections.slice().sort((a, b) => {
        return a.title.localeCompare(b.title);
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
._list {
  width: 100%;
  // background: var(--c-gris);
  // padding: 1px;

  tr {
    padding: calc(var(--spacing) / 2);
    background: white;
  }

  tr:nth-child(2n) {
    // background-color: var(--c-gris);
  }
  tr:nth-child(2n + 1) {
    // background-color: var(--c-gris_clair);
  }
  tr > td:last-child {
    text-align: right;
  }

  td {
    padding: calc(var(--spacing) / 4);
  }
}
</style>
