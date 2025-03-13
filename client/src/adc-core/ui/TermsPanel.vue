<template>
  <div>
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <div v-else>
      <div class="u-instructions">
        <p class="u-spacingBottom">{{ $t("terms_confidentiality_infos") }}</p>
        <p class="u-spacingBottom">{{ $t("cookies_info") }}</p>
      </div>

      <fieldset v-for="page in ['terms', 'confidentiality']" :key="page">
        <legend>{{ $t(page) }}</legend>
        <!-- <div class="u-spacingBottom">
          <h3>{{ $t(page) }}</h3>
        </div> -->
        <template v-if="!getPage(page)">
          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="createPage(page)"
          >
            {{ $t("create_this_page") }}
          </button>
        </template>
        <template v-else>
          <div class="u-spacingBottom" v-if="page === 'terms'">
            <ToggleField
              :label="$t('users_must_accept_terms_to_signup')"
              :field_name="'users_must_accept_terms_to_signup'"
              :content="settings.users_must_accept_terms_to_signup === true"
              :path="settings.$path"
              :can_edit="true"
            />
          </div>
          <div class="u-spacingBottom" v-if="page === 'terms'">
            <ToggleField
              :label="$t('terms_confidentiality_in_footer')"
              :field_name="'terms_in_footer'"
              :content="settings.terms_in_footer === true"
              :path="settings.$path"
              :can_edit="true"
            />
          </div>
          <div class="u-spacingBottom" v-else-if="page === 'confidentiality'">
            <ToggleField
              :label="$t('terms_confidentiality_in_footer')"
              :field_name="'confidentiality_in_footer'"
              :content="settings.confidentiality_in_footer === true"
              :path="settings.$path"
              :can_edit="true"
            />
          </div>
          <router-link
            :to="createURLFromPath(getPage(page).$path)"
            @click.native="$emit('close')"
            class="u-buttonLink"
          >
            <template v-if="page === 'terms'">
              {{ $t("open_terms_page") }}
            </template>
            <template v-else>
              {{ $t("open_confidentiality_page") }}
            </template>
          </router-link>
        </template>
      </fieldset>
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
  computed: {},
  methods: {
    async createPage(type = "terms") {
      const page_slug = await this.$api.createFolder({
        path: this.path,
        additional_meta: {
          title: this.$t(type),
          requested_slug: type,
          $status: "public",
        },
      });
      this.show_create_page = false;
      page_slug;
      // this.openFontItem(this.path + "/" + page_slug);
    },
    getPage(page) {
      return this.pages?.find((p) => p.$path === `pages/${page}`);
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

fieldset + fieldset {
  margin-top: calc(var(--spacing) / 1);
}
</style>
