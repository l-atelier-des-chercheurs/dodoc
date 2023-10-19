<template>
  <div class="_viewPane">
    <SectionsList
      :publication="publication"
      :opened_section_meta_filename="opened_view_meta_filename"
      :can_edit="can_edit"
      @toggleSection="$emit('toggleView', $event)"
    />
  </div>
</template>
<script>
import SectionsList from "@/components/publications/story/SectionsList.vue";
// import ViewContent from "@/components/publications/cartography/ViewContent.vue";

export default {
  props: {
    publication: Object,
    opened_view_meta_filename: String,
    can_edit: Boolean,
  },
  components: {
    SectionsList,
  },
  data() {
    return {
      opened_section_meta_filename: false,
    };
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
  computed: {},
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
  width: 50%;
  max-width: 420px;
  overflow: auto;

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
