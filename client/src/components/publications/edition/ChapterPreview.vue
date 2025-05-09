<template>
  <div class="u-card2 _chapterPreview">
    <div class="_selects" v-if="can_edit">
      <select
        :value="index"
        size="small"
        class="_selects--order"
        @change="
          $emit('moveSection', {
            old_position: index,
            new_position: +$event.target.value,
          })
        "
      >
        <option
          v-for="p in number_of_sections"
          :key="p - 1"
          :value="p - 1"
          v-text="p"
        />
      </select>
      <div class="_selects--starts_on_page">
        <SelectField2
          :field_name="'section_starts_on_page'"
          :value="section.section_starts_on_page || ''"
          :path="section.$path"
          size="small"
          :hide_validation="true"
          :can_edit="can_edit"
          :options="[
            {
              key: '',
              text: $t('in_flow'),
            },
            {
              key: 'page',
              text: $t('next_page'),
            },
            {
              key: 'left',
              text: $t('next_left_page'),
            },
            {
              key: 'right',
              text: $t('next_right_page'),
            },
          ]"
        />
      </div>
      <!-- <div class="_selects--options">
        <DropDown :right="true" :show_label="false">
          <RemoveMenu @remove="$emit('remove')" />
        </DropDown>
      </div> -->
    </div>

    <h2 class="_item--title">
      <template v-if="section.section_title">
        {{ section.section_title }}
      </template>
      <template v-else>
        <i>{{ $t("untitled") }}</i>
      </template>
    </h2>
    <div class="_item--type">{{ $t("type") }} : {{ section.section_type }}</div>
    <div class="_item--content">
      <div
        class="_item--content--text"
        v-if="section.section_type === 'text' && previewContent(section)"
      >
        <CollaborativeEditor3 :content="previewContent(section)" />
      </div>
      <div
        v-else-if="
          section.section_type === 'gallery' && gallery_medias.length > 0
        "
        class="_item--content--gallery"
      >
        <div
          v-for="media in gallery_medias"
          :key="media.meta_filename_in_project"
        >
          <MediaContent :file="media" />
        </div>
      </div>
      <div v-else class="u-instructions">{{ $t("no_content") }}</div>
    </div>

    <button
      type="button"
      class="_openButton"
      :title="$t('open')"
      @click="$emit('open')"
    />
  </div>
</template>
<script>
import SelectField2 from "@/adc-core/fields/SelectField2.vue";

export default {
  props: {
    section: {
      type: Object,
      required: true,
    },
    index: Number,
    number_of_sections: Number,
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
  computed: {
    gallery_medias() {
      if (
        this.section.section_type !== "gallery" ||
        !this.section.source_medias
      )
        return [];
      return this.section.source_medias?.map((media) => {
        return this.getSourceMedia({
          source_media: media,
          folder_path: this.getParent(this.section.$path),
        });
      });
    },
  },
  methods: {
    previewContent(section) {
      const sub_content = section._main_text?.$content;
      if (sub_content) {
        return sub_content.substring(0, 100) + "...";
      }
      return false;
    },
  },
};
</script>
<style lang="scss" scoped>
._chapterPreview {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) / 2);
  align-items: flex-start;
  background-color: var(--editor-bg);
  padding: calc(var(--spacing) / 1);
  background-color: white;
  border-radius: var(--border-radius);
}

._selects {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  gap: calc(var(--spacing) / 2);
}

._selects--order {
  // width: 5ch;
  width: auto;
  flex: 0 0 auto;
  position: relative;
  z-index: 2;
}

._selects--starts_on_page {
  // width: 15ch;
  width: auto;
  flex: 0 0 auto;
  position: relative;
  z-index: 2;
}
._selects--options {
  flex: 0 0 auto;
  position: relative;
  z-index: 2;
}

._item--type {
  font-size: var(--sl-font-size-x-small);
  color: var(--c-gris_fonce);
}

._item--content {
  width: 100%;
}

._openButton {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: transparent;

  margin: 0;
}

._item--content--gallery {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: calc(var(--spacing) / 2);
  max-height: 200px;
  background-color: var(--c-gris_clair);
}
</style>
