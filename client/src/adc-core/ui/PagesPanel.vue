<template>
  <div>
    <div class="_pagesList">
      <div v-for="page in pages" :key="page.$path" class="_pagesList--page">
        <h3>
          {{ page.title }}
        </h3>
        <router-link
          :to="createURLFromPath(page.$path)"
          @click.native="$emit('close')"
          class="u-buttonLink"
        >
          {{ $t("open") }}
        </router-link>
      </div>
    </div>

    <br />

    <button
      type="button"
      class="u-button u-button_bleuvert"
      :class="{
        'is--active': show_create_page,
      }"
      @click="show_create_page = !show_create_page"
    >
      {{ $t("add") }}
    </button>

    <form
      class="input-validation-required"
      v-if="show_create_page"
      @submit.prevent="createPage"
    >
      <fieldset>
        <legend>{{ $t("create_page") }}</legend>

        <TextInput
          :content.sync="new_page_title"
          :label_str="'title'"
          :required="true"
          :input_type="'text'"
        />

        <br />
        <br />

        <button
          slot="footer"
          class="u-button u-button_bleuvert"
          :disabled="new_page_title.length === 0"
          type="submit"
        >
          {{ $t("create") }}
        </button>
      </fieldset>
    </form>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      pages: undefined,
      fetch_pages_error: undefined,
      show_create_page: false,

      new_page_title: "",

      path: "pages",
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
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {},
  methods: {
    async createPage() {
      const page_slug = await this.$api.createFolder({
        path: this.path,
        additional_meta: {
          title: this.new_page_title,
          requested_slug: this.new_page_title,
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
