<template>
  <div class="_fileShown">
    <transition name="pagechange" mode="out-in">
      <div
        v-if="file"
        :key="file.$path"
        class="_single"
        :data-type="file.$type"
      >
        <div v-if="file.$type === 'text'" class="_textEditor">
          <CollaborativeEditor2
            :path="file.$path"
            :content="file.$content"
            :custom_formats="['bold', 'italic', 'underline', 'link']"
            :can_edit="can_edit"
            :edit_on_mounted="context === 'chutier'"
          />
        </div>
        <MediaContent
          v-else
          :file="file"
          :context="'full'"
          :resolution="1600"
          :show_fs_button="true"
          :zoom_on_click="false"
        />
        <div class="_navArrow" v-if="position">
          <button
            type="button"
            class="u-button u-button_icon"
            :disabled="position === 'alone' || position === 'first'"
            @click="$eventHub.$emit('carousel.prev')"
          >
            <b-icon icon="arrow-left-short" />
          </button>
          <button
            type="button"
            class="u-button u-button_icon"
            :disabled="position === 'alone' || position === 'last'"
            @click="$eventHub.$emit('carousel.next')"
          >
            <b-icon icon="arrow-right-short" />
          </button>

          <!-- <div v-if="optimization_strongly_recommended" class="_optimizeNotice">
            <div class="">
              {{ $t("convert_to_format") }}
              <OptimizeMedia :media="file" @close="$emit('close')" />
            </div>
          </div> -->
        </div>
        <button
          type="button"
          class="u-buttonLink _regenerateBtn"
          v-if="file.$thumbs === 'no_preview'"
          @click="regenerateThumbs"
        >
          <template v-if="!is_regenerating">
            <b-icon icon="arrow-clockwise" />
            {{ $t("regenerate_thumbs") }}
          </template>
          <LoaderSpinner v-else />
        </button>
        <div class="_dragEditBtn">
          <DragFile :file="file" :is_dragged.sync="is_dragged" />
        </div>
      </div>
    </transition>

    <div class="_unfoldBtn">
      <button
        type="button"
        class="u-button u-button_icon u-button_transparent"
        @click="show_infos = !show_infos"
      >
        <b-icon
          v-if="show_infos"
          icon="chevron-down"
          :aria-label="$t('close')"
        />
        <b-icon v-else icon="chevron-up" :aria-label="$t('open')" />

        <b-icon
          v-if="file.caption"
          icon="text-left"
          :aria-label="$t('caption')"
        />
        <b-icon
          v-if="file.$credits"
          icon="info-circle"
          :aria-label="$t('credit/reference')"
        />
      </button>
    </div>

    <transition name="pagechange" mode="out-in">
      <div class="_infos" :data-hide="!show_infos" :key="file.$path">
        <div class="_infos--content">
          <div class="u-spacingBottom" v-if="file.$type === 'url'">
            <DLabel class="_label" :str="$t('link')" />
            <div>
              <a :href="file.$content" target="_blank">
                {{ file.$content }}
              </a>
            </div>
          </div>

          <div class="u-spacingBottom">
            <CollaborativeEditor2
              :label="$t('caption')"
              :field_to_edit="'caption'"
              :content="file.caption"
              :path="file.$path"
              :custom_formats="['bold', 'italic', 'link']"
              :is_collaborative="false"
              :maxlength="1280"
              :can_edit="can_edit"
            />
          </div>

          <div class="">
            <CollaborativeEditor2
              :label="$t('credit/reference')"
              :field_to_edit="'$credits'"
              :content="file.$credits"
              :path="file.$path"
              :custom_formats="['bold', 'italic', 'link']"
              :is_collaborative="false"
              :maxlength="1280"
              :can_edit="can_edit"
            />
          </div>

          <details>
            <summary>
              <label class="u-label _detailsP">
                <b-icon icon="bounding-box" />
                {{ $t("toolbox") }}
              </label>
            </summary>
            <div class="_tools">
              <button
                v-if="cropadjust_possible"
                type="button"
                class="u-button"
                @click="show_cropadjust_modal = true"
              >
                <b-icon icon="bounding-box" />
                {{ $t("crop_adjust") }}
              </button>

              <CropAdjustMedia
                v-if="show_cropadjust_modal"
                :media="file"
                @close="$emit('close')"
              />

              <OptimizeMedia
                v-if="
                  optimization_strongly_recommended || optimization_possible
                "
                :media="file"
                @close="$emit('close')"
              />
            </div>
          </details>

          <template v-if="file.$location">
            <div class="u-spacingBottom" />

            <div class="u-instructions">
              {{ $t("latitude") }} : {{ file.$location.latitude }} //
              {{ $t("longitude") }} : {{ file.$location.longitude }}
            </div>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    context: String,
    position: String,
    can_edit: Boolean,
  },
  components: {
    CropAdjustMedia: () => import("@/adc-core/fields/CropAdjustMedia.vue"),
    OptimizeMedia: () => import("@/adc-core/fields/OptimizeMedia.vue"),
  },
  data() {
    return {
      show_infos: true,
      is_dragged: false,
      edit_mode: false,
      is_regenerating: false,
      show_cropadjust_modal: false,
    };
  },
  i18n: {
    messages: {
      fr: {},
      en: {},
    },
  },
  created() {
    if (localStorage.getItem("show_infos"))
      this.show_infos = localStorage.getItem("show_infos") !== "false";
    else
      this.show_infos =
        this.can_edit || this.file.caption || this.file.$credits;
  },
  mounted() {
    this.$eventHub.$on("fileshown.showInfos", this.showInfos);
    this.$eventHub.$on("fileshown.hideInfos", this.hideInfos);
  },
  beforeDestroy() {
    this.$eventHub.$off("fileshown.showInfos", this.showInfos);
    this.$eventHub.$off("fileshown.hideInfos", this.hideInfos);
  },
  watch: {
    show_infos() {
      localStorage.setItem("show_infos", this.show_infos);
    },
  },
  computed: {
    optimization_possible() {
      return this.fileCanBeOptimized({ path: this.file.$media_filename });
    },
    optimization_strongly_recommended() {
      return this.fileShouldBeOptimized({ path: this.file.$media_filename });
    },
    cropadjust_possible() {
      return (
        this.file.$type === "image" &&
        !this.file.$media_filename.endsWith(".gif")
      );
    },
  },
  methods: {
    async regenerateThumbs() {
      this.is_regenerating = true;
      await this.$api.regenerateThumbs({ path: this.file.$path });
      this.is_regenerating = false;
    },
    showInfos() {
      this.show_infos = true;
    },
    hideInfos() {
      this.show_infos = false;
    },
  },
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
  flex: 1 1 auto;
  overflow: hidden;

  &[data-type="text"] {
    overflow: auto;
  }

  ::v-deep {
    ._mediaContent {
      width: 100%;
      height: 100%;
    }

    ._iframeStylePreview {
      border: none !important;
      border-radius: 0 !important;
    }

    ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: scale-down;
      max-width: none;
      // background-color: var(--c-gris);
      // border-radius: 2px;
    }
  }
}

._regenerateBtn {
  position: absolute;
  top: 0;
  left: 0;
}

._unfoldBtn {
  width: 100%;
  border-top: 1px solid var(--sd-separator);
  z-index: 2;

  > button {
    width: 100%;
    justify-content: flex-start;
    gap: calc(var(--spacing) / 2);
    border-radius: 0;

    &:hover,
    &:focus {
      background: var(--sd-separator);
      // color: white;
    }
  }
}

._infos {
  flex: 0 0 auto;
  position: relative;
  border-top: 1px solid var(--sd-separator);
  // border-bottom: 1px solid var(--sd-separator);
  max-height: 50vh;
  overflow: auto;
  padding: calc(var(--spacing) / 1) calc(var(--spacing) / 1);

  transition: all 0.02s cubic-bezier(0.19, 1, 0.22, 1);

  &[data-hide] {
    overflow: 0;
    max-height: 0;
    border: none;
    padding: 0 calc(var(--spacing) / 1);
  }
}

._dragEditBtn {
  position: absolute;
  top: 0;
  right: 0;
}

._textEditor {
  padding: 0 calc(var(--spacing) / 1);

  ::v-deep .ql-editor {
    padding: calc(var(--spacing) / 2);
    border-left: 2px solid var(--h-700);
  }
}

._navArrow {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

._tools {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: calc(var(--spacing) / 2);
}

._detailsP {
  display: inline-block;
  pointer-events: none;
}
</style>
