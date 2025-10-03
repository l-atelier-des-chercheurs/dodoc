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

      <OptimizeMedia
        v-if="show_optimize_modal"
        :media="file"
        @close="show_optimize_modal = false"
      />

      <div class="_preview" :data-filetype="file.$type">
        <MediaContent
          :file="file"
          :resolution="1600"
          :context="'full'"
          :show_fs_button="true"
          :zoom_on_click="true"
          :can_edit="true"
          @zoomingIn="onZoomingIn"
          @zoomingOut="onZoomingOut"
          @videoPlayed="onVideoPlayed"
          @videoPaused="onVideoPaused"
        />
        <div v-if="optimization_strongly_recommended" class="_optimizeNotice">
          <div class="">
            <div class="u-instructions">
              {{ $t("convert_to_format") }}
            </div>
            <button
              type="button"
              class="u-button u-button_orange"
              @click="show_optimize_modal = true"
            >
              <b-icon :icon="'file-play-fill'" />
              {{ $t("convert_shorten") }}
            </button>
          </div>
        </div>

        <div
          class="_topRightBtn"
          v-if="!$root.is_mobile_view && show_overlay_button"
        >
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
            v-if="
              position_in_list !== 'alone' &&
              show_nav_btn &&
              show_overlay_button
            "
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

            <DropDown :show_label="false" :right="true">
              <ShareFile :file="file">
                <b-icon icon="box-arrow-up-right" />
                {{ $t("share") }}
              </ShareFile>
              <EmbedFile :file="file">
                <b-icon icon="link" />
                {{ $t("embed_link") }}
              </EmbedFile>
              <div>
                <DownloadFile :file="file" />
              </div>
              <div class="_regenerateThumbs">
                <button
                  type="button"
                  class="u-buttonLink"
                  @click="regenerateThumbs"
                >
                  <b-icon icon="arrow-clockwise" />
                  {{ $t("regenerate_thumbs") }}
                </button>
                <LoaderSpinner v-if="is_regenerating" />
              </div>
              <DuplicateMedia :path="file.$path" @close="$emit('close')" />
              <RemoveMenu
                v-if="$listeners.remove"
                :modal_title="$t('remove_media')"
                @remove="$emit('remove')"
              />
            </DropDown>
          </div>
        </div>

        <div class="u-spacingBottom" />

        <DetailsPane
          :header="$t('informations')"
          :icon="'info-square'"
          :is_open_initially="true"
          class="u-spacingBottom"
        >
          <div class="u-spacingBottom">
            <TitleField
              :label="$t('caption')"
              :field_name="'caption'"
              :content="file.caption"
              :path="file.$path"
              :input_type="'editor'"
              :custom_formats="['bold', 'italic', 'link', 'emoji']"
              :can_edit="true"
            />
          </div>
          <div class="u-spacingBottom">
            <TitleField
              :label="$t('credit/reference')"
              :field_name="'$credits'"
              :content="file.$credits"
              :path="file.$path"
              :input_type="'editor'"
              :custom_formats="['bold', 'italic', 'link', 'emoji']"
              :can_edit="true"
            />
          </div>
          <div class="u-spacingBottom">
            <TagsField
              :label="$t('keywords')"
              :field_name="'keywords'"
              :tag_type="'keywords'"
              :local_suggestions="keywords_suggestions"
              :content="file.keywords"
              :path="file.$path"
              :can_edit="true"
            />
          </div>
          <div class="">
            <AuthorField
              :label="$t('authors')"
              :field="'$authors'"
              :authors_paths="authors_path"
              :path="file.$path"
              :can_edit="true"
              :instructions="$t('file_author_instructions')"
              :no_options="true"
            />
          </div>
        </DetailsPane>

        <DetailsPane
          :header="$t('location')"
          :is_open_initially="false"
          :has_items="author_has_location"
          :icon="'map'"
          class="u-spacingBottom"
        >
          <PositionPicker
            :field_name="'$location'"
            :content="file.$location"
            :path="file.$path"
            :can_edit="true"
          />
        </DetailsPane>

        <DetailsPane
          :header="$t('metadatas')"
          :icon="'rulers'"
          class="u-spacingBottom"
        >
          <!-- <div class="u-metaField">
            <DLabel :str="$t('meta_filename')" />
            <div class="u-filename">{{ getFilename(file.$path) }}</div>
          </div> -->

          <div class="u-metaField">
            <DLabel :str="$t('filename')" />
            <div class="u-filename">{{ file.$media_filename }}</div>
          </div>

          <div class="">
            <DateDisplay
              :title="$t('date_uploaded')"
              :date="file.$date_uploaded"
            />
          </div>
          <div class="">
            <DateDisplay
              :title="$t('date_modified')"
              :date="file.$date_modified"
            />
          </div>
          <div class="" v-if="file.$infos.hasOwnProperty('size')">
            <SizeDisplay :size="file.$infos.size" />
          </div>
          <div
            class=""
            v-if="
              file.$infos.hasOwnProperty('width') ||
              file.$infos.hasOwnProperty('height')
            "
          >
            <ResolutionDisplay
              :width="file.$infos.width"
              :height="file.$infos.height"
            />
          </div>
          <div class="" v-if="file.$infos.hasOwnProperty('duration')">
            <DurationDisplay
              :title="$t('duration')"
              :duration="file.$infos.duration"
            />
          </div>
          <div class="u-metaField" v-if="file.$origin">
            <DLabel :str="$t('origin')" />
            <div class="">
              <div
                class="_originInd"
                :style="`--o-color: var(--color-${file.$origin})`"
              >
                {{ $t(file.$origin) }}
              </div>
            </div>
          </div>
        </DetailsPane>

        <DetailsPane
          :header="$t('toolbox')"
          :icon="'tools'"
          :has_items="tools_available"
          :is_open_initially="false"
        >
          <div v-if="tools_available === 0">
            <small class="u-instructions">{{ $t("nothing_to_show") }}</small>
          </div>
          <div class="_allModifyButtons">
            <button
              v-if="cropadjust_possible"
              type="button"
              class="u-button u-button_orange"
              @click="show_cropadjust_modal = true"
            >
              <b-icon icon="bounding-box" />
              {{ $t("crop_adjust") }}
            </button>
            <CropAdjustMedia
              v-if="show_cropadjust_modal"
              :media="file"
              @close="show_cropadjust_modal = false"
              @closeParentModal="$emit('close')"
            />

            <button
              type="button"
              class="u-button u-button_orange"
              v-if="optimization_possible"
              @click="show_optimize_modal = true"
            >
              <b-icon :icon="'file-play-fill'" />
              <template v-if="file.$type === 'image'">
                {{ $t("optimize_resize") }}
              </template>
              <template v-else>
                {{ $t("convert_shorten") }}
              </template>
            </button>

            <div v-for="make in available_makes" :key="make.type">
              <button
                type="button"
                class="u-button u-button_bleumarine"
                @click="
                  createNewMakeAndOpenIt({
                    type: make.type,
                    additional_meta: make.additional_meta,
                  })
                "
              >
                {{ make.title }}
              </button>

              <div class="u-instructions">
                <small v-html="make.instructions" />
              </div>
            </div>
          </div>
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

export default {
  props: {
    file: Object,
    select_mode: String,
    keywords_suggestions: Array,
    position_in_list: String,
  },
  components: {
    DuplicateMedia,
    CropAdjustMedia: () => import("@/adc-core/fields/CropAdjustMedia.vue"),
    OptimizeMedia: () => import("@/adc-core/fields/OptimizeMedia.vue"),
  },
  data() {
    return {
      show_cropadjust_modal: false,
      show_nav_btn: false,
      show_meta_sidebar: true,
      is_regenerating: false,
      is_zooming_in: false,
      is_playing_video: false,
      show_optimize_modal: false,
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
    show_overlay_button() {
      if (this.is_zooming_in || this.is_playing_video) return false;
      return true;
    },
    tools_available() {
      let count = 0;
      if (this.cropadjust_possible) count++;
      if (this.optimization_possible) count++;
      if (this.available_makes?.length > 0)
        count += this.available_makes.length;
      return count;
    },
    cropadjust_possible() {
      return (
        this.file.$type === "image" &&
        !this.file.$media_filename.endsWith(".gif")
      );
    },
    optimization_possible() {
      return this.fileCanBeOptimized({ filename: this.file.$media_filename });
    },
    optimization_strongly_recommended() {
      return this.fileShouldBeOptimized({
        filename: this.file.$media_filename,
      });
    },
    author_has_location() {
      return (
        !!this.file.$location?.latitude && !!this.file.$location?.longitude
      );
    },

    all_available_makes() {
      return {
        video: [
          {
            type: "video_assemblage",
            title: this.$t("video_assemblage"),
            instructions: this.$t("video_assemblage_instructions"),
          },
          {
            type: "video_effects",
            title: this.$t("video_effects"),
            instructions: this.$t("video_effects_instructions"),
            additional_meta: {
              effect_type: "black_and_white",
              base_media_filename: this.meta_filename,
            },
          },
          {
            type: "mix_audio_and_video",
            title: this.$t("mix_audio_and_video"),
            instructions: this.$t("mix_audio_and_video_instructions"),
            additional_meta: {
              base_video_filename: this.meta_filename,
            },
          },
        ],
        image: [
          {
            type: "video_assemblage",
            title: this.$t("video_assemblage"),
            instructions: this.$t("video_assemblage_instructions"),
          },
          {
            type: "mix_audio_and_image",
            title: this.$t("mix_audio_and_image"),
            instructions: this.$t("mix_audio_and_image_instructions"),
            additional_meta: {
              base_image_filename: this.meta_filename,
            },
          },
        ],
        audio: [
          {
            type: "mix_audio_and_image",
            title: this.$t("mix_audio_and_image"),
            instructions: this.$t("mix_audio_and_image_instructions"),
            additional_meta: {
              base_audio_filename: this.meta_filename,
            },
          },
          {
            type: "mix_audio_and_video",
            title: this.$t("mix_audio_and_video"),
            instructions: this.$t("mix_audio_and_video_instructions"),
            additional_meta: {
              base_audio_filename: this.meta_filename,
            },
          },
        ],
      };
    },
    available_makes() {
      return this.all_available_makes[this.file.$type];
    },

    authors_path() {
      return this.file.$authors || "noone";
    },
    project_path() {
      return this.getParent(this.file.$path);
    },
    meta_filename() {
      return this.getFilename(this.file.$path);
    },
  },
  methods: {
    onZoomingIn() {
      this.is_zooming_in = true;
    },
    onZoomingOut() {
      this.is_zooming_in = false;
    },
    onVideoPlayed() {
      this.is_playing_video = true;
    },
    onVideoPaused() {
      this.is_playing_video = false;
    },
    toggleMeta() {
      this.show_meta_sidebar = !this.show_meta_sidebar;
      localStorage.setItem("show_meta_sidebar", this.show_meta_sidebar);
    },
    async regenerateThumbs() {
      this.is_regenerating = true;
      await this.$api.regenerateThumbs({ path: this.file.$path });
      this.is_regenerating = false;
    },

    async createNewMakeAndOpenIt({ type, additional_meta: addtl_meta }) {
      const rnd_suffix = (
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 2 + 3);

      const title = this.$t(type) + "-" + rnd_suffix;

      let additional_meta = {
        type,
        title,
        requested_slug: title,
        $admins: "parent_contributors",
      };
      Object.assign(additional_meta, addtl_meta);

      const new_folder_slug = await this.$api.createFolder({
        path: `${this.project_path}/makes`,
        additional_meta,
      });

      this.$eventHub.$emit("pane.replacePane", {
        type: "make",
      });
      this.$nextTick(() => {
        this.$eventHub.$emit("make.open", new_folder_slug);
      });
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

  display: flex;
  flex-flow: column nowrap;
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
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(5px) !important;

  position: relative;
  z-index: 100;

  &:hover {
    background: rgba(255, 255, 255, 1) !important;
  }
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
  padding: calc(var(--spacing) / 1);

  background: white;
  border: 2px solid var(--c-gris_clair);
}

._mediaModal--content {
  position: relative;
  border-top: 1px solid var(--c-gris);
  width: 100%;
  height: 100%;
  background: white;

  > ._preview {
    position: relative;
    background: var(--c-gris_clair);
    overflow: hidden;

    &[data-filetype="text"] {
      background: var(--c-gris_clair);
      ::v-deep {
        ._mediaContent {
          padding: 0;
        }
        ._collaborativeEditor {
          padding: calc(var(--spacing) * 1);

          .ql-editor {
            background: white;
            padding: calc(var(--spacing) / 2);
          }
        }
        ._floatingEditBtn {
          top: calc(var(--spacing) * 3);
        }
      }
    }
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
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

._stickyClose {
  position: sticky;
  top: 0;
  height: 0;
  z-index: 101;
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
  display: inline-block;
  color: white;
  padding: 2px 4px;
  font-style: italic;
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
    background: white;
    // background: var(--c-bleuvert_clair);
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

._regenerateThumbs {
  position: relative;
}

._allModifyButtons {
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  gap: calc(var(--spacing) / 1);
}
</style>
