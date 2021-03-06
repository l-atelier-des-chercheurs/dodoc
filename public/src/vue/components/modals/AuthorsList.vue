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
          <div class="_searchField">
            <button
              type="button"
              class="button-nostyle text-uc label button-triangle"
              :class="{ 'is--active': show_authors_search }"
              @click="show_authors_search = !show_authors_search"
            >
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

          <template v-if="Object.keys(sorted_authors).length > 0">
            <template v-for="author in sorted_authors">
              <Author
                :author="author"
                :key="author.slugFolderName"
                @close="$emit('close')"
              />
            </template>
          </template>
        </transition-group>
      </div>
    </template>
  </Modal>
</template>
<script>
import Author from "./../subcomponents/Author.vue";
import CreateAuthor from "./../subcomponents/CreateAuthor.vue";

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
    sorted_authors() {
      let sorted_authors = Object.values(this.authors).sort((a, b) =>
        a.name && b.name ? a.name.localeCompare(b.name) : false
      );

      // move current author to top
      if (this.$root.current_author) {
        sorted_authors.some(
          (item, idx) =>
            item.slugFolderName === this.$root.current_author.slugFolderName &&
            sorted_authors.unshift(
              // remove the found item, in-place (by index with splice),
              // returns an array of a single item removed
              sorted_authors.splice(idx, 1)[0]
            )
        );
      }

      if (this.author_name_filter) {
        sorted_authors = sorted_authors.filter((a) =>
          a.name.toLowerCase().includes(this.author_name_filter.toLowerCase())
        );
      }

      return sorted_authors;
    },
  },
  methods: {},
};
</script>
<style scoped lang="scss">
._searchField {
  max-width: 340px;
}
</style>
