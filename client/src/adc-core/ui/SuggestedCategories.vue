<template>
  <div>
    <template v-if="!opened_category_path">
      <div>
        <div
          v-for="category in categories"
          :key="category.$path"
          class="_categoryRow"
          :style="categoryStyles(category)"
        >
          <div class="_title">
            <strong>{{ category.title }}</strong> ({{
              getCatSuggLength(category)
            }})
          </div>
          <button
            type="button"
            class="u-buttonLink"
            @click="openCategory(category.$path)"
            v-text="$t('open')"
          />
        </div>
      </div>

      <button
        type="button"
        class="u-buttonLink"
        v-if="missing_suggested_categories.length > 0"
        :class="{
          'is--active': show_create_category,
        }"
        @click="show_create_category = !show_create_category"
      >
        {{ $t("add_category") }}
      </button>

      <form class="input-validation-required" v-if="show_create_category">
        <fieldset>
          <legend class="u-label">
            {{ $t("create_suggestion_list_for") }}
          </legend>
          <div class="u-sameRow">
            <button
              type="button"
              v-for="cat in missing_suggested_categories"
              :key="cat.key"
              class="u-button u-button_bleuvert"
              @click="createCategory(cat)"
            >
              {{ cat.label }}
            </button>
          </div>
          <!-- <button
            slot="footer"
            class="u-button u-button_bleuvert"
            :disabled="new_category_title.length === 0"
            type="submit"
          >
            {{ $t("create") }}
          </button> -->
        </fieldset>
      </form>
    </template>
    <template v-else>
      <SingleCategory
        :path="opened_category_path"
        @close="opened_category_path = false"
      />
    </template>
  </div>
</template>
<script>
import SingleCategory from "@/adc-core/ui/SingleCategory.vue";

export default {
  props: {},
  components: {
    SingleCategory,
  },
  data() {
    return {
      categories: undefined,
      show_create_category: false,

      opened_category_path: false,

      suggestion_list_cat: [
        {
          key: "machines",
          label: this.$t("machines"),
        },
        {
          key: "materials",
          label: this.$t("materials"),
        },
        {
          key: "keywords",
          label: this.$t("keywords"),
        },
        {
          key: "accountgroup",
          label: this.$t("account_group"),
        },
      ],

      path: "categories",
    };
  },
  created() {},
  async mounted() {
    this.categories = await this.$api
      .getFolders({
        path: this.path,
      })
      .catch((err) => {
        this.fetch_categories_error = err.response;
        return;
      });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    missing_suggested_categories() {
      return this.suggestion_list_cat.filter((c) => {
        return !this.categories?.some((_c) => _c.$path.endsWith("/" + c.key));
      });
    },
  },
  methods: {
    async createCategory(cat) {
      const slug = await this.$api.createFolder({
        path: this.path,
        additional_meta: {
          title: cat.label,
          requested_slug: cat.key,
          $status: "public",
        },
      });
      this.openCategory(this.path + "/" + slug);
    },
    getCatSuggLength(cat) {
      return cat.list_of_suggestions?.length || 0;
    },
    openCategory(path) {
      this.opened_category_path = path;
    },
    categoryStyles(category) {
      if (category.tag_color)
        return `
        --cat-color: ${category.tag_color}
      `;
      return "";
    },
  },
};
</script>
<style lang="scss" scoped>
._categoryRow {
  display: flex;
  justify-content: space-between;
  align-content: center;
  // border-bottom: 2px solid var(--c-gris);
  padding: calc(var(--spacing) / 8) 0;
}

._title {
  background: var(--cat-color, #ffffff);
}
</style>
