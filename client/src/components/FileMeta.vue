<template>
  <div class="_fileMeta">
    <div class="_fileMeta--main">
      <div class="u-spacingBottom">
        <TitleField
          :field_name="'title'"
          :content="file.title"
          :path="file.$path"
          tag="h1"
          :can_edit="can_edit"
        />
      </div>

      <hr />

      <div class="u-spacingBottom">
        <DateField
          :field_name="'date_created_corrected'"
          :label="$t('date_created')"
          :date="creation_date"
          :path="file.$path"
          :input_type="'datetime-local'"
          :can_edit="can_edit"
        />
        <!-- cant be edited server-side -->
        <DateField
          :field_name="'$date_uploaded'"
          :label="$t('date_uploaded')"
          :date="file.$date_uploaded"
          :path="file.$path"
          :input_type="'datetime-local'"
          :can_edit="false"
        />
      </div>

      <!-- // disabled for now -->
      <AuthorField
        :label="$t('authors')"
        class="u-spacingBottom"
        :field="'$admins'"
        :authors_paths="file.$admins"
        :path="file.$path"
        :can_edit="can_edit"
        :instructions="$t('media_editing_instructions')"
      />

      <div class="u-spacingBottom">
        <KeywordsField
          :field_name="'keywords'"
          :label="$t('keywords')"
          :path="file.$path"
          :keywords="file.keywords"
          :can_edit="can_edit"
          @cancelEdit="[]"
        />
      </div>

      <div class="u-spacingBottom">
        <TitleField
          :field_name="'description'"
          :label="$t('description')"
          :content="file.description"
          :path="file.$path"
          :maxlength="1280"
          :input_type="'markdown'"
          :can_edit="can_edit"
        />
      </div>

      <DownloadFile :file="file" v-if="!is_stack">
        <sl-icon name="file-earmark-arrow-down" />
        {{ $t("download") }}
      </DownloadFile>
      <RemoveMenu
        :remove_text="is_stack ? $t('remove_stack') : $t('remove')"
        @remove="$emit('removeMain')"
      />
      <DebugBtn :content="file" />
    </div>
    <transition name="partialSlideupFade" mode="out-in" appear>
      <div
        v-if="is_stack && stack_file_shown"
        :key="stack_file_shown.$path"
        class="_fileMeta--stackItem"
      >
        <button
          type="button"
          class="_fileMeta--stackItem--closeStackBtn"
          @click="$emit('closeStack')"
        />
        <div class="_fileMeta--stackItem--content">
          <div v-if="sequence" class="_sequence">
            {{ sequence }}
          </div>

          <div class="u-spacingBottom">
            <TitleField
              :field_name="'title'"
              :content="stack_file_shown.title"
              :path="stack_file_shown.$path"
              tag="h2"
              :can_edit="can_edit"
            />
          </div>

          <hr />

          <div class="u-spacingBottom">
            <DateField
              :field_name="'date_created_corrected'"
              :label="$t('date_created')"
              :date="stack_file_shown.date_created_corrected"
              :path="stack_file_shown.$path"
              :input_type="'datetime-local'"
              :can_edit="can_edit"
            />
          </div>

          <DownloadFile :file="stack_file_shown">
            <sl-icon name="file-earmark-arrow-down" />
            {{ $t("download") }}
          </DownloadFile>
          <RemoveMenu
            :remove_text="$t('remove_item_in_stack')"
            @remove="$emit('removeCurrent')"
          />
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import KeywordsField from "@/components/KeywordsField.vue";

export default {
  props: {
    sequence: [Boolean, String],
    file: Object,
    is_stack: Boolean,
    stack_file_shown: [Boolean, Object],
  },
  components: {
    KeywordsField,
  },
  data() {
    return {
      edit_mode: false,

      creation_date: this.datetimeLocal(
        this.file.date_created_corrected ||
          this.file.$date_created ||
          this.file.$date_uploaded
      ),
    };
  },
  i18n: {
    messages: {
      fr: {
        remove_item_in_stack: "Supprimer cet élément de la pile",
      },
      en: {
        remove_item_in_stack: "Remove this media in the stack",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    can_edit() {
      return this.canLoggedinEditFolder({ folder: this.file });
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._fileMeta {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: auto;

  background: var(--modal-background);
}

._fileMeta--main {
  padding: calc(var(--spacing) * 1);
  background: var(--modal-background);
}

._fileMeta--stackItem {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: transparent;

  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

._fileMeta--stackItem--closeStackBtn {
  flex: 0 0 30px;
  width: 100%;
  display: block;
  background: var(--modal-background);
  opacity: 0.5;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus-visible {
    opacity: 0.7;
  }
}

._fileMeta--stackItem--content {
  flex: 1;
  border-top: 1px solid var(--color-borders);
  background: var(--modal-background);
  padding: calc(var(--spacing) * 1);
}

hr {
  margin: calc(var(--spacing) * 1) 0;
}

.partialSlideupFade {
  &-enter-active,
  &-leave-active {
    transform: translateY(0);
    opacity: 1;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
</style>
