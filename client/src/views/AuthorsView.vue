<template>
  <div class="_authorsView">
    <h1 class="_title" v-text="$t('list_of_accounts')" />

    <FoldersListWithFilter
      ref="foldersList"
      :folders="authors"
      :folder_type="'author'"
      :path="path"
      :can_edit="false"
      :empty_message="$t('no_accounts_to_show')"
      :available_view_modes="['list', 'medium', 'map']"
      :default_view_mode="'medium'"
    >
      <template #list-header>
        <div class="u-spacingBottom">
          {{
            $t("accounts_displayed", {
              count: filtered_authors_count,
              total: authors.length,
            })
          }}
        </div>
      </template>

      <template #item="{ item }">
        <div class="_authorItem">
          <AuthorCard :author="item" />
        </div>
      </template>
    </FoldersListWithFilter>
  </div>
</template>
<script>
import AuthorCard from "@/adc-core/author/AuthorCard.vue";
import DynamicTitle from "@/mixins/DynamicTitle.js";
import FoldersListWithFilter from "@/components/FoldersListWithFilter.vue";

export default {
  props: {},
  mixins: [DynamicTitle],
  components: {
    AuthorCard,
    FoldersListWithFilter,
  },
  data() {
    return {
      path: "authors",
      authors: [],
    };
  },
  created() {},
  async mounted() {
    // Set the authors page title
    this.updateDocumentTitle(this.$t("list_of_accounts"));

    this.$api.updateSelfPath(this.path);
    this.authors = await this.$api.getFolders({
      path: this.path,
    });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    // Helper to get count from child component if needed,
    // but here we might just show total authors or filtered if we can access it.
    // Since filtered count is inside FoldersListWithFilter, we might need to slot it
    // or just show total. For now, showing total or simplifying the message.
    // Alternatively, we can use a ref to access the filtered count if really needed.
    // Let's assume for now we show total or the filter component handles the count display.
    // Actually, looking at the design, the count is displayed above.
    // We can access filtered count via ref or just show total for now.
    filtered_authors_count() {
      if (this.$refs.foldersList && this.$refs.foldersList.filtered_folders) {
        return this.$refs.foldersList.filtered_folders.length;
      }
      return this.authors.length;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._authorsView {
  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: calc(var(--spacing) * 2) auto calc(var(--spacing) * 4);
}

._title {
  margin-top: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 1);
}
</style>
