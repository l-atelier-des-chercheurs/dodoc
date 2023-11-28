<template>
  <div class="_mediaModal">
    <div class="_mediaModal--overlay" @click="$emit('close')" />

    <div class="_topRightBtn">
      <button
        type="button"
        v-if="!$root.is_mobile_view"
        class="u-button u-button_icon"
        @click="toggleMeta"
      >
        <b-icon
          :icon="
            show_meta_sidebar ? 'chevron-double-right' : 'chevron-double-left'
          "
        />
      </button>
      <button
        type="button"
        class="u-button u-button_icon"
        @click="$emit('close')"
      >
        <b-icon icon="x-lg" />
      </button>
    </div>
    <div
      class="_mediaModal--content"
      :class="{
        'is--mobileView': $root.is_mobile_view,
      }"
    >
      <div class="_preview">
        <!-- <DebugBtn :content="file" /> -->
        <MediaContent
          :file="file"
          :is_draggable="false"
          :resolution="1600"
          :context="'full'"
          :show_fs_button="true"
          :zoom_on_click="true"
        />
        <div v-if="optimization_strongly_recommended" class="_optimizeNotice">
          {{ $t("optimize_to_visualize") }}
          <OptimizeMedia :media="file" @close="$emit('close')" />
        </div>

        <transition name="scaleInFade" mode="out-in">
          <div
            class="_navBtns"
            v-if="position_in_list !== 'alone' && show_nav_btn"
            :key="file.$path"
          >
            <span>
              <button
                type="button"
                class="u-button u-button_transparent _navBtn _leftArrow"
                v-if="position_in_list !== 'first'"
                @click="$emit('prevMedia')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
                  <path
                    d="M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z"
                    style="fill: var(--c-noir)"
                  />
                </svg>
              </button>
            </span>
            <span>
              <button
                type="button"
                class="u-button u-button_transparent _navBtn _rightArrow"
                v-show="position_in_list !== 'last'"
                @click="$emit('nextMedia')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
                  <path
                    d="M78.31,117l14.07-15.31a65.3,65.3,0,0,1,6.15-6.15,47.52,47.52,0,0,1,6.29-4.37H34.17V75.29h70.65a39.1,39.1,0,0,1-6.08-4.37q-2.8-2.46-6.36-6.15L78.31,49.46l13-11.07L131.6,83.21,91.29,128Z"
                    style="fill: #353535"
                  />
                </svg>
              </button>
            </span>
          </div>
        </transition>
      </div>

      <div class="_selectBtn" v-if="select_mode">
        <button
          type="button"
          class="u-buttonLink has--whitebg"
          @click="$emit('close')"
        >
          {{ $t("cancel") }}
        </button>
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="$emit('select')"
        >
          {{ $t("select") }}
        </button>
      </div>

      <div class="_meta" v-else-if="show_meta_sidebar || $root.is_mobile_view">
        <div class="u-spacingBottom">
          <h3>
            {{ $t("media") }}
            {{ file._index }}
            <FavSwitch
              class="_favSwitch"
              :fav="file.fav"
              :path="file.$path"
              :can_edit="true"
            />
          </h3>
          <small class="fieldCaption">{{ file.$media_filename }}</small>
        </div>
        <div class="u-mediaOptions u-spacingBottom">
          <div>
            <DownloadFile :file="file">
              <sl-icon name="file-earmark-arrow-down" />
              {{ $t("download") }}
            </DownloadFile>
          </div>
          <div class="">
            <DuplicateMedia :path="file.$path" @close="$emit('close')" />
          </div>
          <div v-if="optimization_possible">
            <OptimizeMedia :media="file" @close="$emit('close')" />
          </div>

          <RemoveMenu
            :remove_text="$t('remove_media')"
            @remove="$emit('remove')"
          />
        </div>

        <div class="u-spacingBottom">
          <TitleField
            :label="$t('caption')"
            :field_name="'caption'"
            :content="file.caption"
            :path="file.$path"
            :input_type="'markdown'"
            :can_edit="true"
          />
        </div>

        <div>
          <DateDisplay
            :title="$t('date_uploaded')"
            :date="file.$date_uploaded"
          />
          <DateDisplay
            :title="$t('date_modified')"
            :date="file.$date_modified"
          />
          <SizeDisplay
            v-if="file.$infos && file.$infos.size"
            :size="file.$infos.size"
          />
          <DurationDisplay
            v-if="file.$infos && file.$infos.duration"
            :title="$t('duration')"
            :duration="file.$infos.duration"
          />

          <div class="_metaField" v-if="file.$origin">
            <DLabel :str="$t('origin')" />
            <div
              class="_originInd"
              :style="`--o-color: var(--color-${file.$origin})`"
            >
              <i>
                {{ $t(file.$origin) }}
              </i>
            </div>
          </div>

          <ShowOnMap
            v-if="file.$infos && file.$infos.gps"
            :title="$t('place')"
            :gps="file.$infos.gps"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import DuplicateMedia from "@/components/DuplicateMedia.vue";

export default {
  props: {
    file: Object,
    project_path: String,
    select_mode: String,
    position_in_list: String,
  },
  components: {
    DuplicateMedia,
  },
  data() {
    return {
      show_nav_btn: false,
      show_meta_sidebar: true,
    };
  },
  i18n: {
    messages: {
      fr: {
        place: "Emplacement",
        optimize_to_visualize: "Optimiser ce fichier pour le visualiser",
      },
      en: {
        place: "Place",
        optimize_to_visualize: "Optimize to visualize",
      },
    },
  },
  created() {
    if (localStorage.getItem("show_meta_sidebar") === "false")
      this.show_meta_sidebar = false;
  },
  mounted() {
    setTimeout(() => {
      this.show_nav_btn = true;
    }, 200);
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    optimization_possible() {
      return this.fileShouldBeOptimized({ path: this.file.$media_filename });
    },
    optimization_strongly_recommended() {
      return this.fileShouldBeOptimized({ path: this.file.$media_filename });
    },
  },
  methods: {
    toggleMeta() {
      this.show_meta_sidebar = !this.show_meta_sidebar;
      localStorage.setItem("show_meta_sidebar", this.show_meta_sidebar);
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaModal {
  position: absolute;
  overflow: hidden;
  inset: 0;
  z-index: 10;
  // padding: calc(var(--spacing) / 2);

  ._mediaModal--overlay {
    background: var(--c-orange);
    position: absolute;
    inset: 0;
    opacity: 0.6;
    cursor: pointer;
  }

  ._mediaModal--content {
    // background: var(--c-noir);
    // background: var(--c-gris_clair);
    // border-radius: var(--border-radius);
    // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    &.is--mobileView {
      flex-flow: column nowrap;

      *._preview {
        flex: 1 1 320px;
      }
    }
  }

  ._navBtn {
    padding: calc(var(--spacing) / 2);
    pointer-events: auto;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    border-radius: 50%;

    background: rgba(255, 255, 255, 0.4);
    position: relative;
    z-index: 100;

    &:hover,
    &:focus {
      background: rgba(255, 255, 255, 1);
    }
  }

  ::v-deep {
    ._mediaContent {
      // position: absolute;
      // width: 100%;
      // height: 100%;
      // pointer-events: auto;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;

      &[data-filetype="audio"] {
        padding: calc(var(--spacing) * 3);
      }

      ._mediaContent--image {
        position: absolute;
        width: 100%;
        height: 100%;

        object-fit: contain;
        max-width: none;
      }
    }
  }
}

._meta {
  // margin: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 1) calc(var(--spacing) / 1);
  background: var(--panel-color);
  border: var(--panel-borders);
  box-shadow: var(--panel-shadows);
  // border-radius: var(--panel-radius);
}

._selectBtn {
  display: flex;
  place-items: center;
  justify-content: center;
  width: 100%;
  gap: calc(var(--spacing) / 1);

  position: absolute;
  bottom: 0;
  left: 0;
  background: none;
  padding: calc(var(--spacing) / 1);

  backdrop-filter: blur(5px);
}

._mediaModal--content {
  position: relative;
  border-top: 1px solid var(--c-gris);

  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;

  > * {
    &._preview {
      position: relative;
      flex: 10 1 320px;
      min-height: 50vh;
      // border: 2px solid var(--c-gris);
      background: var(--c-gris);
      // height: 50%;
    }
    &._meta {
      background: white;
      flex: 2 0 200px;
      height: 100%;
      overflow: auto;
    }
  }
}

._topRightBtn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;

  display: flex;
  flex-flow: row wrap;

  padding: calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 2);
  margin: 0;

  button {
    font-size: var(--sl-font-size-medium);
  }

  &:not(:hover) {
    // margin-top: -10px;
    // margin-right: -10px;
  }
}

._navBtns {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;

  padding: calc(var(--spacing) / 4);
  // padding-bottom: calc(var(--spacing) * 1);
  pointer-events: none;

  display: flex;
  justify-content: space-between;
  align-items: center;

  ._leftArrow {
    &:not(:hover) {
      // margin-left: -10px;
    }
  }

  ._rightArrow {
    &:not(:hover) {
      // margin-right: -10px;
    }
  }
}

._originInd {
  padding: 2px 4px;
  color: white;
  background: var(--o-color);
}

._favSwitch {
  display: inline-block;
}

._optimizeNotice {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  padding: calc(var(--spacing) * 1);
  margin-top: calc(var(--spacing) * 2);
}
</style>
