<template>
  <div class="_openChapter">
    <div class="_topButtons">
      <button type="button" class="u-buttonLink" @click="$emit('close')">
        {{ $t("close") }}
      </button>
      <SelectField
        :field_name="'section_type'"
        :value="chapter.section_type"
        :path="chapter.$path"
        :options="[
          { key: 'html', text: 'HTML' },
          { key: 'markdown', text: 'Markdown' },
        ]"
        :can_edit="can_edit"
        :hide_validation="true"
      />
      <RemoveMenu @remove="$emit('remove')" />
    </div>
    <div class="_content">
      <div class="u-spacingBottom">
        <TitleField
          :label="$t('section_title')"
          :field_name="'section_title'"
          :content="chapter.section_title"
          :required="true"
          :maxlength="40"
          :tag="'h1'"
          :path="chapter.$path"
          :can_edit="can_edit"
        />
      </div>
      <template v-if="chapter._main_text">
        <DLabel :str="$t('content')" />
        <CollaborativeEditor3
          :content="chapter._main_text.$content"
          :path="chapter._main_text.$path"
          :edit_on_mounted="true"
          :can_edit="can_edit"
        />
      </template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    chapter: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {};
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
._openChapter {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: var(--c-gris_clair);
  background-color: white;

  // display: flex;
  // flex-direction: row nowrap;

  // > * {
  //   flex: 1 1 0;
  // }
}

._topButtons {
  display: flex;
  flex-direction: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2) 0;
}

._content {
  padding: calc(var(--spacing) / 2);
}
</style>
