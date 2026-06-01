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

        <div
          class="_currentlyConnected"
          v-if="$api.other_devices_connected.length >= 1"
        >
          <DetailsPane
            :header="$t('other_devices_connected')"
            :icon="'people'"
            :has_items="$api.other_devices_connected.length"
          >
            <div
              v-for="(device, index) in $api.other_devices_connected"
              :key="device.id"
              class="u-spacingBottom"
            >
              <hr v-if="index !== 0" />
              <div>
                <AuthorTag
                  v-if="device.meta.token_path"
                  :path="device.meta.token_path"
                />
                <span v-else>{{ $t("not_logged_in") }}</span>
              </div>
              <DLabel :str="$t('opened_page')" />
              <router-link
                v-if="device.meta.path"
                :to="{ path: createURLFromPath(device.meta.path) }"
                class="u-buttonLink"
              >
                {{ $t("open") }}
              </router-link>
            </div>
          </DetailsPane>
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

._currentlyConnected {
  max-width: 400px;
  margin-bottom: calc(var(--spacing) * 1);
}

._title {
  margin-top: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 1);
}
</style>
