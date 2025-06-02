<template>
  <div class="_spacesList">
    <div class="_filterSortBar">
      <div class="_filterSortBar--leftSide">
        <button
          type="button"
          class="u-button u-button_red u-button_small"
          v-if="is_instance_admin || is_instance_contributor"
          @click="show_create_modal = true"
        >
          <b-icon icon="plus" :label="$t('create')" />
          {{ $t("create") }}
        </button>
        <div class="_searchField" v-if="sorted_spaces.length > 0">
          <SearchInput
            v-model="search_space"
            :search_placeholder="$t('search_by_title_or_subtitle')"
            :name="'search_space'"
          />
        </div>
      </div>
      <div class="">
        <!-- <DLabel :str="$t('sort')" /> -->
        <select
          size="small"
          class="_orderSelect"
          aria-label="$t('sort')"
          name="order_spaces"
          v-model="order_key"
          :disabled="filtered_spaces.length <= 1"
        >
          <option
            v-for="opt in order_options"
            :key="opt.key"
            :value="opt.key"
            v-text="opt.text"
          />
        </select>
      </div>
    </div>

    <CreateFolder
      v-if="show_create_modal"
      :type_of_folder="'space'"
      :path="'spaces'"
      @close="show_create_modal = false"
      @openNew="openNewSpace"
    />

    <PinnedNonpinnedFolder
      v-if="!is_loading"
      :field_name="'spaces_pinned'"
      :label="$t('spaces_pinned')"
      :content="settings.spaces_pinned"
      :path="''"
      :folders="filtered_spaces"
      :can_edit="is_instance_admin"
      v-slot="slotProps"
    >
      <SpacePresentation
        :space="slotProps.item"
        :context="'list'"
        :can_edit="false"
      />
    </PinnedNonpinnedFolder>

    <button
      type="button"
      class="u-buttonLink"
      v-if="is_instance_admin"
      @click="show_bin_modal = true"
    >
      <b-icon icon="recycle" />
      {{ $t("bin") }}
    </button>
    <BinFolder
      v-if="show_bin_modal"
      :modal_title="$t('restore_spaces')"
      :path="'.'"
      :subfolders_type="'spaces'"
      @close="show_bin_modal = false"
    />
  </div>
</template>
<script>
import PinnedNonpinnedFolder from "@/adc-core/ui/PinnedNonpinnedFolder.vue";
import SpacePresentation from "@/components/space/SpacePresentation.vue";
import BinFolder from "@/adc-core/fields/BinFolder.vue";

export default {
  props: {},
  components: {
    PinnedNonpinnedFolder,
    SpacePresentation,
    BinFolder,
  },
  data() {
    return {
      settings: undefined,
      spaces: undefined,
      path: "spaces",
      fetch_spaces_error: undefined,
      show_create_modal: false,
      is_loading: true,

      order_key: "$date_created",
      order_options: [
        {
          key: "$date_created",
          text: this.$t("date_created"),
        },
        {
          key: "$date_modified",
          text: this.$t("date_modified"),
        },
        {
          key: "alphabetical",
          text: this.$t("alphabetical"),
        },
      ],

      search_space: "",
      show_bin_modal: false,
    };
  },
  created() {},
  async mounted() {
    this.settings = await this.$api
      .getFolder({
        path: "",
      })
      .catch((err) => {
        return err;
      });
    this.$api.join({ room: "." });

    this.spaces = await this.$api
      .getFolders({
        path: this.path,
      })
      .catch((err) => {
        this.fetch_spaces_error = err.response;
        return;
      });
    this.$api.join({ room: this.path });

    this.is_loading = false;
  },
  beforeDestroy() {
    this.$api.leave({ room: "." });
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    sorted_spaces() {
      if (!this.spaces) return [];
      return this.spaces
        .slice()
        .filter((s) =>
          this.canLoggedinSeeFolder({
            folder: s,
          })
        )
        .sort((a, b) => {
          if (this.order_key === "$date_created")
            return +new Date(b.$date_created) - +new Date(a.$date_created);
          else if (this.order_key === "$date_modified")
            return +new Date(b.$date_modified) - +new Date(a.$date_modified);
          else if (this.order_key === "alphabetical")
            return a.title.localeCompare(b.title);
        });
    },
    filtered_spaces() {
      return this.sorted_spaces.filter((s) => {
        if (this.search_space && !this.searchInSpace(s)) return false;
        return true;
      });
    },
  },
  methods: {
    getSlug(path) {
      return path.split("/").at(-1);
    },
    openNewSpace(new_folder_slug) {
      this.show_create_modal = false;
      const url = this.createURLFromPath(this.path + "/" + new_folder_slug);
      this.$router.push(url);
    },
    searchInSpace(space) {
      if (space.title && this.twoStringsSearch(space.title, this.search_space))
        return true;
      if (
        space.subtitle &&
        this.twoStringsSearch(space.subtitle, this.search_space)
      )
        return true;
      return false;
    },
  },
};
</script>
<style lang="scss" scoped>
._spacesList {
  --item-width: 400px;

  width: 100%;
  min-height: 60vh;
  // padding: calc(var(--spacing) * 1);
}

._createSearch {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-end;

  gap: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 2) 0;
  // margin-bottom: calc(var(--spacing) / 4);
}

._pinDropzone {
  border: 2px dotted var(--c-noir);
  border-radius: 10px;
  box-shadow: 0 1px 10px rgb(0 0 0 / 20%);
  padding: calc(var(--spacing) / 2);
}

._searchField {
  ::v-deep ._searchInput {
    // max-width: 35ch;
    width: 35ch;
  }
}

._filterSortBar {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}
._filterSortBar--leftSide {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}
</style>
