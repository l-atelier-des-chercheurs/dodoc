<template>
  <div class="_mediaModal">
    <div class="_mediaModal--overlay" @click="$emit('close')" />

    <div
      class="_mediaModal--content"
      :class="{
        'is--mobileView': $root.is_mobile_view,
      }"
    >
      <!-- // specific mobile only close btn -->
      <div class="_stickyClose" v-if="$root.is_mobile_view">
        <div class="_stickyClose--content">
          <button
            type="button"
            class="u-button u-button_icon _navBtn"
            @click="$emit('close')"
          >
            <b-icon icon="x-lg" />
          </button>
        </div>
      </div>

      <div class="_preview">
        <!-- <DebugBtn :content="file" /> -->
        <MediaContent
          :file="file"
          :resolution="1600"
          :context="'full'"
          :show_fs_button="true"
          :zoom_on_click="true"
          :can_edit="true"
        />
        <div v-if="optimization_strongly_recommended" class="_optimizeNotice">
          <div class="">
            {{ $t("convert_to_format") }}
            <OptimizeMedia :media="file" @close="$emit('close')" />
          </div>
        </div>

        <div class="_topRightBtn" v-if="!$root.is_mobile_view">
          <DragFile class="_dragFile" :file="file" />
          <button
            type="button"
            class="u-button u-button_icon _navBtn"
            @click="toggleMeta"
          >
            <b-icon
              :icon="
                show_meta_sidebar
                  ? 'chevron-double-right'
                  : 'chevron-double-left'
              "
            />
          </button>
          <button
            type="button"
            class="u-button u-button_icon _navBtn"
            @click="$emit('close')"
          >
            <b-icon icon="x-lg" />
          </button>
        </div>

        <transition name="scaleOutFade" mode="out-in">
          <div
            class="_navBtns"
            v-if="position_in_list !== 'alone' && show_nav_btn"
            :key="file.$path"
          >
            <span>
              <button
                type="button"
                class="u-button u-button_icon _navBtn _leftArrow"
                v-if="position_in_list !== 'first'"
                @click="$emit('prevMedia')"
              >
                <b-icon icon="arrow-left-short" />
                <!-- 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
                  <path
                    d="M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z"
                    style="fill: var(--c-noir)"
                  />
                </svg> -->
              </button>
            </span>
            <span>
              <button
                type="button"
                class="u-button u-button_icon _navBtn _rightArrow"
                v-show="position_in_list !== 'last'"
                @click="$emit('nextMedia')"
              >
                <b-icon icon="arrow-right-short" />
                <!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
                  <path
                    d="M78.31,117l14.07-15.31a65.3,65.3,0,0,1,6.15-6.15,47.52,47.52,0,0,1,6.29-4.37H34.17V75.29h70.65a39.1,39.1,0,0,1-6.08-4.37q-2.8-2.46-6.36-6.15L78.31,49.46l13-11.07L131.6,83.21,91.29,128Z"
                    style="fill: #353535"
                  />
                </svg> -->
              </button>
            </span>
          </div>
        </transition>
      </div>

      <div class="_meta" v-if="show_meta_sidebar || $root.is_mobile_view">
        <div class="u-spacingBottom">
          <div class="_topbar">
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

            <DropDown :right="true">
              <div>
                <DownloadFile :file="file">
                  <b-icon icon="file-earmark-arrow-down" />
                  {{ $t("download") }}
                </DownloadFile>
              </div>
              <DuplicateMedia :path="file.$path" @close="$emit('close')" />
              <RemoveMenu
                v-if="$listeners.remove"
                :remove_text="$t('remove_media')"
                @remove="$emit('remove')"
              />
            </DropDown>
          </div>
          <small class="fieldCaption">{{ file.$media_filename }}</small>
        </div>

        <hr class="u-spacingBottom" />

        <DetailsPane
          :header="$t('informations')"
          :icon="'info-square'"
          :is_open_initially="true"
          class="u-spacingBottom"
        >
          <div class="u-spacingBottom">
            <CollaborativeEditor2
              :label="$t('caption')"
              :field_to_edit="'caption'"
              :content="file.caption"
              :path="file.$path"
              :custom_formats="['bold', 'italic', 'link']"
              :is_collaborative="false"
              :can_edit="true"
            />
          </div>
          <div class="u-spacingBottom">
            <CollaborativeEditor2
              :label="$t('credit/reference')"
              :field_to_edit="'$credits'"
              :content="file.$credits"
              :path="file.$path"
              :custom_formats="['bold', 'italic', 'link']"
              :is_collaborative="false"
              :can_edit="true"
            />
          </div>

          <div class="u-spacingBottom">
            <AuthorField
              :label="$t('authors')"
              class="u-spacingBottom"
              :field="'$authors'"
              :authors_paths="authors_path"
              :path="file.$path"
              :can_edit="true"
              :instructions="$t('file_author_instructions')"
              :no_options="true"
            />
          </div>

          <div class="">
            <PositionPicker
              :label="$t('location')"
              :field_name="'$location'"
              :content="file.$location"
              :path="file.$path"
              :can_edit="true"
            />
          </div>
        </DetailsPane>

        <DetailsPane
          :header="$t('metadatas')"
          :icon="'rulers'"
          class="u-spacingBottom"
        >
          <DateDisplay
            :title="$t('date_uploaded')"
            :date="file.$date_uploaded"
          />
          <DateDisplay
            :title="$t('date_modified')"
            :date="file.$date_modified"
          />
          <SizeDisplay
            v-if="file.$infos.hasOwnProperty('size')"
            :size="file.$infos.size"
          />
          <ResolutionDisplay
            v-if="
              file.$infos.hasOwnProperty('width') ||
              file.$infos.hasOwnProperty('height')
            "
            :width="file.$infos.width"
            :height="file.$infos.height"
          />
          <DurationDisplay
            v-if="file.$infos.hasOwnProperty('duration')"
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
        </DetailsPane>

        <DetailsPane
          v-if="optimization_possible || file.$type === 'image'"
          :header="$t('edit')"
          :icon="'tools'"
          :is_open_initially="false"
        >
          <CropAdjustMedia
            v-if="file.$type === 'image'"
            :media="file"
            @close="$emit('close')"
          />
          <template v-if="optimization_possible">
            <div class="u-spacingBottom" />
            <OptimizeMedia :media="file" @close="$emit('close')" />
          </template>
        </DetailsPane>
      </div>
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
  </div>
</template>
<script>
import DuplicateMedia from "@/components/DuplicateMedia.vue";
import CropAdjustMedia from "@/adc-core/fields/CropAdjustMedia.vue";
import OptimizeMedia from "@/adc-core/fields/OptimizeMedia.vue";

export default {
  props: {
    file: Object,
    select_mode: String,
    position_in_list: String,
  },
  components: {
    DuplicateMedia,
    CropAdjustMedia,
    OptimizeMedia,
  },
  data() {
    return {
      show_nav_btn: false,
      show_meta_sidebar: true,
    };
  },

  created() {
    // if (this.select_mode) this.show_meta_sidebar = false;
    // else
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
      return this.fileCanBeOptimized({ path: this.file.$media_filename });
    },
    optimization_strongly_recommended() {
      return this.fileShouldBeOptimized({ path: this.file.$media_filename });
    },
    authors_path() {
      return this.file.$authors || "noone";
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
  text-align: left;
  // padding: calc(var(--spacing) / 2);

  ._mediaModal--overlay {
    background: var(--c-orange);
    position: absolute;
    inset: 0;
    opacity: 0.6;
    cursor: pointer;
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

      &[data-filetype="text"] {
        padding: calc(var(--spacing) * 1);
        overflow: auto;
        align-items: flex-start;
      }
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

._navBtn {
  pointer-events: auto;

  position: relative;
  z-index: 100;
}

._meta {
  // margin: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) * 1) calc(var(--spacing) / 1);
  background: var(--panel-color);
  border: var(--panel-borders);
  box-shadow: var(--panel-shadows);
  // border-radius: var(--panel-radius);
}

._selectBtn {
  position: sticky;
  display: flex;
  place-items: center;
  justify-content: center;
  width: 100%;
  gap: calc(var(--spacing) / 1);

  z-index: 100;

  bottom: 0;
  left: 0;
  background: none;
  padding: calc(var(--spacing) / 1);

  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

._mediaModal--content {
  position: relative;
  border-top: 1px solid var(--c-gris);
  width: 100%;
  height: 100%;
  background: white;

  > ._preview {
    position: relative;
    background: var(--c-gris);
    overflow: hidden;
  }

  // large view, side by side
  &:not(.is--mobileView) {
    display: flex;
    flex-flow: row nowrap;
    overflow: hidden;
    height: 100%;

    > ._preview {
      top: 0;
      flex: 10 1 320px;
    }
    > ._meta {
      position: relative;
      z-index: 2;
      background: white;
      flex: 2 0 200px;
      overflow: auto;
    }
  }
  &.is--mobileView {
    overflow: auto;

    > ._preview {
      height: 70vh;
    }
    > ._meta {
    }
  }
}

._topRightBtn,
._stickyClose--content {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);
}

._stickyClose {
  position: sticky;
  height: 0;
  z-index: 100;
}

._navBtns {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;

  padding: calc(var(--spacing) / 2);
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
  font-size: 1rem;
}

._optimizeNotice {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  padding: calc(var(--spacing) * 1);
  margin-top: calc(var(--spacing) * 2);

  > * {
    margin: 0 auto;
    padding: calc(var(--spacing) / 2);
    max-width: 320px;
    width: 100%;
    background: var(--c-bleuvert_clair);
    border-radius: 8px;
    box-shadow: 0 1px 40px rgb(0 0 0 / 10%);
  }
}

._topbar {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) / 1);
}

._dragFile {
}
</style>
