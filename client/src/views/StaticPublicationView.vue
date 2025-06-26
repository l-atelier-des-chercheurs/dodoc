<template>
  <div
    class="_collectionView"
    :class="{
      'is--serversidepreview': is_serversidepreview,
    }"
  >
    <transition name="fade_fast" mode="out-in">
      <div class="u-divCentered" v-if="$root.is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else-if="fetch_collection_error" class="u-divCentered">
        {{ fetch_collection_error }}
      </div>
      <div v-else key="collection" ref="fsContainer">
        <div
          v-if="
            !collection.template ||
            collection.template === 'story_with_sections'
          "
        >
          <SectionWithPrint :publication="collection" />
        </div>
        <AgoraExport
          v-else-if="collection.template === 'agora'"
          :publication="collection"
        />
        <EditionExport
          v-else-if="collection.template === 'edition'"
          :publication="collection"
        />
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {},
  components: {
    SectionWithPrint: () =>
      import("@/components/publications/story/SectionWithPrint.vue"),
    AgoraExport: () =>
      import("@/components/publications/agora/AgoraExport.vue"),
    EditionExport: () =>
      import("@/components/publications/edition/EditionExport.vue"),
    // MapForPrint: () =>
    //   import("@/components/publications/cartography/MapForPrint.vue"),
  },
  data() {
    return {
      collection: null,
      fetch_collection_error: null,

      is_fullscreen: false,
      is_serversidepreview: false,
    };
  },
  i18n: {
    messages: {
      fr: {
        fetch_collection_error: "Erreur lors du fetch de la collection",
        collection_is_not_public:
          "Cette collection n'est pas publique, veuillez cocher la case qui s'affiche dans la fenêtre de partage.",
      },
    },
  },

  created() {
    console.log("Loading collectionView");
  },
  async mounted() {
    if (this.$route.query?.make_preview === "true")
      this.is_serversidepreview = true;

    let superadmintoken = undefined;
    if (this.$route.query?.sat) superadmintoken = this.$route.query.sat;

    this.collection = await this.$api
      .getPublicFolder({
        path: this.collection_path,
        superadmintoken,
      })
      .catch((err) => {
        if (err.code === "folder_not_public")
          this.fetch_collection_error = this.$t("collection_is_not_public");
        else this.fetch_collection_error = this.$t("fetch_collection_error");
        this.$root.is_loading = false;
      });

    // not pushing changes to presentation for performance reasons – though this could be useful at some point?
    // this.$api.join({ room: this.project.$path });
    // this.$api.join({ room: this.collection_path });

    this.$root.is_loading = false;
  },
  beforeDestroy() {
    // this.$api.leave({ room: this.project.$path });
    // this.$api.leave({ room: this.collection_path });
  },
  watch: {
    is_fullscreen() {
      // this.$nextTick(() => {
      // this.fitZoomToPage();
      // });
    },
  },
  computed: {
    collection_path() {
      return `collections/${this.$route.params.document_slug}`;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._collectionView {
  background: white;
  min-height: 100%;
}
</style>
