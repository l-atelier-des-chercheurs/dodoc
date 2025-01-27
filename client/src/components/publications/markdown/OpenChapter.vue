<template>
  <div class="_openChapter">
    <div class="_topButtons">
      <button type="button" class="u-buttonLink" @click="$emit('close')">
        {{ $t("close") }}
      </button>
      <SelectField
        :field_name="'content_type'"
        :content="content_type"
        :path="chapter._main_text.$path"
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
        <!-- <MarkdownEditor
          :content="chapter._main_text.$content"
          :path="chapter._main_text.$path"
          :edit_on_mounted="true"
          :can_edit="can_edit"
        /> -->
        <CollaborativeEditor3
          :content="chapter._main_text.$content"
          :path="chapter._main_text.$path"
          :custom_formats="custom_formats"
          :save_format="save_format"
          :can_edit="can_edit"
        />
      </template>
    </div>
  </div>
</template>
<script>
// import MarkdownEditor from "@/adc-core/fields/collaborative-editor/MarkdownEditor.vue";

export default {
  props: {
    chapter: Object,
    can_edit: Boolean,
  },
  components: {
    // MarkdownEditor,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    content_type() {
      return this.chapter._main_text?.content_type || "html";
    },
    custom_formats() {
      if (this.content_type === "markdown") return [];
      else return;
    },
    save_format() {
      if (this.content_type === "html") return "html";
      else if (this.content_type === "markdown") return "raw";
      else return "html";
    },
  },
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
  z-index: 2;

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
  margin-bottom: calc(var(--spacing) * 1);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 2) 0;
}

._content {
  padding: 0 calc(var(--spacing) * 2) calc(var(--spacing) * 2);
}
</style>
