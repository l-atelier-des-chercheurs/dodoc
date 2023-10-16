<template>
  <div class="_viewPane">
    <div class="_views">
      <DLabel :str="$t('views_list')" />

      <ReorderedList
        :field_name="'views_list'"
        :items="views"
        :path="publication.$path"
        :active_item_path="opened_view_path"
        :can_edit="can_edit"
        @openItem="openView"
        v-slot="slotProps"
      >
        <span v-if="slotProps.item.section_title">
          {{ slotProps.item.section_title }}
        </span>
        <span v-else v-html="`<i>${$t('untitled')}</i>`" />
      </ReorderedList>

      <button
        type="button"
        class="u-button u-button_bleuvert u-button_small"
        v-if="can_edit"
        @click="createView"
      >
        {{ $t("create_view") }}
      </button>
    </div>

    <ViewContent
      v-if="opened_view"
      :view="opened_view"
      :publication="publication"
      :can_edit="can_edit"
      @close="closeView"
    />
  </div>
</template>
<script>
import ViewContent from "@/components/publications/cartography/ViewContent.vue";

export default {
  props: {
    publication: Object,
    opened_view_path: String,
    views: Array,
    can_edit: Boolean,
  },
  components: {
    ViewContent,
  },
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {
        views_list: "Liste des vues",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    opened_view() {
      return this.views.find(
        (v) => this.getFilename(v.$path) === this.opened_view_path
      );
    },
    new_view_title() {
      let idx = this.views.length + 1;
      let new_view_title = this.$t("view") + " " + idx;
      while (this.views.section_title === new_view_title) {
        idx++;
        new_view_title = this.$t("view") + " " + idx;
      }
      return new_view_title;
    },
  },
  methods: {
    async createView() {
      await this.createSection2({
        publication: this.publication,
        type: "view",
        group: "views_list",
        title: this.new_view_title,
      });
    },
    openView(path) {
      this.$emit("toggleView", this.getFilename(path));
    },
    closeView() {
      this.$emit("toggleView", false);
    },
  },
};
</script>
<style lang="scss" scoped>
._viewPane {
  position: relative;

  height: 100%;
  width: 420px;

  padding: calc(var(--spacing) / 2);

  background: var(--panel-color);
  border: var(--panel-borders);
  box-shadow: var(--panel-shadows);
  text-align: left;
}
._viewPreview {
  background: var(--c-gris_clair);
  padding: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 2);

  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  &:hover {
    background: var(--c-gris_fonce);
  }
}
._openedView {
  position: absolute;
  top: calc(var(--spacing) / 4);
  left: calc(var(--spacing) / 4);
  width: calc(100% - calc(var(--spacing) / 2));
  height: 100%;
  overflow: auto;
  background: white;
  padding: calc(var(--spacing) / 2);
}

._closeBtn {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
