<template>
  <div class="_openChapter">
    <!-- <div class="_close_button">
      <button
        type="button"
        class="u-button u-button_icon"
        @click="$emit('close')"
      >
        <b-icon icon="x-lg" :label="$t('close')" />
      </button>
    </div> -->
    <div class="_navBtns">
      <div class="_navBtns--content">
        <div class="">
          <button type="button" class="u-linkList" @click="$emit('close')">
            <b-icon icon="x" :label="$t('close')" />
            {{ $t("close") }}
          </button>
        </div>
        <div
          class="_navBtns--content--buttons"
          v-show="next_section || prev_section"
        >
          <span>
            <button
              type="button"
              class="u-linkList"
              v-if="prev_section"
              @click="$emit('prev')"
            >
              <b-icon icon="arrow-left-short" />
              <span>
                {{ prev_section.section_title }}
              </span>
            </button>
            <span v-else>–</span>
          </span>

          <span class="_separator">|</span>

          <span>
            <button
              type="button"
              class="u-linkList"
              v-if="next_section"
              @click="$emit('next')"
            >
              <span>
                {{ next_section.section_title }}
              </span>
              <b-icon icon="arrow-right-short" />
            </button>
            <span v-else>–</span>
          </span>
        </div>
        <div></div>
      </div>
    </div>
    <div class="_openChapter--content">
      <div class="_topButtons">
        <TitleField
          :field_name="'section_title'"
          :content="chapter.section_title"
          :maxlength="100"
          :tag="'h1'"
          :path="chapter.$path"
          :can_edit="true"
        />

        <DropDown :right="true" :show_label="false">
          <RemoveMenu @remove="$emit('remove')" />
        </DropDown>

        <!-- <div>
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          <b-icon icon="arrow-left-short" />
          {{ $t("back") }}
        </button>
      </div> -->
        <!-- <SelectField
        :field_name="'content_type'"
        :content="content_type"
        :path="chapter._main_text.$path"
        :options="[
          { key: 'html', text: 'HTML' },
          { key: 'markdown', text: 'Markdown' },
        ]"
        :can_edit="can_edit"
        :hide_validation="true"
      /> -->
      </div>

      <div class="_infos">
        <div class="_content--type">
          <template v-if="chapter.section_type === 'text'">
            <b-icon icon="markdown" />
            {{ $t("text") }}
          </template>
          <template v-else-if="chapter.section_type === 'gallery'">
            <b-icon icon="image" />
            {{ $t("gallery") }}
          </template>
          <template v-else-if="chapter.section_type === 'grid'">
            <b-icon icon="grid-fill" />
            {{ $t("grid") }}
          </template>
          <template v-else-if="chapter.section_type === 'story'">
            <b-icon icon="list" />
            {{ $t("story") }}
          </template>
        </div>

        <transition name="fade" mode="out-in">
          <div v-if="view_mode === 'book' && chapter_position?.first_page">
            <div class="_selects--pageRange" :key="chapter_position.first_page">
              p.{{ chapter_position.first_page }}
              <template
                v-if="
                  chapter_position.first_page !== chapter_position.last_page
                "
              >
                <b-icon icon="arrow-right-short" /> p.{{
                  chapter_position.last_page
                }}
              </template>
            </div>
          </div>
        </transition>
      </div>

      <ChapterLayout
        :chapter="chapter"
        :publication="publication"
        :view_mode="view_mode"
      />

      <div class="_content">
        <template v-if="chapter.section_type === 'text'">
          <MainText
            v-if="chapter._main_text"
            :text_file="chapter._main_text"
            :medias_holder="chapter"
            :publication_path="publication.$path"
            :edit_mode="'edit_on_mounted'"
          />
          <div v-else class="u-instructions">
            {{ $t("no_content") }}
          </div>
        </template>
        <template v-if="chapter.section_type === 'gallery'">
          <GalleryChapter :chapter="chapter" :publication="publication" />
        </template>
        <template v-if="chapter.section_type === 'grid'">
          <GridChapter :chapter="chapter" :publication="publication" />
        </template>
        <template v-if="chapter.section_type === 'story'">
          <SingleSection
            class="_singleSection"
            :publication="publication"
            :section="chapter"
            :can_edit="true"
          />
        </template>
      </div>
    </div>
  </div>
</template>
<script>
// import MarkdownEditor from "@/adc-core/fields/collaborative-editor/MarkdownEditor.vue";

import GalleryChapter from "@/components/publications/edition/GalleryChapter.vue";
import GridChapter from "@/components/publications/edition/GridChapter.vue";
import ChapterLayout from "@/components/publications/edition/ChapterLayout.vue";
import MainText from "@/components/publications/edition/MainText.vue";

export default {
  props: {
    chapter: Object,
    chapters: Array,
    prev_section: Object,
    next_section: Object,
    publication: Object,
    chapter_position: Object,
    view_mode: String,
  },
  components: {
    // MarkdownEditor,
    GalleryChapter,
    GridChapter,
    ChapterLayout,
    MainText,
    SingleSection: () =>
      import("@/components/publications/story/SingleSection.vue"),
  },
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
  scroll-behavior: smooth;
  scroll-padding: 10vh;
  background: var(--c-gris_clair);
  z-index: 10;

  // display: flex;
  // flex-direction: row nowrap;

  // > * {
  //   flex: 1 1 0;
  // }
}
._openChapter--content {
  position: relative;
  min-height: calc(100% - calc(var(--spacing) * 1));
  background-color: white;
  // box-shadow: 0 0 0 1px hsla(230, 13%, 9%, 0.05),
  //   0 0.3px 0.4px hsla(230, 13%, 9%, 0.02),
  //   0 0.9px 1.5px hsla(230, 13%, 9%, 0.025),
  //   0 3.5px 6px hsla(230, 13%, 9%, 0.09);
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.1));

  border-top-left-radius: 4px;
  border-top-right-radius: 4px;

  margin: 0 calc(var(--spacing) / 1);
  margin-bottom: 0;
  padding: calc(var(--spacing) * 2);
}

._close_button {
  position: sticky;
  height: 0;
  top: 0;
  text-align: right;
  right: 0;
  z-index: 100;
}

._topButtons {
  display: flex;
  flex-direction: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(var(--spacing) * 1);
  padding-bottom: calc(var(--spacing) / 2);
}

._content {
  padding-bottom: calc(var(--spacing) * 1);
}

._navBtns {
  padding: calc(var(--spacing) / 2);
  // padding-top: calc(var(--spacing) * 4);
  // padding-bottom: calc(var(--spacing) * 4);
}

._navBtns--content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) / 1);
  height: 20px;

  &:first-child,
  &:last-child {
    flex: 0 0 10ch;
  }

  > * {
    flex: 0 1 10ch;
    overflow: hidden;
  }
}

._navBtns--content--buttons {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;

  > * {
    display: block;
    flex: 1 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    > * {
      padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    }

    &:first-child {
      text-align: right;

      > * {
        justify-content: flex-end;
      }
    }

    &:last-child > * {
      text-align: left;
    }
  }

  ._separator {
    flex: 0 0 1ch;
    margin: 0ch;
    text-align: center;
  }
}

// ._customBtn {
// background-color: var(--c-bleumarine) !important;
// color: white !important;
// border-radius: var(--input-border-radius) !important;
// }

._textField {
  resize: vertical;
  min-height: 8rem;
}
._content--type {
  font-weight: 500;
}

._infos {
  margin-bottom: calc(var(--spacing) * 1);
  font-size: var(--sl-font-size-small);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  gap: calc(var(--spacing) * 1);
}

._selects--pageRange {
  // font-size: var(--sl-font-size);
  color: var(--c-gris_fonce);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  // gap: calc(var(--spacing) / 2);
}

._singleSection {
  ::v-deep {
    ._topbar {
      display: none;
    }
  }
}
</style>
