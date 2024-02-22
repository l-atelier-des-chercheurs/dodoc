<template>
  <div class="_fileShown">
    <div class="_single">
      <transition name="pagechange" mode="out-in">
        <div v-if="file">
          <div class="_textEditor" v-if="file.$type === 'text'">
            <CollaborativeEditor2
              :path="file.$path"
              :content="file.$content"
              :custom_formats="['bold', 'italic', 'underline', 'link']"
              :can_edit="can_edit"
            />
          </div>
          <MediaContent
            v-else
            :key="file.$path"
            :file="file"
            :context="'full'"
            :resolution="1600"
            :show_fs_button="true"
            :zoom_on_click="false"
          />
        </div>
      </transition>

      <div class="_dragEditBtn">
        <DragFile :file="file" :is_dragged.sync="is_dragged" />
      </div>
    </div>

    <div class="_unfoldBtn">
      <button
        type="button"
        class="u-button u-button_icon u-button_transparent"
        @click="show_infos = !show_infos"
      >
        <!-- <template v-if="!show_infos"> -->
        <b-icon
          v-if="file.caption"
          icon="text-left"
          :aria-label="$t('caption')"
        />
        <b-icon
          v-if="file.credits"
          icon="info-circle"
          :aria-label="$t('credits/source')"
        />
        <!-- </template> -->

        <div class="_separator" />

        <b-icon
          v-if="show_infos"
          icon="chevron-compact-down"
          :aria-label="$t('close')"
        />
        <b-icon v-else icon="chevron-compact-up" :aria-label="$t('open')" />
        <!-- <b-icon icon="file-earmark-text" /> -->
      </button>
    </div>

    <transition name="pagechange" mode="out-in">
      <div class="_infos" :data-hide="!show_infos" :key="file.$path">
        <div class="_infos--content">
          <div v-if="optimization_strongly_recommended" class="_optimizeNotice">
            <div class="">
              {{ $t("convert_to_format") }}
              <OptimizeMedia :media="file" @close="$emit('close')" />
            </div>
          </div>
          <!-- <OptimizeMedia
            v-if="optimization_possible"
            :media="file"
            @close="$emit('close')"
          /> -->

          <div class="u-spacingBottom">
            <TitleField
              :field_name="'caption'"
              class="_caption"
              :label="$t('caption')"
              :content="file.caption"
              :path="file.$path"
              :maxlength="1280"
              :input_type="'markdown'"
              :can_edit="can_edit"
            />
          </div>

          <div class="u-spacingBottom">
            <TitleField
              :field_name="'credits'"
              class="_credits"
              :label="$t('credits/source')"
              :content="file.credits"
              :path="file.$path"
              :maxlength="1280"
              :input_type="'markdown'"
              :can_edit="can_edit"
            />
          </div>

          <div class="u-instructions" v-if="file.$location">
            {{ $t("latitude") }} : {{ file.$location.latitude }}
            <br />
            {{ $t("longitude") }} : {{ file.$location.longitude }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      show_infos: true,
      is_dragged: false,
      edit_mode: false,
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {
    this.show_infos = this.can_edit || this.file.caption || this.file.credits;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    optimization_possible() {
      return this.fileCanBeOptimized({ path: this.file.$media_filename });
    },
    optimization_strongly_recommended() {
      return this.fileShouldBeOptimized({ path: this.file.$media_filename });
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._fileShown {
  display: flex;
  flex-flow: column nowrap;
  overflow: hidden;
}

._single {
  position: relative;
  flex: 1 0 50px;

  ._mediaContent {
    height: 100%;
  }
}

._unfoldBtn {
  width: 100%;
  border-top: 1px solid var(--sd-separator);
  z-index: 2;

  > button {
    width: 100%;
    justify-content: flex-end;
    border-radius: 0;

    display: flex;
    flex-flow: row nowrap;
    gap: calc(var(--spacing) / 2);
    justify-content: space-between;

    &:hover,
    &:focus {
      background: var(--sd-separator);
    }

    ._separator {
      flex: 1 1 auto;
    }
  }
}

._infos {
  position: relative;
  border-top: 1px solid var(--sd-separator);
  border-bottom: 1px solid var(--sd-separator);
  max-height: 50vh;
  overflow: auto;
  padding: calc(var(--spacing) / 1) calc(var(--spacing) / 1);

  transition: all 0.02s cubic-bezier(0.19, 1, 0.22, 1);

  &[data-hide] {
    max-height: 0;
    padding: 0 calc(var(--spacing) / 1);
  }
}

._dragEditBtn {
  position: absolute;
  top: 0;
  right: 0;
}

._textEditor {
  padding: calc(var(--spacing) / 2);

  ::v-deep .ql-container {
    padding: calc(var(--spacing) / 2);
    border-left: 2px solid var(--sd-textcolor);
  }
}
</style>
