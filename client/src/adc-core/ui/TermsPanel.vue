<template>
  <div>
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <div v-else>
      <template v-if="!terms_page">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="createTermsPage"
        >
          {{ $t("create_terms_page") }}
        </button>
      </template>
      <template v-else>
        <div class="u-spacingBottom">
          <ToggleField
            :label="$t('users_must_accept_terms_to_signup')"
            :field_name="'users_must_accept_terms_to_signup'"
            :content="settings.users_must_accept_terms_to_signup === true"
            :path="settings.$path"
            :can_edit="true"
          />
        </div>
        <div class="u-spacingBottom">
          <ToggleField
            :label="$t('terms_in_footer')"
            :field_name="'terms_in_footer'"
            :content="settings.terms_in_footer === true"
            :path="settings.$path"
            :can_edit="true"
          />
        </div>

        <router-link
          :to="createURLFromPath(terms_page.$path)"
          @click.native="$emit('close')"
          class="u-buttonLink"
        >
          {{ $t("open_page") }}
        </router-link>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    settings: Object,
  },
  components: {},
  data() {
    return {
      pages: undefined,
      path: "pages",

      is_loading: true,
    };
  },
  created() {},
  async mounted() {
    this.pages = await this.$api
      .getFolders({
        path: this.path,
      })
      .catch((err) => {
        this.fetch_pages_error = err.response;
        return;
      });
    this.$api.join({ room: this.path });
    this.is_loading = false;
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    terms_page() {
      return this.pages?.find((p) => p.$path === "pages/terms");
    },
  },
  methods: {
    async createTermsPage() {
      const page_slug = await this.$api.createFolder({
        path: this.path,
        additional_meta: {
          title: this.$t("terms"),
          requested_slug: "terms",
          $status: "public",
        },
      });
      this.show_create_page = false;
      page_slug;
      // this.openFontItem(this.path + "/" + page_slug);
    },
  },
};
</script>
<style lang="scss" scoped>
._pagesList--page {
  display: flex;
  justify-content: space-between;
  align-content: center;
  border-bottom: 2px solid var(--c-gris);
  padding: calc(var(--spacing) / 2) 0;
}
</style>
