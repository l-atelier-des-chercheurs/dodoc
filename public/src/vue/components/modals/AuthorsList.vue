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

  watch: {},
  computed: {
    sorted_authors() {
      let sorted_authors = Object.values(this.authors).sort((a, b) =>
        a.name.localeCompare(b.name)
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
      return sorted_authors;
    },
  },
  methods: {},
};
</script>
<style></style>
