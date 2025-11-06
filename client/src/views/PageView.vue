<template>
  <div class="_pageView">
    <transition name="fade_fast" mode="out-in">
      <LoaderSpinner v-if="is_loading_page" />
      <div v-else>
        <div class="_topbar">
          <TitleField
            :field_name="'title'"
            :label="can_edit ? $t('title') : undefined"
            class="_title"
            :content="page.title"
            :path="page.$path"
            :required="true"
            :maxlength="70"
            :tag="'h1'"
            :can_edit="can_edit"
          />

          <DropDown v-if="can_edit" :show_label="false">
            <RemoveMenu
              :modal_title="$t('remove_page_and_content')"
              @remove="removePage"
            />
          </DropDown>
        </div>

        <div class="u-spacingBottom" />

        <CollaborativeEditor3
          v-if="text_content"
          ref="textBloc"
          :path="text_content.$path"
          :content="text_content.$content"
          :line_selected="false"
          :can_edit="can_edit"
        />
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      is_loading_page: true,
      page: undefined,
    };
  },
  async created() {},
  async mounted() {
    this.$api.updateSelfPath(this.page_path);
    await this.getPage();
    this.$api.join({ room: this.page_path });

    if (this.page.$files?.length === 0) {
      await this.$api.uploadText({
        path: this.page.$path,
        filename: "content.txt",
        content: "<i>" + this.$t("page_content") + "</i>",
      });
    }

    this.is_loading_page = false;
  },
  beforeDestroy() {
    this.$api.leave({ room: this.page_path });
  },
  watch: {},
  computed: {
    page_path() {
      return this.createPath({ page_slug: this.$route.params.page_slug });
    },
    can_edit() {
      return this.canLoggedinEditFolder({ folder: this.page });
    },
    text_content() {
      return this.page?.$files?.find((f) => f.$type === "text");
    },
  },
  methods: {
    async getPage() {
      this.page = await this.$api
        .getFolder({
          path: this.page_path,
        })
        .catch(() => {
          return;
        });
    },
    async removePage() {
      await this.$api.deleteItem({
        path: this.page.$path,
      });
      this.$router.push("/");
    },
  },
};
</script>
<style lang="scss" scoped>
._pageView {
  width: 90%;
  max-width: 560px;
  margin: 0 auto;
  padding: calc(var(--spacing) * 2) 0;
}
._topbar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
}
</style>
