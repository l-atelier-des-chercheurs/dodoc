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
            {{ category.title }}
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
        :class="{
          'is--active': show_create_category,
        }"
        @click="show_create_category = !show_create_category"
      >
        {{ $t("add_category") }}
      </button>

      <form
        class="input-validation-required"
        v-if="show_create_category"
        @submit.prevent="createCategory"
      >
        <fieldset>
          <legend class="u-label">{{ $t("add_category") }}</legend>

          <TextInput
            class="u-spacingBottom"
            :content.sync="new_category_title"
            :label_str="'category_name'"
            :required="true"
            :input_type="'text'"
          />
          <div class="u-instructions">
            <small> Tout en majuscule </small>
          </div>

          <button
            slot="footer"
            class="u-button u-button_bleuvert"
            :disabled="new_category_title.length === 0"
            type="submit"
          >
            {{ $t("create") }}
          </button>
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

      new_category_title: "",

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
  computed: {},
  methods: {
    async createCategory() {
      const slug = await this.$api.createFolder({
        path: this.path,
        additional_meta: {
          title: this.new_category_title.toUpperCase(),
          requested_slug: this.new_category_title,
          $status: "public",
        },
      });
      this.openCategory(this.path + "/" + slug);
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
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: 4px;
  background: var(--cat-color, #ffffff);
  color: #000;
}
</style>
