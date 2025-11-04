<template>
  <div class="_sharedFolder">
    <div class="_topBar" v-if="false">
      <label class="u-label _corpusLabel">
        {{ $t("Corpus") }}
      </label>
      <TitleField
        v-if="folder"
        :field_name="'title'"
        :label="$t('corpus_title')"
        :show_label="false"
        :tag="'b'"
        :content="folder.title || $t('untitled')"
        :path="folder.$path"
        :required="true"
        :maxlength="30"
        :can_edit="can_edit"
      />
      <button
        type="button"
        class="u-button u-button_white u-button_icon u-button_small"
        @click="show_corpus_menu = !show_corpus_menu"
      >
        <b-icon icon="three-dots" />
        <!-- {{ $t("previous") }} -->
      </button>
    </div>

    <CorpusMenu
      v-if="show_corpus_menu"
      :current_corpus_path="shared_folder_path"
      :can_edit="false"
      @changeCorpus="$emit('changeCorpus', $event)"
      @close="show_corpus_menu = false"
    />

    <transition name="slideup" mode="out-in">
      <StackDisplay
        v-if="opened_stack"
        class="_stackModal"
        :key="opened_stack.$path"
        :stack_path="opened_stack.$path"
        :context="'archive'"
        :can_be_added_to_fav="can_be_added_to_fav"
        :can_be_selected="select_mode"
        :is_favorite="isFavorite(opened_stack.$path)"
        :read_only="read_only"
        @toggleFav="toggleFav(opened_stack.$path)"
        @prevMedia="navMedia(-1)"
        @nextMedia="navMedia(+1)"
        @selectStack="$emit('selectStack', opened_stack)"
        @selectMedias="$emit('selectMedias', $event)"
        @close="closeStack"
      />
    </transition>

    <transition name="fade_fast" mode="out-in">
      <div class="_loader" v-if="is_loading_folder">
        <LoaderSpinner />
      </div>
      <div v-else class="_sharedFolder--content">
        <FilterBar
          :group_mode.sync="group_mode"
          :sort_order.sync="sort_order"
          :search_str.sync="search_str"
          :filetype_filter.sync="filetype_filter"
          :author_path_filter.sync="author_path_filter"
          :available_keywords="valid_keywords"
          :keywords_filter.sync="keywords_filter"
          :fav_filter.sync="fav_filter"
          :view_mode.sync="view_mode"
          :stack_preview_width.sync="stack_preview_width"
        >
          <template #top>
            <DLabel :str="$t('corpus visibles')" />
            <div v-for="folder in all_folders" :key="folder.$path">
              <div class="_corpusItem">
                <input
                  checkbox
                  type="checkbox"
                  :id="folder.$path"
                  checked
                  :value="folder.$path"
                  @change="changeCorpus(folder.$path)"
                />
                <label :for="folder.$path">{{
                  folder.title || $t("untitled")
                }}</label>
              </div>
            </div>
            <div class="u-spacingBottom" />
            <hr />
          </template>
        </FilterBar>

        <!-- <hr /> -->

        <transition name="pagechange" mode="out-in">
          <transition-group
            tag="div"
            name="projectsList"
            class="_stacksList"
            appear
            :key="sort_order + '-' + group_mode"
          >
            <div
              v-if="grouped_stacks.length === 0"
              class="u-instructions _noContent"
              :key="'nocontent'"
            >
              {{ $t("no_content") }}
            </div>
            <template v-else>
              <template v-if="view_mode === 'list'">
                <div
                  class="_dayFileSection"
                  v-for="{ label, files: stacks } in grouped_stacks"
                  :key="label"
                >
                  <div class="_label">
                    {{ label }}
                  </div>
                  <transition-group
                    tag="div"
                    class="_itemGrid"
                    name="listComplete"
                    :style="{
                      '--stack_preview_width': `${stack_preview_width}px`,
                    }"
                    appear
                  >
                    <StackPreview
                      v-for="stack in stacks"
                      :key="stack.$path"
                      :stack="stack"
                      :display="stack_preview_width < 120 ? 'compact' : ''"
                      :is_selected="stack.$path === last_selected_stack_path"
                      :can_be_added_to_fav="can_be_added_to_fav"
                      :is_favorite="isFavorite(stack.$path)"
                      @toggleFav="toggleFav(stack.$path)"
                      @openStack="openStack"
                    />
                  </transition-group>
                </div>
              </template>
              <div
                v-else-if="view_mode === 'map'"
                key="mediaMap"
                class="_mediamapContainer"
              >
                <MediaMap
                  :medias="filtered_stacks"
                  @toggleMediaFocus="toggleMediaFocus"
                />
              </div>
            </template>
          </transition-group>
        </transition>
      </div>
    </transition>
  </div>
</template>
<script>
import FilterBar from "@/components/archive/FilterBar.vue";
import StackPreview from "@/components/archive/StackPreview.vue";
import StackDisplay from "@/components/StackDisplay.vue";
import CorpusMenu from "@/components/archive/CorpusMenu.vue";

export default {
  props: {
    shared_folder_path: String,
    select_mode: {
      type: [Boolean, String],
      default: false,
    },
    read_only: Boolean,
  },
  components: {
    FilterBar,
    StackPreview,
    StackDisplay,
    CorpusMenu,
    MediaMap: () => import("@/adc-core/ui/MediaMap.vue"),
  },
  data() {
    return {
      folder: undefined,
      all_folders: [],
      all_stacks: [],

      show_corpus_menu: false,

      is_loading_folder: true,
      show_admin_settings: false,

      last_selected_stack_path: undefined,
      view_mode: "list",

      sort_order: localStorage.getItem("archive.sort_order") || "date_modified",

      search_str: "",
      filetype_filter: "all",
      author_path_filter: "",
      keywords_filter: [],
      group_mode: "year",

      fav_filter: false,

      selected_medias_paths: [],

      stack_preview_width: 120,
    };
  },
  i18n: {
    messages: {
      fr: {
        corpus_title: "Titre du corpus",
      },
      en: {
        corpus_title: "Corpus title",
      },
    },
  },
  async created() {},
  async mounted() {
    await this.checkExistingFolder();

    localStorage.setItem("last_opened_folder_path", this.shared_folder_path);

    this.folder = await this.$api.getFolder({
      path: this.shared_folder_path,
    });
    this.$api.join({ room: this.shared_folder_path });

    this.all_stacks = await this.$api.getFolders({
      path: this.stack_shared_folder_path,
    });
    this.$api.join({ room: this.stack_shared_folder_path });
    this.is_loading_folder = false;
  },
  beforeDestroy() {
    this.$api.leave({ room: this.stack_shared_folder_path });
  },
  watch: {
    opened_stack() {
      if (this.opened_stack) {
        this.last_selected_stack_path = this.opened_stack.$path;
      }
    },
    sort_order() {
      localStorage.setItem("archive.sort_order", this.sort_order);
    },
  },
  computed: {
    can_edit() {
      return this.canLoggedinEditFolder({ folder: this.folder });
    },
    stack_shared_folder_path() {
      return this.shared_folder_path + "/stacks";
    },
    can_be_added_to_fav() {
      return (
        this.connected_as &&
        this.connected_as?.$path !== undefined &&
        !this.read_only
      );
    },
    sorted_stacks() {
      return this.all_stacks
        .slice()
        .sort(
          (a, b) => +new Date(b.$date_modified) - +new Date(a.$date_modified)
        );
    },
    stacks_without_keyword_filter() {
      // Stacks filtered by all filters except keyword filter
      // Used to compute which keywords would result in 0 results
      return this.sorted_stacks.filter((f) => {
        if (this.fav_filter) if (!this.isFavorite(f.$path)) return false;

        if (this.author_path_filter)
          if (!f.$authors?.includes(this.author_path_filter)) return false;

        if (this.search_str) {
          if (
            (f.title &&
              f.title.toLowerCase().includes(this.search_str.toLowerCase())) ||
            (f.description &&
              f.description
                .toLowerCase()
                .includes(this.search_str.toLowerCase()))
          )
            return true;
          else return false;
        }

        return true;
      });
    },
    filtered_stacks() {
      return this.sorted_stacks.filter((f) => {
        if (this.fav_filter) if (!this.isFavorite(f.$path)) return false;

        if (this.author_path_filter)
          if (!f.$authors?.includes(this.author_path_filter)) return false;

        if (this.keywords_filter.length > 0) {
          // Inclusion logic: show only stacks that have ALL selected keywords (AND logic)
          if (!f.keywords || !Array.isArray(f.keywords)) return false;
          if (!this.keywords_filter.every((kwf) => f.keywords.includes(kwf)))
            return false;
        }
        // if (this.filetype_filter !== "all")
        //   if (!this.fileOrStackContainsType(f, this.filetype_filter))
        //     return false;

        if (this.search_str) {
          if (
            (f.title &&
              f.title.toLowerCase().includes(this.search_str.toLowerCase())) ||
            (f.description &&
              f.description
                .toLowerCase()
                .includes(this.search_str.toLowerCase()))
          )
            return true;
          else return false;
        }

        return true;
      });
    },
    grouped_stacks() {
      let order_props = ["$date_modified"];
      if (this.sort_order === "date_created")
        order_props = [
          "date_created_corrected",
          "$date_created",
          "$date_uploaded",
        ];
      else if (this.sort_order === "date_modified")
        order_props = ["$date_modified"];
      return this.groupFilesBy(
        this.filtered_stacks,
        order_props,
        this.group_mode
      );
    },
    timeline_stacks() {
      let order_props = [
        "date_created_corrected",
        "$date_created",
        "$date_uploaded",
      ];
      return this.groupFilesBy(this.filtered_stacks, order_props, "day");
    },
    available_keywords() {
      // Use sorted_stacks instead of filtered_stacks so all keywords remain visible
      // even when some are excluded from the view
      const all_kw = this.sorted_stacks.reduce((acc, f) => {
        if (f.keywords && Array.isArray(f.keywords)) {
          f.keywords.map((kw) => {
            const item = acc.find((_kw) => _kw.title === kw);
            if (item) item.count += 1;
            else acc.push({ title: kw, count: 1 });
          });
        }
        return acc;
      }, []);
      return all_kw.sort((a, b) => {
        return b.count - a.count;
      });
    },
    valid_keywords() {
      // Filter out keywords that would result in 0 results when combined with current selection
      return this.available_keywords.filter((kw) => {
        // If keyword is already selected, always show it
        if (this.keywords_filter.includes(kw.title)) return true;

        // Combine current selection with this keyword
        const test_keywords = [...this.keywords_filter, kw.title];

        // Check if any stack has ALL of these keywords
        return this.stacks_without_keyword_filter.some((stack) => {
          if (!stack.keywords || !Array.isArray(stack.keywords)) return false;
          return test_keywords.every((kwf) => stack.keywords.includes(kwf));
        });
      });
    },
    opened_stack() {
      if (!this.$route.query?.stack) return false;
      return this.all_stacks.find(
        (s) => this.getFilename(s.$path) === this.$route.query.stack
      );
    },
  },
  methods: {
    async checkExistingFolder() {
      // first load all folders
      this.all_folders = await this.$api.getFolders({ path: "folders" });

      if (this.shared_folder_path) {
        const matching_folder = this.all_folders.find(
          (f) => f.$path === this.shared_folder_path
        );
        if (matching_folder) {
          return;
        } else {
          // folder doesnt exist
        }
      }

      // then check locals
      const last_opened_folder_path = localStorage.getItem(
        "last_opened_folder_path"
      );
      if (last_opened_folder_path) {
        const matching_folder = this.all_folders.find(
          (f) => f.$path === last_opened_folder_path
        );
        if (matching_folder?.$path) {
          this.$emit("changeCorpus", matching_folder.$path);
          return;
        }
      }

      if (this.all_folders.length > 0) {
        this.$emit("changeCorpus", this.all_folders[0].$path);
      }
    },
    toggleMediaFocus(path) {
      const slug = this.getFilename(path);
      this.openStack(slug);
    },
    openStack(stack_slug) {
      let query = Object.assign({}, this.$route.query) || {};
      query.stack = stack_slug;
      this.$router.push({ query });
    },
    isFavorite(stack_path) {
      if (
        !this.connected_as?.favorites ||
        this.connected_as.favorites.length === 0
      )
        return false;
      return this.connected_as.favorites.some(
        (f) => f.stack_path === stack_path
      );
    },
    async toggleFav(stack_path) {
      let favorites = this.connected_as?.favorites
        ? this.connected_as.favorites.slice()
        : [];

      if (this.isFavorite(stack_path))
        favorites = favorites.filter((f) => f.stack_path !== stack_path);
      else
        favorites.push({
          stack_path,
          added: +new Date(),
        });

      await this.$api.updateMeta({
        path: this.connected_as.$path,
        new_meta: {
          favorites,
        },
      });
    },
    closeStack() {
      let query = Object.assign({}, this.$route.query) || {};
      delete query.stack;
      this.$router.push({ query });
    },
  },
};
</script>
<style lang="scss" scoped>
._sharedFolder {
  position: relative;
  height: 100%;
  overflow: hidden;

  display: flex;
  flex-flow: column nowrap;

  > ._topBar {
    flex: 0 0 auto;
  }

  > ._sharedFolder--content {
    flex: 1 1 0;
  }
}

._sharedFolder--content {
  position: relative;
  overflow: auto;

  display: flex;
  flex-flow: row nowrap;

  ._filterBar {
    position: sticky;
    top: 0;
    height: 100%;
    overflow: auto;
    flex: 0 0 320px;
  }

  @include scrollbar(3px, 4px, 4px, transparent, var(--c-noir));
}

._dayFileSection {
  margin: 0 calc(var(--spacing) / 1);
}

._itemGrid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(var(--stack_preview_width, 120px), 1fr)
  );
  // gap: calc(var(--spacing) / 2);
}

._stacksList {
  width: 100%;
}

._label {
  position: sticky;
  top: 0;
  z-index: 10;
  font-weight: 600;
  padding: calc(var(--spacing) / 4);
  margin-top: calc(var(--spacing) / 2);
  background-color: var(--body-bg);
}

._stackModal {
  --sd-separator: var(--h-200);
  --sd-textcolor: var(--h-900);
  --sd-bg: var(--body-bg);
}

._footer {
  text-align: center;
  margin: calc(var(--spacing) * 2) auto;
}

._loader {
  position: relative;
  min-height: 80vh;
}

._mediamapContainer {
  width: 100%;
  height: 100%;
}

._noContent {
  margin: calc(var(--spacing) / 1);
}
._topBar {
  background: var(--h-100);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
  border-bottom: 1px solid var(--h-200);

  :deep(._content) {
    margin-right: 0;
  }
}

._corpusLabel {
  margin-bottom: 0;
}
._corpusItem {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}
</style>
