<template>
  <Modal
    ref="modal"
    @close="$emit('close')"
    :typeOfModal="'LargeAndScroll'"
    :prevent_close="prevent_close"
    :is_loading="is_loading"
  >
    <template slot="header">
      <span class>{{ $t("authors_list") }}</span>
    </template>

    <template slot="preview">
      <div class>
        <div class="margin-sides-medium margin-vert-small">
          <div
            v-if="
              $root.state.local_options.force_login && !$root.current_author
            "
          >
            <strong>{{ $t("login_to_access") }}</strong>
          </div>

          <small>{{
            $t("when_logged_as_author_content_will_be_tagged")
          }}</small>
          <button
            v-if="!show_detail"
            type="button"
            class="buttonLink margin-left-none padding-left-none"
            @click="show_detail = !show_detail"
          >
            + {{ $t("more_informations") }}
          </button>
          <div>
            <small v-if="show_detail">{{
              $t("more_informations_on_authors")
            }}</small>
          </div>

          <hr />

          <TagsAndAuthorFilters
            :allKeywords="authorsKeywords"
            :keywordFilter="author_keyword_filter"
            @setKeywordFilter="toggleKeywordFilter($event)"
            class="padding-none"
          />

          <div class="_searchField">
            <button
              type="button"
              class="button-nostyle text-uc label button-triangle"
              :class="{ 'is--active': show_authors_search }"
              @click="show_authors_search = !show_authors_search"
            >
              <svg
                class="inline-svg"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width="96.2px"
                height="96.2px"
                viewBox="0 0 96.2 96.2"
                style="margin-bottom: -2px"
                xml:space="preserve"
              >
                <path
                  fill="currentColor"
                  class="st0"
                  d="M10.3,59.9c11.7,11.7,29.5,13.4,43,5.2l9.7,9.7l21.3,21.3l11.9-11.9L74.9,63l-9.7-9.7c8.2-13.5,6.4-31.3-5.2-43 C46.2-3.4,24-3.4,10.3,10.3C-3.4,24-3.4,46.2,10.3,59.9z M50.8,19.5c8.6,8.6,8.6,22.6,0,31.3c-8.6,8.6-22.6,8.6-31.3,0 c-8.6-8.6-8.6-22.6,0-31.3C28.1,10.8,42.1,10.8,50.8,19.5z"
                />
              </svg>
              {{ $t("author_name_to_find") }}
            </button>

            <div class="input-group" v-if="show_authors_search">
              <input
                type="text"
                class=""
                autofocus="autofocus"
                ref="searchField"
                v-model="debounce_search_author_name"
              />
              <span
                class="input-addon"
                v-if="debounce_search_author_name.length > 0"
              >
                <button
                  type="button"
                  :disabled="debounce_search_author_name.length === 0"
                  @click="debounce_search_author_name = ''"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>

        <transition-group tag="div" class="m_authorsList" name="list-complete">
          <div class :key="'createAuthor'">
            <div class="m_authorsList--createAuthor">
              <button
                type="button"
                @click="openCreateAuthorPanel = true"
                v-if="openCreateAuthorPanel == false"
                class="m_authorsList--createAuthor--createButton bg-bleumarine"
              >
                {{ $t("create_an_author") }}
              </button>
              <CreateAuthor
                v-else
                @close="openCreateAuthorPanel = false"
                :read_only="read_only"
              />
            </div>
          </div>

          <template v-for="author in filtered_authors">
            <Author
              :author="author"
              :key="author.slugFolderName"
              @close="$emit('close')"
            />
          </template>
        </transition-group>
      </div>
    </template>
  </Modal>
</template>
<script>
import Author from "./../subcomponents/Author.vue";
import CreateAuthor from "./../subcomponents/CreateAuthor.vue";
import TagsAndAuthorFilters from "../../components/subcomponents/TagsAndAuthorFilters.vue";

export default {
  props: {
    authors: {
      type: Object,
      default: {},
    },
    prevent_close: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    Author,
    CreateAuthor,
    TagsAndAuthorFilters,
  },
  data() {
    return {
      openCreateAuthorPanel: false,
      editAuthorSlug: false,
      show_detail: false,
      is_loading: false,

      show_authors_search: false,

      author_name_filter: "",
      debounce_search_author_name: "",
      debounce_search_author_name_function: undefined,

      author_keyword_filter: "",
    };
  },

  created() {},
  mounted() {
    this.is_loading = true;
    this.$socketio.listFolders({ type: "authors" });
    this.$eventHub.$once("socketio.authors.folders_listed", () => {
      this.is_loading = false;
    });
  },
  beforeDestroy() {},

  watch: {
    debounce_search_author_name: function () {
      if (this.debounce_search_author_name_function)
        clearTimeout(this.debounce_search_author_name_function);
      this.debounce_search_author_name_function = setTimeout(() => {
        this.author_name_filter = this.debounce_search_author_name;
      }, 340);
    },
    show_authors_search() {
      if (this.show_authors_search) {
        this.$nextTick(() => {
          this.$nextTick(() => {
            if (this.$refs.searchField) this.$refs.searchField.focus();
          });
        });
      }
    },
  },
  computed: {
    authorsKeywords: function () {
      return this.$root.getAllKeywordsFrom(this.authors);
    },

    sorted_authors() {
      return Object.values(this.authors).sort((a, b) =>
        a.name && b.name ? a.name.localeCompare(b.name) : false
      );
    },
    filtered_authors() {
      let filtered_authors = this.sorted_authors;

      // move current author to top
      if (this.$root.current_author) {
        filtered_authors.some(
          (item, idx) =>
            item.slugFolderName === this.$root.current_author.slugFolderName &&
            filtered_authors.unshift(
              // remove the found item, in-place (by index with splice),
              // returns an array of a single item removed
              filtered_authors.splice(idx, 1)[0]
            )
        );
      }

      if (this.author_name_filter) {
        filtered_authors = filtered_authors.filter((a) =>
          a.name.toLowerCase().includes(this.author_name_filter.toLowerCase())
        );
      }

      if (this.author_keyword_filter) {
        filtered_authors = filtered_authors.filter((a) => {
          return (
            a.hasOwnProperty("keywords") &&
            typeof a.keywords === "object" &&
            a.keywords.some((k) => k.title === this.author_keyword_filter)
          );
        });
      }

      return filtered_authors;
    },
  },
  methods: {
    toggleKeywordFilter(value) {
      this.author_keyword_filter =
        this.author_keyword_filter === value ? "" : value;
    },
  },
};
</script>
<style scoped lang="scss">
._searchField {
  max-width: 340px;
}
</style>
