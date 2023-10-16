<template>
  <div class="_viewContent">
    <div class="_closeLayerBtn">
      <sl-button variant="default" size="medium" circle @click="$emit('close')">
        <sl-icon name="x-lg" :label="$t('close')"></sl-icon>
      </sl-button>
    </div>

    <TitleField
      :field_name="'section_title'"
      :content="view.section_title"
      :path="view.$path"
      :required="true"
      :minlength="3"
      :maxlength="40"
      :tag="'h2'"
      :can_edit="can_edit"
    />

    <StorySectionTemplate
      class="_publicationOpen--content"
      :publication="publication"
      :opened_section_meta_filename="page_opened_id"
      :can_edit="can_edit"
      @toggleSection="$emit('togglePage', $event)"
    />
  </div>
</template>
<script>
export default {
  props: {
    view: Object,
    publication: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._viewContent {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;

  background: white;

  padding: calc(var(--spacing) * 1);
}
</style>
